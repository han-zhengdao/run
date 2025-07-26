/**
 * 命名=》API_xxx_methodName
 * 
 * 示例API模块
 */

import { request } from '../request'
import { createApiPath, createApiUrl } from '../utils'

export default {
  /**
   * 使用完整配置的POST请求示例
   * @param {Object} data - 请求数据
   * @returns {Promise}
   */
  API_DEMO_POST(data = {}) {
    return request({
      url: createApiPath('/mock/user'),
      method: 'post',
      data
    })
  },

  /**
   * 使用完整配置的GET请求示例
   * @param {Object} params - 请求参数
   * @returns {Promise}
   */
  API_DEMO_GET(params = {}) {
    return request({
      url: createApiPath('/posts'),
      method: 'get',
      params
    })
  },
  
  /**
   * 使用便捷方法的POST请求示例
   * @param {Object} data - 请求数据
   * @returns {Promise}
   */
  API_DEMO_POST_SIMPLE(data = {}) {
    return request.post(createApiPath('/mock/user'), data)
  },
  
  /**
   * 使用便捷方法的GET请求示例
   * @param {Object} params - 请求参数
   * @returns {Promise}
   */
  API_DEMO_GET_SIMPLE(params = {}) {
    return request.get(createApiPath('/posts'), params)
  },
  
  /**
   * 使用createApiPath的请求示例
   * @param {Object} params - 请求参数
   * @returns {Promise}
   */
  API_DEMO_WITH_PATH(params = {}) {
    const path = createApiPath('custom/endpoint')
    return request.get(path, params)
  },
  
  /**
   * 使用createApiUrl的请求示例
   * @param {Object} params - 请求参数
   * @returns {Promise}
   */
  API_DEMO_WITH_URL(params = {}) {
    const url = createApiUrl('user', '/profile')
    return request.get(url, params)
  }
}
