import { ApiProperty } from '@nestjs/swagger';

export class AbacatePayWebhookCustomerDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  metadata: {
    name: string;
    email: string;
    cellphone: string;
    taxId: string;
  };
}

export class AbacatePayWebhookProductDto {
  @ApiProperty()
  externalId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  price: number;
}

export class AbacatePayWebhookBillingDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  customer: AbacatePayWebhookCustomerDto;

  @ApiProperty({ type: [AbacatePayWebhookProductDto], required: false })
  products?: AbacatePayWebhookProductDto[];
}

export class AbacatePayWebhookDataDto {
  @ApiProperty()
  billing: AbacatePayWebhookBillingDto;
}

export class AbacatePayWebhookDto {
  @ApiProperty({ description: 'Evento do webhook' })
  event: string;

  @ApiProperty()
  data: AbacatePayWebhookDataDto;
}
