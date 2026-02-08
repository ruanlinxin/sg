import { Module } from '@nestjs/common';
import { NotFoundController } from './controllers/not-found.controller';

/**
 * 公共模块
 * 包含通用的控制器、服务、拦截器、过滤器等
 */
@Module({
  controllers: [NotFoundController],
  exports: [],
})
export class CommonModule {}
