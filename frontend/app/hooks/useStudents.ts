"use client";

import { useState, useEffect, useCallback } from "react";
import { api, isApiConfigured } from "@/app/lib/api";
import type { Student } from "@/app/lib/types/dashboard";

export interface CreateStudentDto {
  name: string;
  phone: string;
  cpf: string;
  status?: "active" | "inactive";
  planId?: string;
}

export interface UpdateStudentDto {
  name?: string;
  phone?: string;
  status?: "active" | "inactive";
}

interface StudentsQueryParams {
  page?: number;
  limit?: number;
  status?: "active" | "inactive";
  search?: string;
}

interface UseStudentsResult {
  students: Student[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
  create: (data: CreateStudentDto) => Promise<Student | null>;
  update: (id: string, data: UpdateStudentDto) => Promise<Student | null>;
  remove: (id: string) => Promise<boolean>;
  toggleStatus: (id: string, status: "active" | "inactive") => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useStudents(params?: StudentsQueryParams): UseStudentsResult {
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    if (!isApiConfigured()) {
      setIsLoading(false);
      setError("API nao configurada");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set("page", params.page.toString());
      if (params?.limit) queryParams.set("limit", params.limit.toString());
      if (params?.status) queryParams.set("status", params.status);
      if (params?.search) queryParams.set("name", params.search);

      const queryString = queryParams.toString();
      const endpoint = `/students${queryString ? `?${queryString}` : ""}`;

      const response = await api.get<any>(endpoint);
      const body = response.data?.data || response.data;
      const items = body?.data || body || [];
      const meta = body?.meta || body?.pagination;
      setStudents(Array.isArray(items) ? items : []);
      setPagination(
        meta || { total: 0, page: 1, limit: 10, totalPages: 0 },
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar alunos";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [params?.page, params?.limit, params?.status, params?.search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const create = useCallback(
    async (data: CreateStudentDto): Promise<Student | null> => {
      try {
        const response = await api.post<any>("/students", data);
        const student = response.data?.data || response.data;
        await fetchStudents();
        return student;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao criar aluno";
        setError(message);
        return null;
      }
    },
    [fetchStudents],
  );

  const update = useCallback(
    async (id: string, data: UpdateStudentDto): Promise<Student | null> => {
      try {
        const response = await api.patch<any>(`/students/${id}`, data);
        const student = response.data?.data || response.data;
        await fetchStudents();
        return student;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao atualizar aluno";
        setError(message);
        return null;
      }
    },
    [fetchStudents],
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await api.delete(`/students/${id}`);
        await fetchStudents();
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao remover aluno";
        setError(message);
        return false;
      }
    },
    [fetchStudents],
  );

  const toggleStatus = useCallback(
    async (id: string, status: "active" | "inactive"): Promise<boolean> => {
      try {
        await api.patch(`/students/${id}/status`, { status });
        await fetchStudents();
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao atualizar status";
        setError(message);
        return false;
      }
    },
    [fetchStudents],
  );

  return {
    students,
    pagination,
    isLoading,
    error,
    create,
    update,
    remove,
    toggleStatus,
    refetch: fetchStudents,
  };
}
