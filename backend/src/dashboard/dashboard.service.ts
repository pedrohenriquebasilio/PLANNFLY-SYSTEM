import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  DashboardResponseDto,
  DashboardLessonsDto,
  DashboardRevenueDto,
  RevenueProgressDto,
} from './dto/dashboard-response.dto';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { startOfDay, endOfDay, format, eachDayOfInterval } from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(
    userId: string,
    query: DashboardQueryDto,
  ): Promise<DashboardResponseDto> {
    const { studentId, startDate, endDate } = query;

    const periodStart = startDate
      ? new Date(startDate)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const periodEnd = endDate
      ? new Date(endDate)
      : new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0,
          23, 59, 59,
        );

    const baseLessonFilter: any = {
      userId,
      ...(studentId && {
        studentLessons: { some: { studentId } },
      }),
    };

    const basePaymentFilter: any = {
      userId,
      ...(studentId && { studentId }),
    };

    const today = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    // Run ALL independent queries in parallel
    const [
      todayLessons,
      toBeGivenLessons,
      givenLessons,
      rescheduledLessons,
      receivedPayments,
      expectedPayments,
      pendingPayments,
      revenueProgress,
    ] = await Promise.all([
      // Lesson counts
      this.prisma.lesson.count({
        where: {
          ...baseLessonFilter,
          startDateTime: { gte: today, lte: todayEnd },
        },
      }),
      this.prisma.lesson.count({
        where: {
          ...baseLessonFilter,
          startDateTime: { gt: new Date() },
          status: { in: ['scheduled', 'rescheduled'] },
        },
      }),
      this.prisma.lesson.count({
        where: {
          ...baseLessonFilter,
          status: 'completed',
          ...(startDate && endDate && {
            startDateTime: { gte: periodStart, lte: periodEnd },
          }),
        },
      }),
      this.prisma.lesson.count({
        where: {
          ...baseLessonFilter,
          status: 'rescheduled',
          ...(startDate && endDate && {
            startDateTime: { gte: periodStart, lte: periodEnd },
          }),
        },
      }),
      // Payment aggregates
      this.prisma.payment.aggregate({
        where: {
          ...basePaymentFilter,
          status: 'paid',
          ...(startDate && endDate && {
            paidDate: { gte: periodStart, lte: periodEnd },
          }),
        },
        _sum: { value: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          ...basePaymentFilter,
          ...(startDate && endDate && {
            dueDate: { gte: periodStart, lte: periodEnd },
          }),
        },
        _sum: { value: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          ...basePaymentFilter,
          status: 'pending',
          ...(startDate && endDate && {
            dueDate: { gte: periodStart, lte: periodEnd },
          }),
        },
        _sum: { value: true },
      }),
      // Revenue progress - single grouped query instead of N*2 queries
      this.getRevenueProgress(basePaymentFilter, periodStart, periodEnd),
    ]);

    const lessons: DashboardLessonsDto = {
      today: todayLessons,
      toBeGiven: toBeGivenLessons,
      given: givenLessons,
      rescheduled: rescheduledLessons,
    };

    const revenue: DashboardRevenueDto = {
      received: Number(receivedPayments._sum.value || 0),
      expected: Number(expectedPayments._sum.value || 0),
      pending: Number(pendingPayments._sum.value || 0),
    };

    return { lessons, revenue, revenueProgress };
  }

  private async getRevenueProgress(
    basePaymentFilter: any,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<RevenueProgressDto[]> {
    // Fetch all relevant payments in the period with 2 queries (instead of 60)
    const [paidPayments, allPayments] = await Promise.all([
      this.prisma.payment.findMany({
        where: {
          ...basePaymentFilter,
          status: 'paid',
          paidDate: { gte: periodStart, lte: periodEnd },
        },
        select: { paidDate: true, value: true },
      }),
      this.prisma.payment.findMany({
        where: {
          ...basePaymentFilter,
          dueDate: { gte: periodStart, lte: periodEnd },
        },
        select: { dueDate: true, value: true },
      }),
    ]);

    // Build lookup maps by date
    const receivedByDate = new Map<string, number>();
    for (const p of paidPayments) {
      if (p.paidDate) {
        const key = format(p.paidDate, 'yyyy-MM-dd');
        receivedByDate.set(key, (receivedByDate.get(key) || 0) + Number(p.value));
      }
    }

    const expectedByDate = new Map<string, number>();
    for (const p of allPayments) {
      const key = format(p.dueDate, 'yyyy-MM-dd');
      expectedByDate.set(key, (expectedByDate.get(key) || 0) + Number(p.value));
    }

    // Generate the daily progress array
    const days = eachDayOfInterval({ start: periodStart, end: periodEnd });
    return days.map((day) => {
      const key = format(day, 'yyyy-MM-dd');
      return {
        date: key,
        received: receivedByDate.get(key) || 0,
        expected: expectedByDate.get(key) || 0,
      };
    });
  }

  async getLessonsStats(
    userId: string,
    query: DashboardQueryDto,
  ): Promise<DashboardLessonsDto> {
    const dashboard = await this.getDashboard(userId, query);
    return dashboard.lessons;
  }

  async getRevenueStats(
    userId: string,
    query: DashboardQueryDto,
  ): Promise<DashboardRevenueDto> {
    const dashboard = await this.getDashboard(userId, query);
    return dashboard.revenue;
  }
}
