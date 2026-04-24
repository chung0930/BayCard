# BayCard 完整部署指南（Google Apps Script + GitHub Pages）

本指南說明如何完整部署 BayCard 社交平台。

## 架構概述

BayCard 採用以下架構：

```
┌─────────────────────────────────────────────────────────┐
│                    前端（GitHub Pages）                   │
│              React 19 + Tailwind CSS 4                   │
│         https://yourusername.github.io/BayCard          │
└──────────────────────┬──────────────────────────────────┘
                       │ API 調用
                       ▼
┌─────────────────────────────────────────────────────────┐
│          後端（Google Apps Script Web API）              │
│         https://script.google.com/macros/d/...          │
└──────────────────────┬──────────────────────────────────┘
                       │ 讀寫
                       ▼
┌─────────────────────────────────────────────────────────┐
│           資料庫（Google Sheet）                         │
│    https://sheets.google.com/d/YOUR_SHEET_ID           │
└─────────────────────────────────────────────────────────┘
```

## 部署步驟

### 第 1 部分：部署 Google Apps Script 後端

#### 1.1 建立 Google Sheet

1. 訪問 https://sheets.google.com
2. 點擊 **+ 建立新試算表**
3. 命名為 `BayCard Database`
4. 記下 Sheet ID（URL 中的 `d/` 後面的部分）

#### 1.2 建立 Google Apps Script 專案

1. 在 Google Sheet 中，點擊 **工具** > **指令碼編輯器**
2. 刪除預設代碼

#### 1.3 複製代碼

按順序複製以下文件到 Google Apps Script 編輯器：

1. 點擊 **+ 新增檔案** > **新增指令碼**
2. 命名為 `Users`，複製 `google-apps-script/Users.gs` 的代碼
3. 重複以下文件：
   - `Boards.gs`
   - `Articles.gs`
   - `Comments.gs`
   - `Interactions.gs`
   - `WebAPI.gs`
4. 編輯 `Code.gs`（預設文件），複製 `google-apps-script/Code.gs` 的代碼

#### 1.4 設置 Spreadsheet ID

在 `Code.gs` 中，找到這一行：

```javascript
const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
```

改為：

```javascript
const SPREADSHEET_ID = 'YOUR_SHEET_ID_HERE';
```

將 `YOUR_SHEET_ID_HERE` 替換為你的 Google Sheet ID。

#### 1.5 初始化資料庫

1. 在編輯器中，選擇 `initializeDatabase` 函數
2. 點擊 **執行**
3. 授予必要的權限
4. 等待完成

#### 1.6 部署為 Web 應用

1. 點擊 **部署** > **新增部署**
2. 選擇類型為 **Web 應用**
3. 設置：
   - **執行身份**: 選擇你的帳戶
   - **誰可以存取**: 選擇 **任何人**
4. 點擊 **部署**
5. **複製生成的部署 URL**（形式如 `https://script.google.com/macros/d/...`）

### 第 2 部分：部署前端到 GitHub Pages

#### 2.1 設置環境變數

1. 在 BayCard 專案根目錄建立 `.env.local` 文件
2. 添加以下內容：

```env
VITE_GAS_API_URL=https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID/usercontent
```

將 `YOUR_DEPLOYMENT_ID` 替換為你的 Google Apps Script 部署 ID。

#### 2.2 構建前端

```bash
cd /home/ubuntu/BayCard
pnpm install
pnpm build
```

#### 2.3 推送到 GitHub

```bash
git add .
git commit -m "Deploy BayCard with Google Apps Script backend"
git push origin main
```

#### 2.4 啟用 GitHub Pages

1. 訪問 https://github.com/chung0930/BayCard/settings
2. 找到 **Pages** 部分
3. **Source** 選擇 **Deploy from a branch**
4. **Branch** 選擇 **main**，**Folder** 選擇 **/(root)**
5. 點擊 **Save**

#### 2.5 配置自訂域名（可選）

1. 在 GitHub 倉庫設置中，找到 **Pages**
2. 在 **Custom domain** 中輸入你的域名（例如 `baycard.com`）
3. 點擊 **Save**
4. 按照提示配置 DNS 記錄

### 第 3 部分：測試

#### 3.1 測試 Google Apps Script API

訪問以下 URL 測試 API：

```
https://script.google.com/macros/d/YOUR_ID/usercontent?action=getAllBoards
```

應該返回空的看板列表。

#### 3.2 測試前端

1. 訪問 https://yourusername.github.io/BayCard
2. 檢查是否能加載頁面
3. 嘗試以下功能：
   - 查看首頁
   - 搜尋文章
   - 查看看板

#### 3.3 測試完整流程

1. 建立用戶
2. 建立看板
3. 發布文章
4. 發布留言
5. 按讚和收藏

## 常見問題

### Q: 如何修改 Google Apps Script 代碼？

A: 在 Google Apps Script 編輯器中修改代碼，然後：
1. 點擊 **部署** > **管理部署**
2. 選擇你的部署
3. 點擊 **編輯**
4. 點擊 **部署新版本**

### Q: 如何增加新的 API 端點？

A: 
1. 在對應的 `.gs` 文件中添加新函數
2. 在 `WebAPI.gs` 的 `doPost` 或 `doGet` 中添加新的 case
3. 部署新版本

### Q: 資料會丟失嗎？

A: 不會。所有資料存儲在 Google Sheet 中，Google 會自動備份。你也可以定期下載 Sheet 為 CSV 文件。

### Q: 有沒有使用限制？

A: Google Apps Script 有以下限制：
- 每天最多 20,000 次執行
- 每個指令碼最多 6 分鐘執行時間
- 每個 Sheet 最多 1,000 萬個單元格

對於小型社區平台，這些限制通常足夠。

### Q: 如何增加用戶數量？

A: Google Sheet 理論上可以存儲無限行數據（實際限制是 1,000 萬行）。如果達到限制，可以：
1. 建立新的 Google Sheet
2. 將舊數據存檔
3. 更新 `SPREADSHEET_ID`

### Q: 如何自訂域名？

A: 參考 **第 2 部分 > 2.5 配置自訂域名**。

### Q: 如何添加 SSL 證書？

A: GitHub Pages 自動提供 HTTPS。自訂域名也會自動獲得 SSL 證書。

## 優化建議

### 1. 緩存

在前端添加緩存層，減少 API 調用：

```typescript
const cache = new Map();

async function getCachedArticles() {
  if (cache.has('articles')) {
    return cache.get('articles');
  }
  
  const articles = await articleAPI.getAll();
  cache.set('articles', articles);
  
  // 5 分鐘後清除緩存
  setTimeout(() => cache.delete('articles'), 5 * 60 * 1000);
  
  return articles;
}
```

### 2. 分頁

使用分頁減少每次加載的數據量：

```typescript
const { data, total } = await articleAPI.getAll(20, 0); // 每頁 20 條
```

### 3. 索引

在 Google Sheet 中為常用字段建立索引，提高查詢速度。

### 4. 監控

定期檢查 Google Apps Script 的執行日誌，找出性能瓶頸。

## 故障排除

### 前端無法加載

1. 檢查 GitHub Pages 是否啟用
2. 檢查 `.env.local` 中的 `VITE_GAS_API_URL` 是否正確
3. 查看瀏覽器控制台的錯誤信息

### API 無回應

1. 檢查 Google Apps Script 是否已部署
2. 檢查部署 URL 是否正確
3. 查看 Google Apps Script 的執行日誌

### 資料庫初始化失敗

1. 檢查 `SPREADSHEET_ID` 是否正確
2. 檢查是否有 Google Sheet 的編輯權限
3. 查看執行日誌中的詳細錯誤

## 下一步

1. 按照本指南部署 Google Apps Script 後端
2. 部署前端到 GitHub Pages
3. 測試所有功能
4. 邀請用戶使用
5. 根據反饋不斷改進

祝你使用愉快！🎉
