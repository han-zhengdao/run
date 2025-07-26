import axios from 'axios'
import { createUniAppAxiosAdapter } from '@uni-helper/axios-adapter'
import { httpLogError, requestError, throttleToLogin } from './utils'
export function createService() {
  const request = axios.create({
    adapter: createUniAppAxiosAdapter(),
    baseURL: import.meta.env.VITE_APP_API_BASEURL
  })
  request.interceptors.request.use(
    (request) => {
      return request
    },
    (err) => {
      return Promise.reject(err)
    }
  )

  request.interceptors.request.use(
    (config) => {
      // 自动携带 token
      const token = uni.getStorageSync('token')
      if (token) {
        config.headers.Authorization = 'Bearer ' + token
      }
      return config
    },
    (err) => {
      return Promise.reject(err)
    }
  )
  return request
}

export const service = createService()
