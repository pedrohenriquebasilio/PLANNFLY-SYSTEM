import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TimeRangeDto, BlockedSlotDto } from './create-schedule-config.dto';

export class UpdateScheduleConfigDto {
  @ApiPropertyOptional({
    description: 'Dias da semana disponíveis (0=Domingo, 1=Segunda, ..., 6=Sábado)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  availableDays?: string[];

  @ApiPropertyOptional({
    description: 'Horários de funcionamento',
    type: [TimeRangeDto],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TimeRangeDto)
  workingHours?: TimeRangeDto[];

  @ApiPropertyOptional({
    description: 'Horários bloqueados',
    type: [BlockedSlotDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlockedSlotDto)
  blockedSlots?: BlockedSlotDto[];

  @ApiPropertyOptional({ description: 'Timezone' })
  @IsOptional()
  @IsString()
  timezone?: string;
}