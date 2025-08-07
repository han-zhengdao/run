/**
 * 处理请求参数
 * @param {Object} params 请求参数
 * @returns {Object} 处理后的参数
 */
export const handleParams = (params = {}) => {
  // 移除undefined和null值
  const cleanParams = {}
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null) {
      cleanParams[key] = params[key]
    }
  })
  return cleanParams
}

/**
 * 构建查询字符串
 * @param {Object} params 参数对象
 * @returns {string} 查询字符串
 */
export const buildQueryString = (params = {}) => {
  const cleanParams = handleParams(params)
  return Object.keys(cleanParams)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(cleanParams[key])}`)
    .join('&')
}

/**
 * 构建URL
 * @param {string} baseUrl 基础URL
 * @param {Object} params 查询参数
 * @returns {string} 完整URL
 */
export const buildUrl = (baseUrl, params = {}) => {
  const queryString = buildQueryString(params)
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

/**
 * 格式化响应数据
 * @param {Object} response API响应数据
 * @returns {Object} 格式化后的数据
 */
export const formatResponse = (response) => {
  return {
    success: response?.status === 0,
    data: response?.data,
    message: response?.message,
    status: response?.status
  }
}
