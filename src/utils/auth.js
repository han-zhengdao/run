/**
 * 权限验证工具函数
 */

import tokenManager from './tokenManager'

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
export function isLoggedIn() {
  return tokenManager.isTokenValid()
}

/**
 * 获取用户token
 * @returns {string|null} 用户token
 */
export function getToken() {
  return tokenManager.getToken()
}

/**
 * 获取用户信息
 * @returns {Object|null} 用户信息
 */
export function getUserInfo() {
  return uni.getStorageSync('userInfo') || null
}

/**
 * 清除登录信息
 */
export function clearAuth() {
  tokenManager.clearTokens()
}

/**
 * 检查权限并在需要时跳转到登录页
 * @param {string} message - 提示信息，默认为"请先登录"
 * @returns {boolean} 是否有权限
 */
export function checkAuthAndRedirect(message = '请先登录') {
  if (!isLoggedIn()) {
    tokenManager.redirectToLogin(message)
    return false
  }
  return true
}

/**
 * 静默检查权限（不显示提示，直接跳转）
 * @returns {boolean} 是否有权限
 */
export function checkAuthSilent() {
  if (!isLoggedIn()) {
    tokenManager.redirectToLogin('请先登录')
    return false
  }
  return true
}

/**
 * 在页面需要权限时调用的混入函数
 * 可以在页面的onLoad或onShow中调用
 */
export function requireAuth(showToast = true) {
  if (showToast) {
    return checkAuthAndRedirect()
  } else {
    return checkAuthSilent()
  }
}
