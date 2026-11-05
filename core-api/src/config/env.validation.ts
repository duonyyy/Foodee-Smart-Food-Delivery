import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';
import 'reflect-metadata';
import { assertProductionConfiguration } from './production-config.guard';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 3001;

  @IsString()
  @IsOptional()
  FRONTEND_URL?: string;

  @IsString()
  @IsOptional()
  API_URL?: string;

  @IsString()
  @IsOptional()
  ALLOWED_ORIGINS?: string;

  @IsString()
  @IsOptional()
  JWT_SECRET?: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRATION?: string;

  @IsString()
  @IsOptional()
  JWT_ISSUER?: string;

  @IsString()
  @IsOptional()
  JWT_AUDIENCE?: string;

  @IsString()
  @IsOptional()
  DB_HOST?: string;

  @IsNumber()
  @IsOptional()
  DB_PORT?: number;

  @IsString()
  @IsOptional()
  DB_USERNAME?: string;

  @IsString()
  @IsOptional()
  DB_PASSWORD?: string;

  @IsString()
  @IsOptional()
  DB_NAME?: string;

  @IsString()
  @IsOptional()
  REDIS_HOST?: string;

  @IsNumber()
  @IsOptional()
  REDIS_PORT?: number;

  @IsString()
  @IsOptional()
  MINIO_ENDPOINT?: string;

  @IsNumber()
  @IsOptional()
  MINIO_PORT?: number;

  @IsString()
  @IsOptional()
  MINIO_ACCESS_KEY?: string;

  @IsString()
  @IsOptional()
  MINIO_SECRET_KEY?: string;

  @IsString()
  @IsOptional()
  MINIO_BUCKET?: string;

  @IsString()
  @IsOptional()
  MAPBOX_ACCESS_TOKEN?: string;

  @IsString()
  @IsOptional()
  AI_SERVER_URL?: string;

  @IsString()
  @IsOptional()
  AI_SERVICE_TOKEN?: string;

  @IsString()
  @IsOptional()
  OUTBOX_DISPATCHER_ENABLED?: string;

  @IsString()
  @IsOptional()
  QUEUE_PROCESSOR_ENABLED?: string;

  @IsString()
  @IsOptional()
  ENABLE_DEMO_PAYMENT?: string;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Environment validation failed: ${messages}`);
  }

  assertProductionConfiguration(config as Record<string, string | undefined>);

  return validatedConfig;
}

export { assertProductionConfiguration };
