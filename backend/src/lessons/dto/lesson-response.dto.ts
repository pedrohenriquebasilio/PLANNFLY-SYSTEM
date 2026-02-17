import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LessonStudentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  cpf: string;
}

export class LessonResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  startDateTime: Date;

  @ApiProperty()
  durationMinutes: number;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  observations?: string;

  @ApiPropertyOptional()
  originalStartDateTime?: Date;

  @ApiPropertyOptional()
  planId?: string;

  @ApiProperty({ type: [LessonStudentDto] })
  students: LessonStudentDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}