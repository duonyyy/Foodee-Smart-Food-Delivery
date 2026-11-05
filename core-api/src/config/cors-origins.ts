import { ConfigService } from '@nestjs/config';

const developmentOrigins = ['http://localhost:3000', 'http://localhost:3001'];

export function allowedCorsOrigins(
  configSource: ConfigService | Record<string, string | undefined> = process.env,
): string[] {
  const getEnv = (key: string): string | undefined => {
    if (configSource && typeof (configSource as ConfigService).get === 'function') {
      return (configSource as ConfigService).get<string>(key);
    }
    return (configSource as Record<string, string | undefined>)?.[key];
  };

  const nodeEnv = getEnv('NODE_ENV');
  const isProduction = nodeEnv === 'production';
  const origins = isProduction ? [] : [...developmentOrigins];
  const configured = [
    ...(getEnv('ALLOWED_ORIGINS') || '').split(','),
    getEnv('FRONTEND_URL') || '',
  ];

  for (const raw of configured) {
    const origin = raw.trim().replace(/\/$/, '');
    if (!origin) continue;
    if (isProduction) {
      let parsed: URL;
      try {
        parsed = new URL(origin);
      } catch {
        throw new Error(`Invalid production CORS origin: ${origin}`);
      }
      if (parsed.protocol !== 'https:' || parsed.origin !== origin) {
        throw new Error(`Production CORS origin must be an HTTPS origin: ${origin}`);
      }
    }
    if (!origins.includes(origin)) origins.push(origin);
  }

  if (isProduction && !origins.length) {
    throw new Error('At least one production CORS origin is required');
  }
  return origins;
}
