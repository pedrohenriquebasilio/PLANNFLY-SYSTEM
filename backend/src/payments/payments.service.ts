import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { MarkPaymentPaidDto } from './dto/mark-payment-paid.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { ListPaymentsQueryDto } from './dto/list-payments.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { ResponseDto } from '../common/dto/response.dto';
import { LessonsService } from '../lessons/lessons.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => LessonsService))
    private lessonsService: LessonsService,
  ) {}

  async create(userId: string, createPaymentDto: CreatePaymentDto) {
    // Verificar se aluno existe e pertence ao usuário
    const student = await this.prisma.student.findFirst({
      where: {
        id: createPaymentDto.studentId,
        userId,
      },
    });

    if (!student) {
      throw new NotFoundException('Aluno não encontrado');
    }

    // Verificar se plano existe (se fornecido)
    if (createPaymentDto.planId) {
      const plan = await this.prisma.plan.findFirst({
        where: {
          id: createPaymentDto.planId,
          userId,
        },
      });

      if (!plan) {
        throw new NotFoundException('Plano não encontrado');
      }
    }

    // Verificar se já existe pagamento duplicado no mesmo período
    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        userId,
        studentId: createPaymentDto.studentId,
        planId: createPaymentDto.planId || null,
        referenceMonth: createPaymentDto.referenceMonth,
        referenceYear: createPaymentDto.referenceYear,
        ...(createPaymentDto.installmentNumber && {
          installmentNumber: createPaymentDto.installmentNumber,
        }),
      },
    });

    if (existingPayment) {
      throw new ConflictException(
        'Já existe um pagamento para este período e plano',
      );
    }

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        studentId: createPaymentDto.studentId,
        planId: createPaymentDto.planId,
        value: createPaymentDto.value,
        dueDate: new Date(createPaymentDto.dueDate),
        referenceMonth: createPaymentDto.referenceMonth,
        referenceYear: createPaymentDto.referenceYear,
        installmentNumber: createPaymentDto.installmentNumber,
        totalInstallments: createPaymentDto.totalInstallments,
        observations: createPaymentDto.observations,
        gatewayTransactionId: createPaymentDto.gatewayTransactionId,
        status: 'pending',
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
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

    return this.formatPaymentResponse(payment);
  }

  async findAll(
    userId: string,
    query: ListPaymentsQueryDto,
  ): Promise<PaginatedResponseDto<PaymentResponseDto>> {
    const { page = 1, limit = 10, studentId, status, startDate, endDate, month, year } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      ...(studentId && { studentId }),
      ...(status && { status }),
      ...(month && { referenceMonth: parseInt(month) }),
      ...(year && { referenceYear: parseInt(year) }),
      ...(startDate && endDate && {
        dueDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    };

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dueDate: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              name: true,
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
      this.prisma.payment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return new PaginatedResponseDto(
      payments.map((payment) => this.formatPaymentResponse(payment)),
      {
        page,
        limit,
        total,
        totalPages,
      },
    );
  }

  async findOne(userId: string, id: string): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
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

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    return this.formatPaymentResponse(payment);
  }

  async update(
    userId: string,
    id: string,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findFirst({
      where: { id, userId },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: {
        ...(updatePaymentDto.value && { value: updatePaymentDto.value }),
        ...(updatePaymentDto.dueDate && {
          dueDate: new Date(updatePaymentDto.dueDate),
        }),
        ...(updatePaymentDto.paidDate && {
          paidDate: new Date(updatePaymentDto.paidDate),
        }),
        ...(updatePaymentDto.status && { status: updatePaymentDto.status }),
        ...(updatePaymentDto.referenceMonth && {
          referenceMonth: updatePaymentDto.referenceMonth,
        }),
        ...(updatePaymentDto.referenceYear && {
          referenceYear: updatePaymentDto.referenceYear,
        }),
        ...(updatePaymentDto.observations !== undefined && {
          observations: updatePaymentDto.observations,
        }),
        ...(updatePaymentDto.gatewayTransactionId !== undefined && {
          gatewayTransactionId: updatePaymentDto.gatewayTransactionId,
        }),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
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

    return this.formatPaymentResponse(updatedPayment);
  }

  async markAsPaid(
    userId: string,
    id: string,
    markPaymentPaidDto: MarkPaymentPaidDto,
  ): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findFirst({
      where: { id, userId },
      include: {
        plan: true,
        student: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    if (payment.status === 'paid') {
      throw new BadRequestException('Pagamento já está marcado como pago');
    }

    const paidDate = markPaymentPaidDto.paidDate
      ? new Date(markPaymentPaidDto.paidDate)
      : new Date();

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: {
        status: 'paid',
        paidDate,
        gatewayTransactionId: markPaymentPaidDto.gatewayTransactionId,
        observations: markPaymentPaidDto.observations || payment.observations,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
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

    // Se for mensalidade de plano, gerar aulas automaticamente
    if (payment.planId && payment.plan) {
      await this.lessonsService.generateLessonsFromPayment(
        userId,
        payment.studentId,
        payment.planId,
        payment.referenceMonth,
        payment.referenceYear,
      );
    }

    return this.formatPaymentResponse(updatedPayment);
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    const payment = await this.prisma.payment.findFirst({
      where: { id, userId },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    if (payment.status === 'paid') {
      throw new BadRequestException(
        'Não é possível remover um pagamento já pago',
      );
    }

    await this.prisma.payment.delete({
      where: { id },
    });

    return { message: 'Pagamento removido com sucesso' };
  }

  /**
   * Gera mensalidades automaticamente ao associar plano a aluno
   */
  async generatePaymentsForStudentPlan(
    userId: string,
    studentId: string,
    planId: string,
    startDate: Date,
  ): Promise<void> {
    const plan = await this.prisma.plan.findFirst({
      where: { id: planId, userId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    const student = await this.prisma.student.findFirst({
      where: { id: studentId, userId },
    });

    if (!student) {
      throw new NotFoundException('Aluno não encontrado');
    }

    // Calcular número de parcelas baseado no tipo de período
    let totalInstallments = 1;
    switch (plan.periodType) {
      case 'monthly':
        totalInstallments = 1;
        break;
      case 'quarterly':
        totalInstallments = 3;
        break;
      case 'semiannual':
        totalInstallments = 6;
        break;
      case 'annual':
        totalInstallments = 12;
        break;
    }

    // Criar parcelas
    const payments: Prisma.PaymentCreateManyInput[] = [];
    for (let i = 1; i <= totalInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i - 1);

      const referenceDate = new Date(startDate);
      referenceDate.setMonth(referenceDate.getMonth() + i - 1);

      payments.push({
        userId,
        studentId,
        planId,
        value: plan.value,
        dueDate,
        referenceMonth: referenceDate.getMonth() + 1,
        referenceYear: referenceDate.getFullYear(),
        installmentNumber: i,
        totalInstallments,
        status: 'pending',
      });
    }

    await this.prisma.payment.createMany({
      data: payments,
      skipDuplicates: true,
    });
  }

  private formatPaymentResponse(payment: any): PaymentResponseDto {
    return {
      id: payment.id,
      userId: payment.userId,
      studentId: payment.studentId,
      planId: payment.planId,
      value: Number(payment.value),
      dueDate: payment.dueDate,
      paidDate: payment.paidDate,
      status: payment.status,
      referenceMonth: payment.referenceMonth,
      referenceYear: payment.referenceYear,
      observations: payment.observations,
      gatewayTransactionId: payment.gatewayTransactionId,
      installmentNumber: payment.installmentNumber,
      totalInstallments: payment.totalInstallments,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}