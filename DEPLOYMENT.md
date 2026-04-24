# BayCard 自動化部署指南

本文檔提供三種完全自動化部署方案。

## 方案 1：GitHub Actions + Vercel（推薦）

### 優點
- ✅ 完全自動化，無需手動操作
- ✅ 每次 push 到 main 分支自動部署
- ✅ 支持自動回滾
- ✅ 免費額度充足

### 設置步驟

#### 第 1 步：連接 Vercel 帳戶

1. 訪問 https://vercel.com
2. 使用 GitHub 帳戶登入
3. 點擊 "New Project"
4. 選擇 "Import Git Repository"
5. 選擇 `chung0930/BayCard` 倉庫
6. 點擊 "Import"

#### 第 2 步：配置環境變數

在 Vercel 項目設置中，添加以下環境變數：

```
DATABASE_URL=<你的資料庫連接字符串>
JWT_SECRET=<你的 JWT 密鑰>
VITE_APP_ID=<Manus OAuth App ID>
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=<Manus OAuth 入口 URL>
OWNER_OPEN_ID=<服主 OpenID>
OWNER_NAME=<服主名稱>
VITE_ANALYTICS_ENDPOINT=<分析端點>
VITE_ANALYTICS_WEBSITE_ID=<分析網站 ID>
VITE_FRONTEND_FORGE_API_KEY=<前端 API 密鑰>
VITE_FRONTEND_FORGE_API_URL=<前端 API URL>
BUILT_IN_FORGE_API_KEY=<後端 API 密鑰>
BUILT_IN_FORGE_API_URL=<後端 API URL>
```

#### 第 3 步：配置 GitHub Actions

1. 在 GitHub 倉庫設置中，進入 "Secrets and variables" > "Actions"
2. 添加以下 Secrets：

```
VERCEL_TOKEN=<你的 Vercel Token>
VERCEL_ORG_ID=<你的 Vercel Organization ID>
VERCEL_PROJECT_ID=<你的 Vercel Project ID>
```

獲取這些信息：
- `VERCEL_TOKEN`: https://vercel.com/account/tokens
- `VERCEL_ORG_ID` 和 `VERCEL_PROJECT_ID`: 在 Vercel 項目設置中查看

#### 第 4 步：完成！

現在每次你 push 代碼到 `main` 分支，GitHub Actions 會自動：
1. 檢出代碼
2. 安裝依賴
3. 構建項目
4. 部署到 Vercel

你的應用將在 `https://<project-name>.vercel.app` 上線。

---

## 方案 2：GitHub Actions + Netlify

### 優點
- ✅ 完全自動化
- ✅ 支持預覽部署
- ✅ 自動 DNS 配置

### 設置步驟

1. 訪問 https://netlify.com
2. 使用 GitHub 帳戶登入
3. 點擊 "Add new site" > "Import an existing project"
4. 選擇 GitHub 倉庫 `chung0930/BayCard`
5. 配置構建設置：
   - Build command: `pnpm build`
   - Publish directory: `dist`
6. 添加環境變數（同方案 1）
7. 點擊 "Deploy site"

Netlify 會自動設置 GitHub Actions 工作流。

---

## 方案 3：Docker + 自託管

### 優點
- ✅ 完全控制
- ✅ 支持自定義配置
- ✅ 可部署到任何伺服器

### Dockerfile

```dockerfile
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
```

### 部署命令

```bash
# 構建 Docker 鏡像
docker build -t baycard:latest .

# 運行容器
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="<你的資料庫 URL>" \
  -e JWT_SECRET="<你的 JWT 密鑰>" \
  -e VITE_APP_ID="<OAuth App ID>" \
  # ... 其他環境變數
  baycard:latest
```

---

## 方案 4：Manus 平台原生部署（最簡單）

### 優點
- ✅ 無需配置
- ✅ 自動 SSL
- ✅ 自動資料庫管理

### 步驟

1. 在 Manus 管理界面點擊 "Publish"
2. 系統自動部署到 `https://baycard.manus.space`
3. 完成！

---

## 監控與維護

### 查看部署日誌

**Vercel:**
```bash
# 安裝 Vercel CLI
npm i -g vercel

# 查看日誌
vercel logs <deployment-url>
```

**Netlify:**
```bash
# 安裝 Netlify CLI
npm i -g netlify-cli

# 查看日誌
netlify logs
```

### 自動回滾

如果部署失敗，所有平台都支持自動回滾到上一個穩定版本。

### 性能監控

- **Vercel Analytics**: https://vercel.com/docs/analytics
- **Netlify Analytics**: https://docs.netlify.com/analytics/overview/

---

## 故障排除

### 部署失敗

1. 檢查環境變數是否正確設置
2. 查看構建日誌找出具體錯誤
3. 確保 `pnpm install` 和 `pnpm build` 在本地可以成功執行

### 應用無法啟動

1. 檢查資料庫連接字符串
2. 確保所有必需的環境變數都已設置
3. 查看應用日誌

### 性能問題

1. 檢查資料庫查詢是否優化
2. 啟用 CDN 緩存
3. 使用性能分析工具找出瓶頸

---

## 推薦方案

**對於大多數用戶：** 使用方案 1（GitHub Actions + Vercel）
- 完全免費
- 自動化程度最高
- 無需額外配置

**對於企業用戶：** 使用方案 3（Docker + 自託管）
- 完全控制
- 支持自定義配置
- 可集成到現有基礎設施

**對於 Manus 用戶：** 使用方案 4（Manus 原生部署）
- 最簡單
- 無需額外工具
- 完全集成

---

## 下一步

1. 選擇適合你的部署方案
2. 按照上述步驟進行配置
3. 推送代碼到 GitHub
4. 等待自動部署完成
5. 訪問你的應用！

有任何問題，請查看各平台的官方文檔或提交 GitHub Issue。
