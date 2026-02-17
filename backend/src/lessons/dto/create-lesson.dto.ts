import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLessonDto {
  @ApiProperty({
    description: 'ID(s) do(s) aluno(s) - suporta aulas em grupo',
    type: [String],
    example: ['student-id-1'],
  })
  @IsArray()
  @IsString({ each: true })
  studentIds: string[];

  @ApiProperty({
    description: 'Data e hora de início (ISO 8601)',
    example: '2024-01-15T10:00:00Z',
  })
  @IsDateString()
  startDateTime: string;

  @ApiProperty({
    description: 'Duração da aula em minutos',
    example: 50,
    minimum: 15,
    maximum: 480,
  })
  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(480)
  durationMinutes: number;

  @ApiPropertyOptional({ description: 'ID do plano associado (para aulas avulsas, não informar)' })
  @IsOptional()
  @IsString()
  planId?: string;

  @ApiPropertyOptional({ description: 'Observações' })
  @IsOptional()
  @IsString()
  observations?: string;
}