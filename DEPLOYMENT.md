# DNS 泄露检测工具 - 部署指南

## 项目概述

该项目已经从原来的 MyIP 工具成功改造为专业的 DNS 泄露检测工具，支持：

- IPv4 和 IPv6 DNS 泄露检测
- 基于 ASN 和地理位置的精准检测
- 实时结果展示
- 速率限制保护
- Docker 容器化部署

## 快速开始

### 1. 环境准备

确保您的服务器已安装：
- Docker
- Docker Compose
- 开放端口：53/udp (DNS), 3000/tcp (Web), 80/tcp, 443/tcp

### 2. 配置环境变量

复制环境变量模板：
```bash
cp .env.example .env
```

编辑 `.env` 文件，至少配置以下必需变量：
```bash
DOMAIN_NAME=您的域名.com
VPS_IPV4=您的服务器IPv4地址
VPS_IPV6=您的服务器IPv6地址
```

### 3. 启动服务

```bash
# 构建并启动所有服务
docker-compose up --build -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

## 开发模式

如果需要在开发模式下运行：

```bash
# 安装依赖
npm install

# 启动 Redis (如果本地没有)
docker run -d -p 6379:6379 redis:alpine

# 设置开发环境变量
export REDIS_HOST=localhost
export DOMAIN_NAME=checkdnsleak.com

# 启动开发服务器
npm run dev

# 在另一个终端启动 DNS 服务器
npm run start:dns
```

## 域名配置

**重要**: 在部署前必须完成域名的胶水记录配置，详见 `方案论证.md` 中的域名配置章节。

简要步骤：
1. 在域名注册商添加主机记录 (ns1, ns2)
2. 设置域名服务器为您的自定义 NS
3. 等待 DNS 传播 (24-48小时)

## 生产环境配置

### Nginx 反向代理

创建 `/etc/nginx/sites-available/your-domain.conf`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL 证书

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 监控和维护

### 服务状态检查

```bash
# 检查容器状态
docker-compose ps

# 检查 DNS 服务器
nslookup test.your-domain.com your-server-ip

# 检查 Web 应用
curl http://localhost:3000/api/start-test
```

### 日志管理

```bash
# 查看应用日志
docker-compose logs dns-leak-app

# 查看 Redis 日志
docker-compose logs redis

# 实时日志
docker-compose logs -f --tail=100
```

### 备份

```bash
# 备份 Redis 数据
docker-compose exec redis redis-cli BGSAVE

# 导出配置
docker-compose config > backup-compose.yml
```

## 故障排除

### 常见问题

1. **DNS 服务器无法启动**
   - 检查端口 53 是否被占用
   - 确认容器有绑定特权端口的权限

2. **Redis 连接失败**
   - 检查 Redis 容器是否正常运行
   - 验证网络连接

3. **API 返回 500 错误**
   - 查看应用日志
   - 检查环境变量配置

### 调试命令

```bash
# 进入应用容器
docker-compose exec dns-leak-app sh

# 检查网络连接
docker network ls
docker network inspect myip_dns-leak-net

# 重启特定服务
docker-compose restart dns-leak-app
```

## 性能优化

### 生产环境建议

1. **启用 Redis 持久化**
2. **配置 Nginx 缓存**
3. **使用 CDN 加速静态资源**
4. **设置监控和告警**

### 扩展性

- 可以添加多个 DNS 服务器实例实现负载均衡
- Redis 可以配置为集群模式
- 应用支持水平扩展

## 安全注意事项

1. **防火墙配置**: 只开放必要端口
2. **定期更新**: 保持系统和依赖最新
3. **监控日志**: 定期检查异常访问
4. **备份策略**: 定期备份配置和数据

## 支持

如遇到问题，请检查：
1. 环境变量配置
2. 域名 DNS 设置
3. 防火墙和端口配置
4. 容器日志信息