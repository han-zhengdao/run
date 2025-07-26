/**
 * 文章分类相关API
 */

import { request } from '../request'
import { createApiPath } from '../utils'

export default {
  /**
   * 获取文章分类列表
   * @returns {Promise}
   */
  API_ARTICLE_GET_CATEGORIES() {
    return request({
      url: createApiPath('/my/artcate/getlist'),
      method: 'get'
    })
  },

  /**
   * 发布文章
   * @param {Object} data - 文章数据
   * @param {string} data.content - 文章内容
   * @param {number} data.categoryId - 分类ID
   * @param {Array<string>} data.images - 图片列表
   * @returns {Promise}
   */
  API_ARTICLE_ADD(data) {
    return request({
      url: createApiPath('/my/article/add'),
      method: 'post',
      data
    })
  },

}