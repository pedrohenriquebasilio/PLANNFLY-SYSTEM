import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduleConfigService } from '../schedule-config/schedule-config.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { RescheduleLessonDto } from './dto/reschedule-lesson.dto';
import { GenerateRecurringLessonsDto } from './dto/generate-recurring-lessons.dto';
import { LessonResponseDto, LessonStudentDto } from './dto/lesson-response.dto';
import { ListLessonsQueryDto } from './dto/list-lessons.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { ResponseDto } from '../common/dto/response.dto';
import { addDays, format, startOfWeek, eachDayOfInterval, lastDayOfMonth, parseISO } from 'date-fns';

@Injectable()
export class LessonsService {
  constructor(
    private prisma: PrismaService,
    private scheduleConfigService: ScheduleConfigService,
  ) {}

  async create(userId: string, createLessonDto: CreateLessonDto) {
    const { studentIds, startDateTime, durationMinutes, planId, observations } =
      createLessonDto;

    // Verificar se alunos existem e pertencem ao usuário
    const students = await this.prisma.student.findMany({
      where: {
        id: { in: studentIds },
        userId,
        status: 'active',
      },
    });

    if (students.length !== studentIds.length) {
      throw new NotFoundException(
        'Um ou mais alunos não foram encontrados ou estão inativos',
      );
    }

    // Verificar se plano existe (se fornecido)
    let plan: Awaited<ReturnType<typeof this.prisma.plan.findFirst>> = null;
    if (planId) {
      plan = await this.prisma.plan.findFirst({
        where: {
          id: planId,
          userId,
        },
      });

      if (!plan) {
        throw new NotFoundException('Plano não encontrado');
      }
    }

    const startDate = new Date(startDateTime);
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + durationMinutes);

    // Validar horário na agenda
    const timeString = format(startDate, 'HH:mm');
    const validation = await this.scheduleConfigService.validateTimeSlot(
      userId,
      startDate,
      timeString,
      durationMinutes,
    );

    if (!validation.valid) {
      throw new BadRequestException(validation.reason || 'Horário inválido');
    }

    // Verificar conflitos de horário
    const conflictingLesson = await this.prisma.lesson.findFirst({
      where: {
        userId,
        status: { not: 'cancelled' },
        OR: [
          {
            AND: [
              { startDateTime: { lte: startDate } },
              {
                startDateTime: {
                  gte: new Date(startDate.getTime() - durationMinutes * 60000),
                },
              },
            ],
          },
          {
            AND: [
              {
                startDateTime: {
                  lte: new Date(endDate.getTime() + durationMinutes * 60000),
                },
              },
              { startDateTime: { gte: startDate } },
            ],
          },
        ],
      },
    });

    if (conflictingLesson) {
      throw new ConflictException('Já existe uma aula neste horário');
    }

    // Criar aula
    const lesson = await this.prisma.lesson.create({
      data: {
        userId,
        startDateTime: startDate,
        durationMinutes,
        planId: planId || null,
        observations,
        status: 'scheduled',
      },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Associar alunos à aula
    await Promise.all(
      studentIds.map((studentId) =>
        this.prisma.lessonStudent.create({
          data: {
            lessonId: lesson.id,
            studentId,
          },
        }),
      ),
    );

    // Buscar aula completa com alunos
    const lessonWithStudents = await this.findOne(userId, lesson.id);
    return lessonWithStudents;
  }

  async findAll(
    userId: string,
    query: ListLessonsQueryDto,
  ): Promise<PaginatedResponseDto<LessonResponseDto>> {
    const {
      page = 1,
      limit = 10,
      studentId,
      status,
      startDate,
      endDate,
      planId,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      ...(studentId && {
        studentLessons: {
          some: {
            studentId,
          },
        },
      }),
      ...(status && { status }),
      ...(planId && { planId }),
      ...(startDate &&
        endDate && {
          startDateTime: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
    };

    const [lessons, total] = await Promise.all([
      this.prisma.lesson.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDateTime: 'asc' },
        include: {
          studentLessons: {
            include: {
              student: true,
            },
          },
          plan: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.lesson.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return new PaginatedResponseDto(
      lessons.map((lesson) => this.formatLessonResponse(lesson)),
      {
        page,
        limit,
        total,
        totalPages,
      },
    );
  }

  async findOne(userId: string, id: string): Promise<LessonResponseDto> {
    const lesson = await this.prisma.lesson.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        studentLessons: {
          include: {
            student: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Aula não encontrada');
    }

    return this.formatLessonResponse(lesson);
  }

  async update(
    userId: string,
    id: string,
    updateLessonDto: UpdateLessonDto,
  ): Promise<LessonResponseDto> {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id, userId },
    });

    if (!lesson) {
      throw new NotFoundException('Aula não encontrada');
    }

    // Validar horário se estiver sendo atualizado
    if (updateLessonDto.startDateTime || updateLessonDto.durationMinutes) {
      const startDate = updateLessonDto.startDateTime
        ? new Date(updateLessonDto.startDateTime)
        : lesson.startDateTime;
      const durationMinutes =
        updateLessonDto.durationMinutes || lesson.durationMinutes;

      const timeString = format(startDate, 'HH:mm');
      const validation = await this.scheduleConfigService.validateTimeSlot(
        userId,
        startDate,
        timeString,
        durationMinutes,
      );

      if (!validation.valid) {
        throw new BadRequestException(validation.reason || 'Horário inválido');
      }
    }

    // Atualizar aula
    const updatedLesson = await this.prisma.lesson.update({
      where: { id },
      data: {
        ...(updateLessonDto.startDateTime && {
          startDateTime: new Date(updateLessonDto.startDateTime),
        }),
        ...(updateLessonDto.durationMinutes && {
          durationMinutes: updateLessonDto.durationMinutes,
        }),
        ...(updateLessonDto.status && { status: updateLessonDto.status }),
        ...(updateLessonDto.observations !== undefined && {
          observations: updateLessonDto.observations,
        }),
      },
      include: {
        studentLessons: {
          include: {
            student: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Atualizar alunos se fornecidos
    if (updateLessonDto.studentIds) {
      // Remover associações antigas
      await this.prisma.lessonStudent.deleteMany({
        where: { lessonId: id },
      });

      // Criar novas associações
      await Promise.all(
        updateLessonDto.studentIds.map((studentId) =>
          this.prisma.lessonStudent.create({
            data: {
              lessonId: id,
              studentId,
            },
          }),
        ),
      );

      // Buscar aula atualizada
      return this.findOne(userId, id);
    }

    return this.formatLessonResponse(updatedLesson);
  }

  async reschedule(
    userId: string,
    id: string,
    rescheduleLessonDto: RescheduleLessonDto,
  ): Promise<LessonResponseDto> {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id, userId },
      include: {
        plan: true,
      },
    });

    if (!lesson) {
      throw new NotFoundException('Aula não encontrada');
    }

    if (lesson.status === 'cancelled') {
      throw new BadRequestException('Não é possível remarcar uma aula cancelada');
    }

    const newStartDate = new Date(rescheduleLessonDto.startDateTime);

    // Validar antecedência mínima se tiver plano
    if (lesson.plan) {
      const now = new Date();
      const hoursUntilLesson =
        (newStartDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilLesson < lesson.plan.rescheduleMinHours) {
        throw new BadRequestException(
          `Antecedência mínima para remarcação é de ${lesson.plan.rescheduleMinHours} horas`,
        );
      }
    }

    // Validar horário na agenda
    const timeString = format(newStartDate, 'HH:mm');
    const validation = await this.scheduleConfigService.validateTimeSlot(
      userId,
      newStartDate,
      timeString,
      lesson.durationMinutes,
    );

    if (!validation.valid) {
      throw new BadRequestException(validation.reason || 'Horário inválido');
    }

    // Verificar conflitos de horário (exceto a própria aula)
    const conflictingLesson = await this.prisma.lesson.findFirst({
      where: {
        userId,
        id: { not: id },
        status: { not: 'cancelled' },
        OR: [
          {
            AND: [
              { startDateTime: { lte: newStartDate } },
              {
                startDateTime: {
                  gte: new Date(
                    newStartDate.getTime() - lesson.durationMinutes * 60000,
                  ),
                },
              },
            ],
          },
          {
            AND: [
              {
                startDateTime: {
                  lte: new Date(
                    newStartDate.getTime() + lesson.durationMinutes * 60000,
                  ),
                },
              },
              { startDateTime: { gte: newStartDate } },
            ],
          },
        ],
      },
    });

    if (conflictingLesson) {
      throw new ConflictException('Já existe uma aula neste horário');
    }

    // Atualizar aula com status de remarcada
    const updatedLesson = await this.prisma.lesson.update({
      where: { id },
      data: {
        startDateTime: newStartDate,
        originalStartDateTime: lesson.originalStartDateTime || lesson.startDateTime,
        status: 'rescheduled',
      },
      include: {
        studentLessons: {
          include: {
            student: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return this.formatLessonResponse(updatedLesson);
  }

  async updateStatus(
    userId: string,
    id: string,
    status: 'scheduled' | 'completed' | 'rescheduled' | 'cancelled',
  ): Promise<LessonResponseDto> {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id, userId },
    });

    if (!lesson) {
      throw new NotFoundException('Aula não encontrada');
    }

    const updatedLesson = await this.prisma.lesson.update({
      where: { id },
      data: { status },
      include: {
        studentLessons: {
          include: {
            student: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return this.formatLessonResponse(updatedLesson);
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id, userId },
    });

    if (!lesson) {
      throw new NotFoundException('Aula não encontrada');
    }

    await this.prisma.lesson.delete({
      where: { id },
    });

    return { message: 'Aula removida com sucesso' };
  }

  /**
   * Gera aulas automaticamente baseado no pagamento de mensalidade
   */
  async generateLessonsFromPayment(
    userId: string,
    studentId: string,
    planId: string,
    referenceMonth: number,
    referenceYear: number,
  ): Promise<void> {
    const plan = await this.prisma.plan.findFirst({
      where: { id: planId, userId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    // Verificar se aluno está ativo
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, userId, status: 'active' },
    });

    if (!student) {
      throw new NotFoundException('Aluno não encontrado ou inativo');
    }

    // Calcular início do período (primeiro dia do mês de referência)
    const periodStart = new Date(referenceYear, referenceMonth - 1, 1);
    const periodEnd = new Date(referenceYear, referenceMonth, 0); // Último dia do mês

    // Obter configuração de agenda
    let scheduleConfig;
    try {
      scheduleConfig = await this.scheduleConfigService.findOne(userId);
    } catch (error) {
      // Se não houver configuração, não é possível gerar aulas
      throw new NotFoundException(
        'Configuração de agenda não encontrada. Configure a agenda antes de gerar aulas.',
      );
    }

    // Gerar dias da semana baseado nos dias configurados no plano
    const planDaysOfWeek = plan.daysOfWeek.map((day) => parseInt(day));
    const daysInMonth = eachDayOfInterval({
      start: periodStart,
      end: periodEnd,
    });

    // Filtrar apenas os dias que correspondem aos dias da semana do plano
    const validDays = daysInMonth.filter((day) =>
      planDaysOfWeek.includes(day.getDay()),
    );

    // Calcular número de semanas no mês
    const firstDayOfMonth = periodStart.getDay();
    const daysInFirstWeek = 7 - firstDayOfMonth;
    const remainingDays = daysInMonth.length - daysInFirstWeek;
    const weeksInMonth = Math.ceil(1 + remainingDays / 7);

    // Limitar ao número de aulas por semana * semanas no mês
    const totalLessonsToGenerate = Math.min(
      plan.frequency * weeksInMonth,
      validDays.length,
    );
    const daysToGenerate = validDays.slice(0, totalLessonsToGenerate);

    // Gerar aulas para cada dia
    const lessons: Array<{
      userId: string;
      studentId: string;
      planId: string;
      startDateTime: Date;
      durationMinutes: number;
      status: string;
    }> = [];
    for (const day of daysToGenerate) {
      // Usar primeiro horário disponível do workingHours como padrão
      const workingHours: Array<{ start: string; end: string }> =
        scheduleConfig.workingHours as any;
      if (workingHours.length === 0) continue;

      const firstTimeSlot = workingHours[0].start;
      const [hour, minute] = firstTimeSlot.split(':').map(Number);

      const lessonDateTime = new Date(day);
      lessonDateTime.setHours(hour, minute, 0, 0);

      // Verificar se já existe aula neste horário para este aluno
      const existingLesson = await this.prisma.lesson.findFirst({
        where: {
          userId,
          startDateTime: lessonDateTime,
          studentLessons: {
            some: {
              studentId,
            },
          },
        },
      });

      if (existingLesson) continue;

      lessons.push({
        userId,
        studentId,
        planId,
        startDateTime: lessonDateTime,
        durationMinutes: plan.durationMinutes,
        status: 'scheduled',
      });
    }

    // Criar aulas em lote
    for (const lessonData of lessons) {
      const lesson = await this.prisma.lesson.create({
        data: {
          userId: lessonData.userId,
          startDateTime: lessonData.startDateTime,
          durationMinutes: lessonData.durationMinutes,
          planId: lessonData.planId,
          status: lessonData.status,
        },
      });

      // Associar aluno à aula
      await this.prisma.lessonStudent.create({
        data: {
          lessonId: lesson.id,
          studentId: lessonData.studentId,
        },
      });
    }
  }

  /**
   * Gera aulas recorrentes nos dias do plano ate o fim do periodo de cobranca atual.
   * O "fim do periodo" = ultimo dia do mes de referencia da proxima cobranca pendente.
   * Se todas as cobrancas estao pagas, usa a ultima cobranca paga.
   */
  async generateRecurring(
    userId: string,
    dto: GenerateRecurringLessonsDto,
  ): Promise<{ created: number; skipped: number; periodEnd: string }> {
    const { studentId, planId, startDate, time } = dto;

    // Validate student
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, userId, status: 'active' },
    });
    if (!student) {
      throw new NotFoundException('Aluno nao encontrado ou inativo');
    }

    // Validate plan
    const plan = await this.prisma.plan.findFirst({
      where: { id: planId, userId },
    });
    if (!plan) {
      throw new NotFoundException('Plano nao encontrado');
    }

    // Validate student is associated with plan
    const studentPlan = await this.prisma.studentPlan.findFirst({
      where: { studentId, planId, isActive: true },
    });
    if (!studentPlan) {
      throw new BadRequestException('Aluno nao esta associado a este plano');
    }

    // Determine period end from payments
    const periodEnd = await this.findPeriodEnd(userId, studentId, planId, plan.periodType);

    const start = parseISO(startDate);
    const [hour, minute] = time.split(':').map(Number);
    const planDays = plan.daysOfWeek.map((d) => parseInt(d));

    // Generate all days in the interval
    const allDays = eachDayOfInterval({ start, end: periodEnd });

    // Filter to only plan days
    const validDays = allDays.filter((day) => planDays.includes(day.getDay()));

    let created = 0;
    let skipped = 0;

    for (const day of validDays) {
      const lessonStart = new Date(day);
      lessonStart.setHours(hour, minute, 0, 0);

      const lessonEnd = new Date(lessonStart);
      lessonEnd.setMinutes(lessonEnd.getMinutes() + plan.durationMinutes);

      // Check for existing lesson at this exact time for this student
      const existing = await this.prisma.lesson.findFirst({
        where: {
          userId,
          startDateTime: lessonStart,
          status: { not: 'cancelled' },
          studentLessons: { some: { studentId } },
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Check for time conflicts (any lesson overlapping this slot)
      const conflict = await this.prisma.lesson.findFirst({
        where: {
          userId,
          status: { not: 'cancelled' },
          AND: [
            { startDateTime: { lt: lessonEnd } },
            {
              startDateTime: {
                gte: new Date(lessonStart.getTime() - plan.durationMinutes * 60000),
              },
            },
          ],
        },
      });

      if (conflict) {
        skipped++;
        continue;
      }

      // Create lesson
      const lesson = await this.prisma.lesson.create({
        data: {
          userId,
          startDateTime: lessonStart,
          durationMinutes: plan.durationMinutes,
          planId,
          status: 'scheduled',
        },
      });

      await this.prisma.lessonStudent.create({
        data: { lessonId: lesson.id, studentId },
      });

      created++;
    }

    return {
      created,
      skipped,
      periodEnd: format(periodEnd, 'yyyy-MM-dd'),
    };
  }

  /**
   * Encontra o fim do periodo de cobranca atual para o aluno+plano.
   * 1. Busca a proxima cobranca pendente → ultimo dia do mes de referencia
   * 2. Se nao houver, busca a ultima cobranca paga → ultimo dia do mes de referencia
   * 3. Se nao houver cobrancas, calcula pelo periodType a partir de hoje
   */
  private async findPeriodEnd(
    userId: string,
    studentId: string,
    planId: string,
    periodType: string,
  ): Promise<Date> {
    // 1. Next pending payment
    const pendingPayment = await this.prisma.payment.findFirst({
      where: { userId, studentId, planId, status: 'pending' },
      orderBy: { dueDate: 'asc' },
    });

    if (pendingPayment) {
      return lastDayOfMonth(
        new Date(pendingPayment.referenceYear, pendingPayment.referenceMonth - 1),
      );
    }

    // 2. Latest paid payment
    const paidPayment = await this.prisma.payment.findFirst({
      where: { userId, studentId, planId, status: 'paid' },
      orderBy: { dueDate: 'desc' },
    });

    if (paidPayment) {
      return lastDayOfMonth(
        new Date(paidPayment.referenceYear, paidPayment.referenceMonth - 1),
      );
    }

    // 3. Fallback: calculate from periodType
    const now = new Date();
    switch (periodType) {
      case 'quarterly': {
        const end = new Date(now);
        end.setMonth(end.getMonth() + 3);
        return lastDayOfMonth(end);
      }
      case 'semiannual': {
        const end = new Date(now);
        end.setMonth(end.getMonth() + 6);
        return lastDayOfMonth(end);
      }
      case 'annual': {
        const end = new Date(now);
        end.setFullYear(end.getFullYear() + 1);
        return lastDayOfMonth(end);
      }
      default: // monthly
        return lastDayOfMonth(now);
    }
  }

  private formatLessonResponse(lesson: any): LessonResponseDto {
    return {
      id: lesson.id,
      userId: lesson.userId,
      startDateTime: lesson.startDateTime,
      durationMinutes: lesson.durationMinutes,
      status: lesson.status,
      observations: lesson.observations,
      originalStartDateTime: lesson.originalStartDateTime,
      planId: lesson.planId,
      students: lesson.studentLessons.map((ls: any): LessonStudentDto => ({
        id: ls.student.id,
        name: ls.student.name,
        phone: ls.student.phone,
        cpf: ls.student.cpf,
      })),
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    };
  }
}