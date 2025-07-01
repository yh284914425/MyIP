import dns from 'dns2';
import Redis from 'ioredis';

const redis = new Redis({ 
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
});

const { Packet } = dns;

const yourVpsIp = process.env.VPS_IPV4 || '23.95.215.125';
const yourVpsIpv6 = process.env.VPS_IPV6 || null; // 在环境变量中设置
const mainDomain = process.env.DOMAIN_NAME || 'checkdnsleak.com';

const DNS_RATE_LIMIT_WINDOW = 10; // 10秒
const DNS_RATE_LIMIT_MAX = 100; // 每个IP最多100次查询

const server = dns.createServer(async (request, send, rinfo) => {
  const resolverIp = rinfo.address;

  // --- 速率限制检查 ---
  const rateLimitKey = `dns_rate_limit:${resolverIp}`;
  try {
    const currentDnsCount = await redis.incr(rateLimitKey);
    if (currentDnsCount === 1) {
      await redis.expire(rateLimitKey, DNS_RATE_LIMIT_WINDOW);
    }
    if (currentDnsCount > DNS_RATE_LIMIT_MAX) {
      console.log(`Rate limit exceeded for IP: ${resolverIp}. Dropping request.`);
      return;
    }
  } catch (e) { 
    console.error("Redis rate limit error:", e);
    // 如果 Redis 失败，仍然处理 DNS 请求
  }
  // --- 速率限制结束 ---

  const response = Packet.createResponseFromRequest(request);
  const [question] = request.questions;
  
  if (!question) return send(response);

  const name = question.name;
  const type = question.type;

  // 结构化日志记录
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    resolverIp,
    queryName: name,
    queryType: Packet.TYPE[type]
  }));

  if (name === mainDomain || name === `www.${mainDomain}`) {
    if (type === Packet.TYPE.A) {
      response.answers.push({ name, type: Packet.TYPE.A, class: Packet.CLASS.IN, ttl: 300, address: yourVpsIp });
    } else if (type === Packet.TYPE.AAAA && yourVpsIpv6) {
      response.answers.push({ name, type: Packet.TYPE.AAAA, class: Packet.CLASS.IN, ttl: 300, address: yourVpsIpv6 });
    }
  } else {
    try {
      await redis.set(`dns_query:${name}`, resolverIp, 'EX', 600);
    } catch (error) {
      console.error("Redis write error:", error);
    }
    
    if (type === Packet.TYPE.A) {
      response.answers.push({ name, type: Packet.TYPE.A, class: Packet.CLASS.IN, ttl: 10, address: '127.0.0.1' });
    } else if (type === Packet.TYPE.AAAA) {
      response.answers.push({ name, type: Packet.TYPE.AAAA, class: Packet.CLASS.IN, ttl: 10, address: '::1' });
    }
  }
  
  send(response);
});

server.on('error', (err) => { console.error("DNS Server Error:", err.stack); });
server.on('listening', () => { console.log('DNS Server started successfully on UDP port 53 for IPv4 and IPv6.'); });

// 监听IPv4和IPv6
server.listen({ udp: 53 });