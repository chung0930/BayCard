# BayCard API 文檔

BayCard 使用 tRPC 提供類型安全的 API。所有 API 調用都通過 `/api/trpc` 端點進行。

## 認證

所有受保護的 API 都需要用戶登入。認證通過 OAuth 會話 Cookie 進行。

## 文章 API

### 獲取文章列表

```typescript
trpc.articles.list.useQuery({
  boardSlug?: string;  // 可選：按看板篩選
  limit?: number;      // 可選：限制數量
  offset?: number;     // 可選：分頁偏移
})
```

**返回值**:
```typescript
{
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  boardSlug: string;
  authorId: number;
  author?: User;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  isFavorited?: boolean;
  createdAt: Date;
  updatedAt: Date;
}[]
```

### 獲取熱門文章

```typescript
trpc.articles.hot.useQuery({
  limit?: number;  // 可選：限制數量（默認 10）
})
```

### 按 Slug 獲取文章詳情

```typescript
trpc.articles.getBySlug.useQuery({
  slug: string;  // 必需：文章 slug
})
```

**返回值**:
```typescript
{
  id: number;
  title: string;
  content: string;
  slug: string;
  boardSlug: string;
  author?: User;
  comments?: Comment[];
  isLiked?: boolean;
  isFavorited?: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 發布文章

```typescript
trpc.articles.create.useMutation({
  title: string;           // 必需：文章標題
  content: string;         // 必需：文章內容
  boardId: number;         // 必需：看板 ID
  excerpt?: string;        // 可選：文章摘要
  images?: string[];       // 可選：圖片 URL 列表
})
```

**返回值**:
```typescript
{
  id: number;
  slug: string;  // 自動生成的 URL slug
  title: string;
  createdAt: Date;
}
```

### 獲取用戶文章

```typescript
trpc.articles.getUserArticles.useQuery({
  userId: number;  // 必需：用戶 ID
})
```

## 看板 API

### 獲取看板列表

```typescript
trpc.boards.list.useQuery()
```

**返回值**:
```typescript
{
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  articleCount: number;
  createdAt: Date;
}[]
```

## 留言 API

### 發布留言

```typescript
trpc.comments.create.useMutation({
  articleId: number;           // 必需：文章 ID
  content: string;             // 必需：留言內容
  parentCommentId?: number;    // 可選：父留言 ID（用於回覆）
})
```

**返回值**:
```typescript
{
  id: number;
}
```

### 獲取文章留言

```typescript
trpc.comments.getByArticleId.useQuery({
  articleId: number;  // 必需：文章 ID
})
```

**返回值**:
```typescript
{
  id: number;
  content: string;
  authorId: number;
  author?: User;
  articleId: number;
  parentCommentId?: number;
  likeCount: number;
  isLiked?: boolean;
  createdAt: Date;
  updatedAt: Date;
}[]
```

## 用戶 API

### 獲取當前用戶

```typescript
trpc.auth.me.useQuery()
```

**返回值**:
```typescript
{
  id: number;
  openId: string;
  name?: string;
  email?: string;
  role: "user" | "admin";
  createdAt: Date;
  lastSignedIn: Date;
} | null
```

### 更新用戶資料

```typescript
trpc.users.updateProfile.useMutation({
  name?: string;      // 可選：用戶名
  bio?: string;       // 可選：個人簽名
  avatar?: string;    // 可選：頭像 URL
})
```

### 登出

```typescript
trpc.auth.logout.useMutation()
```

## 按讚 API

### 切換文章按讚

```typescript
trpc.likes.toggleArticleLike.useMutation({
  articleId: number;  // 必需：文章 ID
})
```

**返回值**:
```typescript
{
  liked: boolean;  // 按讚後的狀態
}
```

### 切換留言按讚

```typescript
trpc.likes.toggleCommentLike.useMutation({
  commentId: number;  // 必需：留言 ID
})
```

## 收藏 API

### 切換收藏

```typescript
trpc.favorites.toggle.useMutation({
  articleId: number;  // 必需：文章 ID
})
```

**返回值**:
```typescript
{
  favorited: boolean;  // 收藏後的狀態
}
```

## 公告 API

### 獲取公告列表

```typescript
trpc.announcements.list.useQuery()
```

**返回值**:
```typescript
{
  id: number;
  title: string;
  content: string;
  priority: number;
  createdAt: Date;
}[]
```

## 系統日誌 API

### 獲取日誌

```typescript
trpc.systemLogs.list.useQuery({
  actionType?: string;  // 可選：操作類型篩選
  limit?: number;       // 可選：限制數量
  offset?: number;      // 可選：分頁偏移
})
```

**返回值**:
```typescript
{
  id: number;
  actionType: string;
  userId?: number;
  targetType: string;
  targetId: number;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}[]
```

## 廣告 API

### 獲取廣告

```typescript
trpc.advertisements.get.useQuery({
  position: string;  // 必需：廣告位置
})
```

**返回值**:
```typescript
{
  id: number;
  title: string;
  imageUrl: string;
  targetUrl?: string;
  position: string;
  isActive: boolean;
} | null
```

## 設定 API

### 獲取設定

```typescript
trpc.settings.get.useQuery({
  key: string;  // 必需：設定鍵
})
```

**返回值**:
```typescript
{
  key: string;
  value: string;
}
```

## 錯誤處理

所有 API 錯誤都遵循標準的 tRPC 錯誤格式：

```typescript
{
  code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "BAD_REQUEST" | "INTERNAL_SERVER_ERROR",
  message: string;
}
```

### 常見錯誤碼

| 錯誤碼 | 含義 | 解決方案 |
|--------|------|---------|
| UNAUTHORIZED | 未登入 | 調用登入 API |
| FORBIDDEN | 無權限 | 檢查用戶角色 |
| NOT_FOUND | 資源不存在 | 檢查 ID 是否正確 |
| BAD_REQUEST | 請求參數無效 | 檢查參數格式 |
| INTERNAL_SERVER_ERROR | 伺服器錯誤 | 聯繫支持 |

## 使用示例

### React 組件中使用 API

```typescript
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";

export function ArticleList() {
  const { data: articles, isLoading, error } = trpc.articles.list.useQuery({
    limit: 10,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {articles?.map((article) => (
        <div key={article.id}>
          <h2>{article.title}</h2>
          <p>{article.excerpt}</p>
          <p>Likes: {article.likeCount}</p>
        </div>
      ))}
    </div>
  );
}
```

### 發布文章

```typescript
export function CreateArticleForm() {
  const createMutation = trpc.articles.create.useMutation({
    onSuccess: (data) => {
      console.log("Article created:", data.slug);
      // 重定向到文章頁面
      window.location.href = `/article/${data.slug}`;
    },
    onError: (error) => {
      console.error("Failed to create article:", error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      title: "My Article",
      content: "Article content...",
      boardId: 1,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 表單字段 */}
      <button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? "Publishing..." : "Publish"}
      </button>
    </form>
  );
}
```

## 速率限制

目前沒有實施速率限制，但建議：
- 避免頻繁的重複請求
- 使用適當的緩存策略
- 實施客戶端防抖

## 版本控制

API 版本：1.0.0
最後更新：2026年4月24日

---

更多信息請參考 [README.md](./README.md)
