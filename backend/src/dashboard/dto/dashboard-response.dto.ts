import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardLessonsDto {
  @ApiProperty()
  today: number;

  @ApiProperty()
  toBeGiven: number;

  @ApiProperty()
  given: number;

  @ApiProperty()
  rescheduled: number;
}

export class DashboardRevenueDto {
  @ApiProperty()
  received: number;

  @ApiProperty()
  expected: number;

  @ApiProperty()
  pending: number;
}

export class RevenueProgressDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  received: number;

  @ApiProperty()
  expected: number;
}

export class DashboardResponseDto {
  @ApiProperty()
  lessons: DashboardLessonsDto;

  @ApiProperty()
  revenue: DashboardRevenueDto;

  @ApiProperty({ type: [RevenueProgressDto] })
  revenueProgress: RevenueProgressDto[];
}