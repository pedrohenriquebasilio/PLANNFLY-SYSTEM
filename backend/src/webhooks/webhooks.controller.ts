import {
  Controller,
  Post,
  Body,
  Query,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { WebhooksService } from './webhooks.service';
import type { Request } from 'express';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Post('abacatepay')
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Webhook do AbacatePay para ativação de assinatura',
  })
  @ApiQuery({
    name: 'webhookSecret',
    required: false,
    description: 'Secret para validação do webhook',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processado com sucesso',
  })
  async handleAbacatePayWebhook(
    @Body(new ValidationPipe({ transform: true, whitelist: false, forbidNonWhitelisted: false }))
    body: any,
    @Query('webhookSecret') webhookSecret: string,
    @Headers('x-webhook-signature') signature: string,
    @Req() req: Request,
  ) {
    // Validate webhook secret from query string
    this.webhooksService.validateWebhookSecret(webhookSecret);

    // Validate HMAC signature
    const rawBody =
      typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    this.webhooksService.validateHmacSignature(rawBody, signature);

    return this.webhooksService.processWebhook(body);
  }
}
