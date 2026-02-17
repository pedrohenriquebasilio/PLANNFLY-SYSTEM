import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsNumber,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePlanDto {
  @ApiPropertyOptional({ description: 'Nome do plano' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Frequência de aulas por semana',
    minimum: 1,
    maximum: 7,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  frequency?: number;

  @ApiPropertyOptional({ description: 'Valor do plano' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  value?: number;

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
    description: 'Antecedência mínima para remarcação em horas',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  rescheduleMinHours?: number;

  @ApiPropertyOptional({
    description: 'Tipo de período',
    enum: ['monthly', 'quarterly', 'semiannual', 'annual'],
  })
  @IsOptional()
  @IsString()
  periodType?: string;

  @ApiPropertyOptional({
    description: 'Dias da semana onde as aulas são geradas',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  daysOfWeek?: string[];

  @ApiPropertyOptional({ description: 'Se o plano está ativo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}