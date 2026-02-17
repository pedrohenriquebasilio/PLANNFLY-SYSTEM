import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { ScheduleConfigModule } from './schedule-config/schedule-config.module';
import { PlansModule } from './plans/plans.module';
import { PaymentsModule } from './payments/payments.module';
import { LessonsModule } from './lessons/lessons.module';
import { CalendarModule } from './calendar/calendar.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { AbacatePayModule } from './abacatepay/abacatepay.module';
import { WahaModule } from './waha/waha.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Rate Limiting - Proteção contra brute force e DDoS
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,   // 1 segundo
        limit: 3,    // 3 requisições por segundo
      },
      {
        name: 'medium',
        ttl: 10000,  // 10 segundos
        limit: 20,   // 20 requisições por 10 segundos
      },
      {
        name: 'long',
        ttl: 60000,  // 1 minuto
        limit: 100,  // 100 requisições por minuto
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    StudentsModule,
    ScheduleConfigModule,
    PlansModule,
    PaymentsModule,
    LessonsModule,
    CalendarModule,
    DashboardModule,
    WebhooksModule,
    AbacatePayModule,
    WahaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Aplicar rate limiting globalmente
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
