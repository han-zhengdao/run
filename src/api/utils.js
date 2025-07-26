import config from '@/config'

// 请求状态错误
export const httpLogError = (error, msg) => {
  error.message = msg
  uni.showToast({
    title: msg,
    icon: 'error',
    duration: 2000
  })
}

// api请求错误
export const requestError = (response) => {
  return new Promise((resolve, reject) => {
    const { data } = response
    const msg = `api请求出错 ${response.config.url}：${data.message}`
    uni.showToast({
      title: msg,
      icon: 'error',
      duration: 2000
    })
    reject(data)
  })
}

// 登录失效
export const throttleToLogin = () => {
  // uni.navigateTo({ url: '/pages/login/login' })
}

// 生成完整的API路径
export const createApiUrl = (module, endpoint) => {
  const modulePrefix = config.modules[module] || `/${module}`
  return `${config.apiPrefix}/${config.apiVersion}${modulePrefix}${endpoint}`
}

// 创建相对路径
export const createApiPath = (path) => {
  return path.startsWith('/') ? path : `/${path}`
}
