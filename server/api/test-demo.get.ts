// 本地测试用的模拟 DNS 泄露检测
export default defineEventHandler(async (event) => {
  // 模拟不同的测试场景
  const scenario = getQuery(event).scenario || 'safe';
  
  const mockHttpIp = {
    ip: '45.32.123.45',
    country: 'US',
    city: 'New York',
    isp: 'AS20473 The Constant Company',
    asn: 'AS20473'
  };

  let mockResults;
  
  switch (scenario) {
    case 'leak':
      // 模拟 DNS 泄露场景
      mockResults = {
        httpIpInfo: mockHttpIp,
        dnsIpsInfo: [
          {
            ip: '8.8.8.8',
            country: 'US',
            city: 'Mountain View',
            isp: 'AS15169 Google LLC',
            asn: 'AS15169'
          },
          {
            ip: '202.96.209.133',
            country: 'CN',
            city: 'Shanghai',
            isp: 'AS4812 China Telecom',
            asn: 'AS4812'
          }
        ],
        isLeaking: true,
        leakReason: '严重: 检测到 1 个DNS服务器来自不同的网络。您的网络 ASN: AS20473，泄露的 ASN: AS4812',
        leakAnalysis: {
          totalDnsServers: 2,
          uniqueAsns: ['AS15169', 'AS4812'],
          uniqueCountries: ['US', 'CN'],
          leakType: 'asn',
          severity: 'critical'
        },
        timestamp: new Date().toISOString()
      };
      break;
      
    case 'safe':
    default:
      // 模拟安全场景
      mockResults = {
        httpIpInfo: mockHttpIp,
        dnsIpsInfo: [
          {
            ip: '45.32.123.46',
            country: 'US',
            city: 'New York',
            isp: 'AS20473 The Constant Company',
            asn: 'AS20473'
          },
          {
            ip: '45.32.123.47',
            country: 'US',
            city: 'New York',
            isp: 'AS20473 The Constant Company',
            asn: 'AS20473'
          }
        ],
        isLeaking: false,
        leakReason: '安全: 所有 2 个DNS查询都通过您的VPN网络 (AS20473, US)',
        leakAnalysis: {
          totalDnsServers: 2,
          uniqueAsns: ['AS20473'],
          uniqueCountries: ['US'],
          leakType: null,
          severity: 'none'
        },
        timestamp: new Date().toISOString()
      };
      break;
  }

  return mockResults;
});