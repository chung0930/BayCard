/**
 * 留言管理 API
 */

/**
 * 創建留言
 */
function createComment(commentData) {
  const commentId = generateId();
  const now = getCurrentTimestamp();
  
  const comment = {
    id: commentId,
    content: commentData.content,
    authorId: commentData.authorId,
    articleId: commentData.articleId,
    parentCommentId: commentData.parentCommentId || '',
    likeCount: 0,
    createdAt: now,
    updatedAt: now
  };
  
  addRowToSheet(SHEET_NAMES.COMMENTS, comment);
  
  // 更新文章留言數
  const article = getArticleById(commentData.articleId);
  if (article) {
    const newCommentCount = parseInt(article.commentCount) + 1;
    updateArticle(commentData.articleId, { commentCount: newCommentCount });
  }
  
  logAction('CREATE', commentData.authorId, 'COMMENT', { commentId });
  
  return commentId;
}

/**
 * 根據 ID 獲取留言
 */
function getCommentById(commentId) {
  const comments = getSheetData(SHEET_NAMES.COMMENTS);
  return comments.find(c => c.id === commentId);
}

/**
 * 獲取文章的所有留言
 */
function getArticleComments(articleId) {
  const comments = getSheetData(SHEET_NAMES.COMMENTS);
  const articleComments = comments.filter(c => c.articleId === articleId);
  
  // 按創建時間排序
  articleComments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  // 構建巢狀結構
  return buildCommentTree(articleComments);
}

/**
 * 構建留言樹（支持巢狀回覆）
 */
function buildCommentTree(comments) {
  const commentMap = {};
  const rootComments = [];
  
  // 首先創建所有留言的映射
  comments.forEach(comment => {
    commentMap[comment.id] = {
      ...comment,
      replies: []
    };
  });
  
  // 然後構建樹結構
  comments.forEach(comment => {
    if (comment.parentCommentId) {
      // 這是一個回覆
      if (commentMap[comment.parentCommentId]) {
        commentMap[comment.parentCommentId].replies.push(commentMap[comment.id]);
      }
    } else {
      // 這是一個根留言
      rootComments.push(commentMap[comment.id]);
    }
  });
  
  return rootComments;
}

/**
 * 獲取用戶的所有留言
 */
function getUserComments(userId) {
  const comments = getSheetData(SHEET_NAMES.COMMENTS);
  return comments.filter(c => c.authorId === userId);
}

/**
 * 更新留言
 */
function updateComment(commentId, updates) {
  const sheet = getSheet(SHEET_NAMES.COMMENTS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][headers.indexOf('id')] === commentId) {
      headers.forEach((header, index) => {
        if (updates[header] !== undefined) {
          sheet.getRange(i + 1, index + 1).setValue(updates[header]);
        }
      });
      
      // 更新 updatedAt
      const updatedAtIndex = headers.indexOf('updatedAt');
      sheet.getRange(i + 1, updatedAtIndex + 1).setValue(getCurrentTimestamp());
      
      logAction('UPDATE', null, 'COMMENT', { commentId, updates });
      return true;
    }
  }
  
  return false;
}

/**
 * 刪除留言
 */
function deleteComment(commentId) {
  const comment = getCommentById(commentId);
  if (!comment) return false;
  
  const sheet = getSheet(SHEET_NAMES.COMMENTS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][headers.indexOf('id')] === commentId) {
      sheet.deleteRow(i + 1);
      
      // 更新文章留言數
      const article = getArticleById(comment.articleId);
      if (article) {
        const newCommentCount = Math.max(0, parseInt(article.commentCount) - 1);
        updateArticle(comment.articleId, { commentCount: newCommentCount });
      }
      
      logAction('DELETE', null, 'COMMENT', { commentId });
      return true;
    }
  }
  
  return false;
}

/**
 * 增加留言讚數
 */
function incrementCommentLikes(commentId) {
  const comment = getCommentById(commentId);
  if (!comment) return false;
  
  const newLikeCount = parseInt(comment.likeCount) + 1;
  return updateComment(commentId, { likeCount: newLikeCount });
}

/**
 * 減少留言讚數
 */
function decrementCommentLikes(commentId) {
  const comment = getCommentById(commentId);
  if (!comment) return false;
  
  const newLikeCount = Math.max(0, parseInt(comment.likeCount) - 1);
  return updateComment(commentId, { likeCount: newLikeCount });
}

/**
 * 獲取留言的所有回覆
 */
function getCommentReplies(commentId) {
  const comments = getSheetData(SHEET_NAMES.COMMENTS);
  return comments.filter(c => c.parentCommentId === commentId);
}
