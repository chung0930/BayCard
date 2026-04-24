/**
 * 文章管理 API
 */

/**
 * 創建文章
 */
function createArticle(articleData) {
  const articleId = generateId();
  const slug = generateSlug(articleData.title);
  const now = getCurrentTimestamp();
  
  const article = {
    id: articleId,
    slug: slug,
    title: articleData.title,
    content: articleData.content,
    excerpt: articleData.excerpt || articleData.content.substring(0, 100),
    authorId: articleData.authorId,
    boardId: articleData.boardId,
    images: articleData.images || '',
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    createdAt: now,
    updatedAt: now
  };
  
  addRowToSheet(SHEET_NAMES.ARTICLES, article);
  logAction('CREATE', articleData.authorId, 'ARTICLE', { articleId });
  
  return articleId;
}

/**
 * 根據 Slug 獲取文章
 */
function getArticleBySlug(slug) {
  const articles = getSheetData(SHEET_NAMES.ARTICLES);
  return articles.find(a => a.slug === slug);
}

/**
 * 根據 ID 獲取文章
 */
function getArticleById(articleId) {
  const articles = getSheetData(SHEET_NAMES.ARTICLES);
  return articles.find(a => a.id === articleId);
}

/**
 * 獲取所有文章（分頁）
 */
function getAllArticles(limit = 20, offset = 0) {
  const articles = getSheetData(SHEET_NAMES.ARTICLES);
  
  // 按創建時間倒序排列
  articles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  return {
    data: articles.slice(offset, offset + limit),
    total: articles.length,
    limit: limit,
    offset: offset
  };
}

/**
 * 獲取看板的文章
 */
function getBoardArticles(boardId, limit = 20, offset = 0) {
  const articles = getSheetData(SHEET_NAMES.ARTICLES);
  const boardArticles = articles.filter(a => a.boardId === boardId);
  
  // 按創建時間倒序排列
  boardArticles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  return {
    data: boardArticles.slice(offset, offset + limit),
    total: boardArticles.length,
    limit: limit,
    offset: offset
  };
}

/**
 * 獲取熱門文章
 */
function getHotArticles(limit = 10) {
  const articles = getSheetData(SHEET_NAMES.ARTICLES);
  
  // 按讚數 + 留言數排序
  articles.sort((a, b) => {
    const scoreA = parseInt(a.likeCount) + parseInt(a.commentCount);
    const scoreB = parseInt(b.likeCount) + parseInt(b.commentCount);
    return scoreB - scoreA;
  });
  
  return articles.slice(0, limit);
}

/**
 * 更新文章
 */
function updateArticle(articleId, updates) {
  const sheet = getSheet(SHEET_NAMES.ARTICLES);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][headers.indexOf('id')] === articleId) {
      headers.forEach((header, index) => {
        if (updates[header] !== undefined) {
          sheet.getRange(i + 1, index + 1).setValue(updates[header]);
        }
      });
      
      // 更新 updatedAt
      const updatedAtIndex = headers.indexOf('updatedAt');
      sheet.getRange(i + 1, updatedAtIndex + 1).setValue(getCurrentTimestamp());
      
      logAction('UPDATE', null, 'ARTICLE', { articleId, updates });
      return true;
    }
  }
  
  return false;
}

/**
 * 刪除文章
 */
function deleteArticle(articleId) {
  const sheet = getSheet(SHEET_NAMES.ARTICLES);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][headers.indexOf('id')] === articleId) {
      sheet.deleteRow(i + 1);
      logAction('DELETE', null, 'ARTICLE', { articleId });
      return true;
    }
  }
  
  return false;
}

/**
 * 增加文章瀏覽數
 */
function incrementViewCount(articleId, userAgent = '', ipAddress = '') {
  const article = getArticleById(articleId);
  if (!article) return false;
  
  const newViewCount = parseInt(article.viewCount) + 1;
  updateArticle(articleId, { viewCount: newViewCount });
  
  // 記錄瀏覽
  const pageView = {
    id: generateId(),
    articleId: articleId,
    userId: '',
    userAgent: userAgent,
    ipAddress: ipAddress,
    viewedAt: getCurrentTimestamp()
  };
  
  addRowToSheet(SHEET_NAMES.PAGE_VIEWS, pageView);
  
  return true;
}

/**
 * 搜尋文章
 */
function searchArticles(query) {
  const articles = getSheetData(SHEET_NAMES.ARTICLES);
  const lowerQuery = query.toLowerCase();
  
  return articles.filter(a => 
    a.title.toLowerCase().includes(lowerQuery) ||
    a.content.toLowerCase().includes(lowerQuery)
  );
}

/**
 * 生成 URL 友好的 Slug
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50) + '-' + Math.random().toString(36).substring(7);
}
