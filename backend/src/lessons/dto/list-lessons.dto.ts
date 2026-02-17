import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ListLessonsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filtrar por ID do aluno' })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por status',
    enum: ['scheduled', 'completed', 'rescheduled', 'cancelled'],
  })
  @IsOptional()
  @IsEnum(['scheduled', 'completed', 'rescheduled', 'cancelled'])
  status?: string;

  @ApiPropertyOptional({ description: 'Data inicial (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Data final (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ID do plano' })
  @IsOptional()
  @IsString()
  planId?: string;
}