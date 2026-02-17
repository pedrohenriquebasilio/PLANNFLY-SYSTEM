import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface AbacatePayCustomer {
  id: string;
  metadata: {
    name: string;
    email: string;
    cellphone: string;
    taxId: string;
  };
}

interface AbacatePayBilling {
  id: string;
  url: string;
  status: string;
}

interface AbacatePayResponse<T> {
  data: T;
  error: string | null;
}

@Injectable()
export class AbacatePayService {
  private readonly logger = new Logger(AbacatePayService.name);
  private readonly baseUrl = 'https://api.abacatepay.com/v1';
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ABACATEPAY_API_KEY', '');
  }

  async createCustomer(
    name: string,
    email: string,
    cpf: string,
    phone: string,
  ): Promise<AbacatePayCustomer> {
    const body: Record<string, string> = {
      name,
      email,
      cellphone: phone,
      taxId: cpf,
    };

    const response = await this.request<AbacatePayCustomer>(
      '/customer/create',
      body,
    );
    return response;
  }

  async createBilling(
    returnUrl: string,
    completionUrl: string,
    planType: 'monthly' | 'quarterly' = 'monthly',
    customerId: string,
  ): Promise<AbacatePayBilling> {
    const plans = {
      monthly: {
        price: 3990,
        externalId: 'plannfly-monthly',
        name: 'Assinatura Plannfly - Mensal',
      },
      quarterly: {
        price: 8990,
        externalId: 'plannfly-quarterly',
        name: 'Assinatura Plannfly - Trimestral',
      },
    };

    const plan = plans[planType];

    const body = {
      frequency: 'ONE_TIME',
      methods: ['PIX'],
      products: [
        {
          externalId: plan.externalId,
          name: plan.name,
          quantity: 1,
          price: plan.price,
        },
      ],
      returnUrl,
      completionUrl,
      customerId,
    };

    const response = await this.request<AbacatePayBilling>(
      '/billing/create',
      body,
    );
    return response;
  }

  private async request<T>(path: string, body: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `AbacatePay API error [${response.status}]: ${errorText}`,
        );
        throw new InternalServerErrorException(
          'Erro ao comunicar com AbacatePay',
        );
      }

      const result: AbacatePayResponse<T> = await response.json();

      if (result.error) {
        this.logger.error(`AbacatePay error: ${result.error}`);
        throw new InternalServerErrorException(
          'Erro ao comunicar com AbacatePay',
        );
      }

      return result.data;
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error(`AbacatePay request failed: ${error}`);
      throw new InternalServerErrorException(
        'Erro ao comunicar com AbacatePay',
      );
    }
  }
}
