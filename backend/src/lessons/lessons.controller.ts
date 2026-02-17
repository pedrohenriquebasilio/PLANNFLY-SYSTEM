import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
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
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { RescheduleLessonDto } from './dto/reschedule-lesson.dto';
import { GenerateRecurringLessonsDto } from './dto/generate-recurring-lessons.dto';
import { LessonResponseDto } from './dto/lesson-response.dto';
import { ListLessonsQueryDto } from './dto/list-lessons.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { ResponseDto } from '../common/dto/response.dto';

@ApiTags('lessons')
@Controller('lessons')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @UseGuards(SubscriptionGuard)
  @ApiOperation({ summary: 'Criar nova aula' })
  @ApiResponse({
    status: 201,
    description: 'Aula criada com sucesso',
    type: LessonResponseDto,
  })
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() createLessonDto: CreateLessonDto,
  ): Promise<ResponseDto<LessonResponseDto>> {
    const lesson = await this.lessonsService.create(
      user.userId,
      createLessonDto,
    );
    return new ResponseDto(lesson, 'Aula criada com sucesso');
  }

  @Post('recurring')
  @UseGuards(SubscriptionGuard)
  @ApiOperation({ summary: 'Gerar aulas recorrentes ate o fim do periodo de cobranca' })
  @ApiResponse({
    status: 201,
    description: 'Aulas geradas com sucesso',
  })
  async generateRecurring(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: GenerateRecurringLessonsDto,
  ): Promise<ResponseDto<{ created: number; skipped: number; periodEnd: string }>> {
    const result = await this.lessonsService.generateRecurring(user.userId, dto);
    return new ResponseDto(
      result,
      `${result.created} aula(s) criada(s) ate ${result.periodEnd}`,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Listar aulas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de aulas',
    type: PaginatedResponseDto,
  })
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: ListLessonsQueryDto,
  ): Promise<PaginatedResponseDto<LessonResponseDto>> {
    return await this.lessonsService.findAll(user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes da aula' })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da aula',
    type: LessonResponseDto,
  })
  async findOne(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ): Promise<ResponseDto<LessonResponseDto>> {
    const lesson = await this.lessonsService.findOne(user.userId, id);
    return new ResponseDto(lesson, 'Aula encontrada');
  }

  @Patch(':id')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar aula' })
  @ApiResponse({
    status: 200,
    description: 'Aula atualizada com sucesso',
    type: LessonResponseDto,
  })
  async update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ): Promise<ResponseDto<LessonResponseDto>> {
    const lesson = await this.lessonsService.update(
      user.userId,
      id,
      updateLessonDto,
    );
    return new ResponseDto(lesson, 'Aula atualizada com sucesso');
  }

  @Patch(':id/status')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar status da aula' })
  @ApiResponse({
    status: 200,
    description: 'Status atualizado com sucesso',
    type: LessonResponseDto,
  })
  async updateStatus(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body('status') status: 'scheduled' | 'completed' | 'rescheduled' | 'cancelled',
  ): Promise<ResponseDto<LessonResponseDto>> {
    const lesson = await this.lessonsService.updateStatus(
      user.userId,
      id,
      status,
    );
    return new ResponseDto(lesson, 'Status atualizado com sucesso');
  }

  @Post(':id/reschedule')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remarcar aula' })
  @ApiResponse({
    status: 200,
    description: 'Aula remarcada com sucesso',
    type: LessonResponseDto,
  })
  async reschedule(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() rescheduleLessonDto: RescheduleLessonDto,
  ): Promise<ResponseDto<LessonResponseDto>> {
    const lesson = await this.lessonsService.reschedule(
      user.userId,
      id,
      rescheduleLessonDto,
    );
    return new ResponseDto(lesson, 'Aula remarcada com sucesso');
  }

  @Delete(':id')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover aula' })
  @ApiResponse({
    status: 200,
    description: 'Aula removida com sucesso',
  })
  async remove(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ): Promise<ResponseDto<{ message: string }>> {
    const result = await this.lessonsService.remove(user.userId, id);
    return new ResponseDto(result, 'Aula removida com sucesso');
  }
}