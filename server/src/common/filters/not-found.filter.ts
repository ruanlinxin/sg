import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../dto/response.dto';

/**
 * 全局 HTTP 异常过滤器
 * 处理所有 HTTP 异常，包括 404 错误
 */
@Catch(HttpException)
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    
    // 获取异常消息
    const exceptionResponse = exception.getResponse();
    let message = '请求失败';
    
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (exceptionResponse && typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as any;
      message = Array.isArray(responseObj.message)
        ? responseObj.message.join(', ')
        : responseObj.message || exception.message || message;
    }

    // 构建 API 响应
    const apiResponse = ApiResponse.error(
      message,
      status,
      undefined,
      request.url,
    );

    response.status(status).json(apiResponse);
  }
}
