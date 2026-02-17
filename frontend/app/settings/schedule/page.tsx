"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Switch } from "@/app/components/ui/switch";
import {
  Clock,
  Plus,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  Check,
  Calendar,
  X,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { useScheduleConfig } from "@/app/hooks/useScheduleConfig";
import {
  DAYS_OF_WEEK,
  DEFAULT_SCHEDULE_CONFIG,
  type TimeRange,
  type BlockedSlot,
  type CreateScheduleConfigDto,
} from "@/app/lib/types/schedule";

export default function SchedulePage() {
  const { config, isLoading, isSaving, error, isNew, save } = useScheduleConfig();

  // Local state for form
  const [availableDays, setAvailableDays] = useState<string[]>(DEFAULT_SCHEDULE_CONFIG.availableDays);
  const [workingHours, setWorkingHours] = useState<TimeRange[]>(DEFAULT_SCHEDULE_CONFIG.workingHours);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load config into form when fetched
  useEffect(() => {
    if (config) {
      setAvailableDays(config.availableDays);
      setWorkingHours(config.workingHours || DEFAULT_SCHEDULE_CONFIG.workingHours);
      setBlockedSlots(config.blockedSlots || []);
    }
  }, [config]);

  // Track changes
  useEffect(() => {
    if (!config && !isNew) return;

    const originalDays = config?.availableDays || DEFAULT_SCHEDULE_CONFIG.availableDays;
    const originalHours = config?.workingHours || DEFAULT_SCHEDULE_CONFIG.workingHours;
    const originalBlocked = config?.blockedSlots || [];

    const daysChanged = JSON.stringify(availableDays.sort()) !== JSON.stringify([...originalDays].sort());
    const hoursChanged = JSON.stringify(workingHours) !== JSON.stringify(originalHours);
    const blockedChanged = JSON.stringify(blockedSlots) !== JSON.stringify(originalBlocked);

    setHasChanges(daysChanged || hoursChanged || blockedChanged);
  }, [availableDays, workingHours, blockedSlots, config, isNew]);

  // Toggle day
  const toggleDay = (day: string) => {
    setAvailableDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  // Working hours handlers
  const addWorkingHour = () => {
    setWorkingHours(prev => [...prev, { start: "09:00", end: "17:00" }]);
  };

  const removeWorkingHour = (index: number) => {
    setWorkingHours(prev => prev.filter((_, i) => i !== index));
  };

  const updateWorkingHour = (index: number, field: "start" | "end", value: string) => {
    setWorkingHours(prev =>
      prev.map((hour, i) =>
        i === index ? { ...hour, [field]: value } : hour
      )
    );
  };

  // Blocked slots handlers
  const addBlockedSlot = () => {
    const today = new Date().toISOString().split("T")[0];
    setBlockedSlots(prev => [...prev, { date: today, startTime: "12:00", endTime: "13:00" }]);
  };

  const removeBlockedSlot = (index: number) => {
    setBlockedSlots(prev => prev.filter((_, i) => i !== index));
  };

  const updateBlockedSlot = (index: number, field: keyof BlockedSlot, value: string) => {
    setBlockedSlots(prev =>
      prev.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      )
    );
  };

  // Save handler
  const handleSave = async () => {
    const data: CreateScheduleConfigDto = {
      availableDays,
      workingHours,
      blockedSlots,
      timezone: "America/Sao_Paulo",
    };

    const success = await save(data);
    if (success) {
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // Error state
  if (error && !isLoading) {
    return (
      <DashboardLayout title="Horarios" breadcrumb="Configuracoes / Horarios">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-muted-foreground">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Horarios" breadcrumb="Configuracoes / Horarios">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-foreground">
              Configuracao de Horarios
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Defina seus dias e horarios de atendimento
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={cn(
              "bg-gradient-primary hover:opacity-90 transition-opacity text-white shadow-lg shadow-primary/25 border-0",
              saveSuccess && "bg-green-500"
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Salvo!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alteracoes
              </>
            )}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Days of Week */}
            <Card className="border-border shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border flex items-center gap-2 bg-card">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Dias de Atendimento</h3>
              </div>
              <div className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione os dias da semana em que voce atende
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = availableDays.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        onClick={() => toggleDay(day.value)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all duration-200 text-center",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span className="text-sm font-medium block">{day.shortLabel}</span>
                        <span className="text-xs opacity-70 hidden sm:block">{day.label.split("-")[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Working Hours */}
            <Card className="border-border shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between bg-card">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold">Horarios de Funcionamento</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addWorkingHour}
                  className="gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Defina os intervalos de horario em que voce esta disponivel
                </p>

                {workingHours.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Clock className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">Nenhum horario configurado</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addWorkingHour}
                      className="mt-4"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Horario
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workingHours.map((hour, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-lg bg-muted/30 border border-border"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <label className="text-sm text-muted-foreground whitespace-nowrap">
                            Das
                          </label>
                          <Input
                            type="time"
                            value={hour.start}
                            onChange={(e) => updateWorkingHour(index, "start", e.target.value)}
                            className="w-full sm:w-32 bg-background"
                          />
                          <label className="text-sm text-muted-foreground whitespace-nowrap">
                            ate
                          </label>
                          <Input
                            type="time"
                            value={hour.end}
                            onChange={(e) => updateWorkingHour(index, "end", e.target.value)}
                            className="w-full sm:w-32 bg-background"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeWorkingHour(index)}
                          className="text-muted-foreground hover:text-destructive self-end sm:self-auto"
                          disabled={workingHours.length <= 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Visual preview */}
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                    Visualizacao
                  </p>
                  <div className="relative h-12 bg-muted/30 rounded-lg overflow-hidden">
                    {/* Time labels */}
                    <div className="absolute inset-x-0 top-0 flex justify-between px-2 text-[10px] text-muted-foreground">
                      <span>00:00</span>
                      <span>06:00</span>
                      <span>12:00</span>
                      <span>18:00</span>
                      <span>24:00</span>
                    </div>
                    {/* Working hours bars */}
                    {workingHours.map((hour, index) => {
                      const [startH, startM] = hour.start.split(":").map(Number);
                      const [endH, endM] = hour.end.split(":").map(Number);
                      const startPercent = ((startH * 60 + startM) / (24 * 60)) * 100;
                      const endPercent = ((endH * 60 + endM) / (24 * 60)) * 100;
                      const width = endPercent - startPercent;

                      return (
                        <div
                          key={index}
                          className="absolute top-4 h-6 bg-primary/60 rounded"
                          style={{
                            left: `${startPercent}%`,
                            width: `${width}%`,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            {/* Blocked Slots */}
            <Card className="border-border shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between bg-card">
                <div className="flex items-center gap-2">
                  <X className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold">Bloqueios de Horario</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addBlockedSlot}
                  className="gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Bloqueie horarios especificos para compromissos pessoais
                </p>

                {blockedSlots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Calendar className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">Nenhum bloqueio configurado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blockedSlots.map((slot, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <label className="text-sm text-muted-foreground whitespace-nowrap">
                            Data
                          </label>
                          <Input
                            type="date"
                            value={slot.date}
                            onChange={(e) => updateBlockedSlot(index, "date", e.target.value)}
                            className="w-full sm:w-40 bg-background"
                          />
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <label className="text-sm text-muted-foreground whitespace-nowrap">
                            das
                          </label>
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateBlockedSlot(index, "startTime", e.target.value)}
                            className="w-full sm:w-32 bg-background"
                          />
                          <label className="text-sm text-muted-foreground whitespace-nowrap">
                            ate
                          </label>
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateBlockedSlot(index, "endTime", e.target.value)}
                            className="w-full sm:w-32 bg-background"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBlockedSlot(index)}
                          className="text-muted-foreground hover:text-destructive self-end sm:self-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Info Card */}
            <Card className="border-border shadow-sm p-6 bg-primary/5">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Como funciona?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Os horarios configurados aqui serao usados para validar o agendamento de aulas.
                    Aulas so poderao ser marcadas nos dias e horarios que voce definir como disponiveis.
                    Bloqueios de horario impedem agendamentos em datas e horarios especificos.
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
