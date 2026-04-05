import Redis from 'ioredis';
import crypto from 'crypto';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

class CacheService {
  private redis: Redis | null = null;
  private connected = false;

  constructor() {
    try {
      this.redis = new Redis(config.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => {
          // Do not retry. Fail immediately to gracefully disable caching and prevent log spam.
          return null;
        },
        lazyConnect: true,
      });

      this.redis.on('connect', () => {
        this.connected = true;
        logger.info('Redis connected');
      });

      this.redis.on('error', (err) => {
        this.connected = false;
        logger.warn('Redis error', { error: err.message });
      });

      this.redis.connect().catch(() => {
        logger.warn('Redis connection failed — caching disabled');
      });
    } catch {
      logger.warn('Redis initialization failed — caching disabled');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.connected || !this.redis) return null;
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) as T : null;
    } catch (err) {
      logger.warn('Cache get failed', { key, error: (err as Error).message });
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.connected || !this.redis) return;
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (err) {
      logger.warn('Cache set failed', { key, error: (err as Error).message });
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.connected || !this.redis) return;
    try {
      await this.redis.del(key);
    } catch (err) {
      logger.warn('Cache delete failed', { key, error: (err as Error).message });
    }
  }

  async getCachedOrCompute<T>(key: string, computeFn: () => Promise<T>, ttlSeconds: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      logger.debug('Cache hit', { key });
      return cached;
    }
    logger.debug('Cache miss', { key });
    const result = await computeFn();
    await this.set(key, result, ttlSeconds);
    return result;
  }

  static hashKey(...parts: string[]): string {
    return crypto.createHash('sha256').update(parts.join('|')).digest('hex');
  }
}

export const cache = new CacheService();
export { CacheService };
