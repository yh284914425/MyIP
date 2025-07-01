import Redis from 'ioredis';
import { defineEventHandler, getRequestIP, createError } from 'h3';

// 只在生产环境或明确启用Redis时初始化连接
let redis = null;
const shouldUseRedis = process.env.NODE_ENV === 'production' || process.env.ENABLE_REDIS === 'true';

if (shouldUseRedis) {
  try {
    redis = new Redis({ 
      host: process.env.REDIS_HOST || (process.env.NODE_ENV === 'production' ? 'redis' : 'localhost'),
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectTimeout: 1000,
      commandTimeout: 1000
    });

    // 添加错误处理，防止未处理的错误
    redis.on('error', (error) => {
      console.warn('Redis connection error in rate limiter:', error.message);
    });
  } catch (error) {
    console.warn('Failed to initialize Redis for rate limiting:', error.message);
    redis = null;
  }
} else {
  console.info('Rate limiting: Redis disabled in development mode');
}

// 配置: 1分钟内最多30次API请求
const TIME_WINDOW_SECONDS = 60;
const MAX_REQUESTS = 30;

export default defineEventHandler(async (event) => {
  // 只对API路由进行限制
  if (!event.path.startsWith('/api/')) {
    return;
  }
  
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown';
  if (ip === 'unknown') return; // 如果无法获取IP，则不限制

  const key = `rate_limit:${ip}`;

  // 如果 Redis 未连接，在开发环境中跳过限制
  if (!redis) {
    if (process.env.NODE_ENV !== 'production') {
      return; // 开发环境中没有Redis时跳过限制
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Service Unavailable',
      message: 'Rate limiting service is unavailable.',
    });
  }

  try {
    const currentCount = await redis.incr(key);

    if (currentCount === 1) {
      // 如果是窗口内的第一次请求，设置过期时间
      await redis.expire(key, TIME_WINDOW_SECONDS);
    }

    if (currentCount > MAX_REQUESTS) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
      });
    }
  } catch (error) {
    if (error.statusCode === 429) {
      throw error;
    }
    // Redis连接失败时不阻止请求（但记录警告）
    console.warn('Redis operation failed for rate limiting:', error.message);
    if (process.env.NODE_ENV === 'production') {
      // 生产环境中Redis失败时可能需要更严格的处理
      console.error('Rate limiting failed in production:', error);
    }
  }
});