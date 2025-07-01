import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { getRequestIP } from 'h3';

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

    redis.on('error', (error) => {
      console.warn('Redis connection error in start-test:', error.message);
    });
  } catch (error) {
    console.warn('Failed to initialize Redis for start-test:', error.message);
    redis = null;
  }
} else {
  console.info('start-test: Redis disabled in development mode');
}

export default defineEventHandler(async (event) => {
  const httpIp = getRequestIP(event, { xForwardedFor: true });
  const testId = uuidv4().substring(0, 8);
  const domain = process.env.DOMAIN_NAME || "checkdnsleak.com"; // 您的域名

  const generateSubdomains = (prefix: string, count: number) => {
    const subs = [];
    for (let i = 0; i < count; i++) {
      const randomStr = Math.random().toString(36).substring(2, 7);
      subs.push(`${prefix}-${randomStr}.${testId}.${domain}`);
    }
    return subs;
  }
  
  // 分别为A和AAAA记录生成测试子域名
  const aSubdomains = generateSubdomains('a', 3);
  const aaaaSubdomains = generateSubdomains('aaaa', 3);
  const allSubdomains = [...aSubdomains, ...aaaaSubdomains];

  if (redis) {
    try {
      // 存储会话信息
      await redis.set(`test_id:${testId}`, JSON.stringify(allSubdomains), 'EX', 600);
    } catch (error) {
      console.warn('Redis connection failed, continuing without storage:', error.message);
    }
  } else {
    console.warn('Redis not available, test session will not be stored');
  }

  return { httpIp, testId, aSubdomains, aaaaSubdomains };
});