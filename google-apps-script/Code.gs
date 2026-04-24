/**
 * BayCard Google Apps Script 後端
 * 
 * 功能：
 * - 用戶管理（認證、個人資料）
 * - 文章管理（發布、編輯、刪除、查詢）
 * - 留言系統（發布、回覆、刪除）
 * - 互動功能（按讚、收藏）
 * - 瀏覽數統計
 * 
 * 數據存儲：Google Sheet + Google Drive
 */

// ============================================================================
// 配置
// ============================================================================

const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
const SHEET_NAMES = {
  USERS: 'users',
  ARTICLES: 'articles',
  COMMENTS: 'comments',
  LIKES: 'likes',
  FAVORITES: 'favorites',
  PAGE_VIEWS: 'pageViews',
  BOARDS: 'boards',
  ANNOUNCEMENTS: 'announcements',
  LOGS: 'logs'
};

// ============================================================================
// 初始化
// ============================================================================

/**
 * 初始化 Google Sheet 資料庫
 * 運行一次即可
 */
function initializeDatabase() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // 創建所有必需的 Sheet
  createSheetIfNotExists(ss, SHEET_NAMES.USERS, [
    'id', 'openId', 'name', 'email', 'avatar', 'bio', 'role', 'createdAt', 'updatedAt', 'lastSignedIn'
  ]);
  
  createSheetIfNotExists(ss, SHEET_NAMES.BOARDS, [
    'id', 'name', 'slug', 'description', 'icon', 'color', 'moderatorId', 'isPublic', 'order', 'createdAt', 'updatedAt'
  ]);
  
  createSheetIfNotExists(ss, SHEET_NAMES.ARTICLES, [
    'id', 'slug', 'title', 'content', 'excerpt', 'authorId', 'boardId', 'images', 'viewCount', 'likeCount', 'commentCount', 'createdAt', 'updatedAt'
  ]);
  
  createSheetIfNotExists(ss, SHEET_NAMES.COMMENTS, [
    'id', 'content', 'authorId', 'articleId', 'parentCommentId', 'likeCount', 'createdAt', 'updatedAt'
  ]);
  
  createSheetIfNotExists(ss, SHEET_NAMES.LIKES, [
    'id', 'userId', 'articleId', 'commentId', 'createdAt'
  ]);
  
  createSheetIfNotExists(ss, SHEET_NAMES.FAVORITES, [
    'id', 'userId', 'articleId', 'createdAt'
  ]);
  
  createSheetIfNotExists(ss, SHEET_NAMES.PAGE_VIEWS, [
    'id', 'articleId', 'userId', 'userAgent', 'ipAddress', 'viewedAt'
  ]);
  
  createSheetIfNotExists(ss, SHEET_NAMES.ANNOUNCEMENTS, [
    'id', 'title', 'content', 'authorId', 'isPublished', 'createdAt', 'updatedAt'
  ]);
  
  createSheetIfNotExists(ss, SHEET_NAMES.LOGS, [
    'id', 'action', 'userId', 'targetId', 'targetType', 'details', 'createdAt'
  ]);
  
  Logger.log('✅ 資料庫初始化完成');
}

/**
 * 創建 Sheet（如果不存在）
 */
function createSheetIfNotExists(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    Logger.log(`✅ 創建 Sheet: ${sheetName}`);
  }
}

// ============================================================================
// 工具函數
// ============================================================================

/**
 * 獲取 Sheet
 */
function getSheet(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(sheetName);
}

/**
 * 獲取 Sheet 的所有數據（跳過標題行）
 */
function getSheetData(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

/**
 * 添加行到 Sheet
 */
function addRowToSheet(sheetName, rowData) {
  const sheet = getSheet(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const row = headers.map(header => rowData[header] || '');
  sheet.appendRow(row);
  
  logAction('CREATE', null, sheetName, { data: rowData });
}

/**
 * 生成唯一 ID
 */
function generateId() {
  return Utilities.getUuid();
}

/**
 * 獲取當前時間戳
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * 記錄操作日誌
 */
function logAction(action, userId, targetType, details) {
  const logData = {
    id: generateId(),
    action: action,
    userId: userId || '',
    targetType: targetType,
    details: JSON.stringify(details),
    createdAt: getCurrentTimestamp()
  };
  
  addRowToSheet(SHEET_NAMES.LOGS, logData);
}

// ============================================================================
// 測試函數
// ============================================================================

/**
 * 測試 API
 */
function testAPI() {
  Logger.log('🧪 開始測試 API...');
  
  // 測試初始化
  initializeDatabase();
  
  // 測試創建用戶
  const userId = createUser({
    openId: 'test-user-001',
    name: 'Test User',
    email: 'test@example.com'
  });
  Logger.log(`✅ 創建用戶: ${userId}`);
  
  // 測試創建看板
  const boardId = createBoard({
    name: 'Test Board',
    slug: 'test-board',
    description: 'Test board description'
  });
  Logger.log(`✅ 創建看板: ${boardId}`);
  
  // 測試創建文章
  const articleId = createArticle({
    title: 'Test Article',
    content: 'This is a test article',
    authorId: userId,
    boardId: boardId
  });
  Logger.log(`✅ 創建文章: ${articleId}`);
  
  Logger.log('🎉 所有測試完成！');
}
