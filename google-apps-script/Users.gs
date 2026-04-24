/**
 * 用戶管理 API
 */

/**
 * 創建或更新用戶
 */
function createUser(userData) {
  const userId = generateId();
  const now = getCurrentTimestamp();
  
  const user = {
    id: userId,
    openId: userData.openId,
    name: userData.name || '',
    email: userData.email || '',
    avatar: userData.avatar || '',
    bio: userData.bio || '',
    role: userData.role || 'user',
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now
  };
  
  addRowToSheet(SHEET_NAMES.USERS, user);
  logAction('CREATE', userId, 'USER', { user });
  
  return userId;
}

/**
 * 根據 OpenId 獲取用戶
 */
function getUserByOpenId(openId) {
  const users = getSheetData(SHEET_NAMES.USERS);
  return users.find(u => u.openId === openId);
}

/**
 * 根據 ID 獲取用戶
 */
function getUserById(userId) {
  const users = getSheetData(SHEET_NAMES.USERS);
  return users.find(u => u.id === userId);
}

/**
 * 更新用戶資料
 */
function updateUserProfile(userId, updates) {
  const sheet = getSheet(SHEET_NAMES.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[headers.indexOf('id')] === userId) {
      // 更新行
      headers.forEach((header, index) => {
        if (updates[header] !== undefined) {
          sheet.getRange(i + 1, index + 1).setValue(updates[header]);
        }
      });
      
      // 更新 updatedAt
      const updatedAtIndex = headers.indexOf('updatedAt');
      sheet.getRange(i + 1, updatedAtIndex + 1).setValue(getCurrentTimestamp());
      
      logAction('UPDATE', userId, 'USER', { updates });
      return true;
    }
  }
  
  return false;
}

/**
 * 獲取用戶發布的文章
 */
function getUserArticles(userId) {
  const articles = getSheetData(SHEET_NAMES.ARTICLES);
  return articles.filter(a => a.authorId === userId);
}

/**
 * 獲取用戶收藏的文章
 */
function getUserFavorites(userId) {
  const favorites = getSheetData(SHEET_NAMES.FAVORITES);
  const favoriteArticleIds = favorites
    .filter(f => f.userId === userId)
    .map(f => f.articleId);
  
  const articles = getSheetData(SHEET_NAMES.ARTICLES);
  return articles.filter(a => favoriteArticleIds.includes(a.id));
}

/**
 * 獲取所有用戶
 */
function getAllUsers() {
  return getSheetData(SHEET_NAMES.USERS);
}

/**
 * 刪除用戶
 */
function deleteUser(userId) {
  const sheet = getSheet(SHEET_NAMES.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][headers.indexOf('id')] === userId) {
      sheet.deleteRow(i + 1);
      logAction('DELETE', userId, 'USER', {});
      return true;
    }
  }
  
  return false;
}

/**
 * 設置用戶角色為管理員
 */
function promoteToAdmin(userId) {
  return updateUserProfile(userId, { role: 'admin' });
}

/**
 * 設置用戶角色為普通用戶
 */
function demoteToUser(userId) {
  return updateUserProfile(userId, { role: 'user' });
}
