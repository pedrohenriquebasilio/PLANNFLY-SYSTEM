"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  Calendar,
  Clock,
  CheckCircle2,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Users,
  Info,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { useDashboard } from "@/app/hooks/useDashboard";

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());

  // Calculate start and end dates for the selected month
  const dateParams = useMemo(() => {
    const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  }, [selectedMonth]);

  const { data, todayLessons, activeStudentsCount, isLoading, error, refetch } = useDashboard(dateParams);

  // Navigation handlers
  const goToPreviousMonth = () => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(new Date());
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Format month name
  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  // KPIs data from API
  const kpis = [
    {
      label: "Aulas Hoje",
      value: data?.lessons.today.toString() || "0",
      icon: Calendar,
      color: "text-primary"
    },
    {
      label: "Aulas Realizadas",
      value: data?.lessons.given.toString() || "0",
      icon: CheckCircle2,
      color: "text-green-500"
    },
    {
      label: "Aulas Remarcadas",
      value: data?.lessons.rescheduled.toString() || "0",
      icon: RefreshCw,
      color: "text-orange-500"
    },
    {
      label: "A Receber",
      value: formatCurrency(data?.revenue.pending || 0),
      icon: DollarSign,
      color: "text-emerald-500"
    },
  ];

  // Lessons summary
  const totalLessons = data ?
    data.lessons.today + data.lessons.given + data.lessons.rescheduled + data.lessons.toBeGiven : 0;

  const lessonsSummary = [
    {
      label: "Aulas agendadas",
      value: data?.lessons.toBeGiven.toString() || "0",
      color: "bg-primary",
      percentage: totalLessons > 0 ? ((data?.lessons.toBeGiven || 0) / totalLessons) * 100 : 0,
    },
    {
      label: "Aulas realizadas",
      value: data?.lessons.given.toString() || "0",
      color: "bg-green-500",
      percentage: totalLessons > 0 ? ((data?.lessons.given || 0) / totalLessons) * 100 : 0,
    },
    {
      label: "Aulas remarcadas",
      value: data?.lessons.rescheduled.toString() || "0",
      color: "bg-orange-500",
      percentage: totalLessons > 0 ? ((data?.lessons.rescheduled || 0) / totalLessons) * 100 : 0,
    },
    {
      label: "Aulas hoje",
      value: data?.lessons.today.toString() || "0",
      color: "bg-blue-500",
      percentage: totalLessons > 0 ? ((data?.lessons.today || 0) / totalLessons) * 100 : 0,
    },
  ];

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Dashboard" breadcrumb="Dashboard">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={refetch} variant="outline">
            Tentar novamente
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard" breadcrumb="Dashboard">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {kpis.map((kpi, i) => (
            <Card key={i} className="p-4 md:p-6 bg-card border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-xs md:text-sm font-medium text-muted-foreground">{kpi.label}</p>
                <kpi.icon className={cn("w-4 h-4 md:w-5 md:h-5", kpi.color)} />
              </div>
              {isLoading ? (
                <div className="mt-2 h-9 flex items-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <h2 className="text-2xl md:text-3xl font-bold mt-2 tracking-tight">{kpi.value}</h2>
              )}
            </Card>
          ))}
        </div>

        {/* Date Filter Bar */}
        <Card className="p-4 flex items-center justify-between border-border shadow-sm">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium capitalize min-w-[150px] text-center">
              {formatMonth(selectedMonth)}
            </span>
            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={goToCurrentMonth}>
            Hoje
          </Button>
        </Card>

        {/* Lessons Summary Section */}
        <Card className="overflow-hidden border-border shadow-sm">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Resumo de Aulas</h3>
          </div>
          <div className="p-6 space-y-8">
            {/* Progress bar */}
            <div className="h-4 w-full bg-secondary/50 rounded-full overflow-hidden flex">
              {!isLoading && lessonsSummary.map((item, i) => (
                item.percentage > 0 && (
                  <div
                    key={i}
                    className={cn("h-full transition-all duration-500", item.color)}
                    style={{ width: `${item.percentage}%` }}
                  />
                )
              ))}
            </div>

            <div className="space-y-4">
              {lessonsSummary.map((item, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full", item.color)} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : (
                    <span className="text-sm font-semibold">{item.value}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm">Total de aulas</span>
              </div>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                <span className="font-bold">{totalLessons}</span>
              )}
            </div>
          </div>
        </Card>

        {/* Secondary Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RevenueCard
            received={data?.revenue.received || 0}
            expected={data?.revenue.expected || 0}
            isLoading={isLoading}
          />
          <RevenueProgressCard
            progressData={data?.revenueProgress || []}
            isLoading={isLoading}
          />
          <StudentsCard count={activeStudentsCount} isLoading={isLoading} />
          <TodayLessonsCard lessons={todayLessons} isLoading={isLoading} />
        </div>
      </div>
    </DashboardLayout>
  );
}

function RevenueCard({
  received,
  expected,
  isLoading
}: {
  received: number;
  expected: number;
  isLoading: boolean;
}) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const percentage = expected > 0 ? (received / expected) * 100 : 0;

  return (
    <Card className="md:min-h-[300px] border-border shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Receita Recebida x Esperada</h3>
        </div>
        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
      </div>
      <div className="flex-1 p-6 flex flex-col justify-center">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Recebido</span>
                <span className="font-semibold text-green-600">{formatCurrency(received)}</span>
              </div>
              <div className="h-3 w-full bg-secondary/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Esperado</span>
                <span className="font-semibold">{formatCurrency(expected)}</span>
              </div>
              <div className="h-3 w-full bg-primary/20 rounded-full" />
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {percentage > 0
                  ? `${percentage.toFixed(1)}% da meta atingida`
                  : "Nenhum pagamento recebido ainda"
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function RevenueProgressCard({
  progressData,
  isLoading
}: {
  progressData: Array<{ date: string; received: number; expected: number }>;
  isLoading: boolean;
}) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
    }).format(value);
  };

  // Calculate total for the period
  const totalReceived = progressData.reduce((sum, day) => sum + day.received, 0);
  const totalExpected = progressData.reduce((sum, day) => sum + day.expected, 0);

  return (
    <Card className="md:min-h-[300px] border-border shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Evolucao Mensal</h3>
        </div>
        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
      </div>
      <div className="flex-1 p-6 flex flex-col justify-center">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : progressData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <DollarSign className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Sem dados para o periodo</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Total Recebido</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(totalReceived)}</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Total Esperado</p>
                <p className="text-lg font-bold">{formatCurrency(totalExpected)}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Dados dos ultimos {progressData.length} dias
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function StudentsCard({ count, isLoading }: { count: number; isLoading: boolean }) {
  return (
    <Card className="md:min-h-[300px] border-border shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Alunos Ativos</h3>
        </div>
        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
      </div>
      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        {isLoading ? (
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        ) : (
          <>
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-4xl font-bold text-primary">{count}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {count === 1 ? "aluno ativo" : "alunos ativos"}
            </p>
          </>
        )}
      </div>
    </Card>
  );
}

function TodayLessonsCard({
  lessons,
  isLoading
}: {
  lessons: Array<{
    id: string;
    startDateTime: string;
    durationMinutes: number;
    status: string;
    students: Array<{ id: string; name: string }>;
  }>;
  isLoading: boolean;
}) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "scheduled":
        return "bg-primary";
      case "rescheduled":
        return "bg-orange-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-muted";
    }
  };

  return (
    <Card className="md:min-h-[300px] border-border shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Aulas de Hoje</h3>
        </div>
        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Calendar className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Nenhuma aula hoje</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className={cn("w-2 h-2 rounded-full", getStatusColor(lesson.status))} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {lesson.students.map(s => s.name).join(", ") || "Sem aluno"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(lesson.startDateTime)} - {lesson.durationMinutes}min
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
