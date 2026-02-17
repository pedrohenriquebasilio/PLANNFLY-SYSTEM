import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalendarEventDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  startDateTime: Date;

  @ApiProperty()
  durationMinutes: number;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  observations?: string;

  @ApiPropertyOptional()
  planId?: string;

  @ApiProperty({ type: [String] })
  studentIds: string[];

  @ApiProperty({ type: [String] })
  studentNames: string[];
}