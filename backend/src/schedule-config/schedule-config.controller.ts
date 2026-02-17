import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ScheduleConfigService } from './schedule-config.service';
import { CreateScheduleConfigDto } from './dto/create-schedule-config.dto';
import { UpdateScheduleConfigDto } from './dto/update-schedule-config.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { ResponseDto } from '../common/dto/response.dto';

@ApiTags('schedule-config')
@Controller('schedule-config')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ScheduleConfigController {
  constructor(private readonly scheduleConfigService: ScheduleConfigService) {}

  @Post()
  @UseGuards(SubscriptionGuard)
  @ApiOperation({ summary: 'Criar ou atualizar configuração de agenda' })
  @ApiResponse({
    status: 201,
    description: 'Configuração criada/atualizada com sucesso',
  })
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() createScheduleConfigDto: CreateScheduleConfigDto,
  ): Promise<ResponseDto<any>> {
    const config = await this.scheduleConfigService.create(
      user.userId,
      createScheduleConfigDto,
    );
    return new ResponseDto(config, 'Configuração de agenda salva com sucesso');
  }

  @Get()
  @ApiOperation({ summary: 'Obter configuração de agenda atual' })
  @ApiResponse({
    status: 200,
    description: 'Configuração de agenda',
  })
  async findOne(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ResponseDto<any>> {
    const config = await this.scheduleConfigService.findOne(user.userId);
    return new ResponseDto(config, 'Configuração encontrada');
  }

  @Patch()
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar configuração de agenda' })
  @ApiResponse({
    status: 200,
    description: 'Configuração atualizada com sucesso',
  })
  async update(
    @CurrentUser() user: CurrentUserPayload,
    @Body() updateScheduleConfigDto: UpdateScheduleConfigDto,
  ): Promise<ResponseDto<any>> {
    const config = await this.scheduleConfigService.update(
      user.userId,
      updateScheduleConfigDto,
    );
    return new ResponseDto(config, 'Configuração atualizada com sucesso');
  }
}