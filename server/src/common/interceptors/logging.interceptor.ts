import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * 日志拦截器
 * 记录请求和响应信息
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, query, params, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // 记录请求信息
    const logMessage = `${method} ${url}`;
    
    // 记录请求详情（如果有请求体、查询参数或路径参数）
    const requestDetails: any = {};
    if (Object.keys(query).length > 0) {
      requestDetails.query = query;
    }
    if (Object.keys(params).length > 0) {
      requestDetails.params = params;
    }
    if (body && Object.keys(body).length > 0) {
      requestDetails.body = this.sanitizeBody(body);
    }
    if (ip) {
      requestDetails.ip = ip;
    }
    if (userAgent) {
      requestDetails.userAgent = userAgent;
    }

    this.logger.log(
      `Incoming Request: ${logMessage}`,
      Object.keys(requestDetails).length > 0 ? requestDetails : '',
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - startTime;
          
          // 记录响应信息
          const responseDetails: any = {
            statusCode: response.statusCode,
            responseTime: `${responseTime}ms`,
          };

          // 记录响应数据（跳过 data 字段，避免日志过长）
          if (data) {
            if (typeof data === 'object') {
              responseDetails.data = this.prepareResponseLog(data);
            } else {
              responseDetails.data = data;
            }
          }

          this.logger.log(
            `Outgoing Response: ${method} ${url}`,
            responseDetails,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          
          // 记录错误信息
          this.logger.error(
            `Request Error: ${method} ${url}`,
            {
              statusCode: error.status || 500,
              message: error.message,
              responseTime: `${responseTime}ms`,
            },
          );
        },
      }),
    );
  }

  /**
   * 清理请求体，避免记录敏感信息
   */
  private sanitizeBody(body: any): any {
    const sensitiveFields = ['password', 'passwd', 'secret', 'token', 'apiKey'];
    
    if (typeof body !== 'object' || body === null) {
      return body;
    }

    const sanitized = { ...body };
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // 如果请求体太大，截断显示
    const jsonString = JSON.stringify(sanitized);
    if (jsonString.length > 500) {
      return '[BODY TOO LARGE]';
    }

    return sanitized;
  }

  /**
   * 清理响应数据，避免日志过长
   */
  private sanitizeResponse(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const jsonString = JSON.stringify(data);
    if (jsonString.length > 500) {
      return '[RESPONSE TOO LARGE]';
    }

    return data;
  }

  /**
   * 准备响应日志，跳过 data 字段
   */
  private prepareResponseLog(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    // 创建一个新对象，排除 data 字段
    const logData: any = {};
    for (const key in data) {
      if (key !== 'data') {
        logData[key] = data[key];
      } else {
        logData[key] = '[DATA SKIPPED]';
      }
    }

    return logData;
  }
}
