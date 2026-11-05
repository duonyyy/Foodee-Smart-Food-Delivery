import { Environment, validateEnv } from '../../../src/config/env.validation';

describe('validateEnv', () => {
  it('accepts valid default configuration and converts PORT to number', () => {
    const config = {
      NODE_ENV: 'development',
      PORT: '3001',
      FRONTEND_URL: 'http://localhost:3000',
    };

    const validated = validateEnv(config);
    expect(validated.NODE_ENV).toBe(Environment.Development);
    expect(validated.PORT).toBe(3001);
    expect(validated.FRONTEND_URL).toBe('http://localhost:3000');
  });

  it('rejects invalid NODE_ENV', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'invalid-environment',
      }),
    ).toThrow(/Environment validation failed/);
  });

  it('rejects non-numeric PORT', () => {
    expect(() =>
      validateEnv({
        PORT: 'not-a-number',
      }),
    ).toThrow(/Environment validation failed/);
  });

  it('enforces production configuration requirements when NODE_ENV is production', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'production',
        JWT_SECRET: 'your_secret_key',
      }),
    ).toThrow(/JWT_SECRET/);
  });

  it('accepts valid production configuration with secure secrets', () => {
    const validProduction = {
      NODE_ENV: 'production',
      PORT: 3001,
      JWT_SECRET: 'a-long-random-jwt-secret-value-for-production',
      DB_PASSWORD: 'a-secure-database-password-value',
      MINIO_SECRET_KEY: 'a-secure-minio-secret-password-value',
      ENABLE_DEMO_PAYMENT: 'false',
    };

    expect(() => validateEnv(validProduction)).not.toThrow();
  });
});
