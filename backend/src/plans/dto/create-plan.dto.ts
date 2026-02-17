import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsNumber,
  IsArray,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePlanDto {
  @ApiProperty({ description: 'Nome do plano', example: 'Mensal – 2x por semana' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Frequência de aulas por semana',
    example: 2,
    minimum: 1,
    maximum: 7,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  frequency: number;

  @ApiProperty({ description: 'Valor do plano', example: 200.0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  value: number;

  @ApiPropertyOptional({
    description: 'Duração da aula em minutos',
    example: 50,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(480)
  durationMinutes?: number;

  @ApiProperty({
    description: 'Antecedência mínima para remarcação em horas',
    example: 24,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  rescheduleMinHours: number;

  @ApiProperty({
    description: 'Tipo de período',
    example: 'monthly',
    enum: ['monthly', 'quarterly', 'semiannual', 'annual'],
  })
  @IsString()
  @IsNotEmpty()
  periodType: string;

  @ApiProperty({
    description: 'Dias da semana onde as aulas são geradas (0=Domingo, 6=Sábado)',
    example: ['1', '3'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  daysOfWeek: string[];

  @ApiPropertyOptional({
    description: 'IDs dos alunos para associar ao plano',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  studentIds?: string[];
}