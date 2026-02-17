import { ApiProperty } from '@nestjs/swagger';

export class PlanResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  frequency: number;

  @ApiProperty()
  value: number;

  @ApiProperty()
  durationMinutes: number;

  @ApiProperty()
  rescheduleMinHours: number;

  @ApiProperty()
  periodType: string;

  @ApiProperty({ type: [String] })
  daysOfWeek: string[];

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}