# Vue 3 项目迁移到 Nuxt.js 详细方案

## 1. 迁移目标与优势

**目标**: 将现有的 Vue 3 + Vite + Express SPA 项目迁移到一个基于 Nuxt.js 的现代化项目中。

**核心优势**:
- **解决 SEO 问题**: Nuxt.js 默认支持服务器端渲染 (SSR) 和静态站点生成 (SSG)，搜索引擎可以直接抓取到完整的页面内容，从根本上解决单页应用 (SPA) 的 SEO 难题。
- **简化架构**: Nuxt.js 内置了服务器引擎 (Nitro)，可以将您现有的 `backend-server.js` 和 `frontend-server.js` 的功能统一整合到 Nuxt 项目中，不再需要管理两个独立的 Node.js 服务和复杂的代理配置。
- **提升性能**: Nuxt.js 提供了自动代码分割、智能预加载、静态化渲染等多种性能优化策略。
- **改善开发体验**: 享受基于文件系统的路由、组件自动导入、集成的状态管理和数据获取方案等特性，提升开发效率。

---

## 2. 迁移前准备

1.  **代码备份**: 确保您当前的所有工作都已经提交到 Git。
    ```bash
    git add .
    git commit -m "Feat: Prepare for Nuxt.js migration"
    ```
2.  **理解 Nuxt 核心概念**:
    *   **目录结构**: Nuxt 采用约定优于配置的原则，目录结构决定了应用的功能（例如 `pages/` 用于路由，`components/` 用于组件）。
    *   **服务器端渲染 (SSR)**: 页面在服务器上渲染成 HTML 后再发送给客户端。
    *   **数据获取**: 使用 `useFetch` 和 `useAsyncData` 在服务器端或客户端获取数据。
    *   **Nitro 服务器**: 内置的服务器引擎，用于处理 API 请求和服务器端逻辑。

---

## 3. 详细迁移步骤

### 第 1 步：创建新的 Nuxt.js 项目

最稳妥的方式是创建一个全新的 Nuxt 项目，然后将旧代码逐步迁移过去。

```bash
# 1. 在 MyIP 项目的同级目录下创建一个新的 Nuxt 应用
npx nuxi@latest init MyIP-Nuxt

# 2. 进入新项目目录
cd MyIP-Nuxt

# 3. 安装依赖
npm install
```

### 第 2 步：迁移组件

将您现有的 Vue 组件从 `MyIP/frontend/components/` 目录复制到 `MyIP-Nuxt/components/` 目录。

**操作**:
1.  复制 `MyIP/frontend/components/*` 到 `MyIP-Nuxt/components/`。
2.  Nuxt 3 会自动导入这些组件，您无需在代码中手动 `import`。

### 第 3 步：迁移页面和路由

Nuxt 使用基于文件的路由系统。您需要将 `MyIP/frontend/router/index.js` 中的路由定义转换为 `MyIP-Nuxt/pages/` 目录下的文件结构。

**操作**:
1.  删除 `MyIP-Nuxt/app.vue` (这是临时入口文件)。
2.  根据您的路由配置创建以下文件：
    *   `MyIP/frontend/router/index.js` 中的 `{ path: '/', ... }` 对应 `MyIP-Nuxt/pages/index.vue`。
    *   `MyIP/frontend/router/index.js` 中的 `{ path: '/learn', ... }` 对应 `MyIP-Nuxt/pages/learn.vue`。
3.  将 `MyIP/frontend/components/DnsLeaksTest.vue` 的内容移动到 `MyIP-Nuxt/pages/index.vue`。
4.  将 `MyIP/frontend/components/LearnPage.vue` 的内容移动到 `MyIP-Nuxt/pages/learn.vue`。

### 第 4 步：迁移布局 (Layout)

您项目的主布局（导航栏和页脚）在 `App.vue` 中定义。在 Nuxt 中，这应该被移到 `layouts` 目录。

**操作**:
1.  在 `MyIP-Nuxt/` 下创建 `layouts/default.vue` 文件。
2.  将 `MyIP/frontend/App.vue` 的结构移入 `layouts/default.vue`，并用 `<slot />` 标签替代 `<router-view />`。

**`MyIP-Nuxt/layouts/default.vue` 示例**:
```vue
<template>
  <div>
    <NavBar />
    <main class="container mt-5 jn-container">
      <slot /> <!-- 页面内容将在这里渲染 -->
    </main>
    <Footer />
  </div>
</template>

<script setup>
// NavBar 和 Footer 组件会被自动导入
</script>
```

### 第 5 步：迁移状态管理 (Pinia)

Nuxt 对 Pinia 有官方支持，迁移过程很顺畅。

**操作**:
1.  安装 Pinia 模块:
    ```bash
    npm install pinia @pinia/nuxt
    ```
2.  在 `nuxt.config.ts` 中添加模块:
    ```typescript
    export default defineNuxtConfig({
      modules: ['@pinia/nuxt'],
    })
    ```
3.  将您的 store 文件从 `MyIP/frontend/store.js` 移动到 `MyIP-Nuxt/stores/main.ts`。
    *   在 Nuxt 中，通常会将 store 文件放在 `stores` 目录下。
    *   `defineStore` 的用法保持不变。

### 第 6 步：迁移静态资源和全局样式

**操作**:
1.  **公共资源**: 将 `MyIP/public/` 目录下的所有内容复制到 `MyIP-Nuxt/public/`。
2.  **全局样式**:
    *   将 `MyIP/frontend/style/style.css` 移动到 `MyIP-Nuxt/assets/css/main.css`。
    *   在 `nuxt.config.ts` 中引入全局 CSS:
      ```typescript
      export default defineNuxtConfig({
        css: ['~/assets/css/main.css', 'bootstrap/dist/css/bootstrap.min.css'],
      })
      ```

### 第 7 步：迁移后端 API

这是迁移的核心优势之一。您可以将 `backend-server.js` 和 `api/` 目录下的逻辑全部移入 Nuxt 的 `server/` 目录。

**操作**:
1.  在 `MyIP-Nuxt/` 下创建 `server/api/` 目录。
2.  将 `MyIP/api/dns-resolver.js` 改造为 `MyIP-Nuxt/server/api/dns-resolver.get.ts`。Nuxt 会自动根据文件名 (`.get`) 创建 GET 路由。

**`MyIP-Nuxt/server/api/dns-resolver.get.ts` 示例**:
```typescript
import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const { hostname, type } = getQuery(event)

  if (!hostname || typeof hostname !== 'string') {
    // ... 错误处理
  }

  // ... 您原有的 DNS 解析逻辑 ...

  // 直接返回 JSON 数据
  return {
    hostname,
    result_dns,
    result_doh
  }
})
```
3.  对 `configs.js` 和其他 API 文件执行类似操作。

### 第 8 步：迁移数据获取逻辑

使用 Nuxt 的 `useFetch` 来替代您在前端组件中使用的 `fetch`。`useFetch` 可以在服务器端运行，这对 SEO 至关重要。

**`pages/index.vue` 中的示例**:
```vue
<script setup>
// 在 setup 脚本中获取数据
const { data: configs, pending, error } = await useFetch('/api/configs')

// `configs` 是一个 ref，包含了从 /api/configs 获取到的数据
// `pending` 是一个布尔值，表示请求是否正在进行中
// `error` 包含了请求失败时的错误信息
</script>
```

### 第 9 步：处理环境变量

Nuxt 有一套强大的运行时配置系统来处理环境变量。

**操作**:
1.  创建 `.env` 文件，与原项目类似。
2.  在 `nuxt.config.ts` 中配置 `runtimeConfig` 来安全地暴露环境变量给客户端或仅在服务器端使用。

**`nuxt.config.ts` 示例**:
```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    // 只在服务器端可用的私有 key
    ipinfoApiToken: process.env.IPINFO_API_TOKEN,
    // public 部分会暴露给客户端
    public: {
      googleAnalyticsId: process.env.VITE_GOOGLE_ANALYTICS_ID,
    }
  }
})
```

### 第 10 步：清理和收尾

迁移完成后，您可以删除旧项目中的以下文件和依赖：
- **文件**: `backend-server.js`, `frontend-server.js`, `vite.config.js`, `index.html`。
- **依赖**: `express`, `vite`, `vue-router`, `concurrently`, `nodemon`, `http-proxy-middleware` 等。

---

## 4. 部署方案

将 Nuxt.js 应用部署到像 Vercel 或 Netlify 这样的现代托管平台非常简单。

1.  将您的 `MyIP-Nuxt` 项目推送到 GitHub。
2.  在 Vercel 或 Netlify 上，连接您的 GitHub 仓库。
3.  平台会自动识别出这是一个 Nuxt.js 项目，并配置好构建和部署流程。
4.  在平台的设置中配置好您的环境变量。

---

## 5. 总结

迁移到 Nuxt.js 是一个战略性的升级，它将彻底解决您项目的 SEO 问题，同时简化您的技术栈并提升应用性能。虽然初期需要投入一些时间和精力进行代码迁移和重构，但长远来看，这将为项目带来巨大的价值和更好的可维护性。
