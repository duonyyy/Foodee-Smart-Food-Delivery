import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { CACHE_TTL_JITTER_MAX_SECONDS, REDIS_CLIENT } from './cache.constants';

const L1_CACHE_MAX_ENTRIES = 500;
const L1_CACHE_DEFAULT_TTL_MS = 10_000;

@Injectable()
export class AppCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AppCacheService.name);
  private readonly l1Cache = new Map<string, { raw: string; expiresAt: number }>();

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.redis.connect();
      this.logger.log('Redis cache connected');
    } catch (error) {
      this.logger.error(`Redis cache connection failed: ${(error as Error).message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.l1Cache.clear();
    await this.redis.quit().catch(() => undefined);
  }

  async get<T>(key: string): Promise<T | null> {
    const l1Hit = this.getFromL1<T>(key);
    if (l1Hit !== null) {
      return l1Hit;
    }

    try {
      const value = await this.redis.get(key);
      if (!value) {
        return null;
      }
      const parsed = JSON.parse(value) as T;
      this.setInL1(key, value, L1_CACHE_DEFAULT_TTL_MS);
      return parsed;
    } catch (error) {
      this.logger.warn(`Cache get failed for ${key}: ${(error as Error).message}`);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      this.setInL1(key, serialized, Math.min(ttlSeconds * 1000, L1_CACHE_DEFAULT_TTL_MS));
      const ttlWithJitter = ttlSeconds + this.getTtlJitterSeconds();
      await this.redis.set(key, serialized, 'EX', ttlWithJitter);
    } catch (error) {
      this.logger.warn(`Cache set failed for ${key}: ${(error as Error).message}`);
    }
  }

  async remember<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await loader();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  async delete(key: string): Promise<void> {
    this.l1Cache.delete(key);
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.warn(`Cache delete failed for ${key}: ${(error as Error).message}`);
    }
  }

  async deleteByPattern(pattern: string): Promise<number> {
    this.deleteFromL1ByPattern(pattern);
    let deleted = 0;
    let cursor = '0';

    try {
      do {
        const [nextCursor, keys] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 250);
        cursor = nextCursor;

        if (keys.length > 0) {
          deleted += keys.length;
          await this.redis.unlink(...keys).catch(() => this.redis.del(...keys));
        }
      } while (cursor !== '0');
    } catch (error) {
      this.logger.warn(`Cache pattern delete failed for ${pattern}: ${(error as Error).message}`);
    }

    return deleted;
  }

  private getFromL1<T>(key: string): T | null {
    const entry = this.l1Cache.get(key);
    if (!entry) {
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.l1Cache.delete(key);
      return null;
    }
    try {
      // Refresh LRU order
      this.l1Cache.delete(key);
      this.l1Cache.set(key, entry);
      return JSON.parse(entry.raw) as T;
    } catch {
      this.l1Cache.delete(key);
      return null;
    }
  }

  private setInL1(key: string, raw: string, ttlMs: number): void {
    if (ttlMs <= 0) return;
    if (this.l1Cache.has(key)) {
      this.l1Cache.delete(key);
    } else if (this.l1Cache.size >= L1_CACHE_MAX_ENTRIES) {
      const oldestKey = this.l1Cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.l1Cache.delete(oldestKey);
      }
    }
    this.l1Cache.set(key, { raw, expiresAt: Date.now() + ttlMs });
  }

  private deleteFromL1ByPattern(pattern: string): void {
    if (pattern === '*') {
      this.l1Cache.clear();
      return;
    }
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    const regex = new RegExp(`^${escaped}$`);
    for (const key of this.l1Cache.keys()) {
      if (regex.test(key)) {
        this.l1Cache.delete(key);
      }
    }
  }

  private getTtlJitterSeconds(): number {
    return Math.floor(Math.random() * CACHE_TTL_JITTER_MAX_SECONDS);
  }
}
