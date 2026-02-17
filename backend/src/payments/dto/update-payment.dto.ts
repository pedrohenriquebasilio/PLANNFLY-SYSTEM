import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePaymentDto {
  @ApiPropertyOptional({ description: 'Valor do pagamento' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  value?: number;

  @ApiPropertyOptional({ description: 'Data de vencimento (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Data de pagamento (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  paidDate?: string;

  @ApiPropertyOptional({
    description: 'Status do pagamento',
    enum: ['pending', 'paid'],
  })
  @IsOptional()
  @IsString()
  status?: 'pending' | 'paid';

  @ApiPropertyOptional({ description: 'Mês de referência (1-12)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  referenceMonth?: number;

  @ApiPropertyOptional({ description: 'Ano de referência' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  referenceYear?: number;

  @ApiPropertyOptional({ description: 'Observações' })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiPropertyOptional({ description: 'ID da transação do gateway' })
  @IsOptional()
  @IsString()
  gatewayTransactionId?: string;
}