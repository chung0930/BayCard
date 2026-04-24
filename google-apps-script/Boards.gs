/**
 * 看板管理 API
 */

/**
 * 創建看板
 */
function createBoard(boardData) {
  const boardId = generateId();
  const now = getCurrentTimestamp();
  
  const board = {
    id: boardId,
    name: boardData.name,
    slug: boardData.slug || generateSlug(boardData.name),
    description: boardData.description || '',
    icon: boardData.icon || '📌',
    color: boardData.color || '#3b82f6',
    moderatorId: boardData.moderatorId || '',
    isPublic: boardData.isPublic !== false ? 1 : 0,
    order: boardData.order || 0,
    createdAt: now,
    updatedAt: now
  };
  
  addRowToSheet(SHEET_NAMES.BOARDS, board);
  logAction('CREATE', boardData.moderatorId || '', 'BOARD', { boardId });
  
  return boardId;
}

/**
 * 根據 Slug 獲取看板
 */
function getBoardBySlug(slug) {
  const boards = getSheetData(SHEET_NAMES.BOARDS);
  return boards.find(b => b.slug === slug);
}

/**
 * 根據 ID 獲取看板
 */
function getBoardById(boardId) {
  const boards = getSheetData(SHEET_NAMES.BOARDS);
  return boards.find(b => b.id === boardId);
}

/**
 * 獲取所有看板
 */
function getAllBoards() {
  const boards = getSheetData(SHEET_NAMES.BOARDS);
  
  // 按 order 排序
  boards.sort((a, b) => parseInt(a.order) - parseInt(b.order));
  
  return boards;
}

/**
 * 獲取公開看板
 */
function getPublicBoards() {
  const boards = getSheetData(SHEET_NAMES.BOARDS);
  return boards.filter(b => b.isPublic === 1 || b.isPublic === '1');
}

/**
 * 更新看板
 */
function updateBoard(boardId, updates) {
  const sheet = getSheet(SHEET_NAMES.BOARDS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][headers.indexOf('id')] === boardId) {
      headers.forEach((header, index) => {
        if (updates[header] !== undefined) {
          sheet.getRange(i + 1, index + 1).setValue(updates[header]);
        }
      });
      
      // 更新 updatedAt
      const updatedAtIndex = headers.indexOf('updatedAt');
      sheet.getRange(i + 1, updatedAtIndex + 1).setValue(getCurrentTimestamp());
      
      logAction('UPDATE', null, 'BOARD', { boardId, updates });
      return true;
    }
  }
  
  return false;
}

/**
 * 刪除看板
 */
function deleteBoard(boardId) {
  const sheet = getSheet(SHEET_NAMES.BOARDS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][headers.indexOf('id')] === boardId) {
      sheet.deleteRow(i + 1);
      logAction('DELETE', null, 'BOARD', { boardId });
      return true;
    }
  }
  
  return false;
}

/**
 * 獲取看板的文章統計
 */
function getBoardStats(boardId) {
  const articles = getSheetData(SHEET_NAMES.ARTICLES);
  const boardArticles = articles.filter(a => a.boardId === boardId);
  
  const totalViews = boardArticles.reduce((sum, a) => sum + parseInt(a.viewCount), 0);
  const totalLikes = boardArticles.reduce((sum, a) => sum + parseInt(a.likeCount), 0);
  const totalComments = boardArticles.reduce((sum, a) => sum + parseInt(a.commentCount), 0);
  
  return {
    articleCount: boardArticles.length,
    totalViews: totalViews,
    totalLikes: totalLikes,
    totalComments: totalComments
  };
}

/**
 * 設置看板版主
 */
function setBoardModerator(boardId, moderatorId) {
  return updateBoard(boardId, { moderatorId: moderatorId });
}

/**
 * 設置看板為公開
 */
function setBoardPublic(boardId) {
  return updateBoard(boardId, { isPublic: 1 });
}

/**
 * 設置看板為私密
 */
function setBoardPrivate(boardId) {
  return updateBoard(boardId, { isPublic: 0 });
}
