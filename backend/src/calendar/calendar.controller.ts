import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { CalendarEventDto } from './dto/calendar-event.dto';
import { GetCalendarQueryDto } from './dto/get-calendar.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { ResponseDto } from '../common/dto/response.dto';

@ApiTags('calendar')
@Controller('calendar')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  @ApiOperation({ summary: 'Obter eventos do calendário' })
  @ApiResponse({
    status: 200,
    description: 'Eventos do calendário',
    type: [CalendarEventDto],
  })
  async getCalendar(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: GetCalendarQueryDto,
  ): Promise<ResponseDto<CalendarEventDto[]>> {
    const events = await this.calendarService.getCalendar(user.userId, query);
    return new ResponseDto(events, 'Eventos do calendário');
  }

  @Get('day/:date')
  @ApiOperation({ summary: 'Obter aulas do dia específico' })
  @ApiResponse({
    status: 200,
    description: 'Aulas do dia',
  })
  async getDay(
    @CurrentUser() user: CurrentUserPayload,
    @Param('date') date: string,
  ): Promise<ResponseDto<any[]>> {
    const lessons = await this.calendarService.getDay(user.userId, date);
    return new ResponseDto(lessons, 'Aulas do dia');
  }

  @Get('week/:week')
  @ApiOperation({ summary: 'Obter aulas da semana' })
  @ApiResponse({
    status: 200,
    description: 'Aulas da semana',
  })
  async getWeek(
    @CurrentUser() user: CurrentUserPayload,
    @Param('week') week: string,
  ): Promise<ResponseDto<any>> {
    const lessons = await this.calendarService.getWeek(user.userId, week);
    return new ResponseDto(lessons, 'Aulas da semana');
  }

  @Get('month/:month')
  @ApiOperation({ summary: 'Obter aulas do mês' })
  @ApiResponse({
    status: 200,
    description: 'Aulas do mês',
  })
  async getMonth(
    @CurrentUser() user: CurrentUserPayload,
    @Param('month') month: string,
  ): Promise<ResponseDto<any>> {
    const lessons = await this.calendarService.getMonth(user.userId, month);
    return new ResponseDto(lessons, 'Aulas do mês');
  }
}