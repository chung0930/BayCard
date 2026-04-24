FROM node:22-alpine

WORKDIR /app

# 安裝 pnpm
RUN npm install -g pnpm

# 複製 package 文件
COPY package.json pnpm-lock.yaml ./

# 安裝依賴
RUN pnpm install --frozen-lockfile

# 複製源代碼
COPY . .

# 構建
RUN pnpm build

# 暴露端口
EXPOSE 3000

# 啟動應用
CMD ["pnpm", "start"]
