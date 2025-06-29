export default defineEventHandler(async (event) => {
    // 返回基础配置信息
    return {
        message: 'SecureDNSCheck API is running',
        version: '2.0.0',
        services: {
            dnsLeak: true,
            learningCenter: true
        }
    }
})