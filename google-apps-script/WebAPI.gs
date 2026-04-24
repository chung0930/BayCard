/**
 * Google Apps Script Web API 端點
 * 供前端通過 fetch 調用
 */

/**
 * 處理 POST 請求
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const params = data.params || {};
    
    let result;
    
    switch (action) {
      // 用戶相關
      case 'createUser':
        result = createUser(params);
        break;
      case 'getUserByOpenId':
        result = getUserByOpenId(params.openId);
        break;
      case 'getUserById':
        result = getUserById(params.userId);
        break;
      case 'updateUserProfile':
        result = updateUserProfile(params.userId, params.updates);
        break;
      case 'getUserArticles':
        result = getUserArticles(params.userId);
        break;
      case 'getAllUsers':
        result = getAllUsers();
        break;
      
      // 看板相關
      case 'createBoard':
        result = createBoard(params);
        break;
      case 'getBoardBySlug':
        result = getBoardBySlug(params.slug);
        break;
      case 'getBoardById':
        result = getBoardById(params.boardId);
        break;
      case 'getAllBoards':
        result = getAllBoards();
        break;
      case 'getPublicBoards':
        result = getPublicBoards();
        break;
      case 'updateBoard':
        result = updateBoard(params.boardId, params.updates);
        break;
      case 'getBoardStats':
        result = getBoardStats(params.boardId);
        break;
      
      // 文章相關
      case 'createArticle':
        result = createArticle(params);
        break;
      case 'getArticleBySlug':
        result = getArticleBySlug(params.slug);
        break;
      case 'getArticleById':
        result = getArticleById(params.articleId);
        break;
      case 'getAllArticles':
        result = getAllArticles(params.limit, params.offset);
        break;
      case 'getBoardArticles':
        result = getBoardArticles(params.boardId, params.limit, params.offset);
        break;
      case 'getHotArticles':
        result = getHotArticles(params.limit);
        break;
      case 'updateArticle':
        result = updateArticle(params.articleId, params.updates);
        break;
      case 'deleteArticle':
        result = deleteArticle(params.articleId);
        break;
      case 'incrementViewCount':
        result = incrementViewCount(params.articleId, params.userAgent, params.ipAddress);
        break;
      case 'searchArticles':
        result = searchArticles(params.query);
        break;
      
      // 留言相關
      case 'createComment':
        result = createComment(params);
        break;
      case 'getCommentById':
        result = getCommentById(params.commentId);
        break;
      case 'getArticleComments':
        result = getArticleComments(params.articleId);
        break;
      case 'updateComment':
        result = updateComment(params.commentId, params.updates);
        break;
      case 'deleteComment':
        result = deleteComment(params.commentId);
        break;
      case 'getCommentReplies':
        result = getCommentReplies(params.commentId);
        break;
      
      // 互動相關
      case 'toggleArticleLike':
        result = toggleArticleLike(params.userId, params.articleId);
        break;
      case 'toggleCommentLike':
        result = toggleCommentLike(params.userId, params.commentId);
        break;
      case 'hasUserLikedArticle':
        result = hasUserLikedArticle(params.userId, params.articleId);
        break;
      case 'hasUserLikedComment':
        result = hasUserLikedComment(params.userId, params.commentId);
        break;
      case 'toggleFavorite':
        result = toggleFavorite(params.userId, params.articleId);
        break;
      case 'hasUserFavoritedArticle':
        result = hasUserFavoritedArticle(params.userId, params.articleId);
        break;
      
      default:
        result = { error: 'Unknown action: ' + action };
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: result
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 處理 GET 請求
 */
function doGet(e) {
  const action = e.parameter.action;
  const params = e.parameter;
  
  let result;
  
  switch (action) {
    case 'getAllBoards':
      result = getAllBoards();
      break;
    case 'getPublicBoards':
      result = getPublicBoards();
      break;
    case 'getBoardBySlug':
      result = getBoardBySlug(params.slug);
      break;
    case 'getArticleBySlug':
      result = getArticleBySlug(params.slug);
      break;
    case 'getAllArticles':
      result = getAllArticles(parseInt(params.limit) || 20, parseInt(params.offset) || 0);
      break;
    case 'getHotArticles':
      result = getHotArticles(parseInt(params.limit) || 10);
      break;
    case 'searchArticles':
      result = searchArticles(params.query);
      break;
    case 'getArticleComments':
      result = getArticleComments(params.articleId);
      break;
    default:
      result = { error: 'Unknown action: ' + action };
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    data: result
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 測試 API 端點
 */
function testWebAPI() {
  Logger.log('🧪 測試 Web API...');
  
  // 測試 GET 請求
  const getUrl = ScriptApp.getService().getUrl() + '?action=getAllBoards';
  Logger.log('GET URL: ' + getUrl);
  
  // 測試 POST 請求
  const postUrl = ScriptApp.getService().getUrl();
  const payload = {
    action: 'createUser',
    params: {
      openId: 'test-user-' + Date.now(),
      name: 'Test User',
      email: 'test@example.com'
    }
  };
  
  const options = {
    method: 'post',
    payload: JSON.stringify(payload),
    contentType: 'application/json'
  };
  
  const response = UrlFetchApp.fetch(postUrl, options);
  Logger.log('POST Response: ' + response.getContentText());
}
