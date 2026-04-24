# BayCard - 社交討論平台

BayCard 是一個優雅的社群論壇平台，靈感來自 Dcard，提供用戶友好的界面和完整的社交功能。

## 🚀 核心功能

### 用戶系統
- ✅ OAuth 第三方登入（Manus OAuth 整合）
- ✅ 個人頁面（查看發布的文章、編輯個人資料）
- ✅ 用戶認證與會話管理

### 文章系統
- ✅ 發布文章（支持標題、內容、看板選擇）
- ✅ 文章詳情頁（自動生成獨立 URL）
- ✅ 熱門文章推薦（按讚數與留言數排序）
- ✅ 文章瀏覽數統計

### 互動功能
- ✅ 文章按讚與收藏
- ✅ 留言系統（支持在文章下方留言）
- ✅ 留言按讚

### 看板系統
- ✅ 多個主題看板
- ✅ 看板列表展示

## 📋 技術棧

### 前端
- **React 19** - UI 框架
- **Tailwind CSS 4** - 樣式系統
- **Wouter** - 路由管理
- **tRPC** - 類型安全的 API 調用
- **Shadcn/UI** - UI 組件庫

### 後端
- **Express 4** - Web 伺服器
- **tRPC 11** - RPC 框架
- **Drizzle ORM** - 資料庫 ORM
- **MySQL/TiDB** - 資料庫

### 資料庫表結構
- `users` - 用戶表
- `boards` - 看板表
- `articles` - 文章表
- `comments` - 留言表
- `likes` - 按讚表
- `favorites` - 收藏表
- `pageViews` - 瀏覽數表
- `systemLogs` - 系統日誌表
- `announcements` - 公告表
- `advertisements` - 廣告表
- `settings` - 系統設定表

## 🔧 開發環境設置

### 前置要求
- Node.js 22.13.0+
- pnpm 10.4.1+
- MySQL 8.0+ 或 TiDB

### 安裝依賴
```bash
cd /home/ubuntu/BayCard
pnpm install
```

### 環境變數
系統自動注入以下環境變數：
- `DATABASE_URL` - 資料庫連接字符串
- `JWT_SECRET` - JWT 簽名密鑰
- `VITE_APP_ID` - OAuth 應用 ID
- `OAUTH_SERVER_URL` - OAuth 伺服器 URL
- `VITE_OAUTH_PORTAL_URL` - OAuth 登入入口

### 啟動開發伺服器
```bash
pnpm dev
```

開發伺服器將在 `http://localhost:3000` 啟動

### 構建生產版本
```bash
pnpm build
pnpm start
```

## 📁 項目結構

```
BayCard/
├── client/                    # 前端應用
│   ├── src/
│   │   ├── pages/            # 頁面組件
│   │   │   ├── Home.tsx      # 首頁
│   │   │   ├── ArticleDetail.tsx  # 文章詳情頁
│   │   │   ├── Profile.tsx   # 用戶個人頁面
│   │   │   └── CreateArticle.tsx  # 文章發布頁面
│   │   ├── components/       # 可複用組件
│   │   ├── lib/              # 工具函數
│   │   ├── App.tsx           # 主應用組件
│   │   └── index.css         # 全局樣式
│   └── public/               # 靜態資源
├── server/                    # 後端應用
│   ├── routers.ts            # tRPC 路由定義
│   ├── db.ts                 # 資料庫查詢函數
│   └── _core/                # 核心基礎設施
├── drizzle/                   # 資料庫遷移
│   └── schema.ts             # 資料庫 schema 定義
├── shared/                    # 共享代碼
└── package.json              # 項目配置
```

## 🎨 設計風格

BayCard 採用優雅且精緻的設計語言：
- **色彩系統** - 使用 OKLCH 色彩空間，支持亮色和暗色主題
- **字體** - Inter（正文）+ Plus Jakarta Sans（標題）
- **間距** - 一致的 8px 網格系統
- **陰影** - 柔和的陰影效果，增強層次感
- **響應式** - 完全支持桌面和行動裝置

## 🔌 API 端點

所有 API 通過 tRPC 提供，自動生成類型定義。主要端點包括：

### 文章相關
- `articles.list` - 獲取文章列表
- `articles.getBySlug` - 獲取文章詳情
- `articles.hot` - 獲取熱門文章
- `articles.create` - 發布新文章
- `articles.getUserArticles` - 獲取用戶文章

### 看板相關
- `boards.list` - 獲取看板列表

### 留言相關
- `comments.create` - 發布留言
- `comments.getByArticleId` - 獲取文章留言

### 用戶相關
- `users.updateProfile` - 更新個人資料

### 互動相關
- `likes.toggleArticleLike` - 切換文章按讚
- `favorites.toggle` - 切換收藏

## 📊 瀏覽數偵測

系統自動記錄每個頁面的瀏覽數，包括：
- 瀏覽次數
- 訪客裝置信息（User-Agent）
- 訪問時間戳

## 🔐 安全性

- ✅ OAuth 認證
- ✅ 會話管理
- ✅ CSRF 保護
- ✅ SQL 注入防護（通過 ORM）
- ✅ 類型安全的 API

## 🚀 部署

### 使用 Manus 平台部署

1. 點擊管理界面的 **Publish** 按鈕
2. 系統將自動構建和部署應用
3. 應用將在 `https://{project-name}.manus.space` 上線

### 自定義域名

在管理界面的 **Settings > Domains** 中配置自定義域名。

## 📝 使用指南

### 發布文章
1. 點擊 **New Article** 按鈕
2. 填寫標題、選擇看板、輸入內容
3. 點擊 **Publish Article** 發布

### 查看個人頁面
1. 點擊右上角用戶名
2. 選擇 **Profile**
3. 查看發布的文章和個人資料

### 與文章互動
1. 點擊文章進入詳情頁
2. 點擊 ❤️ 按讚或 🔖 收藏
3. 在下方留言區域留言

## 🔄 後續開發計劃

以下功能已在計劃中，可根據需要實現：

- [ ] 管理員功能（用戶管理、文章管理）
- [ ] 系統公告功能
- [ ] 板主功能（刪除留言、管理看板）
- [ ] 系統日誌查詢與篩選
- [ ] Google Apps Script 整合
- [ ] 富文本編輯器
- [ ] 圖片上傳功能
- [ ] 巢狀留言回覆
- [ ] 搜尋功能
- [ ] 用戶通知系統
- [ ] 廣告系統

## 🐛 已知問題

目前沒有已知的重大問題。如發現 bug，請通過以下方式報告：

1. 在 GitHub 上提交 Issue
2. 提供詳細的重現步驟
3. 附加相關的錯誤信息

## 📞 支持

如需技術支持或有任何問題，請：

1. 查看 [GitHub Issues](https://github.com/chung0930/BayCard)
2. 聯繫開發團隊

## 📄 許可證

MIT License - 詳見 LICENSE 文件

## 🙏 致謝

感謝所有貢獻者和使用者的支持！

---

**最後更新**: 2026年4月24日
**版本**: 1.0.0 (預付版)
