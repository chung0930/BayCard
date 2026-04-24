/**
 * 互動功能 API（按讚、收藏）
 */

/**
 * 切換文章按讚
 */
function toggleArticleLike(userId, articleId) {
  const likes = getSheetData(SHEET_NAMES.LIKES);
  const existingLike = likes.find(l => l.userId === userId && l.articleId === articleId && !l.commentId);
  
  if (existingLike) {
    // 已讚，取消讚
    removeLike(existingLike.id);
    
    // 減少文章讚數
    const article = getArticleById(articleId);
    if (article) {
      const newLikeCount = Math.max(0, parseInt(article.likeCount) - 1);
      updateArticle(articleId, { likeCount: newLikeCount });
    }
    
    return { liked: false };
  } else {
    // 未讚，新增讚
    const likeId = generateId();
    const like = {
      id: likeId,
      userId: userId,
      articleId: articleId,
      commentId: '',
      createdAt: getCurrentTimestamp()
    };
    
    addRowToSheet(SHEET_NAMES.LIKES, like);
    
    // 增加文章讚數
    const article = getArticleById(articleId);
    if (article) {
      const newLikeCount = parseInt(article.likeCount) + 1;
      updateArticle(articleId, { likeCount: newLikeCount });
    }
    
    logAction('CREATE', userId, 'LIKE', { articleId });
    
    return { liked: true };
  }
}

/**
 * 切換留言按讚
 */
function toggleCommentLike(userId, commentId) {
  const likes = getSheetData(SHEET_NAMES.LIKES);
  const existingLike = likes.find(l => l.userId === userId && l.commentId === commentId);
  
  if (existingLike) {
    // 已讚，取消讚
    removeLike(existingLike.id);
    decrementCommentLikes(commentId);
    return { liked: false };
  } else {
    // 未讚，新增讚
    const likeId = generateId();
    const like = {
      id: likeId,
      userId: userId,
      articleId: '',
      commentId: commentId,
      createdAt: getCurrentTimestamp()
    };
    
    addRowToSheet(SHEET_NAMES.LIKES, like);
    incrementCommentLikes(commentId);
    
    logAction('CREATE', userId, 'LIKE', { commentId });
    
    return { liked: true };
  }
}

/**
 * 檢查用戶是否讚過文章
 */
function hasUserLikedArticle(userId, articleId) {
  const likes = getSheetData(SHEET_NAMES.LIKES);
  return likes.some(l => l.userId === userId && l.articleId === articleId && !l.commentId);
}

/**
 * 檢查用戶是否讚過留言
 */
function hasUserLikedComment(userId, commentId) {
  const likes = getSheetData(SHEET_NAMES.LIKES);
  return likes.some(l => l.userId === userId && l.commentId === commentId);
}

/**
 * 移除讚
 */
function removeLike(likeId) {
  const sheet = getSheet(SHEET_NAMES.LIKES);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][headers.indexOf('id')] === likeId) {
      sheet.deleteRow(i + 1);
      logAction('DELETE', null, 'LIKE', { likeId });
      return true;
    }
  }
  
  return false;
}

/**
 * 切換收藏
 */
function toggleFavorite(userId, articleId) {
  const favorites = getSheetData(SHEET_NAMES.FAVORITES);
  const existingFavorite = favorites.find(f => f.userId === userId && f.articleId === articleId);
  
  if (existingFavorite) {
    // 已收藏，取消收藏
    removeFavorite(existingFavorite.id);
    return { favorited: false };
  } else {
    // 未收藏，新增收藏
    const favoriteId = generateId();
    const favorite = {
      id: favoriteId,
      userId: userId,
      articleId: articleId,
      createdAt: getCurrentTimestamp()
    };
    
    addRowToSheet(SHEET_NAMES.FAVORITES, favorite);
    logAction('CREATE', userId, 'FAVORITE', { articleId });
    
    return { favorited: true };
  }
}

/**
 * 檢查用戶是否收藏過文章
 */
function hasUserFavoritedArticle(userId, articleId) {
  const favorites = getSheetData(SHEET_NAMES.FAVORITES);
  return favorites.some(f => f.userId === userId && f.articleId === articleId);
}

/**
 * 移除收藏
 */
function removeFavorite(favoriteId) {
  const sheet = getSheet(SHEET_NAMES.FAVORITES);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][headers.indexOf('id')] === favoriteId) {
      sheet.deleteRow(i + 1);
      logAction('DELETE', null, 'FAVORITE', { favoriteId });
      return true;
    }
  }
  
  return false;
}

/**
 * 獲取用戶的所有讚
 */
function getUserLikes(userId) {
  const likes = getSheetData(SHEET_NAMES.LIKES);
  return likes.filter(l => l.userId === userId);
}

/**
 * 獲取用戶的所有收藏
 */
function getUserFavorites(userId) {
  const favorites = getSheetData(SHEET_NAMES.FAVORITES);
  return favorites.filter(f => f.userId === userId);
}
