# 开发环境设置指南

## 选项1: 不使用 Redis 开发 (推荐用于快速开发)

直接启动 Nuxt 应用，无需 Redis：

```bash
npm run dev
```

在这种模式下：
- API 速率限制将被跳过（开发环境）
- DNS 测试将返回演示数据
- 不会有 Redis 连接错误

## 选项2: 完整功能开发 (需要 Redis)

### 安装和启动 Redis

**macOS (使用 Homebrew):**
```bash
brew install redis
brew services start redis
```

**或者使用 Docker:**
```bash
docker run -d -p 6379:6379 redis:alpine
```

### 设置环境变量

创建 `.env` 文件：
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
DOMAIN_NAME=checkdnsleak.com
NODE_ENV=development
```

### 启动应用

```bash
npm run dev
```

## 选项3: 完整 Docker 开发环境

使用 Docker Compose 启动完整环境：

```bash
# 构建和启动所有服务（包括DNS服务器）
docker-compose up --build

# 仅启动 Redis 用于开发
docker-compose up redis -d
npm run dev
```

## 验证设置

1. **访问应用**: http://localhost:3000
2. **测试API**: http://localhost:3000/api/start-test  
3. **检查Redis** (如果启用): 
   ```bash
   redis-cli ping
   # 应返回 PONG
   ```

## 故障排除

如果遇到 Redis 连接错误：
1. 确认 Redis 服务正在运行
2. 检查端口 6379 是否被占用
3. 或者直接使用选项1进行无Redis开发