import { Module } from '@nestjs/common';
import { ScheduleConfigService } from './schedule-config.service';
import { ScheduleConfigController } from './schedule-config.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ScheduleConfigController],
  providers: [ScheduleConfigService],
  exports: [ScheduleConfigService],
})
export class ScheduleConfigModule {}
