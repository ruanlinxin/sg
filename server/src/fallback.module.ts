import { Module } from '@nestjs/common';
import { NotFoundController } from '@/common/controllers/not-found.controller';

/**
 * Fallback 模块
 * 必须在所有模块之后导入，用于处理 404 路由
 */
@Module({
  controllers: [NotFoundController],
})
export class FallbackModule {}
