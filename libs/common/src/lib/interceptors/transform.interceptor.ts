import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ApiResponse<T>> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();

    return next.handle().pipe(
      map((data) => {
        // 상태 코드를 항상 200으로 설정
        response.status(200);

        // void 반환 또는 undefined/null인 경우 data 필드 없이 success만 true로 설정
        if (data === undefined || data === null) {
          return {
            success: true,
          };
        }

        // 데이터가 있는 경우 success: true와 함께 data 필드에 데이터 포함
        return {
          success: true,
          data,
        };
      })
    );
  }
}
