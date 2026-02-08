import { IsNumber, IsString, IsOptional, IsBoolean, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

class EnvironmentVariables {
  @IsOptional()
  @IsNumber()
  APP_PORT: number = 3000;

  @IsOptional()
  @IsString()
  APP_ENV: string = 'development';

  @IsOptional()
  @IsString()
  DB_HOST: string = 'localhost';

  @IsOptional()
  @IsNumber()
  DB_PORT: number = 3306;

  @IsOptional()
  @IsString()
  DB_USERNAME: string = 'root';

  @IsOptional()
  @IsString()
  DB_PASSWORD: string = '';

  @IsOptional()
  @IsString()
  DB_DATABASE: string = 'sg_game';

  @IsOptional()
  @IsBoolean()
  DB_SYNCHRONIZE: boolean = true;

  @IsOptional()
  @IsBoolean()
  DB_LOGGING: boolean = true;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
