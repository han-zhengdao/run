/**
 * 全局事件总线
 * 用于组件间通信
 */

class EventBus {
  constructor() {
    this.events = {}
  }

  // 监听事件
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  // 取消监听事件
  off(event, callback) {
    if (!this.events[event]) return

    if (callback) {
      const index = this.events[event].indexOf(callback)
      if (index > -1) {
        this.events[event].splice(index, 1)
      }
    } else {
      // 如果没有指定回调，清空该事件的所有监听
      this.events[event] = []
    }
  }

  // 触发事件
  emit(event, ...args) {
    if (!this.events[event]) return

    this.events[event].forEach((callback) => {
      try {
        callback(...args)
      } catch (error) {
        console.error(`Event ${event} callback error:`, error)
      }
    })
  }

  // 只监听一次
  once(event, callback) {
    const onceCallback = (...args) => {
      callback(...args)
      this.off(event, onceCallback)
    }
    this.on(event, onceCallback)
  }
}

// 创建全局实例
const eventBus = new EventBus()

// 定义事件常量
export const EVENTS = {
  // 用户相关事件
  USER_FOLLOW_CHANGED: 'user:follow:changed',
  USER_INFO_UPDATED: 'user:info:updated',
  USER_LIKES_COUNT_CHANGED: 'user:likes:count:changed',

  // 帖子相关事件
  POST_LIKE_CHANGED: 'post:like:changed',
  POST_COMMENT_ADDED: 'post:comment:added',

  // 关注状态相关事件
  FOLLOW_STATUS_CHANGED: 'follow:status:changed'
}

export default eventBus
