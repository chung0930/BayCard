# BayCard Google Apps Script 後端部署指南

本指南說明如何部署 Google Apps Script 後端。

## 第 1 步：建立 Google Sheet

1. 訪問 https://sheets.google.com
2. 建立新的 Google Sheet，命名為 `BayCard Database`
3. 記下 Sheet ID（在 URL 中）

## 第 2 步：建立 Google Apps Script 專案

1. 在 Google Sheet 中，點擊 **工具** > **指令碼編輯器**
2. 這會打開 Google Apps Script 編輯器
3. 刪除預設的 `myFunction` 代碼

## 第 3 步：複製所有代碼

將以下文件的代碼依序複製到 Google Apps Script 編輯器：

1. **Code.gs** - 主程式和初始化
2. **Users.gs** - 用戶管理
3. **Boards.gs** - 看板管理
4. **Articles.gs** - 文章管理
5. **Comments.gs** - 留言管理
6. **Interactions.gs** - 按讚和收藏
7. **WebAPI.gs** - Web API 端點

### 複製步驟

1. 在編輯器中，點擊 **+ 新增檔案** > **新增指令碼**
2. 命名為文件名（例如 `Users`）
3. 將對應文件的代碼複製進去
4. 重複直到所有文件都複製完成

## 第 4 步：設置 Spreadsheet ID

1. 在 Google Apps Script 編輯器中，點擊 **專案設定**
2. 複製 Spreadsheet ID（從 Google Sheet URL 中）
3. 在 `Code.gs` 的第一行，將 `SPREADSHEET_ID` 設置為你的 Sheet ID

```javascript
const SPREADSHEET_ID = 'YOUR_SHEET_ID_HERE';
```

## 第 5 步：初始化資料庫

1. 在編輯器中，選擇 `initializeDatabase` 函數
2. 點擊 **執行** 按鈕
3. 授予必要的權限
4. 等待完成（應該會在 Google Sheet 中建立所有表）

## 第 6 步：部署為 Web 應用

1. 點擊 **部署** > **新增部署**
2. 選擇類型為 **Web 應用**
3. 設置：
   - **執行身份**: 選擇你的帳戶
   - **誰可以存取**: 選擇 **任何人**
4. 點擊 **部署**
5. 複製生成的 **部署 URL**（形式如 `https://script.google.com/macros/d/...`）

## 第 7 步：設置前端 API 端點

在前端代碼中，將 API 端點設置為你的 Google Apps Script URL：

```javascript
const API_URL = 'https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID/usercontent';
```

## 測試 API

### 測試初始化

1. 在 Google Apps Script 編輯器中，選擇 `testAPI` 函數
2. 點擊 **執行**
3. 查看執行日誌確認沒有錯誤

### 測試 Web API

1. 在編輯器中，選擇 `testWebAPI` 函數
2. 點擊 **執行**
3. 查看執行日誌中的 URL 和回應

### 手動測試

使用 curl 或 Postman 測試 API：

```bash
# GET 請求
curl "https://script.google.com/macros/d/YOUR_ID/usercontent?action=getAllBoards"

# POST 請求
curl -X POST "https://script.google.com/macros/d/YOUR_ID/usercontent" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "createUser",
    "params": {
      "openId": "test-user",
      "name": "Test User",
      "email": "test@example.com"
    }
  }'
```

## API 端點列表

### 用戶相關

- `createUser` - 建立用戶
- `getUserByOpenId` - 根據 OpenId 獲取用戶
- `getUserById` - 根據 ID 獲取用戶
- `updateUserProfile` - 更新用戶資料
- `getUserArticles` - 獲取用戶的文章

### 看板相關

- `getAllBoards` - 獲取所有看板
- `getPublicBoards` - 獲取公開看板
- `getBoardBySlug` - 根據 Slug 獲取看板
- `createBoard` - 建立看板
- `updateBoard` - 更新看板
- `getBoardStats` - 獲取看板統計

### 文章相關

- `getAllArticles` - 獲取所有文章（分頁）
- `getArticleBySlug` - 根據 Slug 獲取文章
- `createArticle` - 發布文章
- `updateArticle` - 編輯文章
- `deleteArticle` - 刪除文章
- `getHotArticles` - 獲取熱門文章
- `searchArticles` - 搜尋文章
- `incrementViewCount` - 增加瀏覽數

### 留言相關

- `createComment` - 發布留言
- `getArticleComments` - 獲取文章的留言
- `updateComment` - 編輯留言
- `deleteComment` - 刪除留言
- `getCommentReplies` - 獲取留言的回覆

### 互動相關

- `toggleArticleLike` - 切換文章按讚
- `toggleCommentLike` - 切換留言按讚
- `toggleFavorite` - 切換收藏
- `hasUserLikedArticle` - 檢查是否讚過文章
- `hasUserFavoritedArticle` - 檢查是否收藏過文章

## 故障排除

### 權限錯誤

如果出現權限錯誤，請確保：
1. 你有 Google Sheet 的編輯權限
2. 在部署時選擇了正確的帳戶
3. 在部署設置中選擇 **任何人** 可以存取

### API 無回應

1. 檢查部署 URL 是否正確
2. 確保 Google Apps Script 已部署
3. 查看 Google Apps Script 的執行日誌找出錯誤

### 資料庫初始化失敗

1. 確保 `SPREADSHEET_ID` 設置正確
2. 確保你有 Google Sheet 的編輯權限
3. 查看執行日誌中的詳細錯誤信息

## 常見問題

### Q: 如何更新代碼？

A: 在 Google Apps Script 編輯器中修改代碼，然後點擊 **部署** > **管理部署** > **編輯** > **部署新版本**。

### Q: 資料存儲在哪裡？

A: 所有資料存儲在 Google Sheet 中。每個功能對應一個 Sheet（users、articles、comments 等）。

### Q: 如何備份資料？

A: Google Sheet 會自動備份。你也可以定期下載 Sheet 為 CSV 或 Excel 文件。

### Q: 有沒有使用限制？

A: Google Apps Script 有以下限制：
- 每天最多 20,000 次執行
- 每個指令碼最多 6 分鐘執行時間
- 每個 Sheet 最多 1,000 萬個單元格

對於小型社區平台，這些限制通常足夠。

## 下一步

1. 部署 Google Apps Script
2. 記下部署 URL
3. 在前端代碼中設置 API 端點
4. 測試所有功能
5. 部署前端到 GitHub Pages

祝你使用愉快！
