import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../dto/response.dto';

export interface Response<T> {
  code: number;
  path: string;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const path = request.url;

    return next.handle().pipe(
      map((data) => {
        // 如果返回的已经是 ApiResponse 实例，自动填充 path
        if (data instanceof ApiResponse) {
          if (!data.path) {
            data.path = path;
          }
          return data;
        }

        // 否则自动包装成成功响应
        return ApiResponse.success<T>(data, '操作成功', path);
      }),
    );
  }
}
