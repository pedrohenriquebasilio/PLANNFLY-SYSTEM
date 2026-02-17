import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ListStudentsQueryDto } from './dto/list-students.dto';
import { PaginatedResponseDto } from '../common/dto/response.dto';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => PaymentsService))
    private paymentsService: PaymentsService,
  ) {}

  async create(userId: string, createStudentDto: CreateStudentDto) {
    // Limpa CPF (remove caracteres não numéricos)
    const cleanCpf = createStudentDto.cpf.replace(/\D/g, '');

    // Verifica se já existe aluno com mesmo CPF para este professor
    const existingStudent = await this.prisma.student.findUnique({
      where: {
        userId_cpf: {
          userId,
          cpf: cleanCpf,
        },
      },
    });

    if (existingStudent) {
      throw new ConflictException(
        'Já existe um aluno com este CPF para este professor',
      );
    }

    const { planId, ...studentData } = createStudentDto;

    // Cria o aluno
    const student = await this.prisma.student.create({
      data: {
        ...studentData,
        cpf: cleanCpf,
        userId,
        status: studentData.status || 'active',
      },
    });

    // Se foi fornecido planId, associa o plano
    if (planId) {
      // Verifica se o plano existe e pertence ao usuário
      const plan = await this.prisma.plan.findFirst({
        where: {
          id: planId,
          userId,
        },
      });

      if (!plan) {
        throw new NotFoundException('Plano não encontrado');
      }

      // Calcula data de término baseado no tipo de período
      const startDate = new Date();
      let endDate: Date | null = null;

      if (plan.periodType === 'monthly') {
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (plan.periodType === 'quarterly') {
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 3);
      } else if (plan.periodType === 'semiannual') {
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 6);
      } else if (plan.periodType === 'annual') {
        endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // Associa plano ao aluno
      await this.prisma.studentPlan.create({
        data: {
          studentId: student.id,
          planId: plan.id,
          startDate,
          endDate,
          isActive: true,
        },
      });

      // Gera pagamentos automaticamente
      await this.paymentsService.generatePaymentsForStudentPlan(
        userId,
        student.id,
        plan.id,
        startDate,
      );
    }

    return student;
  }

  async findAll(userId: string, query: ListStudentsQueryDto) {
    const { page = 1, limit = 10, name, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
    };

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    if (status) {
      where.status = status;
    }

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return new PaginatedResponseDto(students, {
      page,
      limit,
      total,
      totalPages,
    });
  }

  async findOne(userId: string, id: string) {
    const student = await this.prisma.student.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        studentPlans: {
          include: {
            plan: true,
          },
          where: {
            isActive: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Aluno não encontrado');
    }

    return student;
  }

  async update(userId: string, id: string, updateStudentDto: UpdateStudentDto) {
    const student = await this.prisma.student.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!student) {
      throw new NotFoundException('Aluno não encontrado');
    }

    return await this.prisma.student.update({
      where: { id },
      data: updateStudentDto,
    });
  }

  async updateStatus(userId: string, id: string, status: 'active' | 'inactive') {
    const student = await this.prisma.student.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!student) {
      throw new NotFoundException('Aluno não encontrado');
    }

    return await this.prisma.student.update({
      where: { id },
      data: { status },
    });
  }

  async remove(userId: string, id: string) {
    const student = await this.prisma.student.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!student) {
      throw new NotFoundException('Aluno não encontrado');
    }

    await this.prisma.student.delete({
      where: { id },
    });

    return { message: 'Aluno removido com sucesso' };
  }
}