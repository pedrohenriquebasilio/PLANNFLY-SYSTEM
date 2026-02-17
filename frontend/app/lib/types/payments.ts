// Payments & Plans API Types

export interface Plan {
  id: string;
  userId: string;
  name: string;
  frequency: number;
  value: number;
  durationMinutes: number;
  rescheduleMinHours: number;
  periodType: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
  daysOfWeek: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    studentPlans: number;
  };
}

export interface CreatePlanDto {
  name: string;
  frequency: number;
  value: number;
  durationMinutes?: number;
  rescheduleMinHours: number;
  periodType: string;
  daysOfWeek: string[];
  studentIds?: string[];
}

export interface UpdatePlanDto {
  name?: string;
  frequency?: number;
  value?: number;
  durationMinutes?: number;
  rescheduleMinHours?: number;
  periodType?: string;
  daysOfWeek?: string[];
  isActive?: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  studentId: string;
  planId?: string;
  value: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid';
  referenceMonth: number;
  referenceYear: number;
  observations?: string;
  installmentNumber?: number;
  totalInstallments?: number;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    name: string;
  };
  plan?: {
    id: string;
    name: string;
  };
}

export interface CreatePaymentDto {
  studentId: string;
  planId?: string;
  value: number;
  dueDate: string;
  referenceMonth: number;
  referenceYear: number;
  installmentNumber?: number;
  totalInstallments?: number;
  observations?: string;
}

export interface UpdatePaymentDto {
  value?: number;
  dueDate?: string;
  referenceMonth?: number;
  referenceYear?: number;
  observations?: string;
}

export interface PaymentsQueryParams {
  page?: number;
  limit?: number;
  studentId?: string;
  status?: 'pending' | 'paid';
  month?: string;
  year?: string;
  startDate?: string;
  endDate?: string;
}

// Period type labels
export const PERIOD_TYPE_LABELS: Record<string, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
};

// Month labels
export const MONTH_LABELS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
