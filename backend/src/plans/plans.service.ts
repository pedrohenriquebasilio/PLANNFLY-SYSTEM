import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlanResponseDto } from './dto/plan-response.dto';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';
import { ResponseDto } from '../common/dto/response.dto';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class PlansService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => PaymentsService))
    private paymentsService: PaymentsService,
  ) {}

  async create(userId: string, createPlanDto: CreatePlanDto) {
    const { studentIds, ...planData } = createPlanDto;

    // Verificar se os alunos existem e pertencem ao usuário
    if (studentIds && studentIds.length > 0) {
      const students = await this.prisma.student.findMany({
        where: {
          id: { in: studentIds },
          userId,
        },
      });

      if (students.length !== studentIds.length) {
        throw new BadRequestException('Um ou mais alunos não foram encontrados');
      }
    }

    const plan = await this.prisma.plan.create({
      data: {
        ...planData,
        userId,
        durationMinutes: planData.durationMinutes || 50,
      },
      include: {
        _count: {
          select: {
            studentPlans: true,
          },
        },
      },
    });

    // Associar alunos se fornecidos
    if (studentIds && studentIds.length > 0) {
      const now = new Date();
      for (const studentId of studentIds) {
        await this.prisma.studentPlan.create({
          data: {
            studentId,
            planId: plan.id,
            startDate: now,
            isActive: true,
          },
        });

        // Gerar pagamentos automaticamente
        await this.paymentsService.generatePaymentsForStudentPlan(
          userId,
          studentId,
          plan.id,
          now,
        );
      }
    }

    return this.formatPlanResponse(plan);
  }

  async findAll(
    userId: string,
    query: PaginationDto,
  ): Promise<PaginatedResponseDto<PlanResponseDto>> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [plans, total] = await Promise.all([
      this.prisma.plan.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              studentPlans: true,
            },
          },
        },
      }),
      this.prisma.plan.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return new PaginatedResponseDto(
      plans.map((plan) => this.formatPlanResponse(plan)),
      {
        page,
        limit,
        total,
        totalPages,
      },
    );
  }

  async findOne(userId: string, id: string): Promise<PlanResponseDto> {
    const plan = await this.prisma.plan.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        _count: {
          select: {
            studentPlans: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    return this.formatPlanResponse(plan);
  }

  async update(
    userId: string,
    id: string,
    updatePlanDto: UpdatePlanDto,
  ): Promise<PlanResponseDto> {
    const plan = await this.prisma.plan.findFirst({
      where: { id, userId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    const updatedPlan = await this.prisma.plan.update({
      where: { id },
      data: updatePlanDto,
      include: {
        _count: {
          select: {
            studentPlans: true,
          },
        },
      },
    });

    return this.formatPlanResponse(updatedPlan);
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    const plan = await this.prisma.plan.findFirst({
      where: { id, userId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    await this.prisma.plan.delete({
      where: { id },
    });

    return { message: 'Plano removido com sucesso' };
  }

  async associateStudent(
    userId: string,
    planId: string,
    studentId: string,
  ): Promise<{ message: string }> {
    // Verificar se plano existe e pertence ao usuário
    const plan = await this.prisma.plan.findFirst({
      where: { id: planId, userId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    // Verificar se aluno existe e pertence ao usuário
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, userId },
    });

    if (!student) {
      throw new NotFoundException('Aluno não encontrado');
    }

    // Verificar se associação já existe
    const existing = await this.prisma.studentPlan.findUnique({
      where: {
        studentId_planId: {
          studentId,
          planId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Aluno já está associado a este plano');
    }

    const now = new Date();
    await this.prisma.studentPlan.create({
      data: {
        studentId,
        planId,
        startDate: now,
        isActive: true,
      },
    });

    // Gerar pagamentos automaticamente
    await this.paymentsService.generatePaymentsForStudentPlan(
      userId,
      studentId,
      planId,
      now,
    );

    return { message: 'Aluno associado ao plano com sucesso' };
  }

  async removeStudent(
    userId: string,
    planId: string,
    studentId: string,
  ): Promise<{ message: string }> {
    // Verificar se plano existe e pertence ao usuário
    const plan = await this.prisma.plan.findFirst({
      where: { id: planId, userId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    // Verificar se associação existe
    const association = await this.prisma.studentPlan.findUnique({
      where: {
        studentId_planId: {
          studentId,
          planId,
        },
      },
    });

    if (!association) {
      throw new NotFoundException('Associação não encontrada');
    }

    await this.prisma.studentPlan.delete({
      where: {
        studentId_planId: {
          studentId,
          planId,
        },
      },
    });

    return { message: 'Associação removida com sucesso' };
  }

  async findPlanStudents(userId: string, planId: string) {
    const plan = await this.prisma.plan.findFirst({
      where: { id: planId, userId },
      include: {
        studentPlans: {
          where: { isActive: true },
          include: {
            student: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    return plan.studentPlans.map((sp) => ({
      ...sp.student,
      associationDate: sp.startDate,
      endDate: sp.endDate,
    }));
  }

  private formatPlanResponse(plan: any): PlanResponseDto {
    return {
      id: plan.id,
      userId: plan.userId,
      name: plan.name,
      frequency: plan.frequency,
      value: Number(plan.value),
      durationMinutes: plan.durationMinutes,
      rescheduleMinHours: plan.rescheduleMinHours,
      periodType: plan.periodType,
      daysOfWeek: plan.daysOfWeek,
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }
}