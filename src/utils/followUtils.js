/**
 * 关注功能相关工具函数
 */
import { useRequest } from '@/api'
import eventBus, { EVENTS } from './eventBus'

/**
 * 检查关注状态
 * @param {number} userId - 用户ID
 * @returns {Promise<boolean>} 关注状态
 */
export const checkFollowStatus = async (userId) => {
  try {
    const { API_USER_FOLLOW_STATUS } = useRequest()
    const response = await API_USER_FOLLOW_STATUS(userId)

    if (response.status === 0) {
      return response.data.isFollowing
    }
    return false
  } catch (error) {
    return false
  }
}

/**
 * 切换关注状态
 * @param {number} userId - 用户ID
 * @param {boolean} currentStatus - 当前关注状态
 * @returns {Promise<Object>} 返回 {success: boolean, isFollowing?: boolean, message?: string}
 */
export const toggleFollow = async (userId, currentStatus) => {
  try {
    const { API_USER_FOLLOW } = useRequest()
    const response = await API_USER_FOLLOW(userId)

    if (response.status === 0) {
      const newStatus = response.data.isFollowing

      // 触发关注状态变化事件
      eventBus.emit(EVENTS.USER_FOLLOW_CHANGED, {
        userId,
        isFollowing: newStatus,
        type: newStatus ? 'follow' : 'unfollow'
      })

      uni.showToast({
        title: response.message,
        icon: 'success'
      })

      return {
        success: true,
        isFollowing: newStatus,
        message: response.message
      }
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    uni.showToast({
      title: error.message || '操作失败',
      icon: 'none'
    })

    return {
      success: false,
      message: error.message || '操作失败'
    }
  }
}

/**
 * 批量检查关注状态
 * @param {Array<number>} userIds - 用户ID数组
 * @returns {Promise<Map<number, boolean>>} 用户ID到关注状态的映射
 */
export const batchCheckFollowStatus = async (userIds) => {
  const statusMap = new Map()

  try {
    const promises = userIds.map(async (userId) => {
      const status = await checkFollowStatus(userId)
      return { userId, status }
    })

    const results = await Promise.all(promises)

    results.forEach(({ userId, status }) => {
      statusMap.set(userId, status)
    })
  } catch (error) {
    // 静默处理错误
  }

  return statusMap
}

/**
 * 处理关注按钮显示文本
 * @param {boolean} isFollowing - 是否已关注
 * @param {boolean} isSelf - 是否是自己
 * @returns {string} 按钮文本
 */
export const getFollowButtonText = (isFollowing, isSelf = false) => {
  if (isSelf) return '编辑资料'
  return isFollowing ? '已关注' : '关注'
}

/**
 * 处理关注按钮样式类名
 * @param {boolean} isFollowing - 是否已关注
 * @param {boolean} isSelf - 是否是自己
 * @returns {string} 样式类名
 */
export const getFollowButtonClass = (isFollowing, isSelf = false) => {
  if (isSelf) return 'edit-profile-btn'
  return isFollowing ? 'followed' : 'follow-btn'
}
