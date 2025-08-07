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
  }
}