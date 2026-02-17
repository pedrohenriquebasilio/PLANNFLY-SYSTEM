import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarEventDto } from './dto/calendar-event.dto';
import { GetCalendarQueryDto } from './dto/get-calendar.dto';
import { ResponseDto } from '../common/dto/response.dto';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async getCalendar(userId: string, query: GetCalendarQueryDto) {
    const { startDate, endDate } = query;

    let whereClause: any = {
      userId,
    };

    if (startDate && endDate) {
      whereClause.startDateTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      whereClause.startDateTime = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      whereClause.startDateTime = {
        lte: new Date(endDate),
      };
    }

    const lessons = await this.prisma.lesson.findMany({
      where: whereClause,
      include: {
        studentLessons: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        startDateTime: 'asc',
      },
    });

    const events: CalendarEventDto[] = lessons.map((lesson) => ({
      id: lesson.id,
      startDateTime: lesson.startDateTime,
      durationMinutes: lesson.durationMinutes,
      status: lesson.status,
      observations: lesson.observations ?? undefined,
      planId: lesson.planId ?? undefined,
      studentIds: lesson.studentLessons.map((ls) => ls.student.id),
      studentNames: lesson.studentLessons.map((ls) => ls.student.name),
    }));

    return events;
  }

  async getDay(userId: string, date: string) {
    const day = parseISO(date);
    const start = startOfDay(day);
    const end = endOfDay(day);

    const lessons = await this.prisma.lesson.findMany({
      where: {
        userId,
        startDateTime: {
          gte: start,
          lte: end,
        },
      },
      include: {
        studentLessons: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        startDateTime: 'asc',
      },
    });

    return lessons.map((lesson) => ({
      id: lesson.id,
      startDateTime: lesson.startDateTime,
      durationMinutes: lesson.durationMinutes,
      status: lesson.status,
      observations: lesson.observations,
      planId: lesson.planId,
      planName: lesson.plan?.name,
      students: lesson.studentLessons.map((ls) => ({
        id: ls.student.id,
        name: ls.student.name,
      })),
    }));
  }

  async getWeek(userId: string, week: string) {
    const weekDate = parseISO(week);
    const start = startOfWeek(weekDate, { weekStartsOn: 1 }); // Segunda-feira
    const end = endOfWeek(weekDate, { weekStartsOn: 1 }); // Domingo

    const lessons = await this.prisma.lesson.findMany({
      where: {
        userId,
        startDateTime: {
          gte: start,
          lte: end,
        },
      },
      include: {
        studentLessons: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        startDateTime: 'asc',
      },
    });

    // Agrupar por dia
    const groupedByDay: Record<string, any[]> = {};
    lessons.forEach((lesson) => {
      const dayKey = lesson.startDateTime.toISOString().split('T')[0];
      if (!groupedByDay[dayKey]) {
        groupedByDay[dayKey] = [];
      }
      groupedByDay[dayKey].push({
        id: lesson.id,
        startDateTime: lesson.startDateTime,
        durationMinutes: lesson.durationMinutes,
        status: lesson.status,
        observations: lesson.observations,
        planId: lesson.planId,
        planName: lesson.plan?.name,
        students: lesson.studentLessons.map((ls) => ({
          id: ls.student.id,
          name: ls.student.name,
        })),
      });
    });

    return groupedByDay;
  }

  async getMonth(userId: string, month: string) {
    const monthDate = parseISO(month + '-01');
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);

    const lessons = await this.prisma.lesson.findMany({
      where: {
        userId,
        startDateTime: {
          gte: start,
          lte: end,
        },
      },
      include: {
        studentLessons: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        startDateTime: 'asc',
      },
    });

    // Agrupar por dia
    const groupedByDay: Record<string, any[]> = {};
    lessons.forEach((lesson) => {
      const dayKey = lesson.startDateTime.toISOString().split('T')[0];
      if (!groupedByDay[dayKey]) {
        groupedByDay[dayKey] = [];
      }
      groupedByDay[dayKey].push({
        id: lesson.id,
        startDateTime: lesson.startDateTime,
        durationMinutes: lesson.durationMinutes,
        status: lesson.status,
        observations: lesson.observations,
        planId: lesson.planId,
        planName: lesson.plan?.name,
        students: lesson.studentLessons.map((ls) => ({
          id: ls.student.id,
          name: ls.student.name,
        })),
      });
    });

    return groupedByDay;
  }
}