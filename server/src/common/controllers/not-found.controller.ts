import { Controller, All, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '../dto/response.dto';

/**
 * 404 处理控制器
 * 捕获所有未匹配的路由
 */
@Controller()
export class NotFoundController {
  /**
   * 捕获所有 HTTP 方法的未匹配路由
   */
  @All('*')
  @HttpCode(HttpStatus.NOT_FOUND)
  notFound() {
    return ApiResponse.error('请求的资源不存在', HttpStatus.NOT_FOUND);
  }
}
