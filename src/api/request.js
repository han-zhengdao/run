import service from './service'
import { handleParams, buildUrl, formatResponse } from './utils'

const request = {
  /**
   * GET请求
   * @param {string} url 请求地址
   * @param {Object} params 请求参数
   * @param {Object} config 额外配置
   * @returns {Promise} 请求Promise
   */
  get: (url, params = {}, config = {}) => {
    const cleanParams = handleParams(params)
    return service.get(buildUrl(url, cleanParams), config).then(formatResponse)
  },

  /**
   * POST请求
   * @param {string} url 请求地址
   * @param {Object} data 请求数据
   * @param {Object} config 额外配置
   * @returns {Promise} 请求Promise
   */
  post: (url, data = {}, config = {}) => {
    return service.post(url, handleParams(data), config).then(formatResponse)
  },

  /**
   * PUT请求
   * @param {string} url 请求地址
   * @param {Object} data 请求数据
   * @param {Object} config 额外配置
   * @returns {Promise} 请求Promise
   */
  put: (url, data = {}, config = {}) => {
    return service.put(url, handleParams(data), config).then(formatResponse)
  },

  /**
   * DELETE请求
   * @param {string} url 请求地址
   * @param {Object} config 额外配置
   * @returns {Promise} 请求Promise
   */
  delete: (url, config = {}) => {
    return service.delete(url, config).then(formatResponse)
  }
}

export default request
