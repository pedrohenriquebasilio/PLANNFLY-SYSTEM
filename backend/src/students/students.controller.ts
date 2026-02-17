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
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ListStudentsQueryDto } from './dto/list-students.dto';
import { StudentResponseDto } from './dto/student-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { ResponseDto, PaginatedResponseDto } from '../common/dto/response.dto';

@ApiTags('students')
@Controller('students')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @UseGuards(SubscriptionGuard)
  @ApiOperation({ summary: 'Criar novo aluno' })
  @ApiResponse({
    status: 201,
    description: 'Aluno criado com sucesso',
    type: StudentResponseDto,
  })
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() createStudentDto: CreateStudentDto,
  ): Promise<ResponseDto<StudentResponseDto>> {
    const student = await this.studentsService.create(
      user.userId,
      createStudentDto,
    );
    return new ResponseDto(student, 'Aluno criado com sucesso');
  }

  @Get()
  @ApiOperation({ summary: 'Listar alunos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de alunos',
    type: PaginatedResponseDto,
  })
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: ListStudentsQueryDto,
  ): Promise<PaginatedResponseDto<StudentResponseDto>> {
    return await this.studentsService.findAll(user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes do aluno' })
  @ApiResponse({
    status: 200,
    description: 'Detalhes do aluno',
    type: StudentResponseDto,
  })
  async findOne(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ): Promise<ResponseDto<StudentResponseDto>> {
    const student = await this.studentsService.findOne(user.userId, id);
    return new ResponseDto(student, 'Aluno encontrado');
  }

  @Patch(':id')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar aluno' })
  @ApiResponse({
    status: 200,
    description: 'Aluno atualizado com sucesso',
    type: StudentResponseDto,
  })
  async update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<ResponseDto<StudentResponseDto>> {
    const student = await this.studentsService.update(
      user.userId,
      id,
      updateStudentDto,
    );
    return new ResponseDto(student, 'Aluno atualizado com sucesso');
  }

  @Patch(':id/status')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar status do aluno (ativo/inativo)' })
  @ApiResponse({
    status: 200,
    description: 'Status atualizado com sucesso',
  })
  async updateStatus(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body('status') status: 'active' | 'inactive',
  ): Promise<ResponseDto<StudentResponseDto>> {
    const student = await this.studentsService.updateStatus(
      user.userId,
      id,
      status,
    );
    return new ResponseDto(student, 'Status atualizado com sucesso');
  }

  @Delete(':id')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover aluno' })
  @ApiResponse({
    status: 200,
    description: 'Aluno removido com sucesso',
  })
  async remove(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ): Promise<ResponseDto<{ message: string }>> {
    const result = await this.studentsService.remove(user.userId, id);
    return new ResponseDto(result, 'Aluno removido com sucesso');
  }
}