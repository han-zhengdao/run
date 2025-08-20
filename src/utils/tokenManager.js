/**
 * Token管理工具类
 * 处理token的获取、存储、刷新等操作
 */

import axios from 'axios'

class TokenManager {
  constructor() {
    // 防止并发刷新token的标志
    this.isRefreshing = false
    // 存储等待token刷新的请求队列
    this.pendingRequests = []
  }

  /**
   * 获取访问令牌
   * @returns {string|null} 访问令牌
   */
  getToken() {
    return uni.getStorageSync('token') || null
  }

  /**
   * 获取刷新令牌
   * @returns {string|null} 刷新令牌
   */
  getRefreshToken() {
    return uni.getStorageSync('refreshToken') || null
  }

  /**
   * 设置token信息
   * @param {string} token - 访问令牌
   * @param {string} refreshToken - 刷新令牌（可选）
   */
  setTokens(token, refreshToken = null) {
    if (token) {
      uni.setStorageSync('token', token)
    }
    if (refreshToken) {
      uni.setStorageSync('refreshToken', refreshToken)
    }
  }

  /**
   * 清除所有token信息
   */
  clearTokens() {
    uni.removeStorageSync('token')
    uni.removeStorageSync('refreshToken')
    uni.removeStorageSync('userInfo')
  }

  /**
   * 刷新访问令牌
   * @returns {Promise<string>} 新的访问令牌
   */
  async refreshToken() {
    const refreshToken = this.getRefreshToken()

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      // 直接使用axios发送请求，避免触发拦截器
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_BASEURL}/refreshToken`,
        { refreshToken },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      )

      const data = response.data

      if (data.status === 0 && data.data?.token) {
        // 更新本地存储的token
        this.setTokens(data.data.token)
        return data.data.token
      } else {
        throw new Error(data.message || 'Token refresh failed')
      }
    } catch (error) {
      // 刷新失败，清除所有token
      this.clearTokens()
      throw error
    }
  }

  /**
   * 处理token刷新请求（防止并发）
   * @returns {Promise<string>} 新的访问令牌
   */
  async handleTokenRefresh() {
    // 如果正在刷新，返回一个Promise，等待刷新完成
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.pendingRequests.push({ resolve, reject })
      })
    }

    this.isRefreshing = true

    try {
      const newToken = await this.refreshToken()

      // 处理等待队列中的所有请求
      this.pendingRequests.forEach(({ resolve }) => {
        resolve(newToken)
      })
      this.pendingRequests = []

      return newToken
    } catch (error) {
      // 刷新失败，拒绝所有等待的请求
      this.pendingRequests.forEach(({ reject }) => {
        reject(error)
      })
      this.pendingRequests = []

      throw error
    } finally {
      this.isRefreshing = false
    }
  }

  /**
   * 检查token是否有效
   * @returns {boolean} token是否有效
   */
  isTokenValid() {
    const token = this.getToken()
    const userInfo = uni.getStorageSync('userInfo')
    return !!(token && userInfo)
  }

  /**
   * 跳转到登录页面
   * @param {string} message - 提示信息
   */
  redirectToLogin(message = '登录已过期，请重新登录') {
    this.clearTokens()

    uni.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })

    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/login/login'
      })
    }, 1500)
  }
}

// 创建单例实例
const tokenManager = new TokenManager()

export default tokenManager
