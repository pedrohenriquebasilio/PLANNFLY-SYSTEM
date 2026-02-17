"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Edit,
  Trash2,
  X,
  User,
  Phone,
  FileText,
  UserCheck,
  UserX,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { cn } from "@/app/lib/utils";
import {
  useStudents,
  type CreateStudentDto,
  type UpdateStudentDto,
} from "@/app/hooks/useStudents";
import { usePlans } from "@/app/hooks/usePlans";
import type { Student } from "@/app/lib/types/dashboard";

function formatCpf(cpf: string): string {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11) return cpf;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return phone;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-BR");
}

export default function Students() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const {
    students,
    pagination,
    isLoading,
    error,
    create,
    update,
    remove,
    toggleStatus,
  } = useStudents({
    page,
    limit: 10,
    status: statusFilter || undefined,
    search: search || undefined,
  });

  const handleCreate = async (data: CreateStudentDto) => {
    const result = await create(data);
    if (result) {
      setShowModal(false);
    }
  };

  const handleUpdate = async (id: string, data: UpdateStudentDto) => {
    const result = await update(id, data);
    if (result) {
      setEditingStudent(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este aluno?")) {
      await remove(id);
    }
  };

  const handleToggleStatus = async (student: Student) => {
    const newStatus = student.status === "active" ? "inactive" : "active";
    await toggleStatus(student.id, newStatus);
  };

  return (
    <DashboardLayout title="Alunos" breadcrumb="Alunos">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-foreground">
            Alunos
          </h1>
        </div>

        {/* Content Card */}
        <Card className="bg-card border-border shadow-sm rounded-xl overflow-hidden md:min-h-[600px] flex flex-col">
          {/* Toolbar */}
          <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-card">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por nome..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 bg-secondary/50 border-transparent focus:bg-background focus:border-primary/50 transition-all h-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as "" | "active" | "inactive");
                  setPage(1);
                }}
                className="h-10 px-3 rounded-md border border-border bg-background text-sm cursor-pointer"
              >
                <option value="">Todos os status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>

            <Button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto bg-gradient-primary hover:opacity-90 transition-opacity text-white shadow-lg shadow-primary/25 border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar aluno
            </Button>
          </div>

          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/30 border-b border-border">
            <div className="col-span-3 pl-2">Nome</div>
            <div className="col-span-2">Telefone</div>
            <div className="col-span-2">CPF</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Cadastro</div>
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
            ) : students.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium text-foreground">
                  Nenhum aluno encontrado
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  {search
                    ? "Nenhum aluno corresponde a sua pesquisa."
                    : "Cadastre seu primeiro aluno para comecar."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 p-4 hover:bg-muted/30 transition-all active:scale-[0.98] sm:active:scale-100"
                  >
                    {/* Mobile Layout */}
                    <div className="sm:hidden space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{student.name}</span>
                        <StatusBadge status={student.status} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {formatPhone(student.phone)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {formatCpf(student.cpf)}
                        </span>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(student)}
                          title={
                            student.status === "active"
                              ? "Desativar"
                              : "Ativar"
                          }
                        >
                          {student.status === "active" ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingStudent(student)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex col-span-3 items-center pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium truncate">
                          {student.name}
                        </span>
                      </div>
                    </div>
                    <div className="hidden sm:flex col-span-2 items-center text-sm text-muted-foreground">
                      {formatPhone(student.phone)}
                    </div>
                    <div className="hidden sm:flex col-span-2 items-center text-sm text-muted-foreground font-mono">
                      {formatCpf(student.cpf)}
                    </div>
                    <div className="hidden sm:flex col-span-2 items-center">
                      <StatusBadge status={student.status} />
                    </div>
                    <div className="hidden sm:flex col-span-1 items-center text-sm text-muted-foreground">
                      {formatDate(student.createdAt)}
                    </div>
                    <div className="hidden sm:flex col-span-2 items-center justify-end gap-1 pr-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleToggleStatus(student)}
                        title={
                          student.status === "active"
                            ? "Desativar aluno"
                            : "Ativar aluno"
                        }
                      >
                        {student.status === "active" ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-green-600" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingStudent(student)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(student.id)}
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
              {pagination.total} aluno{pagination.total !== 1 ? "s" : ""}
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
      </div>

      {/* Create Modal */}
      {showModal && (
        <StudentModal
          onClose={() => setShowModal(false)}
          onSave={handleCreate}
        />
      )}

      {/* Edit Modal */}
      {editingStudent && (
        <StudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSave={(data) =>
            handleUpdate(editingStudent.id, {
              name: data.name,
              phone: data.phone,
              status: data.status,
            })
          }
        />
      )}
    </DashboardLayout>
  );
}

// --------------- Status Badge ---------------

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Ativo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
      Inativo
    </span>
  );
}

// --------------- Student Modal ---------------

function StudentModal({
  student,
  onClose,
  onSave,
}: {
  student?: Student | null;
  onClose: () => void;
  onSave: (data: CreateStudentDto) => Promise<void>;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const isEditing = !!student;

  const { plans, isLoading: loadingPlans } = usePlans({ limit: 100 });

  const [formData, setFormData] = useState<CreateStudentDto>({
    name: student?.name || "",
    phone: student?.phone || "",
    cpf: student?.cpf || "",
    status: student?.status || "active",
    planId: "",
  });

  // CPF mask
  const handleCpfChange = (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 11);
    let masked = clean;
    if (clean.length > 9) {
      masked = clean.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
    } else if (clean.length > 6) {
      masked = clean.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    } else if (clean.length > 3) {
      masked = clean.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    }
    setFormData((prev) => ({ ...prev, cpf: masked }));
  };

  // Phone mask
  const handlePhoneChange = (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 11);
    let masked = clean;
    if (clean.length > 6) {
      masked = clean.replace(/(\d{2})(\d{5})(\d{1,4})/, "($1) $2-$3");
    } else if (clean.length > 2) {
      masked = clean.replace(/(\d{2})(\d{1,5})/, "($1) $2");
    }
    setFormData((prev) => ({ ...prev, phone: masked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic validation
    const cleanCpf = formData.cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) {
      setFormError("CPF deve ter 11 digitos");
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setFormError("Telefone invalido");
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        cpf: cleanCpf,
        phone: cleanPhone,
        planId: formData.planId || undefined,
      });
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Erro ao salvar aluno",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <Card className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-b-none sm:rounded-b-xl">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isEditing ? "Editar Aluno" : "Novo Aluno"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium">Nome</label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Nome completo do aluno"
              required
              minLength={2}
              className="mt-1"
            />
          </div>

          {/* Phone and CPF */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Telefone</label>
              <Input
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(11) 99999-9999"
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">CPF</label>
              <Input
                value={formData.cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                placeholder="000.000.000-00"
                required
                readOnly={isEditing}
                className={cn("mt-1", isEditing && "bg-muted cursor-not-allowed")}
              />
              {isEditing && (
                <p className="text-xs text-muted-foreground mt-1">
                  CPF nao pode ser alterado
                </p>
              )}
            </div>
          </div>

          {/* Plan (only on create) */}
          {!isEditing && (
            <div>
              <label className="text-sm font-medium">
                Plano (opcional)
              </label>
              <select
                value={formData.planId || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, planId: e.target.value }))
                }
                className="w-full mt-1 h-10 px-3 rounded-md border border-border bg-background text-sm cursor-pointer"
              >
                <option value="">Sem plano vinculado</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} -{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(plan.value)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Vincular um plano gera cobranças automaticamente
              </p>
            </div>
          )}

          {/* Status (only on edit) */}
          {isEditing && (
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as "active" | "inactive",
                  }))
                }
                className="w-full mt-1 h-10 px-3 rounded-md border border-border bg-background text-sm cursor-pointer"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          )}

          {/* Error */}
          {formError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {formError}
            </div>
          )}

          {/* Actions */}
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
              ) : isEditing ? (
                "Salvar"
              ) : (
                "Cadastrar"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
