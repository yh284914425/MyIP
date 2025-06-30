# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

**SecureDNSCheck** 是一个 DNS 泄露检测工具，帮助用户验证他们的 VPN 是否正确保护了 DNS 查询。该项目原为 MyIP（综合 IP 工具箱），现已转型并迁移到 Nuxt.js 以改善 SEO 性能和搜索引擎索引。

## 当前架构 (Nuxt.js 3)

### 前端 (Nuxt.js 3)
- **位置**: 根目录 (`/Users/sheng/Desktop/code/MyIP/`)
- **核心技术**: Nuxt.js 3, Vue 3, Pinia, Bootstrap 5 (CDN), Bootstrap Icons
- **渲染策略**: 混合渲染（内容页面用 SSR，DNS 测试用 SPA）
- **主要组件**:
  - `pages/index.vue` - DNS 泄露测试页面，具有交互式界面
  - `components/Nav.vue` - 导航头部
  - `components/Footer.vue` - 页脚及模态框
  - `layouts/default.vue` - 主布局包装器

### 混合渲染策略
- **DNS 测试页面** (`/`): 客户端渲染，支持交互功能
- **学习页面** (`/learn/**`): 预渲染，优化 SEO
- **API 路由** (`/api/**`): 启用 CORS，支持外部集成

### DNS 测试功能
- 实时 DNS 泄露检测，带进度跟踪
- 模拟 DNS 服务器测试（Google DNS、Cloudflare、OpenDNS、Quad9）
- 可视化反馈，包含进度条和结果显示
- 响应式设计，支持手机和桌面端

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式（Nuxt.js 开发服务器）
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm run start

# 自定义端口开发服务器
npm run dev -- --port 3004
```

## 配置

### Nuxt 配置 (`nuxt.config.ts`)
- **混合渲染**: 基于路由的混合 SSR/SPA 策略
- **CDN 依赖**: 通过 CDN 引入 Bootstrap 5、Bootstrap Icons，兼容 SSR
- **SEO 优化**: Meta 标签、Open Graph、结构化数据
- **运行时配置**: 基于环境变量的 API 密钥配置

### 环境变量
- `VITE_GOOGLE_ANALYTICS_ID`: Google Analytics 跟踪 ID
- `IPINFO_API_TOKEN`: IPInfo.io API 令牌（服务端）
- `NODE_ENV`: 环境模式（development/production）

## 关键技术解决方案

### SSR 兼容性修复
- **Bootstrap 集成**: 使用 CDN 链接而非 ES 模块，避免 SSR 问题
- **客户端检查**: `process.client` 保护 DOM 相关代码
- **模态框初始化**: Bootstrap 模态框仅在客户端初始化

### DNS 测试逻辑
- **模拟测试**: 演示用的模拟 DNS 服务器响应
- **进度跟踪**: 实时进度条和状态更新
- **泄露检测**: 比较国家和 ISP 的简单算法
- **响应式 UI**: Vue 3 Composition API 和响应式状态管理

## 当前状态

✅ **工作功能:**
- DNS 泄露测试，带可视化反馈
- 响应式设计，支持手机端
- SEO 优化的内容页面
- Bootstrap 模态框和 UI 组件
- 运行在 3004 端口的开发服务器

✅ **最近修复:**
- 解决了 Bootstrap SSR 兼容性问题
- 修复了无限加载问题
- 实现了可用的 DNS 测试按钮功能
- 添加了进度条和结果显示

## 测试与开发

```bash
# 启动开发服务器
npm run dev

# 访问应用
http://localhost:3004/

# 测试 DNS 功能
# 点击首页的 "Check for DNS Leaks" 按钮
```

## 迁移说明

该项目已成功从 Vue 3 + Express.js 迁移到 Nuxt.js 3，以解决 SEO 索引问题。迁移保持了所有核心功能，并增加了：
- 服务端渲染，改善 SEO
- 混合渲染提升性能
- 单服务器架构简化部署
- 增强的 Meta 标签管理和结构化数据