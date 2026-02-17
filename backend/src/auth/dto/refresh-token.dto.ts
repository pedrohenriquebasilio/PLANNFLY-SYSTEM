import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiPropertyOptional({ description: 'Refresh token (também pode vir via cookie)' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}