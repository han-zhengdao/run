<script>
import tokenManager from '@/utils/tokenManager'

export default {
  onLaunch: function () {
    // 首次启动时检查登录状态
    this.checkAuthStatus()
  },
  onShow: function () { },
  onHide: function () { },
  methods: {
    // 检查用户登录状态
    checkAuthStatus() {
      // 如果没有有效的登录信息，进行清理
      if (!tokenManager.isTokenValid()) {
        // 清理可能残留的无效数据
        tokenManager.clearTokens()

        // 延迟执行，确保应用已完全启动
        setTimeout(() => {
          // 获取当前页面路径
          const pages = getCurrentPages()
          if (pages.length > 0) {
            const currentPage = pages[pages.length - 1]
            const currentRoute = currentPage ? currentPage.route : ''

            // 如果当前不在登录页面，跳转到登录页
            if (currentRoute !== 'pages/login/login') {
              uni.reLaunch({
                url: '/pages/login/login'
              })
            }
          } else {
            // 如果没有页面实例，直接跳转到登录页
            uni.reLaunch({
              url: '/pages/login/login'
            })
          }
        }, 100)
      }
    }
  }
}
</script>

<style lang="scss">
/*每个页面公共css */
@import 'nutui-uniapp/styles/index.scss';

page,
html,
body {
  height: 100%;
}
</style>
