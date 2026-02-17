import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AbacatePayWebhookDto } from './dto/abacatepay-webhook.dto';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private readonly webhookSecret: string;
  private readonly hmacPublicKey: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.webhookSecret = this.configService.get<string>(
      'ABACATEPAY_WEBHOOK_SECRET',
      '',
    );
    this.hmacPublicKey = this.configService.get<string>(
      'ABACATEPAY_HMAC_PUBLIC_KEY',
      '',
    );
  }

  validateWebhookSecret(secret: string): void {
    if (!this.webhookSecret) {
      this.logger.warn('ABACATEPAY_WEBHOOK_SECRET not configured, skipping secret validation');
      return;
    }
    if (secret !== this.webhookSecret) {
      throw new UnauthorizedException('Invalid webhook secret');
    }
  }

  validateHmacSignature(rawBody: string, signature: string): void {
    if (!this.hmacPublicKey) {
      this.logger.warn('ABACATEPAY_HMAC_PUBLIC_KEY not configured, skipping HMAC validation');
      return;
    }
    if (!signature) {
      throw new UnauthorizedException('Missing webhook signature');
    }

    const isValid = crypto.verify(
      'sha256',
      Buffer.from(rawBody),
      {
        key: this.hmacPublicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      },
      Buffer.from(signature, 'base64'),
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }

  async processWebhook(dto: AbacatePayWebhookDto) {
    const email = dto.data?.billing?.customer?.metadata?.email;
    const status = dto.data?.billing?.status;

    this.logger.log(
      `Webhook received: event=${dto.event}, billingStatus=${status}, email=${email}`,
    );

    if (!email) {
      this.logger.warn('Webhook payload missing customer email');
      return { message: 'Webhook recebido, email não encontrado no payload' };
    }

    if (status === 'PAID' || dto.event === 'billing.paid') {
      const productExternalId = dto.data?.billing?.products?.[0]?.externalId;
      return this.activateSubscription(email, productExternalId);
    }

    this.logger.log(`Webhook event ignored: ${dto.event}, status: ${status}`);
    return { message: 'Webhook recebido' };
  }

  async activateSubscription(email: string, productExternalId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com email ${email} não encontrado`);
    }

    const monthsToAdd =
      productExternalId === 'plannfly-quarterly' ? 3 : 1;

    const baseDate =
      user.subscriptionExpiresAt && user.subscriptionExpiresAt > new Date()
        ? user.subscriptionExpiresAt
        : new Date();

    const expiresAt = new Date(baseDate);
    expiresAt.setMonth(expiresAt.getMonth() + monthsToAdd);

    await this.prisma.user.update({
      where: { email },
      data: {
        subscriptionStatus: 'active',
        subscriptionExpiresAt: expiresAt,
      },
    });

    this.logger.log(
      `Assinatura ativada para: ${email} (plano: ${productExternalId ?? 'monthly'}, expira: ${expiresAt.toISOString()})`,
    );

    return { message: 'Assinatura ativada com sucesso' };
  }
}
