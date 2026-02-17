import {
  Controller,
  Post,
  UseGuards,
  Req,
  Res,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SyncAuthDto } from './dto/sync-auth.dto';
import { ServerAuthGuard } from '../common/guards/server-auth.guard';
import { ResponseDto } from '../common/dto/response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sync')
  @UseGuards(ServerAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sincronizar usuário do NextAuth com o backend' })
  @ApiResponse({
    status: 200,
    description: 'Usuário sincronizado e tokens gerados',
  })
  async syncUser(@Body() syncAuthDto: SyncAuthDto) {
    const user = await this.authService.validateGoogleUser(
      syncAuthDto.googleId,
      syncAuthDto.email,
      syncAuthDto.name,
    );

    const tokens = await this.authService.generateTokens(
      user.id,
      user.email,
      user.name,
    );

    return new ResponseDto(
      {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: 900,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          subscriptionStatus: user.subscriptionStatus,
        },
      },
      'Usuário sincronizado com sucesso',
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token usando refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Token renovado com sucesso',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: Request,
  ): Promise<ResponseDto<{ accessToken: string }>> {
    const refreshToken =
      refreshTokenDto.refreshToken ||
      req.cookies?.refreshToken ||
      req.headers['x-refresh-token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token não fornecido');
    }

    const { accessToken } = await this.authService.refreshAccessToken(
      refreshToken as string,
    );

    return new ResponseDto({ accessToken }, 'Token renovado com sucesso');
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fazer logout e revogar refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Logout realizado com sucesso',
  })
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken =
      req.body.refreshToken ||
      req.cookies?.refreshToken ||
      req.headers['x-refresh-token'];

    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken as string);
    }

    res.clearCookie('refreshToken');

    res.json(new ResponseDto(null, 'Logout realizado com sucesso'));
  }
}
