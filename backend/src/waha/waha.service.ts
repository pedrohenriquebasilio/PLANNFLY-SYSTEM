import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WahaService {
  private readonly logger = new Logger(WahaService.name);

  constructor(private configService: ConfigService) {}

  private get baseUrl(): string {
    return this.configService.get<string>('WAHA_API_URL', 'http://localhost:3000');
  }

  private buildHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const apiKey = this.configService.get<string>('WAHA_API_KEY');
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }
    return headers;
  }

  async startSession(userId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/sessions`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({ name: userId }),
    });

    if (!res.ok && res.status !== 422) {
      const text = await res.text();
      this.logger.error(`Failed to start WAHA session for ${userId}: ${text}`);
    }
  }

  async getSessionStatus(userId: string): Promise<{ status: string; phone?: string }> {
    const res = await fetch(`${this.baseUrl}/api/sessions/${userId}`, {
      headers: this.buildHeaders(),
    });

    if (!res.ok) {
      return { status: 'STOPPED' };
    }

    const data = await res.json();
    return {
      status: data.status ?? 'STOPPED',
      phone: data.me?.id?.replace('@c.us', '') ?? undefined,
    };
  }

  async getQrCode(userId: string): Promise<string | null> {
    const res = await fetch(`${this.baseUrl}/api/sessions/${userId}/auth/qr`, {
      headers: this.buildHeaders(),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const value: string | undefined = data.value;
    if (!value) return null;

    return value.startsWith('data:') ? value : `data:image/png;base64,${value}`;
  }

  async stopSession(userId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/sessions/${userId}`, {
      method: 'DELETE',
      headers: this.buildHeaders(),
    });

    if (!res.ok && res.status !== 404) {
      const text = await res.text();
      this.logger.error(`Failed to stop WAHA session for ${userId}: ${text}`);
    }
  }
}
