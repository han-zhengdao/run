/**
 * 用户相关API
 */

import request from '../request'

export default {
  /**
   * 用户登录
   * @param {Object} data - 登录信息
   * @param {string} data.code - 微信临时登录凭证
   * @param {string} data.avatar - 用户头像
   * @param {string} data.nickname - 用户昵称
   * @returns {Promise} 登录结果
   */
  API_USER_LOGIN(data) {
    return request.post('/api/users', data)
  },

  /**
   * 获取用户信息
   * @returns {Promise} 用户信息
   */
  API_USER_GET_INFO() {
    return request.get('/my/userinfo')
  },

  /**
   * 获取关注列表
   * @param {Object} params - 查询参数
   * @param {number} params.pageSize - 每页数量
   * @param {number} params.pageNum - 页码
   * @returns {Promise} 关注列表
   */
  API_USER_FOLLOWING_LIST(params) {
    return request.get('/my/interaction/following', params)
  },

  /**
   * 获取粉丝列表
   * @param {Object} params - 查询参数
   * @param {number} params.pageSize - 每页数量
   * @param {number} params.pageNum - 页码
   * @returns {Promise} 粉丝列表
   */
  API_USER_FOLLOWERS_LIST(params) {
    return request.get('/my/interaction/followers', params)
  },

  /**
   * 关注/取消关注用户
   * @param {number} userId - 用户ID
   * @returns {Promise} 关注结果
   */
  API_USER_FOLLOW(userId) {
    return request.post('/my/interaction/follow', { userId })
  },

  /**
   * 获取关注状态
   * @param {number} userId - 用户ID
   * @returns {Promise} 关注状态
   */
  API_USER_FOLLOW_STATUS(userId) {
    return request.get('/my/interaction/follow-status', { userId })
  },

  /**
   * 获取用户获赞情况
   * @param {Object} params - 查询参数
   * @param {number} params.pageSize - 每页数量
   * @param {number} params.pageNum - 页码
   * @returns {Promise} 获赞列表
   */
  API_USER_LIKES_LIST(params) {
    return request.get('/my/interaction/user-likes', params)
  },

  /**
   * 获取用户统计信息
   * @returns {Promise} 用户统计数据
   */
  API_USER_GET_STATS() {
    return request.get('/my/interaction/stats')
  },

  /**
   * 刷新访问令牌
   * @param {string} refreshToken - 刷新令牌
   * @returns {Promise} 新的访问令牌
   */
  API_REFRESH_TOKEN(refreshToken) {
    return request.post('/api/refreshToken', { refreshToken })
  },

  /**
   * 获取我的点赞列表
   * @param {Object} params - 查询参数
   * @param {number} params.pageNum - 页码，从1开始
   * @param {number} params.pageSize - 每页数量，最大50
   * @returns {Promise} 我的点赞列表
   */
  API_MY_LIKES_LIST(params) {
    return request.get('/my/interaction/my-likes', params)
  },

  /**
   * 获取我的评论和回复列表
   * @param {Object} params - 查询参数
   * @param {number} params.pageNum - 页码，从1开始
   * @param {number} params.pageSize - 每页数量，最大50
   * @returns {Promise} 我的评论和回复列表
   */
  API_MY_COMMENTS_LIST(params) {
    return request.get('/my/interaction/my-comments', params)
  },

  /**
   * 提交意见反馈
   * @param {Object} data - 反馈信息
   * @param {number} data.type - 反馈类型：1-功能建议，2-界面优化，3-内容问题，4-性能问题，5-其他
   * @param {string} data.title - 反馈标题，1-100字符
   * @param {string} data.content - 反馈内容，1-2000字符
   * @param {string} data.contact_info - 联系方式，最大100字符（可选）
   * @returns {Promise} 反馈提交结果
   */
  API_FEEDBACK_SUBMIT(data) {
    return request.post('/my/interaction/feedback', data)
  }
}
