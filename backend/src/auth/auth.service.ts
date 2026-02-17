import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateGoogleUser(googleId: string, email: string, name: string) {
    let user = await this.prisma.user.findUnique({
      where: { googleId },
    });

    if (!user) {
      // Tenta encontrar por email caso não exista por googleId
      user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (user && !user.googleId) {
        // Atualiza com googleId se já existir por email mas sem googleId
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        });
      } else if (!user) {
        // Cria novo usuário
        user = await this.prisma.user.create({
          data: {
            googleId,
            email,
            name,
          },
        });
      }
    } else {
      // Atualiza nome se necessário
      if (user.name !== name) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { name },
        });
      }
    }

    return user;
  }

  async generateTokens(userId: string, email: string, name: string) {
    const payload = { sub: userId, email, name };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m' as const,
    });

    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    const expiresAt = new Date();
    
    // Calcula a data de expiração baseado em expiresIn
    const days = parseInt(expiresIn.replace('d', '')) || 7;
    expiresAt.setDate(expiresAt.getDate() + days);

    // Salva refresh token no banco
    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    const payload = {
      sub: tokenRecord.userId,
      email: tokenRecord.user.email,
      name: tokenRecord.user.name,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m' as const,
    });

    return { accessToken };
  }

  async revokeRefreshToken(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  async revokeAllUserTokens(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}