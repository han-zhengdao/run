/**
 * 文章分类相关API
 */

import request from '../request'

export default {
  /**
   * 获取文章分类列表
   * @returns {Promise}
   */
  API_ARTICLE_GET_CATEGORIES() {
    return request.get('/my/artcate/getlist')
  },

  /**
   * 上传图片到临时目录
   * @param {Array} filePaths - 图片文件路径数组
   * @returns {Promise}
   */
  API_UPLOAD_TEMP_IMAGES(filePaths) {
    return new Promise((resolve, reject) => {
      // 创建FormData
      const formData = new FormData()

      // 添加多个文件
      filePaths.forEach((filePath, index) => {
        formData.append('pics', {
          uri: filePath,
          type: 'image/jpeg',
          name: `image_${index}.jpg`
        })
      })

      // 使用uni.request发送FormData
      uni.request({
        url: `${import.meta.env.VITE_APP_API_BASEURL}/api/upload/temp`,
        method: 'POST',
        data: formData,
        header: {
          'Content-Type': 'multipart/form-data',
          Authorization: uni.getStorageSync('token') ? `Bearer ${uni.getStorageSync('token')}` : ''
        },
        success: (res) => {
          if (res.data.status === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.message || '上传失败'))
          }
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
  },

  /**
   * 单个图片上传到临时目录（兼容原有接口）
   * @param {string} filePath - 图片文件路径
   * @returns {Promise}
   */
  API_UPLOAD_TEMP_IMAGE(filePath) {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: `${import.meta.env.VITE_APP_API_BASEURL}/api/upload/temp`,
        filePath,
        name: 'pics',
        header: {
          Authorization: uni.getStorageSync('token') ? `Bearer ${uni.getStorageSync('token')}` : ''
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data)
            if (data.status === 0) {
              resolve(data)
            } else {
              reject(new Error(data.message || '上传失败'))
            }
          } catch (error) {
            reject(new Error('响应解析失败'))
          }
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
  },

  /**
   * 发布文章
   * @param {Object} data - 文章数据
   * @param {string} data.content - 文章内容
   * @param {number} data.cate_id - 分类ID
   * @param {Array} data.tempImages - 临时图片路径数组
   * @returns {Promise}
   */
  API_ARTICLE_ADD(data) {
    return request.post('/my/article/add', data)
  },

  /**
   * 获取文章详情
   * @param {number} id - 文章ID
   * @returns {Promise}
   */
  API_ARTICLE_GET_DETAIL(id) {
    return request.get(`/my/article/detail/${id}`)
  }
}
