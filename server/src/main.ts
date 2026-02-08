import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from '@/common/filters/not-found.filter';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 注册全局拦截器（注意顺序：Logging 在最外层）
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  
  const port = 3000;
  await app.listen(port);
  
  const url = await app.getUrl();
  const hostname = url.split('//')[1].split(':')[0];
  
  console.log(`Application is running on:`);
  console.log(`  - Local:   http://localhost:${port}`);
  console.log(`  - Network: http://${hostname}:${port}`);
}
bootstrap();
