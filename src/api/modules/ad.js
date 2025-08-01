/**
 * 广告相关API
 */

import { request } from '../request'

export default {
  /**
   * 获取广告列表
   * @param {number} categoryId - 分类ID，0表示获取全部分类的广告
   * @returns {Promise}
   */
  API_AD_GET_LIST(categoryId = 0) {
    return request.get('/ad/list', { categoryId })
  },
  
  /**
   * 记录广告点击
   * @param {number} adId - 广告ID
   * @returns {Promise}
   */
  API_AD_RECORD_CLICK(adId) {
    return request.post('/ad/click', { adId })
  }
}