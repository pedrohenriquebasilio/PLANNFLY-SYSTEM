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
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlanResponseDto } from './dto/plan-response.dto';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { ResponseDto } from '../common/dto/response.dto';

@ApiTags('plans')
@Controller('plans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @UseGuards(SubscriptionGuard)
  @ApiOperation({ summary: 'Criar novo plano' })
  @ApiResponse({
    status: 201,
    description: 'Plano criado com sucesso',
    type: PlanResponseDto,
  })
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() createPlanDto: CreatePlanDto,
  ): Promise<ResponseDto<PlanResponseDto>> {
    const plan = await this.plansService.create(user.userId, createPlanDto);
    return new ResponseDto(plan, 'Plano criado com sucesso');
  }

  @Get()
  @ApiOperation({ summary: 'Listar planos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de planos',
    type: PaginatedResponseDto,
  })
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: PaginationDto,
  ): Promise<PaginatedResponseDto<PlanResponseDto>> {
    return await this.plansService.findAll(user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes do plano' })
  @ApiResponse({
    status: 200,
    description: 'Detalhes do plano',
    type: PlanResponseDto,
  })
  async findOne(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ): Promise<ResponseDto<PlanResponseDto>> {
    const plan = await this.plansService.findOne(user.userId, id);
    return new ResponseDto(plan, 'Plano encontrado');
  }

  @Get(':id/students')
  @ApiOperation({ summary: 'Listar alunos associados ao plano' })
  @ApiResponse({
    status: 200,
    description: 'Lista de alunos do plano',
  })
  async findPlanStudents(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ): Promise<ResponseDto<any[]>> {
    const students = await this.plansService.findPlanStudents(user.userId, id);
    return new ResponseDto(students, 'Alunos do plano');
  }

  @Patch(':id')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar plano' })
  @ApiResponse({
    status: 200,
    description: 'Plano atualizado com sucesso',
    type: PlanResponseDto,
  })
  async update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ): Promise<ResponseDto<PlanResponseDto>> {
    const plan = await this.plansService.update(user.userId, id, updatePlanDto);
    return new ResponseDto(plan, 'Plano atualizado com sucesso');
  }

  @Post(':planId/students/:studentId')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Associar aluno ao plano' })
  @ApiResponse({
    status: 200,
    description: 'Aluno associado com sucesso',
  })
  async associateStudent(
    @CurrentUser() user: CurrentUserPayload,
    @Param('planId') planId: string,
    @Param('studentId') studentId: string,
  ): Promise<ResponseDto<{ message: string }>> {
    const result = await this.plansService.associateStudent(
      user.userId,
      planId,
      studentId,
    );
    return new ResponseDto(result, 'Aluno associado ao plano');
  }

  @Delete(':planId/students/:studentId')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover associação de aluno ao plano' })
  @ApiResponse({
    status: 200,
    description: 'Associação removida com sucesso',
  })
  async removeStudent(
    @CurrentUser() user: CurrentUserPayload,
    @Param('planId') planId: string,
    @Param('studentId') studentId: string,
  ): Promise<ResponseDto<{ message: string }>> {
    const result = await this.plansService.removeStudent(
      user.userId,
      planId,
      studentId,
    );
    return new ResponseDto(result, 'Associação removida');
  }

  @Delete(':id')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover plano' })
  @ApiResponse({
    status: 200,
    description: 'Plano removido com sucesso',
  })
  async remove(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ): Promise<ResponseDto<{ message: string }>> {
    const result = await this.plansService.remove(user.userId, id);
    return new ResponseDto(result, 'Plano removido com sucesso');
  }
}