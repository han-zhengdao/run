/**
 * 图片处理工具函数
 */

// 默认图片配置
const DEFAULT_IMAGES = {
  ERROR: '/static/errimg.png', // 使用用户指定的错误图片
  AVATAR: '/static/logo.jpg',
  POST: '/static/errimg.png'
}

// 验证图片URL是否有效
export const isValidImageUrl = (url) => {
  if (!url) return false
  if (typeof url !== 'string') return false

  // 检查是否为有效的URL格式
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return true
  }

  // 检查是否为本地静态资源
  if (url.startsWith('/static/')) {
    return true
  }

  // 检查是否为base64图片
  if (url.startsWith('data:image/')) {
    return true
  }

  return false
}

// 获取安全的图片URL
export const getSafeImageUrl = (url, fallback = DEFAULT_IMAGES.ERROR) => {
  if (!url) return fallback
  return isValidImageUrl(url) ? url : fallback
}

// 处理图片加载错误
export const handleImageError = (imageUrls, index, fallback = DEFAULT_IMAGES.ERROR) => {
  if (imageUrls && Array.isArray(imageUrls) && imageUrls[index] !== undefined) {
    imageUrls[index] = fallback
  }
}

// 处理头像加载错误
export const handleAvatarError = (userInfo, fallback = DEFAULT_IMAGES.AVATAR) => {
  if (userInfo && userInfo.value) {
    userInfo.value.avatar = fallback
  }
}

// 过滤有效的图片URL
export const filterValidImages = (images) => {
  if (!images || !Array.isArray(images)) return []

  return images.filter((img) => {
    return (
      img && img !== DEFAULT_IMAGES.ERROR && img !== DEFAULT_IMAGES.POST && isValidImageUrl(img)
    )
  })
}

// 获取图片预览URL列表
export const getPreviewImages = (images) => {
  const validImages = filterValidImages(images)
  return validImages.length > 0 ? validImages : []
}

// 批量处理图片URL
export const processImageUrls = (urls, fallback = DEFAULT_IMAGES.ERROR) => {
  if (!urls || !Array.isArray(urls)) return []

  return urls.map((url) => getSafeImageUrl(url, fallback))
}

// 检查图片是否加载成功
export const checkImageLoad = (url) => {
  return new Promise((resolve) => {
    if (!isValidImageUrl(url)) {
      resolve(false)
      return
    }

    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}
