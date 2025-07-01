#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function runProcess(name, command, args, options = {}) {
  console.log(`🚀 Starting ${name}...`);
  
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname,
    ...options
  });

  child.on('error', (error) => {
    console.error(`❌ Error starting ${name}:`, error);
  });

  child.on('exit', (code) => {
    console.log(`⚠️  ${name} exited with code ${code}`);
    if (code !== 0) {
      console.error(`💥 ${name} failed, exiting...`);
      process.exit(1);
    }
  });

  return child;
}

function startServices() {
  console.log('🎯 Starting DNS Leak Detection Services...\n');

  // 设置环境变量
  const env = {
    ...process.env,
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: process.env.REDIS_PORT || '6379',
    DOMAIN_NAME: process.env.DOMAIN_NAME || 'checkdnsleak.com',
    VPS_IPV4: process.env.VPS_IPV4 || '23.95.215.125',
    VPS_IPV6: process.env.VPS_IPV6 || null
  };

  const processes = [];

  // 启动 Nuxt 应用
  const nuxtCommand = IS_PRODUCTION ? 'node .output/server/index.mjs' : 'npm run dev';
  const nuxtProcess = runProcess('Nuxt App', nuxtCommand, [], { env });
  processes.push(nuxtProcess);

  // 启动 DNS 服务器
  const dnsProcess = runProcess('DNS Server', 'node', ['dns-server.js'], { env });
  processes.push(dnsProcess);

  // 优雅关闭处理
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down services...');
    processes.forEach(child => {
      if (child && !child.killed) {
        child.kill('SIGINT');
      }
    });
    setTimeout(() => {
      processes.forEach(child => {
        if (child && !child.killed) {
          child.kill('SIGKILL');
        }
      });
      process.exit(0);
    }, 5000);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    processes.forEach(child => {
      if (child && !child.killed) {
        child.kill('SIGTERM');
      }
    });
  });
}

// 启动服务
startServices();