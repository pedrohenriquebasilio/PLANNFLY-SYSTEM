import {
  Controller,
  Post,
  Get,
  Delete,
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
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { WahaService } from './waha.service';
import { ResponseDto } from '../common/dto/response.dto';

@ApiTags('waha')
@Controller('waha')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@ApiBearerAuth('JWT-auth')
export class WahaController {
  constructor(private wahaService: WahaService) {}

  @Post('connect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sessão WhatsApp no WAHA' })
  @ApiResponse({ status: 200, description: 'Sessão iniciada' })
  async connect(
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<ResponseDto<{ message: string }>> {
    await this.wahaService.startSession(currentUser.userId);
    return new ResponseDto({ message: 'Sessão iniciada' }, 'ok');
  }

  @Get('status')
  @ApiOperation({ summary: 'Status da sessão WhatsApp' })
  @ApiResponse({ status: 200, description: 'Status da sessão' })
  async status(
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<ResponseDto<{ status: string; phone?: string }>> {
    const result = await this.wahaService.getSessionStatus(currentUser.userId);
    return new ResponseDto(result, 'ok');
  }

  @Get('qr')
  @ApiOperation({ summary: 'QR Code para autenticação WhatsApp' })
  @ApiResponse({ status: 200, description: 'QR Code em base64' })
  async qr(
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<ResponseDto<{ qr: string | null }>> {
    const qr = await this.wahaService.getQrCode(currentUser.userId);
    return new ResponseDto({ qr }, 'ok');
  }

  @Delete('disconnect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desconectar sessão WhatsApp' })
  @ApiResponse({ status: 200, description: 'Sessão encerrada' })
  async disconnect(
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<ResponseDto<{ message: string }>> {
    await this.wahaService.stopSession(currentUser.userId);
    return new ResponseDto({ message: 'Sessão encerrada' }, 'ok');
  }
}
