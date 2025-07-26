const baseURL = import.meta.env.VITE_APP_API_BASEURL

const config = {
  baseURL,
  apiVersion: 'v1',
  apiPrefix: '/api',
  modules: {
    auth: '/auth',
    user: '/user',
    article: '/my/artcate',
    // 其他模块...
  }
}

export default config
