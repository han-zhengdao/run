import axios from 'axios'
import { createUniAppAxiosAdapter } from '@uni-helper/axios-adapter'
import tokenManager from '@/utils/tokenManager'

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
        // 如果token已经包含Bearer前缀，直接使用；否则添加Bearer前缀
        config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`
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
  async (error) => {
    const originalRequest = error.config

    // 处理401权限错误
    if (error.response?.status === 401) {
      // 避免刷新token接口本身触发无限循环
      if (originalRequest.url?.includes('/refreshToken')) {
        tokenManager.redirectToLogin('刷新令牌失败，请重新登录')
        return Promise.reject(error)
      }

      // 避免重复刷新（如果已经重试过了）
      if (originalRequest._retry) {
        tokenManager.redirectToLogin('登录已过期，请重新登录')
        return Promise.reject(error)
      }

      try {
        // 标记这个请求已经重试过
        originalRequest._retry = true

        // 尝试刷新token
        const newToken = await tokenManager.handleTokenRefresh()

        // 更新原请求的Authorization头
        if (newToken && !originalRequest.url?.startsWith('/api')) {
          originalRequest.headers.Authorization = newToken.startsWith('Bearer ')
            ? newToken
            : `Bearer ${newToken}`
        }

        // 重试原请求
        return service.request(originalRequest)
      } catch (refreshError) {
        // 刷新token失败，跳转到登录页
        console.error('Token refresh failed:', refreshError)
        tokenManager.redirectToLogin('登录已过期，请重新登录')
        return Promise.reject(error)
      }
    }

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
