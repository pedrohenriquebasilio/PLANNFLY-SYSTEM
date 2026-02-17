import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { MarkPaymentPaidDto } from './dto/mark-payment-paid.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { ListPaymentsQueryDto } from './dto/list-payments.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { ResponseDto } from '../common/dto/response.dto';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(SubscriptionGuard)
  @ApiOperation({ summary: 'Criar novo pagamento' })
  @ApiResponse({
    status: 201,
    description: 'Pagamento criado com sucesso',
    type: PaymentResponseDto,
  })
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<ResponseDto<PaymentResponseDto>> {
    const payment = await this.paymentsService.create(
      user.userId,
      createPaymentDto,
    );
    return new ResponseDto(payment, 'Pagamento criado com sucesso');
  }

  @Get()
  @ApiOperation({ summary: 'Listar pagamentos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pagamentos',
    type: PaginatedResponseDto,
  })
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: ListPaymentsQueryDto,
  ): Promise<PaginatedResponseDto<PaymentResponseDto>> {
    return await this.paymentsService.findAll(user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes do pagamento' })
  @ApiResponse({
    status: 200,
    description: 'Detalhes do pagamento',
    type: PaymentResponseDto,
  })
  async findOne(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ): Promise<ResponseDto<PaymentResponseDto>> {
    const payment = await this.paymentsService.findOne(user.userId, id);
    return new ResponseDto(payment, 'Pagamento encontrado');
  }

  @Patch(':id')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar pagamento' })
  @ApiResponse({
    status: 200,
    description: 'Pagamento atualizado com sucesso',
    type: PaymentResponseDto,
  })
  async update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<ResponseDto<PaymentResponseDto>> {
    const payment = await this.paymentsService.update(
      user.userId,
      id,
      updatePaymentDto,
    );
    return new ResponseDto(payment, 'Pagamento atualizado com sucesso');
  }

  @Patch(':id/paid')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar pagamento como pago' })
  @ApiResponse({
    status: 200,
    description: 'Pagamento marcado como pago',
    type: PaymentResponseDto,
  })
  async markAsPaid(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() markPaymentPaidDto: MarkPaymentPaidDto,
  ): Promise<ResponseDto<PaymentResponseDto>> {
    const payment = await this.paymentsService.markAsPaid(
      user.userId,
      id,
      markPaymentPaidDto,
    );
    return new ResponseDto(payment, 'Pagamento marcado como pago');
  }

  @Delete(':id')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover pagamento' })
  @ApiResponse({
    status: 200,
    description: 'Pagamento removido com sucesso',
  })
  async remove(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ): Promise<ResponseDto<{ message: string }>> {
    const result = await this.paymentsService.remove(user.userId, id);
    return new ResponseDto(result, 'Pagamento removido com sucesso');
  }
}