import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleConfigDto } from './dto/create-schedule-config.dto';
import { UpdateScheduleConfigDto } from './dto/update-schedule-config.dto';

@Injectable()
export class ScheduleConfigService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createScheduleConfigDto: CreateScheduleConfigDto) {
    // Verifica se já existe configuração para este usuário
    const existing = await this.prisma.scheduleConfig.findUnique({
      where: { userId },
    });

    if (existing) {
      return await this.update(userId, createScheduleConfigDto);
    }

    return await this.prisma.scheduleConfig.create({
      data: {
        userId,
        availableDays: createScheduleConfigDto.availableDays,
        workingHours: createScheduleConfigDto.workingHours as any,
        blockedSlots: createScheduleConfigDto.blockedSlots as any,
        timezone: createScheduleConfigDto.timezone || 'America/Sao_Paulo',
      },
    });
  }

  async findOne(userId: string) {
    const config = await this.prisma.scheduleConfig.findUnique({
      where: { userId },
    });

    if (!config) {
      throw new NotFoundException('Configuração de agenda não encontrada');
    }

    return config;
  }

  async update(userId: string, updateScheduleConfigDto: UpdateScheduleConfigDto) {
    const config = await this.prisma.scheduleConfig.findUnique({
      where: { userId },
    });

    if (!config) {
      throw new NotFoundException('Configuração de agenda não encontrada');
    }

    return await this.prisma.scheduleConfig.update({
      where: { userId },
      data: {
        ...(updateScheduleConfigDto.availableDays && {
          availableDays: updateScheduleConfigDto.availableDays,
        }),
        ...(updateScheduleConfigDto.workingHours && {
          workingHours: updateScheduleConfigDto.workingHours as any,
        }),
        ...(updateScheduleConfigDto.blockedSlots !== undefined && {
          blockedSlots: updateScheduleConfigDto.blockedSlots as any,
        }),
        ...(updateScheduleConfigDto.timezone && {
          timezone: updateScheduleConfigDto.timezone,
        }),
      },
    });
  }

  async validateTimeSlot(
    userId: string,
    date: Date,
    startTime: string,
    durationMinutes: number,
  ): Promise<{ valid: boolean; reason?: string }> {
    const config = await this.prisma.scheduleConfig.findUnique({
      where: { userId },
    });

    if (!config) {
      return { valid: false, reason: 'Configuração de agenda não encontrada' };
    }

    // Verifica dia da semana
    const dayOfWeek = date.getDay().toString();
    if (!config.availableDays.includes(dayOfWeek)) {
      return { valid: false, reason: 'Dia da semana não disponível' };
    }

    // Verifica horários de funcionamento
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startDateTime = new Date(date);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + durationMinutes);

    const workingHours: Array<{ start: string; end: string }> =
      config.workingHours as any;

    const isWithinWorkingHours = workingHours.some((range) => {
      const [rangeStartHour, rangeStartMinute] = range.start.split(':').map(Number);
      const [rangeEndHour, rangeEndMinute] = range.end.split(':').map(Number);

      const rangeStart = new Date(date);
      rangeStart.setHours(rangeStartHour, rangeStartMinute, 0, 0);

      const rangeEnd = new Date(date);
      rangeEnd.setHours(rangeEndHour, rangeEndMinute, 0, 0);

      return startDateTime >= rangeStart && endDateTime <= rangeEnd;
    });

    if (!isWithinWorkingHours) {
      return { valid: false, reason: 'Horário fora do funcionamento' };
    }

    // Verifica bloqueios
    const blockedSlots: Array<{
      date: string;
      startTime: string;
      endTime: string;
    }> = (config.blockedSlots as any) || [];

    const dateStr = date.toISOString().split('T')[0];
    const hasBlockedSlot = blockedSlots.some((blocked) => {
      if (blocked.date !== dateStr) return false;

      const [blockedStartHour, blockedStartMinute] = blocked.startTime
        .split(':')
        .map(Number);
      const [blockedEndHour, blockedEndMinute] = blocked.endTime
        .split(':')
        .map(Number);

      const blockedStart = new Date(date);
      blockedStart.setHours(blockedStartHour, blockedStartMinute, 0, 0);

      const blockedEnd = new Date(date);
      blockedEnd.setHours(blockedEndHour, blockedEndMinute, 0, 0);

      return (
        (startDateTime >= blockedStart && startDateTime < blockedEnd) ||
        (endDateTime > blockedStart && endDateTime <= blockedEnd) ||
        (startDateTime <= blockedStart && endDateTime >= blockedEnd)
      );
    });

    if (hasBlockedSlot) {
      return { valid: false, reason: 'Horário está bloqueado' };
    }

    return { valid: true };
  }
}