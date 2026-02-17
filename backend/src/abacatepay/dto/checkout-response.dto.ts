import { ApiProperty } from '@nestjs/swagger';

export class CheckoutResponseDto {
  @ApiProperty({ description: 'URL do checkout gerado no AbacatePay' })
  url: string;
}
