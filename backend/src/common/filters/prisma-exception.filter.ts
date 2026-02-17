import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { ErrorResponseDto } from '../dto/response.dto';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro no banco de dados';

    switch (exception.code) {
      case 'P2002':
        // Unique constraint violation
        const field = (exception.meta?.target as string[])?.[0] || 'campo';
        message = `Já existe um registro com este ${field}`;
        status = HttpStatus.CONFLICT;
        break;
      case 'P2025':
        // Record not found
        message = 'Registro não encontrado';
        status = HttpStatus.NOT_FOUND;
        break;
      case 'P2003':
        // Foreign key constraint violation
        message = 'Violação de integridade referencial';
        status = HttpStatus.BAD_REQUEST;
        break;
      default:
        message = 'Erro no banco de dados';
    }

    const errorResponse = new ErrorResponseDto(message, status);
    response.status(status).json(errorResponse);
  }
}