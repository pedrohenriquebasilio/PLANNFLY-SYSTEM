"use client";

import { useState, useEffect, useCallback } from "react";
import { api, isApiConfigured } from "@/app/lib/api";
import type {
  Payment,
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentsQueryParams,
} from "@/app/lib/types/payments";
import type { ApiResponseWrapper, PaginatedResponse } from "@/app/lib/types/dashboard";

interface UsePaymentsResult {
  payments: Payment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
  create: (data: CreatePaymentDto) => Promise<Payment | null>;
  update: (id: string, data: UpdatePaymentDto) => Promise<Payment | null>;
  markAsPaid: (id: string, paidDate?: string) => Promise<Payment | null>;
  remove: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function usePayments(params?: PaymentsQueryParams): UsePaymentsResult {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
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
      if (params?.studentId) queryParams.set("studentId", params.studentId);
      if (params?.status) queryParams.set("status", params.status);
      if (params?.month) queryParams.set("month", params.month);
      if (params?.year) queryParams.set("year", params.year);
      if (params?.startDate) queryParams.set("startDate", params.startDate);
      if (params?.endDate) queryParams.set("endDate", params.endDate);

      const queryString = queryParams.toString();
      const endpoint = `/payments${queryString ? `?${queryString}` : ""}`;

      const response = await api.get<any>(endpoint);
      // Backend wraps in ResponseDto: { success, data: { data: [...], meta: {...} } }
      const body = response.data?.data || response.data;
      const items = body?.data || body || [];
      const meta = body?.meta || body?.pagination;
      setPayments(Array.isArray(items) ? items : []);
      setPagination(meta || {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar pagamentos";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [
    params?.page,
    params?.limit,
    params?.studentId,
    params?.status,
    params?.month,
    params?.year,
    params?.startDate,
    params?.endDate,
  ]);

  const create = useCallback(async (data: CreatePaymentDto): Promise<Payment | null> => {
    if (!isApiConfigured()) {
      setError("API nao configurada");
      return null;
    }

    try {
      const response = await api.post<any>("/payments", data);
      await fetchPayments();
      return response.data?.data || response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar pagamento";
      setError(message);
      return null;
    }
  }, [fetchPayments]);

  const update = useCallback(async (id: string, data: UpdatePaymentDto): Promise<Payment | null> => {
    if (!isApiConfigured()) {
      setError("API nao configurada");
      return null;
    }

    try {
      const response = await api.patch<any>(`/payments/${id}`, data);
      await fetchPayments();
      return response.data?.data || response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar pagamento";
      setError(message);
      return null;
    }
  }, [fetchPayments]);

  const markAsPaid = useCallback(async (id: string, paidDate?: string): Promise<Payment | null> => {
    if (!isApiConfigured()) {
      setError("API nao configurada");
      return null;
    }

    try {
      const response = await api.patch<any>(`/payments/${id}/paid`, {
        paidDate: paidDate || new Date().toISOString(),
      });
      await fetchPayments();
      return response.data?.data || response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao marcar como pago";
      setError(message);
      return null;
    }
  }, [fetchPayments]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    if (!isApiConfigured()) {
      setError("API nao configurada");
      return false;
    }

    try {
      await api.delete(`/payments/${id}`);
      await fetchPayments();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao remover pagamento";
      setError(message);
      return false;
    }
  }, [fetchPayments]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    pagination,
    isLoading,
    error,
    create,
    update,
    markAsPaid,
    remove,
    refetch: fetchPayments,
  };
}
