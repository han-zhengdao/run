import { createSSRApp } from 'vue'
import App from './App.vue'
import { setupStore } from './store'
import 'virtual:uno.css'

// --- 登录拦截 ---
// 白名单, M可以是 M- H5, a- app, m- a- h5
const whiteList = ['/pages/login/login', '/pages/index/index']
uni.addInterceptor('navigateTo', {
  invoke(args) {
    const url = args.url.split('?')[0]
    const token = uni.getStorageSync('token')
    if (token) {
      return true
    }
    if (whiteList.includes(url)) {
      return true
    }
    uni.navigateTo({ url: '/pages/login/login' })
    return false
  }
})

export function createApp() {
  const app = createSSRApp(App)
  setupStore(app)
  return {
    app
  }
}
