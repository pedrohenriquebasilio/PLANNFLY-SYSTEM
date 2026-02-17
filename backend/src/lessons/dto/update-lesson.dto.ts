import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLessonDto {
  @ApiPropertyOptional({
    description: 'ID(s) do(s) aluno(s)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  studentIds?: string[];

  @ApiPropertyOptional({
    description: 'Data e hora de início (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  startDateTime?: string;

  @ApiPropertyOptional({
    description: 'Duração da aula em minutos',
    minimum: 15,
    maximum: 480,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(480)
  durationMinutes?: number;

  @ApiPropertyOptional({
    description: 'Status da aula',
    enum: ['scheduled', 'completed', 'rescheduled', 'cancelled'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Observações' })
  @IsOptional()
  @IsString()
  observations?: string;
}