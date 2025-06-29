import dotenv from 'dotenv';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

dotenv.config();

const backEndPort = parseInt(process.env.BACKEND_PORT || 11966, 10);
const frontEndPort = parseInt(process.env.FRONTEND_PORT || 18966, 10);

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'SecureDNSCheck',
        short_name: 'DNSCheck',
        theme_color: '#f8f9fa',
        orientation: "portrait",
        id: 'com.securednscheck.app',
        description: 'Check for DNS leaks in 10 seconds',
        icons: [
          {
            src: '/logos/logo-192.webp',
            sizes: '192x192',
            type: 'image/webp',
            purpose: 'maskable'
          },
          {
            src: '/logos/ios-logo-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/logos/ios-logo-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': '/frontend',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'vue-i18n'],
          'utils': [
            '@/utils/country-name'
          ]
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: frontEndPort,
    proxy: {
      '/api': `http://localhost:${backEndPort}`
    }
  }
})