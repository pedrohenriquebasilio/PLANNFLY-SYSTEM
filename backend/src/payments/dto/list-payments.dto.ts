import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ListPaymentsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filtrar por ID do aluno' })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por status', enum: ['pending', 'paid'] })
  @IsOptional()
  @IsEnum(['pending', 'paid'])
  status?: string;

  @ApiPropertyOptional({ description: 'Data inicial (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Data final (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filtrar por mês de referência (1-12)' })
  @IsOptional()
  @IsString()
  month?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ano de referência' })
  @IsOptional()
  @IsString()
  year?: string;
}