import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { WahaService } from './waha.service';
import { WahaController } from './waha.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [WahaController],
  providers: [WahaService],
})
export class WahaModule {}
