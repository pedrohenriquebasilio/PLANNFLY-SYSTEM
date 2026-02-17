import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID do aluno' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiPropertyOptional({ description: 'ID do plano associado' })
  @IsOptional()
  @IsString()
  planId?: string;

  @ApiProperty({ description: 'Valor do pagamento', example: 200.0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  value: number;

  @ApiProperty({ description: 'Data de vencimento (ISO 8601)', example: '2024-01-15T00:00:00Z' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ description: 'Mês de referência (1-12)', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  referenceMonth: number;

  @ApiProperty({ description: 'Ano de referência', example: 2024 })
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  referenceYear: number;

  @ApiPropertyOptional({ description: 'Número da parcela' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  installmentNumber?: number;

  @ApiPropertyOptional({ description: 'Total de parcelas' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalInstallments?: number;

  @ApiPropertyOptional({ description: 'Observações' })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiPropertyOptional({ description: 'ID da transação do gateway' })
  @IsOptional()
  @IsString()
  gatewayTransactionId?: string;
}