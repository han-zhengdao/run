import axios from 'axios'
import { createUniAppAxiosAdapter } from '@uni-helper/axios-adapter'

// 创建axios实例
const service = axios.create({
  adapter: createUniAppAxiosAdapter(),
  baseURL: import.meta.env.VITE_APP_API_BASEURL,
  timeout: 15000,
  responseType: 'json'
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 设置默认的Content-Type
    config.headers['Content-Type'] = 'application/json'

    // 只为非/api开头的请求添加token
    if (!config.url.startsWith('/api')) {
      const token = uni.getStorageSync('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 直接返回服务器的响应数据，而不是整个response对象
    return response.data
  },
  (error) => {
    const msg = error.response?.data?.message || error.message || '请求失败'
    uni.showToast({
      title: msg,
      icon: 'none',
      duration: 2000
    })
    return Promise.reject(error)
  }
)

export default service
