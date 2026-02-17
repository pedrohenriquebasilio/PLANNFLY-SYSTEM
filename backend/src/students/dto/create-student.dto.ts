import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsCpf } from '../../common/validators/cpf.validator';

export class CreateStudentDto {
  @ApiProperty({ description: 'Nome do aluno' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Telefone do aluno' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'CPF do aluno (apenas números)' })
  @IsString()
  @IsNotEmpty()
  @IsCpf()
  @Transform(({ value }) => value?.replace(/\D/g, ''))
  cpf: string;

  @ApiPropertyOptional({ description: 'Status do aluno', enum: ['active', 'inactive'], default: 'active' })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;

  @ApiPropertyOptional({ description: 'ID do plano para associar ao aluno' })
  @IsOptional()
  @IsString()
  planId?: string;
}