// Dashboard API Types

export interface DashboardLessons {
  today: number;
  toBeGiven: number;
  given: number;
  rescheduled: number;
}

export interface DashboardRevenue {
  received: number;
  expected: number;
  pending: number;
}

export interface RevenueProgress {
  date: string;
  received: number;
  expected: number;
}

export interface DashboardData {
  lessons: DashboardLessons;
  revenue: DashboardRevenue;
  revenueProgress: RevenueProgress[];
}

export interface DashboardQueryParams {
  studentId?: string;
  startDate?: string;
  endDate?: string;
}

// API Response wrapper
export interface ApiResponseWrapper<T> {
  data: T;
  message: string;
  statusCode: number;
  timestamp?: string;
}

// Calendar types
export interface CalendarLesson {
  id: string;
  startDateTime: string;
  durationMinutes: number;
  status: 'scheduled' | 'completed' | 'rescheduled' | 'cancelled';
  observations?: string;
  students: Array<{
    id: string;
    name: string;
  }>;
}

// Student types (for listing)
export interface Student {
  id: string;
  name: string;
  phone: string;
  cpf: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
  statusCode: number;
}
