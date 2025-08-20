/**
 * 文章/帖子相关API
 */

import request from '../request'

export default {
  /**
   * 获取文章列表
   * @param {Object} params - 请求参数
   * @param {number} [params.pageNum=1] - 页码，从1开始
   * @param {number} [params.pageSize=10] - 每页数量，范围1-100
   * @param {number} [params.cate_id] - 分类ID，筛选指定分类的文章
   * @param {number} [params.state] - 文章状态（1=已发布，0=草稿）
   * @returns {Promise} 返回包含文章列表、分页信息的响应
   */
  API_POST_GET_LIST(params = {}) {
    return request.get('/my/article/getlist', params)
  },

  /**
   * 增加帖子浏览量
   * @param {number} articleId - 文章ID
   * @returns {Promise}
   */
  API_POST_INCREASE_VIEW_COUNT(articleId) {
    return request.post(`/my/interaction/increaseviewcount/${articleId}`)
  },

  /**
   * 获取文章详情
   * @param {number} postId - 文章ID
   * @returns {Promise}
   */
  API_POST_GET_DETAIL(postId) {
    return request.get(`/post/detail/${postId}`)
  },

  /**
   * 点赞/取消点赞文章（切换式操作）
   * @param {number} articleId - 文章ID
   * @returns {Promise} 返回 { status: 0, message: string, data: { articleId: number, isLiked: boolean } }
   */
  API_POST_LIKE(articleId) {
    return request.post('/my/interaction/likearticle', { articleId })
  },

  /**
   * 举报内容
   * @param {string} targetType - 举报目标类型（'post', 'comment', 'reply'）
   * @param {number} targetId - 举报目标ID
   * @param {string} reason - 举报原因（'内容违规', '垃圾信息', '其他'）
   * @returns {Promise}
   */
  API_REPORT({ target_type, target_id, reason }) {
    const typeMap = { post: 1, comment: 2, reply: 3 } // 举报目标类型映射
    const reasonMap = { 内容违规: 1, 垃圾信息: 2, 其他: 3 } // 举报原因映射
    return request.post('/my/interaction/report', {
      target_type: typeMap[target_type] || null,
      target_id,
      reason: reasonMap[reason] || null
    })
  },

  /**
   * 关注/取消关注用户
   * @param {number} userId - 用户ID
   * @param {boolean} isFollow - 是否关注
   * @returns {Promise}
   */
  API_POST_FOLLOW_USER(userId, isFollow) {
    return request.post('/user/follow', { userId, isFollow })
  },

  /**
   * 点赞/取消点赞评论（切换式操作）
   * @param {number} commentId - 评论ID
   * @returns {Promise} 返回 { status: 0, message: string, data: { commentId: number, isLiked: boolean } }
   */
  API_COMMENT_LIKE(commentId) {
    return request.post('/my/interaction/like-comment', { commentId })
  },

  /**
   * 发表评论
   * @param {number} articleId - 文章ID，必须为正整数
   * @param {string} content - 评论内容，长度1-500字符
   * @returns {Promise} 返回 { status: 0, message: string, data: { commentId: number, articleId: number, content: string, created_at: string } }
   */
  API_COMMENT_CREATE(articleId, content) {
    return request.post('/my/interaction/comment', { articleId, content })
  },

  /**
   * 回复评论
   * @param {number} commentId - 要回复的评论ID，必须为正整数
   * @param {string} content - 回复内容，长度1-500字符
   * @returns {Promise} 返回 { status: 0, message: string, data: { replyId: number, commentId: number, content: string, created_at: string } }
   */
  API_COMMENT_REPLY(commentId, content) {
    return request.post('/my/interaction/reply', { commentId, content })
  },

  /**
   * 获取评论列表
   * @param {Object} params - 请求参数
   * @param {number} params.articleId - 文章ID，必须为正整数
   * @param {number} [params.pageNum=1] - 页码，默认1
   * @param {number} [params.pageSize=10] - 每页数量，默认10，最大50
   * @returns {Promise} 返回包含评论列表、分页信息的响应
   */
  API_COMMENT_GET_LIST(params) {
    return request.get('/my/interaction/comments', params)
  },

  /**
   * 获取回复列表
   * @param {Object} params - 请求参数
   * @param {number} params.commentId - 评论ID，必须为正整数
   * @param {number} [params.pageNum=1] - 页码，默认1
   * @param {number} [params.pageSize=10] - 每页数量，默认10，最大50
   * @returns {Promise} 返回包含回复列表、分页信息的响应
   */
  API_REPLY_GET_LIST(params) {
    return request.get('/my/interaction/replies', params)
  },

  /**
   * 点赞/取消点赞回复（切换式操作）
   * @param {number} replyId - 回复ID
   * @returns {Promise} 返回 { status: 0, message: string, data: { isLiked: boolean } }
   */
  API_REPLY_LIKE(replyId) {
    return request.post('/my/interaction/like-reply', { replyId })
  },

  /**
   * 关注/取消关注用户（切换式操作）
   * @param {number} userId - 要关注的用户ID
   * @returns {Promise} 返回 { status: 0, message: string, data: { userId: number, isFollowing: boolean } }
   */
  API_USER_FOLLOW(userId) {
    return request.post('/my/interaction/follow', { userId })
  },

  /**
   * 获取关注列表
   * @param {Object} params - 请求参数
   * @param {number} [params.userId] - 用户ID，可选，默认当前用户
   * @param {number} [params.pageNum=1] - 页码，默认1
   * @param {number} [params.pageSize=10] - 每页数量，默认10
   * @returns {Promise} 返回包含关注列表、分页信息的响应
   */
  API_USER_FOLLOWING_LIST(params = {}) {
    return request.get('/my/interaction/following', params)
  },

  /**
   * 获取粉丝列表
   * @param {Object} params - 请求参数
   * @param {number} [params.userId] - 用户ID，可选，默认当前用户
   * @param {number} [params.pageNum=1] - 页码，默认1
   * @param {number} [params.pageSize=10] - 每页数量，默认10
   * @returns {Promise} 返回包含粉丝列表、分页信息的响应
   */
  API_USER_FOLLOWERS_LIST(params = {}) {
    return request.get('/my/interaction/followers', params)
  },

  /**
   * 查询是否关注指定用户
   * @param {number} userId - 要查询的用户ID
   * @returns {Promise} 返回 { status: 0, message: string, data: { isFollowing: boolean } }
   */
  API_USER_FOLLOW_STATUS(userId) {
    return request.get('/my/interaction/follow-status', { userId })
  },

  /**
   * 获取我的文章列表
   * @param {Object} params - 请求参数
   * @param {number} [params.pageNum=1] - 页码，从1开始
   * @param {number} [params.pageSize=10] - 每页数量，最大50
   * @param {string} [params.state] - 文章状态筛选：'已发布' 或 '草稿'
   * @returns {Promise} 返回包含文章列表、分页信息的响应
   */
  API_MY_ARTICLES_GET_LIST(params = {}) {
    return request.get('/my/article/my', params)
  },

  /**
   * 获取文章详情（用于编辑）
   * @param {number} articleId - 文章ID
   * @returns {Promise} 返回文章详情数据
   */
  API_MY_ARTICLE_GET_DETAIL(articleId) {
    return request.get(`/my/article/edit/${articleId}`)
  },

  /**
   * 修改文章
   * @param {number} articleId - 文章ID
   * @param {Object} articleData - 文章数据
   * @param {string} articleData.content - 文章内容（1-10000字符）
   * @param {number} articleData.category_id - 分类ID
   * @param {string} articleData.state - 文章状态：'已发布' 或 '草稿'
   * @returns {Promise} 返回操作结果
   */
  API_MY_ARTICLE_UPDATE(articleId, articleData) {
    return request.put(`/my/article/${articleId}`, articleData)
  },

  /**
   * 删除文章
   * @param {number} articleId - 文章ID
   * @returns {Promise} 返回操作结果
   */
  API_MY_ARTICLE_DELETE(articleId) {
    return request.delete(`/my/article/${articleId}`)
  }
}
