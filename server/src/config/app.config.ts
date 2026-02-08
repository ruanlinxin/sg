import { registerAs } from '@nestjs/config';

export interface AppConfig {
  port: number;
  env: string;
}

export default registerAs(
  'app',
  (): AppConfig => ({
    port: parseInt(process.env.APP_PORT || '3000', 10),
    env: process.env.APP_ENV || 'development',
  }),
);
