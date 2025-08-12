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
    return request.post('/my/interaction/like', { articleId })
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
  }
}
