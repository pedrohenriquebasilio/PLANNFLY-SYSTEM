"use client";

import { useState, useEffect, useCallback } from "react";
import { api, isApiConfigured } from "@/app/lib/api";
import type { Plan, CreatePlanDto, UpdatePlanDto } from "@/app/lib/types/payments";
import type { ApiResponseWrapper, PaginatedResponse } from "@/app/lib/types/dashboard";

interface UsePlansResult {
  plans: Plan[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
  create: (data: CreatePlanDto) => Promise<Plan | null>;
  update: (id: string, data: UpdatePlanDto) => Promise<Plan | null>;
  remove: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

interface PlansQueryParams {
  page?: number;
  limit?: number;
}

export function usePlans(params?: PlansQueryParams): UsePlansResult {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
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

      const queryString = queryParams.toString();
      const endpoint = `/plans${queryString ? `?${queryString}` : ""}`;

      const response = await api.get<any>(endpoint);
      // Backend wraps in ResponseDto: { success, data: { data: [...], meta: {...} } }
      const body = response.data?.data || response.data;
      const items = body?.data || body || [];
      const meta = body?.meta || body?.pagination;
      setPlans(Array.isArray(items) ? items : []);
      setPagination(meta || {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar planos";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [params?.page, params?.limit]);

  const create = useCallback(async (data: CreatePlanDto): Promise<Plan | null> => {
    if (!isApiConfigured()) {
      setError("API nao configurada");
      return null;
    }

    try {
      const response = await api.post<any>("/plans", data);
      await fetchPlans();
      return response.data?.data || response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar plano";
      setError(message);
      return null;
    }
  }, [fetchPlans]);

  const update = useCallback(async (id: string, data: UpdatePlanDto): Promise<Plan | null> => {
    if (!isApiConfigured()) {
      setError("API nao configurada");
      return null;
    }

    try {
      const response = await api.patch<any>(`/plans/${id}`, data);
      await fetchPlans();
      return response.data?.data || response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar plano";
      setError(message);
      return null;
    }
  }, [fetchPlans]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    if (!isApiConfigured()) {
      setError("API nao configurada");
      return false;
    }

    try {
      await api.delete(`/plans/${id}`);
      await fetchPlans();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao remover plano";
      setError(message);
      return false;
    }
  }, [fetchPlans]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    pagination,
    isLoading,
    error,
    create,
    update,
    remove,
    refetch: fetchPlans,
  };
}
