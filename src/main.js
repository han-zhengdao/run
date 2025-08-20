import { createSSRApp } from 'vue'
import App from './App.vue'
import { setupStore } from './store'
import 'virtual:uno.css'

// --- 登录拦截 ---
// 白名单，不需要登录即可访问的页面
const whiteList = ['/pages/login/login', '/pages/index/index']

// 需要权限验证的页面（从tabBar页面跳转时检查）
const authRequiredPages = [
  '/pages/user/user',
  '/pages/post/post',
  '/pages/detail/detail',
  '/pages/userPackage/userProfile',
  '/pages/userPackage/follow',
  '/pages/userPackage/fans',
  '/pages/userPackage/likes',
  '/pages/userPackage/posts',
  '/pages/userPackage/myLikes',
  '/pages/userPackage/myComments',
  '/pages/userPackage/settings',
  '/pages/userPackage/feedback',
  '/pages/userPackage/about',
  '/pages/userPackage/messages',
  '/pages/userPackage/postDetail'
]

// 拦截页面跳转
const interceptor = {
  invoke(args) {
    const url = args.url.split('?')[0]
    const token = uni.getStorageSync('token')

    // 如果有token，允许访问
    if (token) {
      return true
    }

    // 如果没有token且在白名单中，允许访问
    if (whiteList.includes(url)) {
      return true
    }

    // 如果没有token且需要权限验证，跳转到登录页
    if (authRequiredPages.includes(url)) {
      uni.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 1500
      })
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/login/login' })
      }, 1000)
      return false
    }

    // 其他页面默认允许访问
    return true
  }
}

// 添加到路由方法的拦截器
uni.addInterceptor('navigateTo', interceptor)
uni.addInterceptor('redirectTo', interceptor)
uni.addInterceptor('switchTab', interceptor)

export function createApp() {
  const app = createSSRApp(App)
  setupStore(app)
  return {
    app
  }
}
