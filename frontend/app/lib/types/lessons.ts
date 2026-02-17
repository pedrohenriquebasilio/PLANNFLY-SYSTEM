// Lesson & Calendar types

export interface CalendarDayLesson {
  id: string;
  startDateTime: string;
  durationMinutes: number;
  status: 'scheduled' | 'completed' | 'rescheduled' | 'cancelled';
  observations?: string;
  planId?: string;
  planName?: string;
  students: Array<{ id: string; name: string }>;
}

// Response from GET /calendar/month/:month - lessons grouped by "YYYY-MM-DD"
export type CalendarMonthData = Record<string, CalendarDayLesson[]>;

export interface CreateLessonDto {
  studentIds: string[];
  startDateTime: string; // ISO 8601
  durationMinutes: number;
  planId?: string;
  observations?: string;
}

// Student with active plans (from GET /students/:id)
export interface StudentPlanInfo {
  id: string;
  planId: string;
  isActive: boolean;
  plan: {
    id: string;
    name: string;
    frequency: number;
    durationMinutes: number;
    daysOfWeek: string[];
    value: number;
    periodType: string;
  };
}

export interface StudentWithPlans {
  id: string;
  name: string;
  phone: string;
  cpf: string;
  status: string;
  studentPlans: StudentPlanInfo[];
}

export interface GenerateRecurringDto {
  studentId: string;
  planId: string;
  startDate: string; // YYYY-MM-DD
  time: string;      // HH:mm
}

export interface RecurringResult {
  created: number;
  skipped: number;
  periodEnd: string;
}
