"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Star,
  Loader2,
  MoreHorizontal,
  Check,
  X,
  Trash2,
  Edit,
  Clock,
  Users,
  Calendar,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { cn } from "@/app/lib/utils";
import { usePlans } from "@/app/hooks/usePlans";
import { usePayments } from "@/app/hooks/usePayments";
import { useStudents } from "@/app/hooks/useStudents";
import {
  PERIOD_TYPE_LABELS,
  MONTH_LABELS,
  type Plan,
  type Payment,
  type CreatePlanDto,
  type CreatePaymentDto,
} from "@/app/lib/types/payments";
import { DAYS_OF_WEEK } from "@/app/lib/types/schedule";

type Tab = "planos" | "cobrancas";

export default function Mensalidades() {
  const [activeTab, setActiveTab] = useState<Tab>("planos");

  return (
    <DashboardLayout title="Mensalidades" breadcrumb="Mensalidades">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-foreground">
            Mensalidades
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("planos")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === "planos"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            )}
          >
            Planos de Mensalidade
          </button>
          <button
            onClick={() => setActiveTab("cobrancas")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === "cobrancas"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            )}
          >
            Cobrancas
          </button>
        </div>

        {/* Content */}
        {activeTab === "planos" ? <PlanosTab /> : <CobrancasTab />}
      </div>
    </DashboardLayout>
  );
}

function PlanosTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const { plans, pagination, isLoading, error, create, update, remove } = usePlans({
    page,
    limit: 10,
  });

  // Filter plans by search
  const filteredPlans = useMemo(() => {
    if (!search) return plans;
    const searchLower = search.toLowerCase();
    return plans.filter((plan) =>
      plan.name.toLowerCase().includes(searchLower)
    );
  }, [plans, search]);

  const handleCreate = async (data: CreatePlanDto) => {
    const result = await create(data);
    if (result) {
      setShowModal(false);
    }
  };

  const handleUpdate = async (id: string, data: Partial<CreatePlanDto>) => {
    const result = await update(id, data);
    if (result) {
      setEditingPlan(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este plano?")) {
      await remove(id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <>
      <Card className="bg-card border-border shadow-sm rounded-xl overflow-hidden md:min-h-[500px] flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-card">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar plano..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary/50 border-transparent focus:bg-background focus:border-primary/50 transition-all h-10"
            />
          </div>

          <Button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-gradient-primary hover:opacity-90 transition-opacity text-white shadow-lg shadow-primary/25 border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo plano
          </Button>
        </div>

        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/30 border-b border-border">
          <div className="col-span-4 pl-2">Nome do Plano</div>
          <div className="col-span-2">Frequencia</div>
          <div className="col-span-2">Valor</div>
          <div className="col-span-2">Duracao</div>
          <div className="col-span-2 text-right pr-2">Acoes</div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-destructive">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>{error}</p>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <Star className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium text-foreground">
                Nenhum plano cadastrado
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Crie planos de mensalidade para definir como seus alunos serao
                cobrados.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 p-4 hover:bg-muted/30 transition-all active:scale-[0.98] sm:active:scale-100"
                >
                  {/* Mobile Layout */}
                  <div className="sm:hidden space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{plan.name}</span>
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(plan.value)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {plan.frequency}x/semana
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {plan.durationMinutes}min
                      </span>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPlan(plan)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(plan.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex col-span-4 items-center pl-2">
                    <div>
                      <span className="font-medium">{plan.name}</span>
                      <p className="text-xs text-muted-foreground">
                        {PERIOD_TYPE_LABELS[plan.periodType] || plan.periodType}
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex col-span-2 items-center text-sm">
                    {plan.frequency}x por semana
                  </div>
                  <div className="hidden sm:flex col-span-2 items-center font-medium text-primary">
                    {formatCurrency(plan.value)}
                  </div>
                  <div className="hidden sm:flex col-span-2 items-center text-sm text-muted-foreground">
                    {plan.durationMinutes} min/aula
                  </div>
                  <div className="hidden sm:flex col-span-2 items-center justify-end gap-1 pr-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingPlan(plan)}
                      className="h-8 w-8"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(plan.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-card">
          <span className="text-sm text-muted-foreground">
            {pagination.total} plano(s)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {pagination.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Create/Edit Modal */}
      {(showModal || editingPlan) && (
        <PlanModal
          plan={editingPlan}
          onClose={() => {
            setShowModal(false);
            setEditingPlan(null);
          }}
          onSave={editingPlan ? (data) => handleUpdate(editingPlan.id, data) : handleCreate}
        />
      )}
    </>
  );
}

function CobrancasTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "pending" | "paid">("");
  const [showModal, setShowModal] = useState(false);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const { payments, pagination, isLoading, error, create, markAsPaid, remove } =
    usePayments({
      page,
      limit: 10,
      status: statusFilter || undefined,
    });

  // Filter payments by search
  const filteredPayments = useMemo(() => {
    if (!search) return payments;
    const searchLower = search.toLowerCase();
    return payments.filter(
      (payment) =>
        payment.student?.name?.toLowerCase().includes(searchLower) ||
        payment.plan?.name?.toLowerCase().includes(searchLower)
    );
  }, [payments, search]);

  const handleCreate = async (data: CreatePaymentDto) => {
    const result = await create(data);
    if (result) {
      setShowModal(false);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    await markAsPaid(id);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover esta cobranca?")) {
      await remove(id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const isOverdue = (payment: Payment) => {
    if (payment.status === "paid") return false;
    const dueDate = new Date(payment.dueDate);
    return dueDate < new Date();
  };

  const getStatusBadge = (payment: Payment) => {
    if (payment.status === "paid") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <Check className="w-3 h-3" />
          Pago
        </span>
      );
    }
    if (isOverdue(payment)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          <AlertCircle className="w-3 h-3" />
          Atrasado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
        <Clock className="w-3 h-3" />
        Pendente
      </span>
    );
  };

  return (
    <>
      <Card className="bg-card border-border shadow-sm rounded-xl overflow-hidden md:min-h-[500px] flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-card">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por aluno..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-secondary/50 border-transparent focus:bg-background focus:border-primary/50 transition-all h-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "" | "pending" | "paid")}
              className="h-10 px-3 rounded-md border border-border bg-background text-sm"
            >
              <option value="">Todos os status</option>
              <option value="pending">Pendentes</option>
              <option value="paid">Pagos</option>
            </select>
          </div>

          <Button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-gradient-primary hover:opacity-90 transition-opacity text-white shadow-lg shadow-primary/25 border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova cobranca
          </Button>
        </div>

        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/30 border-b border-border">
          <div className="col-span-3 pl-2">Aluno</div>
          <div className="col-span-2">Referencia</div>
          <div className="col-span-2">Valor</div>
          <div className="col-span-2">Vencimento</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right pr-2">Acoes</div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-destructive">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>{error}</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium text-foreground">
                Nenhuma cobranca encontrada
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Nao ha cobrancas registradas ou correspondentes a sua pesquisa.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 p-4 hover:bg-muted/30 transition-all active:scale-[0.98] sm:active:scale-100"
                >
                  {/* Mobile Layout */}
                  <div className="sm:hidden space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {payment.student?.name || "Aluno"}
                      </span>
                      {getStatusBadge(payment)}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {MONTH_LABELS[payment.referenceMonth - 1]}/{payment.referenceYear}
                      </span>
                      <span className="font-bold text-primary">
                        {formatCurrency(payment.value)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Venc: {formatDate(payment.dueDate)}
                      </span>
                      <div className="flex gap-2">
                        {payment.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsPaid(payment.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Pagar
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(payment.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex col-span-3 items-center pl-2">
                    <div>
                      <span className="font-medium">
                        {payment.student?.name || "Aluno"}
                      </span>
                      {payment.plan && (
                        <p className="text-xs text-muted-foreground">
                          {payment.plan.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:flex col-span-2 items-center text-sm">
                    {MONTH_LABELS[payment.referenceMonth - 1]}/{payment.referenceYear}
                  </div>
                  <div className="hidden sm:flex col-span-2 items-center font-medium text-primary">
                    {formatCurrency(payment.value)}
                  </div>
                  <div className="hidden sm:flex col-span-2 items-center text-sm">
                    {formatDate(payment.dueDate)}
                  </div>
                  <div className="hidden sm:flex col-span-2 items-center">
                    {getStatusBadge(payment)}
                  </div>
                  <div className="hidden sm:flex col-span-1 items-center justify-end gap-1 pr-2">
                    {payment.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMarkAsPaid(payment.id)}
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                        title="Marcar como pago"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(payment.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-card">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Pago</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Pendente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Atrasado</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {pagination.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Create Payment Modal */}
      {showModal && (
        <PaymentModal
          onClose={() => setShowModal(false)}
          onSave={handleCreate}
        />
      )}
    </>
  );
}

// Plan Modal Component
function PlanModal({
  plan,
  onClose,
  onSave,
}: {
  plan: Plan | null;
  onClose: () => void;
  onSave: (data: CreatePlanDto) => Promise<void>;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<CreatePlanDto>({
    name: plan?.name || "",
    frequency: plan?.frequency || 1,
    value: plan?.value || 0,
    durationMinutes: plan?.durationMinutes || 50,
    rescheduleMinHours: plan?.rescheduleMinHours || 24,
    periodType: plan?.periodType || "monthly",
    daysOfWeek: plan?.daysOfWeek || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <Card className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-b-none sm:rounded-b-xl">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {plan ? "Editar Plano" : "Novo Plano"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Nome do Plano</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Mensal - 2x por semana"
              required
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Frequencia (x/semana)</label>
              <Input
                type="number"
                min={1}
                max={7}
                value={formData.frequency}
                onChange={(e) => setFormData((prev) => ({ ...prev, frequency: parseInt(e.target.value) || 1 }))}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Valor (R$)</label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={formData.value}
                onChange={(e) => setFormData((prev) => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Duracao da Aula (min)</label>
              <Input
                type="number"
                min={15}
                max={480}
                value={formData.durationMinutes}
                onChange={(e) => setFormData((prev) => ({ ...prev, durationMinutes: parseInt(e.target.value) || 50 }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Periodo</label>
              <select
                value={formData.periodType}
                onChange={(e) => setFormData((prev) => ({ ...prev, periodType: e.target.value }))}
                className="w-full mt-1 h-10 px-3 rounded-md border border-border bg-background text-sm"
              >
                <option value="monthly">Mensal</option>
                <option value="quarterly">Trimestral</option>
                <option value="semiannual">Semestral</option>
                <option value="annual">Anual</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Antecedencia para Remarcacao (horas)</label>
            <Input
              type="number"
              min={0}
              value={formData.rescheduleMinHours}
              onChange={(e) => setFormData((prev) => ({ ...prev, rescheduleMinHours: parseInt(e.target.value) || 0 }))}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Dias da Semana</label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    formData.daysOfWeek.includes(day.value)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  )}
                >
                  {day.shortLabel}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-primary hover:opacity-90 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// Payment Modal Component
function PaymentModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: CreatePaymentDto) => Promise<void>;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const { students, isLoading: loadingStudents } = useStudents({ limit: 100, status: 'active' });
  const { plans, isLoading: loadingPlans } = usePlans({ limit: 100 });

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [formData, setFormData] = useState<CreatePaymentDto>({
    studentId: "",
    planId: "",
    value: 0,
    dueDate: new Date(currentYear, currentMonth - 1, 10).toISOString().split("T")[0],
    referenceMonth: currentMonth,
    referenceYear: currentYear,
  });

  // Auto-fill value when plan is selected
  const handlePlanChange = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    setFormData((prev) => ({
      ...prev,
      planId: planId || "",
      value: plan ? plan.value : 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave({
      ...formData,
      dueDate: new Date(formData.dueDate).toISOString(),
    });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <Card className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-b-none sm:rounded-b-xl">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nova Cobranca</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Aluno</label>
            <select
              value={formData.studentId}
              onChange={(e) => setFormData((prev) => ({ ...prev, studentId: e.target.value }))}
              required
              className="w-full mt-1 h-10 px-3 rounded-md border border-border bg-background text-sm"
            >
              <option value="">Selecione um aluno</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Plano (opcional)</label>
            <select
              value={formData.planId}
              onChange={(e) => handlePlanChange(e.target.value)}
              className="w-full mt-1 h-10 px-3 rounded-md border border-border bg-background text-sm"
            >
              <option value="">Sem plano vinculado</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(plan.value)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Valor (R$)</label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={formData.value}
                onChange={(e) => setFormData((prev) => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                required
                readOnly={!!formData.planId}
                className={cn("mt-1", formData.planId && "bg-muted cursor-not-allowed")}
              />
              {formData.planId && (
                <p className="text-xs text-muted-foreground mt-1">
                  Valor definido pelo plano
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Vencimento</label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Mes de Referencia</label>
              <select
                value={formData.referenceMonth}
                onChange={(e) => setFormData((prev) => ({ ...prev, referenceMonth: parseInt(e.target.value) }))}
                className="w-full mt-1 h-10 px-3 rounded-md border border-border bg-background text-sm"
              >
                {MONTH_LABELS.map((month, i) => (
                  <option key={i} value={i + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Ano de Referencia</label>
              <Input
                type="number"
                min={2020}
                max={2100}
                value={formData.referenceYear}
                onChange={(e) => setFormData((prev) => ({ ...prev, referenceYear: parseInt(e.target.value) || currentYear }))}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Observacoes (opcional)</label>
            <Input
              value={formData.observations || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, observations: e.target.value }))}
              placeholder="Ex: Desconto aplicado"
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !formData.studentId}
              className="bg-gradient-primary hover:opacity-90 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Criar Cobranca"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
