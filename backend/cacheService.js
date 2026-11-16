const Redis = require('ioredis');

class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.redisClient = null;
    this.useRedis = false;
    this.init();
  }

  init() {
    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    try {
      this.redisClient = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          if (times > 3) {
            return null; // Stop retrying and fallback to in-memory
          }
          return Math.min(times * 200, 1000);
        },
        reconnectOnError: () => false
      });

      this.redisClient.on('connect', () => {
        this.useRedis = true;
        console.log('🔴 Connected to Redis Server! High-speed caching active.');
      });

      this.redisClient.on('error', (err) => {
        if (this.useRedis) {
          console.warn('⚠️ Redis disconnected, falling back to High-Speed In-Memory Cache.');
        }
        this.useRedis = false;
      });

      // Attempt initial connection
      this.redisClient.connect().catch(() => {
        this.useRedis = false;
        console.log('⚡ Redis not active locally/VPS. Using High-Speed In-Memory Storage (0.001s latency).');
      });
    } catch (err) {
      this.useRedis = false;
    }
  }

  async get(key) {
    if (this.useRedis && this.redisClient) {
      try {
        const val = await this.redisClient.get(key);
        if (val) return JSON.parse(val);
      } catch (err) {
        // Fallback to memory
      }
    }

    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (item.expire && Date.now() > item.expire) {
      this.memoryCache.delete(key);
      return null;
    }
    return item.data;
  }

  async set(key, value, ttlSeconds = 60) {
    if (this.useRedis && this.redisClient) {
      try {
        await this.redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        return;
      } catch (err) {
        // Fallback to memory
      }
    }

    this.memoryCache.set(key, {
      data: value,
      expire: ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null
    });
  }

  async del(key) {
    if (this.useRedis && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (err) {}
    }
    this.memoryCache.delete(key);
  }
}

const cacheService = new CacheService();
module.exports = cacheService;
