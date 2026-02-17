import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ServerAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const serverSecret = request.headers['x-server-auth'];
    const expectedSecret = this.configService.get<string>('SERVER_AUTH_SECRET');

    if (!expectedSecret) {
      throw new UnauthorizedException('SERVER_AUTH_SECRET not configured');
    }

    if (!serverSecret || serverSecret !== expectedSecret) {
      throw new UnauthorizedException('Invalid server authentication');
    }

    return true;
  }
}
