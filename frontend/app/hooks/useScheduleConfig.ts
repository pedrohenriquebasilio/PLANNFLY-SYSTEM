"use client";

import { useState, useEffect, useCallback } from "react";
import { api, isApiConfigured } from "@/app/lib/api";
import type {
  ScheduleConfig,
  CreateScheduleConfigDto,
  UpdateScheduleConfigDto,
} from "@/app/lib/types/schedule";
import type { ApiResponseWrapper } from "@/app/lib/types/dashboard";

interface UseScheduleConfigResult {
  config: ScheduleConfig | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  isNew: boolean;
  save: (data: CreateScheduleConfigDto | UpdateScheduleConfigDto) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useScheduleConfig(): UseScheduleConfigResult {
  const [config, setConfig] = useState<ScheduleConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);

  const fetchConfig = useCallback(async () => {
    if (!isApiConfigured()) {
      setIsLoading(false);
      setError("API nao configurada");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<ApiResponseWrapper<ScheduleConfig>>("/schedule-config");
      setConfig(response.data.data);
      setIsNew(false);
    } catch (err: any) {
      // 404 means no config exists yet - that's ok
      if (err?.status === 404) {
        setConfig(null);
        setIsNew(true);
        setError(null);
      } else {
        const message = err instanceof Error ? err.message : "Erro ao carregar configuracao";
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const save = useCallback(async (data: CreateScheduleConfigDto | UpdateScheduleConfigDto): Promise<boolean> => {
    if (!isApiConfigured()) {
      setError("API nao configurada");
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      let response;
      if (isNew || !config) {
        // Create new config
        response = await api.post<ApiResponseWrapper<ScheduleConfig>>("/schedule-config", data);
      } else {
        // Update existing config
        response = await api.patch<ApiResponseWrapper<ScheduleConfig>>("/schedule-config", data);
      }
      setConfig(response.data.data);
      setIsNew(false);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar configuracao";
      setError(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [isNew, config]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return {
    config,
    isLoading,
    isSaving,
    error,
    isNew,
    save,
    refetch: fetchConfig,
  };
}
