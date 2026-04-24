/**
 * Google Apps Script API 客戶端
 * 用於前端與 Google Apps Script 後端通信
 */

// 設置你的 Google Apps Script 部署 URL
const GAS_API_URL = import.meta.env.VITE_GAS_API_URL || 'https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID/usercontent';

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 發送 POST 請求到 Google Apps Script
 */
async function gasPost<T>(action: string, params: Record<string, any>): Promise<T> {
  try {
    const response = await fetch(GAS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, params }),
    });

    const result: APIResponse<T> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error');
    }

    return result.data as T;
  } catch (error) {
    console.error(`[GAS API] Error calling ${action}:`, error);
    throw error;
  }
}

/**
 * 發送 GET 請求到 Google Apps Script
 */
async function gasGet<T>(action: string, params: Record<string, any> = {}): Promise<T> {
  try {
    const queryString = new URLSearchParams({
      action,
      ...params,
    }).toString();

    const response = await fetch(`${GAS_API_URL}?${queryString}`);
    const result: APIResponse<T> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error');
    }

    return result.data as T;
  } catch (error) {
    console.error(`[GAS API] Error calling ${action}:`, error);
    throw error;
  }
}

// ============================================================================
// 用戶 API
// ============================================================================

export interface User {
  id: string;
  openId: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
  lastSignedIn: string;
}

export const userAPI = {
  create: (userData: Partial<User>) =>
    gasPost<string>('createUser', userData),

  getByOpenId: (openId: string) =>
    gasPost<User>('getUserByOpenId', { openId }),

  getById: (userId: string) =>
    gasPost<User>('getUserById', { userId }),

  updateProfile: (userId: string, updates: Partial<User>) =>
    gasPost<boolean>('updateUserProfile', { userId, updates }),

  getArticles: (userId: string) =>
    gasPost<Article[]>('getUserArticles', { userId }),

  getAll: () =>
    gasPost<User[]>('getAllUsers', {}),
};

// ============================================================================
// 看板 API
// ============================================================================

export interface Board {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  moderatorId: string;
  isPublic: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const boardAPI = {
  create: (boardData: Partial<Board>) =>
    gasPost<string>('createBoard', boardData),

  getBySlug: (slug: string) =>
    gasGet<Board>('getBoardBySlug', { slug }),

  getById: (boardId: string) =>
    gasPost<Board>('getBoardById', { boardId }),

  getAll: () =>
    gasGet<Board[]>('getAllBoards'),

  getPublic: () =>
    gasGet<Board[]>('getPublicBoards'),

  update: (boardId: string, updates: Partial<Board>) =>
    gasPost<boolean>('updateBoard', { boardId, updates }),

  getStats: (boardId: string) =>
    gasPost<{
      articleCount: number;
      totalViews: number;
      totalLikes: number;
      totalComments: number;
    }>('getBoardStats', { boardId }),
};

// ============================================================================
// 文章 API
// ============================================================================

export interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  authorId: string;
  boardId: string;
  images: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export const articleAPI = {
  create: (articleData: Partial<Article>) =>
    gasPost<string>('createArticle', articleData),

  getBySlug: (slug: string) =>
    gasGet<Article>('getArticleBySlug', { slug }),

  getById: (articleId: string) =>
    gasPost<Article>('getArticleById', { articleId }),

  getAll: (limit = 20, offset = 0) =>
    gasGet<{
      data: Article[];
      total: number;
      limit: number;
      offset: number;
    }>('getAllArticles', { limit: limit.toString(), offset: offset.toString() }),

  getByBoard: (boardId: string, limit = 20, offset = 0) =>
    gasPost<{
      data: Article[];
      total: number;
      limit: number;
      offset: number;
    }>('getBoardArticles', { boardId, limit, offset }),

  getHot: (limit = 10) =>
    gasGet<Article[]>('getHotArticles', { limit: limit.toString() }),

  update: (articleId: string, updates: Partial<Article>) =>
    gasPost<boolean>('updateArticle', { articleId, updates }),

  delete: (articleId: string) =>
    gasPost<boolean>('deleteArticle', { articleId }),

  incrementViews: (articleId: string, userAgent = '', ipAddress = '') =>
    gasPost<boolean>('incrementViewCount', { articleId, userAgent, ipAddress }),

  search: (query: string) =>
    gasGet<Article[]>('searchArticles', { query }),
};

// ============================================================================
// 留言 API
// ============================================================================

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  articleId: string;
  parentCommentId: string;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export const commentAPI = {
  create: (commentData: Partial<Comment>) =>
    gasPost<string>('createComment', commentData),

  getById: (commentId: string) =>
    gasPost<Comment>('getCommentById', { commentId }),

  getByArticle: (articleId: string) =>
    gasGet<Comment[]>('getArticleComments', { articleId }),

  update: (commentId: string, updates: Partial<Comment>) =>
    gasPost<boolean>('updateComment', { commentId, updates }),

  delete: (commentId: string) =>
    gasPost<boolean>('deleteComment', { commentId }),

  getReplies: (commentId: string) =>
    gasPost<Comment[]>('getCommentReplies', { commentId }),
};

// ============================================================================
// 互動 API
// ============================================================================

export const interactionAPI = {
  toggleArticleLike: (userId: string, articleId: string) =>
    gasPost<{ liked: boolean }>('toggleArticleLike', { userId, articleId }),

  toggleCommentLike: (userId: string, commentId: string) =>
    gasPost<{ liked: boolean }>('toggleCommentLike', { userId, commentId }),

  hasLikedArticle: (userId: string, articleId: string) =>
    gasPost<boolean>('hasUserLikedArticle', { userId, articleId }),

  hasLikedComment: (userId: string, commentId: string) =>
    gasPost<boolean>('hasUserLikedComment', { userId, commentId }),

  toggleFavorite: (userId: string, articleId: string) =>
    gasPost<{ favorited: boolean }>('toggleFavorite', { userId, articleId }),

  hasFavoritedArticle: (userId: string, articleId: string) =>
    gasPost<boolean>('hasUserFavoritedArticle', { userId, articleId }),
};

// ============================================================================
// 導出所有 API
// ============================================================================

export const gasAPI = {
  user: userAPI,
  board: boardAPI,
  article: articleAPI,
  comment: commentAPI,
  interaction: interactionAPI,
};

export default gasAPI;
