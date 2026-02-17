// Schedule Config API Types

export interface TimeRange {
  start: string; // HH:mm format
  end: string;   // HH:mm format
}

export interface BlockedSlot {
  date: string;      // YYYY-MM-DD format
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
}

export interface ScheduleConfig {
  id: string;
  userId: string;
  availableDays: string[]; // '0' = Sunday, '1' = Monday, etc.
  workingHours: TimeRange[];
  blockedSlots: BlockedSlot[];
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleConfigDto {
  availableDays: string[];
  workingHours: TimeRange[];
  blockedSlots?: BlockedSlot[];
  timezone?: string;
}

export interface UpdateScheduleConfigDto {
  availableDays?: string[];
  workingHours?: TimeRange[];
  blockedSlots?: BlockedSlot[];
  timezone?: string;
}

// Day of week mapping
export const DAYS_OF_WEEK = [
  { value: '0', label: 'Domingo', shortLabel: 'Dom' },
  { value: '1', label: 'Segunda-feira', shortLabel: 'Seg' },
  { value: '2', label: 'Terca-feira', shortLabel: 'Ter' },
  { value: '3', label: 'Quarta-feira', shortLabel: 'Qua' },
  { value: '4', label: 'Quinta-feira', shortLabel: 'Qui' },
  { value: '5', label: 'Sexta-feira', shortLabel: 'Sex' },
  { value: '6', label: 'Sabado', shortLabel: 'Sab' },
] as const;

// Default schedule config
export const DEFAULT_SCHEDULE_CONFIG: CreateScheduleConfigDto = {
  availableDays: ['1', '2', '3', '4', '5'], // Monday to Friday
  workingHours: [
    { start: '08:00', end: '12:00' },
    { start: '14:00', end: '18:00' },
  ],
  blockedSlots: [],
  timezone: 'America/Sao_Paulo',
};
