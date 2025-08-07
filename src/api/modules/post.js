/**
 * 文章/帖子相关API
 */

import request from '../request'

export default {
  /**
   * 获取文章列表
   * @param {Object} params - 请求参数
   * @param {number} params.categoryId - 分类ID，0表示获取全部分类
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @returns {Promise}
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
   * 点赞/取消点赞文章
   * @param {number} postId - 文章ID
   * @param {boolean} isLike - 是否点赞
   * @returns {Promise}
   */
  API_POST_LIKE(postId, isLike) {
    return request.post('/post/like', { postId, isLike })
  },
  
  /**
   * 关注/取消关注用户
   * @param {number} userId - 用户ID
   * @param {boolean} isFollow - 是否关注
   * @returns {Promise}
   */
  API_POST_FOLLOW_USER(userId, isFollow) {
    return request.post('/user/follow', { userId, isFollow })
  }
}