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
    return request({
      url: '/my/artcate/getlist',
      method: 'get'
    })
  },

  /**
   * 发布文章
   * @param {FormData|Object} data - 文章数据，可以是FormData或普通对象
   * @param {string} data.content - 文章内容
   * @param {number} data.cate_id - 分类ID
   * @param {string} data.picname - 图片URL JSON字符串
   * @returns {Promise}
   */
  API_ARTICLE_ADD(data) {
    const config = {
      url: '/my/article/add',
      method: 'post',
      data
    }

    // 如果是FormData，设置正确的Content-Type
    if (data instanceof FormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data'
      }
    }

    return request(config)
  }
}
