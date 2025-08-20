/**
 * 获赞相关工具函数
 */
import eventBus, { EVENTS } from './eventBus'

/**
 * 更新用户获赞数
 * @param {string} type - 更新类型：'increment', 'decrement', 'set'
 * @param {number} count - 数量
 */
export const updateUserLikesCount = (type, count = 1) => {
  eventBus.emit(EVENTS.USER_LIKES_COUNT_CHANGED, {
    type,
    count
  })
}

/**
 * 计算获赞总数
 * @param {Array} posts - 帖子列表
 * @returns {number} 总获赞数
 */
export const calculateTotalLikes = (posts = []) => {
  return posts.reduce((total, post) => {
    return total + (post.like_count || post.likeCount || 0)
  }, 0)
}

/**
 * 格式化获赞显示
 * @param {number} count - 获赞数
 * @returns {string} 格式化的获赞数
 */
export const formatLikesCount = (count) => {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}w`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

/**
 * 处理点赞操作后的获赞数更新
 * @param {boolean} isLiked - 是否点赞
 * @param {Object} targetInfo - 目标信息（帖子或评论）
 */
export const handleLikeAction = (isLiked, targetInfo) => {
  try {
    // 如果是当前用户的内容被点赞/取消点赞，更新获赞数
    const currentUserId = uni.getStorageSync('userId') || uni.getStorageSync('user_id')

    if (targetInfo.user_id === currentUserId || targetInfo.userId === currentUserId) {
      if (isLiked) {
        updateUserLikesCount('increment', 1)
      } else {
        updateUserLikesCount('decrement', 1)
      }
    }
  } catch (error) {
    console.error('handleLikeAction 执行失败:', error)
  }
}

/**
 * 获取用户统计信息并更新获赞数
 */
export const syncUserLikesCount = async () => {
  try {
    const { useRequest } = await import('@/api')
    const { API_USER_LIKES_LIST, API_USER_GET_STATS } = useRequest()

    // 首先尝试通过获赞列表获取总数
    try {
      const likesResponse = await API_USER_LIKES_LIST({ pageNum: 1, pageSize: 1 })
      if (likesResponse.status === 0 && likesResponse.data) {
        const likesCount = likesResponse.data.total || 0
        // 直接使用事件总线更新
        const eventBus = (await import('@/utils/eventBus')).default
        const { EVENTS } = await import('@/utils/eventBus')

        eventBus.emit(EVENTS.USER_LIKES_COUNT_CHANGED, {
          type: 'set',
          count: likesCount
        })
        return likesCount
      }
    } catch (likesError) {
      // 静默处理错误，尝试其他方式
    }

    // 如果获赞列表接口失败，尝试统计接口
    const response = await API_USER_GET_STATS()
    if (response.status === 0) {
      const likesCount =
        response.data.likes_count || response.data.totalLikes || response.data.total || 0
      // 直接使用事件总线更新
      const eventBus = (await import('@/utils/eventBus')).default
      const { EVENTS } = await import('@/utils/eventBus')

      eventBus.emit(EVENTS.USER_LIKES_COUNT_CHANGED, {
        type: 'set',
        count: likesCount
      })
      return likesCount
    }
  } catch (error) {
    console.error('同步获赞数失败:', error)
  }
  return 0
}
