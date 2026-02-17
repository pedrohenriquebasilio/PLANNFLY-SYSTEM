import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) {
      throw new HttpException('Usuário não autenticado', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true, subscriptionExpiresAt: true },
    });

    if (!user || user.subscriptionStatus !== 'active') {
      throw new HttpException(
        'Assinatura necessária para realizar esta ação',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    if (user.subscriptionExpiresAt && user.subscriptionExpiresAt < new Date()) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { subscriptionStatus: 'inactive' },
      });

      throw new HttpException(
        'Assinatura expirada. Renove para continuar.',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    return true;
  }
}
