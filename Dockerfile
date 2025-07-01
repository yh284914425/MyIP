# 第一阶段：构建
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 第二阶段：生产
FROM node:18-alpine
WORKDIR /app

# 复制构建结果和必要文件
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY dns-server.js ./
COPY start-all.js ./

# 暴露端口
EXPOSE 3000
EXPOSE 53/udp

# 启动命令
CMD ["node", "start-all.js"]
