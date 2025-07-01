import Redis from 'ioredis';
import { getQuery, createError } from 'h3';

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
      console.warn('Redis connection error in get-results:', error.message);
    });
  } catch (error) {
    console.warn('Failed to initialize Redis for get-results:', error.message);
    redis = null;
  }
} else {
  console.info('get-results: Redis disabled in development mode');
}

// 辅助函数：使用ipinfo.io查询IP地理位置和ASN信息
async function getGeoInfo(ip: string) {
    if (!ip) return { ip, error: 'IP address is null' };
    try {
        const response = await fetch(`https://ipinfo.io/${ip}/json`);
        if (!response.ok) throw new Error('Failed to fetch GeoIP from ipinfo.io');
        const data = await response.json();
        
        // ipinfo.io 返回的 ASN 格式：AS#### 或者 {asn: 'AS####', name: 'Name', domain: 'domain.com'}
        let asn = 'N/A';
        if (typeof data.asn === 'string') {
            asn = data.asn; // 直接是 "AS1234" 格式
        } else if (data.asn && typeof data.asn === 'object' && data.asn.asn) {
            asn = data.asn.asn; // 对象格式
        } else if (data.org && data.org.match(/AS\d+/)) {
            // 有时 ASN 信息在 org 字段中，格式如 "AS1234 Company Name"
            const asnMatch = data.org.match(/(AS\d+)/);
            if (asnMatch) asn = asnMatch[1];
        }

        return {
            ip: data.ip || ip,
            country: data.country || 'N/A',
            city: data.city || 'N/A',
            isp: data.org || 'N/A',
            asn: asn,
        };
    } catch (error) {
        console.error(`GeoIP lookup failed for ${ip}:`, error);
        return { ip, error: 'GeoIP lookup failed' };
    }
}

export default defineEventHandler(async (event) => {
  const { testId, httpIp } = getQuery(event);

  if (!testId || !httpIp) {
    throw createError({ statusCode: 400, message: 'Missing required parameters' });
  }

  let subdomains = [];
  
  if (!redis) {
    console.warn('Redis not available, using demo mode');
    // 开发环境中没有Redis时，返回模拟数据
    return {
      httpIpInfo: { ip: httpIp, country: 'Demo', city: 'Local', isp: 'Development', asn: 'AS0000' },
      dnsIpsInfo: [],
      isLeaking: false,
      leakReason: "开发模式: Redis 未连接，这是一个演示响应。",
      leakAnalysis: {
        totalDnsServers: 0,
        uniqueAsns: [],
        uniqueCountries: [],
        leakType: null,
        severity: 'none'
      },
      timestamp: new Date().toISOString()
    };
  }

  try {
    const subdomainsJSON = await redis.get(`test_id:${testId}`);
    if (!subdomainsJSON) {
      throw createError({ statusCode: 404, message: 'Test session not found or has expired.' });
    }
    subdomains = JSON.parse(subdomainsJSON);
  } catch (error) {
    if (error.statusCode) throw error;
    console.warn('Redis connection failed, using fallback:', error.message);
    // 如果 Redis 失败，返回模拟数据用于演示
    return {
      httpIpInfo: { ip: httpIp, country: 'Unknown', city: 'Unknown', isp: 'Unknown', asn: 'N/A' },
      dnsIpsInfo: [],
      isLeaking: false,
      leakReason: "Redis 连接失败，无法获取DNS查询结果。",
      leakAnalysis: {
        totalDnsServers: 0,
        uniqueAsns: [],
        uniqueCountries: [],
        leakType: null,
        severity: 'none'
      },
      timestamp: new Date().toISOString()
    };
  }

  const dnsQueryKeys = subdomains.map(domain => `dns_query:${domain}`);
  let dnsResolverIps = [];
  
  try {
    dnsResolverIps = await redis.mget(dnsQueryKeys);
  } catch (error) {
    console.warn('Failed to get DNS query results from Redis:', error);
  }
  
  const uniqueDnsIps = [...new Set(dnsResolverIps.filter(ip => ip !== null))];

  const [httpIpInfo, dnsIpsInfo] = await Promise.all([
    getGeoInfo(httpIp as string),
    Promise.all(uniqueDnsIps.map(ip => getGeoInfo(ip as string)))
  ]);

  // 增强的泄露检测逻辑：基于ASN和国家
  let isLeaking = false;
  let leakReason = "";
  let leakAnalysis = {
    totalDnsServers: dnsIpsInfo.length,
    uniqueAsns: [...new Set(dnsIpsInfo.map(d => d.asn).filter(asn => asn !== 'N/A'))],
    uniqueCountries: [...new Set(dnsIpsInfo.map(d => d.country).filter(c => c !== 'N/A'))],
    leakType: null,
    severity: 'none'
  };

  if (dnsIpsInfo.length > 0 && httpIpInfo.asn !== 'N/A') {
      const httpAsn = httpIpInfo.asn;
      const httpCountry = httpIpInfo.country;

      // 检查 ASN 泄露
      const asnLeaks = dnsIpsInfo.filter(dnsInfo => 
          dnsInfo.asn !== 'N/A' && dnsInfo.asn !== httpAsn
      );

      // 检查国家泄露
      const countryLeaks = dnsIpsInfo.filter(dnsInfo => 
          dnsInfo.country !== 'N/A' && dnsInfo.country !== httpCountry
      );

      if (asnLeaks.length > 0) {
          isLeaking = true;
          leakAnalysis.leakType = 'asn';
          leakAnalysis.severity = asnLeaks.length > 1 ? 'critical' : 'moderate';
          leakReason = `严重: 检测到 ${asnLeaks.length} 个DNS服务器来自不同的网络。您的网络 ASN: ${httpAsn}，泄露的 ASN: ${asnLeaks.map(l => l.asn).join(', ')}`;
      } else if (countryLeaks.length > 0) {
          isLeaking = true;
          leakAnalysis.leakType = 'country';
          leakAnalysis.severity = 'moderate';
          leakReason = `警告: 检测到 ${countryLeaks.length} 个DNS服务器位于不同国家。您的位置: ${httpCountry}，泄露位置: ${countryLeaks.map(l => l.country).join(', ')}`;
      } else {
          leakReason = `安全: 所有 ${dnsIpsInfo.length} 个DNS查询都通过您的VPN网络 (${httpAsn}, ${httpCountry})`;
      }
  } else if (dnsIpsInfo.length === 0) {
      leakReason = "未检测到任何DNS查询。可能原因: 1) 网络连接问题 2) 防火墙阻止 3) DNS缓存";
  } else {
      leakReason = "无法获取您的网络ASN信息，无法进行精确检测。";
  }

  return { 
    httpIpInfo, 
    dnsIpsInfo, 
    isLeaking, 
    leakReason,
    leakAnalysis,
    timestamp: new Date().toISOString()
  };
});