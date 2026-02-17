import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  studentId: string;

  @ApiPropertyOptional()
  planId?: string;

  @ApiProperty()
  value: number;

  @ApiProperty()
  dueDate: Date;

  @ApiPropertyOptional()
  paidDate?: Date;

  @ApiProperty()
  status: string;

  @ApiProperty()
  referenceMonth: number;

  @ApiProperty()
  referenceYear: number;

  @ApiPropertyOptional()
  observations?: string;

  @ApiPropertyOptional()
  gatewayTransactionId?: string;

  @ApiPropertyOptional()
  installmentNumber?: number;

  @ApiPropertyOptional()
  totalInstallments?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}