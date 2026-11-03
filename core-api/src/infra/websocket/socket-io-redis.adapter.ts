import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis, { RedisOptions } from 'ioredis';
import { allowedCorsOrigins } from '../../config/cors-origins';

export class SocketIoRedisAdapter extends IoAdapter {
  protected readonly adapterLogger = new Logger(SocketIoRedisAdapter.name);
  private adapterConstructor?: ReturnType<typeof createAdapter>;
  private pubClient?: Redis;
  private subClient?: Redis;

  constructor(
    app: INestApplication,
    private readonly configService: ConfigService,
  ) {
    super(app);
    this.initRedisAdapter();
  }

  private initRedisAdapter(): void {
    const isRedisDisabled = this.configService.get<string>('REDIS_DISABLED') === 'true';
    if (isRedisDisabled) {
      this.adapterLogger.warn(
        'REDIS_DISABLED is true. Falling back to default in-memory Socket.io adapter.',
      );
      return;
    }

    const redisUrl = this.configService.get<string>('REDIS_URL');
    const commonOptions: RedisOptions = {
      lazyConnect: false,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      retryStrategy: (times: number) => Math.min(times * 100, 2000),
    };

    try {
      if (redisUrl) {
        this.pubClient = new Redis(redisUrl, commonOptions);
      } else {
        this.pubClient = new Redis({
          ...commonOptions,
          host: this.configService.get<string>('REDIS_HOST', 'localhost'),
          port: this.configService.get<number>('REDIS_PORT', 6379),
          password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
          db: this.configService.get<number>('REDIS_DB', 0),
        });
      }

      this.pubClient.on('error', (err) => {
        this.adapterLogger.warn(`Redis pubClient error: ${err.message}`);
      });

      this.subClient = this.pubClient.duplicate();
      this.subClient.on('error', (err) => {
        this.adapterLogger.warn(`Redis subClient error: ${err.message}`);
      });

      this.adapterConstructor = createAdapter(this.pubClient, this.subClient);
      this.adapterLogger.log('Socket.io Redis adapter initialized successfully');
    } catch (error) {
      this.adapterLogger.warn(
        `Failed to initialize Redis adapter: ${error instanceof Error ? error.message : String(error)}. Using default in-memory adapter.`,
      );
    }
  }

  createIOServer(port: number, options?: any): any {
    const corsOrigins = allowedCorsOrigins();
    const serverOptions = {
      ...options,
      cors: {
        origin: corsOrigins,
        credentials: true,
      },
    };

    const server = super.createIOServer(port, serverOptions);

    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }

    return server;
  }

  async close(): Promise<void> {
    if (this.pubClient) {
      await this.pubClient.quit().catch(() => {});
    }
    if (this.subClient) {
      await this.subClient.quit().catch(() => {});
    }
  }
}
