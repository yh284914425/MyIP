// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  
  // 混合渲染策略：DNS测试页面用SPA，内容页面用SSR
  nitro: {
    routeRules: {
      // 暂时启用首页SSR进行测试
      // '/': { ssr: false },
      // 学习页面：预渲染（优化SEO）
      '/learn': { prerender: true },
      '/learn/**': { prerender: true },
      // API路由
      '/api/**': { cors: true }
    }
  },

  // CSS配置
  css: [
    '~/assets/css/main.css'
  ],

  // 模块配置
  modules: [
    '@pinia/nuxt'
  ],

  // 运行时配置
  runtimeConfig: {
    // 服务器端私有配置
    ipinfoApiToken: process.env.IPINFO_API_TOKEN,
    
    // 客户端公开配置
    public: {
      googleAnalyticsId: process.env.VITE_GOOGLE_ANALYTICS_ID,
      baseUrl: process.env.NODE_ENV === 'production' 
        ? 'https://securednscheck.com' 
        : 'http://localhost:3000'
    }
  },

  // SEO优化
  app: {
    head: {
      title: 'SecureDNSCheck - Free DNS Leak Test Tool',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Test if your VPN is leaking DNS in 10 seconds. Professional DNS leak detection tool with detailed analysis and security recommendations.' },
        { name: 'keywords', content: 'DNS leak test, VPN test, DNS security, privacy protection, DNS leak detection' },
        { property: 'og:title', content: 'SecureDNSCheck - DNS Leak Detection Tool' },
        { property: 'og:description', content: 'Free DNS leak test tool. Check if your VPN is protecting your privacy in 10 seconds.' },
        { property: 'og:type', content: 'website' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css' },
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/css/flag-icons.min.css' },
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css' }
      ],
      script: [
        { src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js', defer: true }
      ]
    }
  }
})
