import {
  Controller,
  Post,
  Body,
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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { AbacatePayService } from './abacatepay.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CheckoutResponseDto } from './dto/checkout-response.dto';
import { ResponseDto } from '../common/dto/response.dto';

@ApiTags('abacatepay')
@Controller('abacatepay')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AbacatePayController {
  constructor(
    private abacatePayService: AbacatePayService,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gerar link de checkout do AbacatePay' })
  @ApiResponse({
    status: 200,
    description: 'URL do checkout gerada com sucesso',
    type: CheckoutResponseDto,
  })
  async createCheckout(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body('planType') planType?: string,
    @Body('cpf') cpf?: string,
    @Body('phone') phone?: string,
  ): Promise<ResponseDto<CheckoutResponseDto>> {
    const validPlanType: 'monthly' | 'quarterly' =
      planType === 'quarterly' ? 'quarterly' : 'monthly';

    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: { name: true, email: true },
    });

    const customer = await this.abacatePayService.createCustomer(
      user?.name ?? '',
      user?.email ?? '',
      cpf ?? '',
      phone ?? '',
    );

    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3001',
    );

    const billing = await this.abacatePayService.createBilling(
      `${frontendUrl}/subscription`,
      `${frontendUrl}/subscription?status=completed`,
      validPlanType,
      customer.id,
    );

    return new ResponseDto({ url: billing.url }, 'Checkout gerado com sucesso');
  }
}
