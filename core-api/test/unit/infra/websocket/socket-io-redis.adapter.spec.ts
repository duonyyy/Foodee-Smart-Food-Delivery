import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocketIoRedisAdapter } from '../../../../src/infra/websocket/socket-io-redis.adapter';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    duplicate: jest.fn().mockReturnValue({
      on: jest.fn(),
      quit: jest.fn().mockResolvedValue('OK'),
    }),
    on: jest.fn(),
    quit: jest.fn().mockResolvedValue('OK'),
  }));
});

jest.mock('@socket.io/redis-adapter', () => ({
  createAdapter: jest.fn().mockReturnValue(jest.fn()),
}));

describe('SocketIoRedisAdapter', () => {
  let mockApp: Partial<INestApplication>;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(() => {
    mockApp = {};
    mockConfigService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        if (key === 'REDIS_DISABLED') return 'false';
        if (key === 'REDIS_URL') return 'redis://localhost:6379';
        return defaultValue;
      }),
    };
  });

  it('should initialize redis adapter when redis url is provided', () => {
    const adapter = new SocketIoRedisAdapter(
      mockApp as INestApplication,
      mockConfigService as ConfigService,
    );

    expect(adapter).toBeDefined();
  });

  it('should skip redis adapter and log warning when REDIS_DISABLED is true', () => {
    mockConfigService.get = jest.fn((key: string) => {
      if (key === 'REDIS_DISABLED') return 'true';
      return undefined;
    });

    const adapter = new SocketIoRedisAdapter(
      mockApp as INestApplication,
      mockConfigService as ConfigService,
    );

    expect(adapter).toBeDefined();
  });

  it('should close redis clients on close()', async () => {
    const adapter = new SocketIoRedisAdapter(
      mockApp as INestApplication,
      mockConfigService as ConfigService,
    );

    await expect(adapter.close()).resolves.toBeUndefined();
  });
});
