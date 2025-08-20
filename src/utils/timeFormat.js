/**
 * 时间格式化工具函数
 */

/**
 * 格式化时间为相对时间
 * @param {string|Date} time - 时间字符串或Date对象
 * @returns {string} 格式化后的时间字符串
 */
export function formatRelativeTime(time) {
  const now = new Date()
  const targetTime = new Date(time)
  const diff = now.getTime() - targetTime.getTime()

  // 如果时间无效，返回原始时间
  if (isNaN(targetTime.getTime())) {
    return time
  }

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 30) {
    return `${days}天前`
  } else if (months < 12) {
    return `${months}个月前`
  } else {
    // 超过一年显示具体日期
    const year = targetTime.getFullYear()
    const month = targetTime.getMonth() + 1
    const day = targetTime.getDate()
    return `${year}年${month}月${day}日`
  }
}

/**
 * 格式化用户等级
 * @param {number} level - 用户等级数字
 * @returns {string} 格式化后的等级字符串
 */
export function formatUserLevel(level) {
  const levelNames = {
    1: '深海窥屏鱼类',
    2: '偶尔冒泡的锦鲤',
    3: '冲鸭冲鸭冲鸭',
    4: '永动机型话事人',
    5: '不稳定的信号源载体',
    6: '神龙见首不见尾的传说'
  }
  return levelNames[level] || '未知等级'
}

/**
 * 获取默认头像
 * @param {string} avatar - 用户头像URL
 * @returns {string} 头像URL或默认头像
 */
export function getAvatarUrl(avatar) {
  if (!avatar || avatar.trim() === '') {
    return '/static/logo.jpg'
  }
  // 如果是相对路径，转换为绝对路径
  if (avatar.startsWith('/') && !avatar.startsWith('/static')) {
    return `${import.meta.env.VITE_APP_API_BASEURL}${avatar}`
  }
  return avatar
}

/**
 * 格式化用户昵称
 * @param {string} nickname - 用户昵称
 * @param {number} userId - 用户ID
 * @returns {string} 格式化后的昵称
 */
export function formatNickname(nickname, userId) {
  if (!nickname || nickname.trim() === '') {
    return `用户${userId || '未知'}`
  }
  return nickname
}

/**
 * 格式化时间显示
 * @param {string|Date} time - 时间字符串或Date对象
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(time) {
  if (!time) return ''

  const now = new Date()
  const targetTime = new Date(time)

  // 如果时间无效，返回原始时间
  if (isNaN(targetTime.getTime())) {
    return time
  }

  const diff = now.getTime() - targetTime.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    // 超过一周显示具体日期
    const year = targetTime.getFullYear()
    const month = String(targetTime.getMonth() + 1).padStart(2, '0')
    const day = String(targetTime.getDate()).padStart(2, '0')
    const hour = String(targetTime.getHours()).padStart(2, '0')
    const minute = String(targetTime.getMinutes()).padStart(2, '0')

    if (year === now.getFullYear()) {
      return `${month}-${day} ${hour}:${minute}`
    } else {
      return `${year}-${month}-${day} ${hour}:${minute}`
    }
  }
}
