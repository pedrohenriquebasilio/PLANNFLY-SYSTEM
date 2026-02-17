"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api, isApiConfigured } from "@/app/lib/api";
import type {
  DashboardData,
  DashboardQueryParams,
  ApiResponseWrapper,
  CalendarLesson,
  PaginatedResponse,
  Student,
} from "@/app/lib/types/dashboard";

interface UseDashboardResult {
  data: DashboardData | null;
  todayLessons: CalendarLesson[];
  activeStudentsCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboard(params?: DashboardQueryParams): UseDashboardResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [todayLessons, setTodayLessons] = useState<CalendarLesson[]>([]);
  const [activeStudentsCount, setActiveStudentsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!isApiConfigured()) {
      setIsLoading(false);
      setError("API não configurada");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (params?.studentId) queryParams.set("studentId", params.studentId);
      if (params?.startDate) queryParams.set("startDate", params.startDate);
      if (params?.endDate) queryParams.set("endDate", params.endDate);

      const queryString = queryParams.toString();
      const endpoint = `/dashboard${queryString ? `?${queryString}` : ""}`;
      const today = new Date().toISOString().split("T")[0];

      // Fetch all data in parallel
      const [dashboardResult, lessonsResult, studentsResult] = await Promise.allSettled([
        api.get<any>(endpoint),
        api.get<any>(`/calendar/day/${today}`),
        api.get<any>("/students?limit=1&status=active"),
      ]);

      // Dashboard data
      if (dashboardResult.status === "fulfilled") {
        setData(dashboardResult.value.data?.data || dashboardResult.value.data);
      } else {
        throw dashboardResult.reason;
      }

      // Today's lessons
      if (lessonsResult.status === "fulfilled") {
        const lessons = lessonsResult.value.data?.data || lessonsResult.value.data;
        setTodayLessons(Array.isArray(lessons) ? lessons : []);
      } else {
        setTodayLessons([]);
      }

      // Active students count
      if (studentsResult.status === "fulfilled") {
        const body = studentsResult.value.data?.data || studentsResult.value.data;
        const meta = body?.meta || body?.pagination;
        setActiveStudentsCount(meta?.total || 0);
      } else {
        setActiveStudentsCount(0);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar dashboard";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [params?.studentId, params?.startDate, params?.endDate]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchDashboard();
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchDashboard]);

  return {
    data,
    todayLessons,
    activeStudentsCount,
    isLoading,
    error,
    refetch: fetchDashboard,
  };
}
