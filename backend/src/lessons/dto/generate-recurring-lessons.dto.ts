import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  Matches,
} from 'class-validator';

export class GenerateRecurringLessonsDto {
  @ApiProperty({
    description: 'ID do aluno',
    example: 'student-uuid',
  })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    description: 'ID do plano',
    example: 'plan-uuid',
  })
  @IsString()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({
    description: 'Data de inicio (YYYY-MM-DD)',
    example: '2026-02-10',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Horario das aulas (HH:mm)',
    example: '10:00',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Horario deve estar no formato HH:mm' })
  time: string;
}
