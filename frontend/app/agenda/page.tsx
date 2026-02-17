"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  X,
  Loader2,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { useCalendar } from "@/app/hooks/useCalendar";
import { useStudents } from "@/app/hooks/useStudents";
import { DAYS_OF_WEEK } from "@/app/lib/types/schedule";
import type {
  CalendarDayLesson,
  CreateLessonDto,
  GenerateRecurringDto,
  RecurringResult,
  StudentPlanInfo,
} from "@/app/lib/types/lessons";

const DAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-primary",
  completed: "bg-green-500",
  rescheduled: "bg-orange-500",
  cancelled: "bg-muted-foreground/30",
};

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  scheduled: { bg: "bg-primary/10", text: "text-primary", label: "Agendada" },
  completed: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", label: "Realizada" },
  rescheduled: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400", label: "Remarcada" },
  cancelled: { bg: "bg-muted", text: "text-muted-foreground", label: "Cancelada" },
};

export default function Agenda() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today);
  const [showModal, setShowModal] = useState(false);

  // Calendar data hook (month is 1-indexed for the API)
  const {
    monthData,
    isLoading,
    createLesson,
    generateRecurring,
    fetchStudentWithPlans,
    countWeekLessons,
    refetch,
  } = useCalendar(currentYear, currentMonth + 1);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const days: Array<{ day: number; isCurrentMonth: boolean }> = [];
    const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, isCurrentMonth: true });
    }
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({ day, isCurrentMonth: false });
    }
    return days;
  }, [currentYear, currentMonth, daysInMonth, firstDayOfMonth]);

  // Get lessons for a specific day from monthData
  const getLessonsForDay = useCallback(
    (day: number): CalendarDayLesson[] => {
      const key = formatDateKey(new Date(currentYear, currentMonth, day));
      return monthData[key] || [];
    },
    [monthData, currentYear, currentMonth],
  );

  // Selected day lessons
  const selectedDayLessons = useMemo(() => {
    const key = formatDateKey(selectedDate);
    return monthData[key] || [];
  }, [monthData, selectedDate]);

  const handleCreateLesson = async (dto: CreateLessonDto) => {
    const success = await createLesson(dto);
    if (success) {
      setShowModal(false);
    }
    return success;
  };

  return (
    <DashboardLayout title="Agenda" breadcrumb="Agenda">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-foreground">
            Agenda
          </h1>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Card */}
          <Card className="lg:col-span-2 bg-card border-border shadow-sm rounded-xl overflow-hidden flex flex-col">
            {/* Toolbar */}
            <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-card">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por aluno..."
                  className="pl-9 bg-secondary/50 border-transparent focus:bg-background focus:border-primary/50 transition-all h-10"
                />
              </div>

              <Button
                onClick={() => setShowModal(true)}
                className="hidden sm:flex bg-gradient-primary hover:opacity-90 transition-opacity text-white shadow-lg shadow-primary/25 border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova aula
              </Button>
            </div>

            {/* Calendar Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">
                  {MONTHS[currentMonth]} {currentYear}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={goToPreviousMonth}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={goToNextMonth}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 p-4">
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS_SHORT.map((day) => (
                  <div
                    key={day}
                    className="h-10 flex items-center justify-center text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((item, index) => {
                  const isToday =
                    item.isCurrentMonth &&
                    item.day === today.getDate() &&
                    currentMonth === today.getMonth() &&
                    currentYear === today.getFullYear();

                  const isSelected =
                    item.isCurrentMonth &&
                    item.day === selectedDate.getDate() &&
                    currentMonth === selectedDate.getMonth() &&
                    currentYear === selectedDate.getFullYear();

                  const dayLessons = item.isCurrentMonth
                    ? getLessonsForDay(item.day)
                    : [];

                  // Collect unique statuses for dot indicators
                  const statuses = [
                    ...new Set(dayLessons.map((l) => l.status)),
                  ].filter((s) => s !== "cancelled");

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (item.isCurrentMonth) {
                          setSelectedDate(
                            new Date(currentYear, currentMonth, item.day),
                          );
                        }
                      }}
                      disabled={!item.isCurrentMonth}
                      className={cn(
                        "h-10 md:h-14 flex flex-col items-center justify-center rounded-lg text-sm transition-all relative",
                        item.isCurrentMonth
                          ? "hover:bg-muted cursor-pointer"
                          : "text-muted-foreground/30 cursor-default",
                        isToday &&
                          !isSelected &&
                          "bg-primary/10 text-primary font-semibold",
                        isSelected &&
                          "bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25",
                      )}
                    >
                      <span>{item.day}</span>
                      {statuses.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {statuses.slice(0, 3).map((status) => (
                            <div
                              key={status}
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                isSelected
                                  ? "bg-primary-foreground/70"
                                  : STATUS_COLORS[status],
                              )}
                            />
                          ))}
                          {dayLessons.length > 3 && (
                            <span
                              className={cn(
                                "text-[8px] leading-none",
                                isSelected
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground",
                              )}
                            >
                              +{dayLessons.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex items-center justify-between bg-card">
              <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-primary" />
                  <span>Agendada</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500" />
                  <span>Realizada</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-orange-500" />
                  <span>Remarcada</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Lessons List Card */}
          <Card className="bg-card border-border shadow-sm rounded-xl overflow-hidden flex flex-col md:min-h-[600px]">
            {/* Header */}
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">
                  {selectedDate.toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                  })}
                </h3>
              </div>
            </div>

            {/* Lessons List or Empty State */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : selectedDayLessons.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px]">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">
                    Nenhuma aula
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Nao ha aulas agendadas para este dia.
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {selectedDayLessons.map((lesson) => {
                    const badge = STATUS_BADGE[lesson.status] || STATUS_BADGE.scheduled;
                    return (
                      <div
                        key={lesson.id}
                        className="p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold">
                                {formatTime(lesson.startDateTime)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {lesson.durationMinutes}min
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-foreground">
                              <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">
                                {lesson.students
                                  .map((s) => s.name)
                                  .join(", ")}
                              </span>
                            </div>
                            {lesson.planName && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                <BookOpen className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">
                                  {lesson.planName}
                                </span>
                              </div>
                            )}
                          </div>
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap",
                              badge.bg,
                              badge.text,
                            )}
                          >
                            {badge.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex items-center justify-between bg-card">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-sm font-semibold">
                {selectedDayLessons.length} aula
                {selectedDayLessons.length !== 1 ? "s" : ""}
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* FAB - Mobile only */}
      <button
        onClick={() => setShowModal(true)}
        className="sm:hidden fixed right-4 bottom-20 z-40 w-14 h-14 rounded-full bg-gradient-primary text-white shadow-lg shadow-primary/25 flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Create Lesson Modal */}
      {showModal && (
        <LessonModal
          selectedDate={selectedDate}
          onClose={() => setShowModal(false)}
          onSave={handleCreateLesson}
          onGenerateRecurring={generateRecurring}
          fetchStudentWithPlans={fetchStudentWithPlans}
          countWeekLessons={countWeekLessons}
        />
      )}
    </DashboardLayout>
  );
}

// --------------- Lesson Modal ---------------

function LessonModal({
  selectedDate,
  onClose,
  onSave,
  onGenerateRecurring,
  fetchStudentWithPlans,
  countWeekLessons,
}: {
  selectedDate: Date;
  onClose: () => void;
  onSave: (dto: CreateLessonDto) => Promise<boolean>;
  onGenerateRecurring: (dto: GenerateRecurringDto) => Promise<RecurringResult | null>;
  fetchStudentWithPlans: (id: string) => Promise<any>;
  countWeekLessons: (studentId: string, planId: string, date: Date) => Promise<number>;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form fields
  const [studentId, setStudentId] = useState("");
  const [planId, setPlanId] = useState("");
  const [date, setDate] = useState(formatDateKey(selectedDate));
  const [time, setTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(50);
  const [observations, setObservations] = useState("");
  const [recurring, setRecurring] = useState(false);

  // Student plans state
  const [studentPlans, setStudentPlans] = useState<StudentPlanInfo[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Validation state
  const [dayError, setDayError] = useState<string | null>(null);
  const [frequencyError, setFrequencyError] = useState<string | null>(null);
  const [checkingFrequency, setCheckingFrequency] = useState(false);

  // Active students
  const { students } = useStudents({
    limit: 100,
    status: "active",
  });

  // Selected plan object
  const selectedPlan = useMemo(
    () => studentPlans.find((sp) => sp.plan.id === planId)?.plan || null,
    [studentPlans, planId],
  );

  // Friendly day label for recurring toggle
  const selectedDayLabel = useMemo(() => {
    const d = new Date(date + "T12:00:00");
    const dayIdx = d.getDay().toString();
    return DAYS_OF_WEEK.find((dw) => dw.value === dayIdx)?.label || "";
  }, [date]);

  // Handle student selection → load plans
  const handleStudentChange = async (newStudentId: string) => {
    setStudentId(newStudentId);
    setPlanId("");
    setStudentPlans([]);
    setDayError(null);
    setFrequencyError(null);
    setRecurring(false);

    if (!newStudentId) return;

    setLoadingPlans(true);
    const student = await fetchStudentWithPlans(newStudentId);
    if (student?.studentPlans) {
      setStudentPlans(student.studentPlans.filter((sp: StudentPlanInfo) => sp.isActive));
    }
    setLoadingPlans(false);
  };

  // Validate day against plan's daysOfWeek
  const validateDay = useCallback(
    (dateStr: string, plan: { daysOfWeek: string[] } | null) => {
      if (!plan) {
        setDayError(null);
        return true;
      }

      const d = new Date(dateStr + "T12:00:00");
      const dayOfWeek = d.getDay().toString();

      if (!plan.daysOfWeek.includes(dayOfWeek)) {
        const allowedDays = plan.daysOfWeek
          .map((dw) => DAYS_OF_WEEK.find((d) => d.value === dw)?.shortLabel || dw)
          .join(", ");
        setDayError(`Dia nao permitido pelo plano. Dias permitidos: ${allowedDays}`);
        return false;
      }

      setDayError(null);
      return true;
    },
    [],
  );

  // Check weekly frequency (only for single lesson)
  const checkFrequency = useCallback(
    async (
      sId: string,
      pId: string,
      dateStr: string,
      frequency: number,
    ) => {
      setCheckingFrequency(true);
      const d = new Date(dateStr + "T12:00:00");
      const count = await countWeekLessons(sId, pId, d);
      if (count >= frequency) {
        setFrequencyError(
          `Limite de ${frequency} aula${frequency > 1 ? "s" : ""}/semana atingido (${count} ja agendada${count > 1 ? "s" : ""})`,
        );
      } else {
        setFrequencyError(null);
      }
      setCheckingFrequency(false);
    },
    [countWeekLessons],
  );

  // Handle plan selection
  const handlePlanChange = (newPlanId: string) => {
    setPlanId(newPlanId);
    setFrequencyError(null);
    setRecurring(false);

    const plan = studentPlans.find((sp) => sp.plan.id === newPlanId)?.plan;
    if (plan) {
      setDurationMinutes(plan.durationMinutes);
      validateDay(date, plan);
      if (studentId && !recurring) {
        checkFrequency(studentId, newPlanId, date, plan.frequency);
      }
    } else {
      setDayError(null);
      setFrequencyError(null);
    }
  };

  // Handle date change
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    setFrequencyError(null);

    if (selectedPlan) {
      validateDay(newDate, selectedPlan);
      if (studentId && planId && !recurring) {
        checkFrequency(studentId, planId, newDate, selectedPlan.frequency);
      }
    }
  };

  // Handle recurring toggle
  const handleRecurringToggle = () => {
    const newVal = !recurring;
    setRecurring(newVal);
    // When recurring is on, frequency check per week doesn't apply
    // (backend handles distributing across the period)
    if (newVal) {
      setFrequencyError(null);
    } else if (selectedPlan && studentId && planId) {
      checkFrequency(studentId, planId, date, selectedPlan.frequency);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    if (!recurring && (dayError || frequencyError)) return;
    if (recurring && dayError) return;
    if (!studentId || !planId || !time) return;

    setIsSaving(true);
    try {
      if (recurring) {
        // Generate recurring lessons for all plan days until period end
        const result = await onGenerateRecurring({
          studentId,
          planId,
          startDate: date,
          time,
        });

        if (result) {
          if (result.created > 0) {
            setSuccessMessage(
              `${result.created} aula(s) criada(s) ate ${new Date(result.periodEnd + "T12:00:00").toLocaleDateString("pt-BR")}` +
              (result.skipped > 0 ? ` (${result.skipped} pulada(s) por conflito)` : ""),
            );
            // Auto-close after showing message
            setTimeout(() => onClose(), 2000);
          } else {
            setSubmitError(
              result.skipped > 0
                ? `Nenhuma aula criada. ${result.skipped} horario(s) ja ocupado(s).`
                : "Nenhuma aula criada. Verifique o periodo do plano.",
            );
          }
        } else {
          setSubmitError("Erro ao gerar aulas recorrentes.");
        }
      } else {
        // Single lesson
        const startDateTime = new Date(`${date}T${time}:00`).toISOString();
        const dto: CreateLessonDto = {
          studentIds: [studentId],
          startDateTime,
          durationMinutes,
          planId,
          observations: observations || undefined,
        };

        const success = await onSave(dto);
        if (!success) {
          setSubmitError("Erro ao criar aula. Verifique os dados e tente novamente.");
        }
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Erro ao criar aula",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Build recurring description
  const recurringDescription = useMemo(() => {
    if (!selectedPlan || !planId) return "";
    const dayNames = selectedPlan.daysOfWeek
      .map((dw) => DAYS_OF_WEEK.find((d) => d.value === dw)?.label || dw)
      .join(", ");
    return `Gerar aulas toda ${dayNames} ate o fim do periodo de cobranca`;
  }, [selectedPlan, planId]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <Card className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-b-none sm:rounded-b-xl">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nova Aula</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Student */}
          <div>
            <label className="text-sm font-medium">Aluno</label>
            <select
              value={studentId}
              onChange={(e) => handleStudentChange(e.target.value)}
              required
              className="w-full mt-1 h-10 px-3 rounded-md border border-border bg-background text-sm cursor-pointer"
            >
              <option value="">Selecione um aluno</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Plan */}
          <div>
            <label className="text-sm font-medium">Plano</label>
            {loadingPlans ? (
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground h-10">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando planos...
              </div>
            ) : (
              <select
                value={planId}
                onChange={(e) => handlePlanChange(e.target.value)}
                required
                disabled={!studentId || studentPlans.length === 0}
                className={cn(
                  "w-full mt-1 h-10 px-3 rounded-md border border-border bg-background text-sm cursor-pointer",
                  (!studentId || studentPlans.length === 0) &&
                    "opacity-50 cursor-not-allowed",
                )}
              >
                <option value="">
                  {!studentId
                    ? "Selecione um aluno primeiro"
                    : studentPlans.length === 0
                      ? "Nenhum plano ativo"
                      : "Selecione um plano"}
                </option>
                {studentPlans.map((sp) => (
                  <option key={sp.plan.id} value={sp.plan.id}>
                    {sp.plan.name} ({sp.plan.frequency}x/sem - {sp.plan.durationMinutes}min)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                {recurring ? "Data de inicio" : "Data"}
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                required
                className="mt-1"
              />
              {dayError && !recurring && (
                <p className="text-xs text-destructive mt-1 flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {dayError}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Horario</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="mt-1"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-sm font-medium">Duracao (minutos)</label>
            <Input
              type="number"
              min={15}
              max={480}
              value={durationMinutes}
              onChange={(e) =>
                setDurationMinutes(parseInt(e.target.value) || 50)
              }
              readOnly={!!selectedPlan}
              className={cn(
                "mt-1",
                selectedPlan && "bg-muted cursor-not-allowed",
              )}
            />
            {selectedPlan && (
              <p className="text-xs text-muted-foreground mt-1">
                Duracao definida pelo plano
              </p>
            )}
          </div>

          {/* Recurring toggle */}
          {selectedPlan && (
            <div
              className={cn(
                "p-3 rounded-lg border transition-colors",
                recurring
                  ? "border-primary/50 bg-primary/5"
                  : "border-border bg-muted/30",
              )}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recurring}
                  onChange={handleRecurringToggle}
                  className="mt-0.5 w-4 h-4 rounded border-border accent-primary cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium">
                    Repetir ate o fim do periodo
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {recurringDescription}
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Frequency warning (only for single lesson) */}
          {!recurring && checkingFrequency && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verificando frequencia semanal...
            </div>
          )}
          {!recurring && frequencyError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {frequencyError}
            </div>
          )}

          {/* Observations (only for single lesson) */}
          {!recurring && (
            <div>
              <label className="text-sm font-medium">
                Observacoes (opcional)
              </label>
              <Input
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Ex: Revisao para prova"
                className="mt-1"
              />
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm">
              <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {successMessage}
            </div>
          )}

          {/* Submit error */}
          {submitError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {submitError}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isSaving ||
                !studentId ||
                !planId ||
                !time ||
                (!recurring && (!!dayError || !!frequencyError || checkingFrequency)) ||
                !!successMessage
              }
              className="bg-gradient-primary hover:opacity-90 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {recurring ? "Gerando aulas..." : "Agendando..."}
                </>
              ) : recurring ? (
                "Gerar aulas"
              ) : (
                "Agendar"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
