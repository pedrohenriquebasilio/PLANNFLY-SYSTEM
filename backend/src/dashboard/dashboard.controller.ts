import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import {
  DashboardResponseDto,
  DashboardLessonsDto,
  DashboardRevenueDto,
} from './dto/dashboard-response.dto';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { ResponseDto } from '../common/dto/response.dto';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Dashboard principal (resumo geral)' })
  @ApiResponse({
    status: 200,
    description: 'Dados do dashboard',
    type: DashboardResponseDto,
  })
  async getDashboard(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: DashboardQueryDto,
  ): Promise<ResponseDto<DashboardResponseDto>> {
    const dashboard = await this.dashboardService.getDashboard(
      user.userId,
      query,
    );
    return new ResponseDto(dashboard, 'Dados do dashboard');
  }

  @Get('lessons')
  @ApiOperation({ summary: 'Estatísticas de aulas' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas de aulas',
    type: DashboardLessonsDto,
  })
  async getLessonsStats(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: DashboardQueryDto,
  ): Promise<ResponseDto<DashboardLessonsDto>> {
    const stats = await this.dashboardService.getLessonsStats(
      user.userId,
      query,
    );
    return new ResponseDto(stats, 'Estatísticas de aulas');
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Estatísticas financeiras' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas financeiras',
    type: DashboardRevenueDto,
  })
  async getRevenueStats(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: DashboardQueryDto,
  ): Promise<ResponseDto<DashboardRevenueDto>> {
    const stats = await this.dashboardService.getRevenueStats(
      user.userId,
      query,
    );
    return new ResponseDto(stats, 'Estatísticas financeiras');
  }
}