"use client";

import { useState, useEffect, useCallback } from "react";
import { api, isApiConfigured } from "@/app/lib/api";
import type {
  CalendarMonthData,
  CreateLessonDto,
  GenerateRecurringDto,
  RecurringResult,
  StudentWithPlans,
} from "@/app/lib/types/lessons";

interface UseCalendarResult {
  monthData: CalendarMonthData;
  isLoading: boolean;
  error: string | null;
  createLesson: (dto: CreateLessonDto) => Promise<boolean>;
  generateRecurring: (dto: GenerateRecurringDto) => Promise<RecurringResult | null>;
  fetchStudentWithPlans: (studentId: string) => Promise<StudentWithPlans | null>;
  countWeekLessons: (studentId: string, planId: string, date: Date) => Promise<number>;
  refetch: () => Promise<void>;
}

export function useCalendar(year: number, month: number): UseCalendarResult {
  const [monthData, setMonthData] = useState<CalendarMonthData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMonth = useCallback(async () => {
    if (!isApiConfigured()) {
      setIsLoading(false);
      setError("API nao configurada");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const monthStr = `${year}-${String(month).padStart(2, "0")}`;
      const response = await api.get<any>(`/calendar/month/${monthStr}`);
      const data = response.data?.data || response.data;
      setMonthData(data && typeof data === "object" ? data : {});
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar calendario";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchMonth();
  }, [fetchMonth]);

  const createLesson = useCallback(
    async (dto: CreateLessonDto): Promise<boolean> => {
      try {
        await api.post("/lessons", dto);
        await fetchMonth();
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao criar aula";
        setError(message);
        return false;
      }
    },
    [fetchMonth],
  );

  const generateRecurring = useCallback(
    async (dto: GenerateRecurringDto): Promise<RecurringResult | null> => {
      try {
        const response = await api.post<any>("/lessons/recurring", dto);
        const data = response.data?.data || response.data;
        await fetchMonth();
        return data as RecurringResult;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao gerar aulas recorrentes";
        setError(message);
        return null;
      }
    },
    [fetchMonth],
  );

  const fetchStudentWithPlans = useCallback(
    async (studentId: string): Promise<StudentWithPlans | null> => {
      try {
        const response = await api.get<any>(`/students/${studentId}`);
        const data = response.data?.data || response.data;
        return data as StudentWithPlans;
      } catch {
        return null;
      }
    },
    [],
  );

  const countWeekLessons = useCallback(
    async (studentId: string, planId: string, date: Date): Promise<number> => {
      try {
        // Calculate Monday and Sunday of the week
        const day = date.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        const monday = new Date(date);
        monday.setDate(date.getDate() + diffToMonday);
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        const startDate = monday.toISOString();
        const endDate = sunday.toISOString();

        const response = await api.get<any>(
          `/lessons?studentId=${studentId}&planId=${planId}&startDate=${startDate}&endDate=${endDate}&limit=50`,
        );
        const body = response.data?.data || response.data;
        const items = body?.data || body || [];
        const lessons = Array.isArray(items) ? items : [];

        // Count non-cancelled lessons
        return lessons.filter(
          (l: any) => l.status !== "cancelled",
        ).length;
      } catch {
        return 0;
      }
    },
    [],
  );

  return {
    monthData,
    isLoading,
    error,
    createLesson,
    generateRecurring,
    fetchStudentWithPlans,
    countWeekLessons,
    refetch: fetchMonth,
  };
}
