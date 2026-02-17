import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TimeRangeDto {
  @ApiProperty({ description: 'Hora de início (formato HH:mm)', example: '08:00' })
  @IsString()
  @IsNotEmpty()
  start: string;

  @ApiProperty({ description: 'Hora de término (formato HH:mm)', example: '12:00' })
  @IsString()
  @IsNotEmpty()
  end: string;
}

export class BlockedSlotDto {
  @ApiProperty({ description: 'Data do bloqueio (formato YYYY-MM-DD)', example: '2024-01-15' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ description: 'Hora de início (formato HH:mm)', example: '10:00' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ description: 'Hora de término (formato HH:mm)', example: '12:00' })
  @IsString()
  @IsNotEmpty()
  endTime: string;
}

export class CreateScheduleConfigDto {
  @ApiProperty({
    description: 'Dias da semana disponíveis (0=Domingo, 1=Segunda, ..., 6=Sábado)',
    example: ['1', '2', '3', '4', '5'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  availableDays: string[];

  @ApiProperty({
    description: 'Horários de funcionamento',
    type: [TimeRangeDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TimeRangeDto)
  workingHours: TimeRangeDto[];

  @ApiPropertyOptional({
    description: 'Horários bloqueados',
    type: [BlockedSlotDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlockedSlotDto)
  blockedSlots?: BlockedSlotDto[];

  @ApiPropertyOptional({ description: 'Timezone', default: 'America/Sao_Paulo' })
  @IsOptional()
  @IsString()
  timezone?: string;
}