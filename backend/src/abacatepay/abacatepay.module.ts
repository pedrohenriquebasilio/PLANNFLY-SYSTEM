import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AbacatePayService } from './abacatepay.service';
import { AbacatePayController } from './abacatepay.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AbacatePayController],
  providers: [AbacatePayService],
  exports: [AbacatePayService],
})
export class AbacatePayModule {}
