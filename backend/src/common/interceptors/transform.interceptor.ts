import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '../dto/response.dto';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        // Se já é uma ResponseDto ou PaginatedResponseDto, retorna como está
        if (
          data &&
          (data instanceof ResponseDto ||
            (typeof data === 'object' && 'success' in data))
        ) {
          return data;
        }
        // Caso contrário, envolve em ResponseDto
        return new ResponseDto(data);
      }),
    );
  }
}