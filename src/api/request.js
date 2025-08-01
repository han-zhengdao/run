import { service } from './service'
import config from '@/config'

function createRequest(service) {
  function request(requestConfig) {
    const configDefault = {
      timeout: 15000,
      responseType: 'json'
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
