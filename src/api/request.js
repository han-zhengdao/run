import { service } from './service'
import config from '@/config'

function createRequest(service) {
  function request(requestConfig) {
    // requestConfig 自定义配置
    // axios默认配置
    const configDefault = {
      baseURL: config.baseURL, // 使用全局配置中的baseURL
      timeout: 15000, // 请求超时时间
      responseType: 'json', // 响应类型
      headers: {
        // 请求头配置...
      }
    }
    const mergedConfig = Object.assign(configDefault, requestConfig)
    return service(mergedConfig)
  }
  
  // 扩展方法，简化API调用
  request.get = (url, params, config = {}) => {
    return request({
      method: 'get',
      url,
      params,
      ...config
    })
  }
  
  request.post = (url, data, config = {}) => {
    return request({
      method: 'post',
      url,
      data,
      ...config
    })
  }
  
  request.put = (url, data, config = {}) => {
    return request({
      method: 'put',
      url,
      data,
      ...config
    })
  }
  
  request.delete = (url, params, config = {}) => {
    return request({
      method: 'delete',
      url,
      params,
      ...config
    })
  }
  
  return request
}

export const request = createRequest(service)
