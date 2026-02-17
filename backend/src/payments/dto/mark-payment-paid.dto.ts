import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsString } from 'class-validator';

export class MarkPaymentPaidDto {
  @ApiPropertyOptional({
    description: 'Data de pagamento (ISO 8601). Se não fornecido, usa data atual',
  })
  @IsOptional()
  @IsDateString()
  paidDate?: string;

  @ApiPropertyOptional({ description: 'ID da transação do gateway' })
  @IsOptional()
  @IsString()
  gatewayTransactionId?: string;

  @ApiPropertyOptional({ description: 'Observações' })
  @IsOptional()
  @IsString()
  observations?: string;
}