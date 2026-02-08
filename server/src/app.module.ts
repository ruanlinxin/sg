import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from '@/common/common.module';
import { QuestionModule } from '@/modules/question/question.module';
import { SystemModule } from '@/modules/system/system.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { FallbackModule } from './fallback.module';
import { databaseConfig, appConfig, validate } from '@/config';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig, databaseConfig],
      validate,
      envFilePath: ['.env.local', '.env.development', '.env'],
    }),

    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        console.log('Database Config:', {
          host: dbConfig.host,
          port: dbConfig.port,
          database: dbConfig.database,
          synchronize: dbConfig.synchronize,
        });
        return dbConfig;
      },
      inject: [ConfigService],
    }),

    CommonModule,

    // 业务模块
    QuestionModule,
    SystemModule,
    AuthModule,

    // Fallback 模块（必须最后导入，处理 404）
    FallbackModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
