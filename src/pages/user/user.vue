<template>
  <view class="page-container">
    <!-- 背景图 -->
    <image class="bg-image" src="/static/userbg.png" mode="aspectFill"></image>

    <!-- 自定义导航栏 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-title"></view>
    </view>

    <!-- 滚动区域 -->
    <scroll-view class="scroll-container" scroll-y>
      <view class="profile-container">
        <!-- 用户信息卡片 -->
        <view class="user-card">
          <view class="user-info">
            <image class="avatar" :src="userInfo?.avatar || '/static/logo.jpg'" mode="aspectFill"
              @error="handleAvatarError" />
            <view class="info-content">
              <view class="nickname">{{ userInfo?.nickname || '未登录' }}</view>
              <view class="user-level">
                {{ userInfo?.levelName ? 'Lv. ' + userInfo.levelName : 'Lv.0 游客' }}
              </view>
            </view>
            <view class="message-btn" @click="goToMessages">
              <text class="i-carbon-notification text-40rpx" />
              <view class="badge" v-if="hasNewMessage"></view>
            </view>
          </view>
          <view class="user-stats">
            <view class="stat-item" @click="goToFollow">
              <text class="num">{{ userInfo?.following_count || 0 }}</text>
              <text class="label">关注</text>
            </view>
            <view class="stat-item" @click="goToFans">
              <text class="num">{{ userInfo?.followers_count || 0 }}</text>
              <text class="label">粉丝</text>
            </view>
            <view class="stat-item" @click="goToLikes">
              <text class="num">{{ getLikesCount() }}</text>
              <text class="label">获赞</text>
            </view>
          </view>
        </view>

        <!-- 功能菜单 -->
        <view class="menu-list">
          <view class="menu-group">
            <view class="menu-item" @click="goToPosts">
              <text class="i-carbon-document text-32rpx mr-2"></text>
              <text class="label">我的帖子</text>
              <text class="i-carbon-chevron-right text-24rpx ml-auto" />
            </view>
            <view class="menu-item" @click="goToMyLikes">
              <text class="i-carbon-thumbs-up text-32rpx mr-2" />
              <text>我的点赞</text>
              <text class="i-carbon-chevron-right text-24rpx ml-auto" />
            </view>
            <view class="menu-item" @click="goToMyComments">
              <text class="i-carbon-chat text-32rpx mr-2" />
              <text>我的评论</text>
              <text class="i-carbon-chevron-right text-24rpx ml-auto" />
            </view>
          </view>

          <view class="menu-group">
            <view class="menu-item" @click="goToSettings">
              <text class="i-carbon-settings text-32rpx mr-2" />
              <text>设置</text>
              <text class="i-carbon-chevron-right text-24rpx ml-auto" />
            </view>
            <view class="menu-item" @click="goToFeedback">
              <text class="i-carbon-help text-32rpx mr-2" />
              <text>意见反馈</text>
              <text class="i-carbon-chevron-right text-24rpx ml-auto" />
            </view>
            <view class="menu-item" @click="goToAbout">
              <text class="i-carbon-information text-32rpx mr-2" />
              <text>关于我们</text>
              <text class="i-carbon-chevron-right text-24rpx ml-auto" />
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRequest } from '@/api'
import eventBus, { EVENTS } from '@/utils/eventBus'

const statusBarHeight = ref(0)
const hasNewMessage = ref(true)
const userInfo = ref(null)
const currentLikesCount = ref(0)
const { API_USER_GET_INFO, API_USER_LIKES_LIST } = useRequest() // 获取用户信息API

// 获取用户信息
const getUserInfo = async () => {
  try {
    const res = await API_USER_GET_INFO()
    // 根据后端返回格式处理数据
    if (res.status === 0) {
      userInfo.value = res.data || {}

      // 如果用户信息中没有获赞数，尝试从其他接口获取
      if (!userInfo.value.likes_count && !userInfo.value.likeCount) {
        try {
          const likesCount = await forceSyncLikesCount()
          if (likesCount > 0) {
            userInfo.value.likes_count = likesCount
          }
        } catch (syncError) {
          // 静默处理错误
        }
      }
    } else {
      uni.showToast({
        title: res.message || '获取用户信息失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '获取用户信息失败',
      icon: 'none'
    })
  }
}

// 监听关注数变化
const handleFollowChanged = (data) => {
  if (userInfo.value) {
    // 根据事件类型更新关注数
    if (data.type === 'follow') {
      userInfo.value.following_count = (userInfo.value.following_count || 0) + 1
    } else if (data.type === 'unfollow') {
      userInfo.value.following_count = Math.max(0, (userInfo.value.following_count || 0) - 1)
    }
  }
}

// 监听用户信息更新事件
const handleUserInfoUpdated = () => {
  getUserInfo()
}

// 获取获赞数显示值
const getLikesCount = () => {
  const fromUserInfo =
    userInfo.value?.likes_count || userInfo.value?.likeCount || userInfo.value?.total || 0
  const fromCurrent = currentLikesCount.value || 0
  return Math.max(fromUserInfo, fromCurrent)
}

// 强制同步获赞数
const forceSyncLikesCount = async () => {
  try {
    const response = await API_USER_LIKES_LIST({ pageNum: 1, pageSize: 1 })

    if (response.status === 0 && response.data) {
      const total = response.data.total || 0
      currentLikesCount.value = total

      // 同时更新userInfo
      if (userInfo.value) {
        userInfo.value.likes_count = total
      }

      return total
    }
  } catch (error) {
    return 0
  }
}

// 监听获赞数变化事件
const handleLikesCountChanged = (data) => {
  // 根据事件类型更新获赞数
  if (data.type === 'increment') {
    currentLikesCount.value = (currentLikesCount.value || 0) + (data.count || 1)
  } else if (data.type === 'decrement') {
    currentLikesCount.value = Math.max(0, (currentLikesCount.value || 0) - (data.count || 1))
  } else if (data.type === 'set') {
    currentLikesCount.value = data.count || 0
  }

  // 同时更新userInfo
  if (userInfo.value) {
    userInfo.value.likes_count = currentLikesCount.value
  }
}

onMounted(async () => {
  // 获取状态栏高度
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight

  // 获取用户信息
  await getUserInfo()

  // 监听关注数变化事件
  eventBus.on(EVENTS.USER_FOLLOW_CHANGED, handleFollowChanged)

  // 监听用户信息更新事件
  eventBus.on(EVENTS.USER_INFO_UPDATED, handleUserInfoUpdated)

  // 监听获赞数变化事件
  eventBus.on(EVENTS.USER_LIKES_COUNT_CHANGED, handleLikesCountChanged)

  // 强制同步获赞数
  setTimeout(async () => {
    try {
      await forceSyncLikesCount()
    } catch (error) {
      // 静默处理错误
    }
  }, 1000)
})

// 页面显示时刷新用户信息
onShow(async () => {
  await getUserInfo()

  // 同步获赞数
  try {
    await forceSyncLikesCount()
  } catch (error) {
    // 静默处理错误
  }
})

onUnmounted(() => {
  // 清理事件监听
  eventBus.off(EVENTS.USER_FOLLOW_CHANGED, handleFollowChanged)
  eventBus.off(EVENTS.USER_INFO_UPDATED, handleUserInfoUpdated)
  eventBus.off(EVENTS.USER_LIKES_COUNT_CHANGED, handleLikesCountChanged)
})

const goToFollow = () => {
  uni.navigateTo({
    url: '/pages/userPackage/follow'
  })
}

const goToFans = () => {
  uni.navigateTo({
    url: '/pages/userPackage/fans'
  })
}

const goToLikes = async () => {
  await forceSyncLikesCount()

  uni.navigateTo({
    url: '/pages/userPackage/likes'
  })
}

const goToPosts = () => {
  uni.navigateTo({
    url: '/pages/userPackage/posts'
  })
}

const goToMyLikes = () => {
  uni.navigateTo({
    url: '/pages/userPackage/myLikes'
  })
}

const goToMyComments = () => {
  uni.navigateTo({
    url: '/pages/userPackage/myComments'
  })
}

const goToSettings = () => {
  uni.navigateTo({
    url: '/pages/userPackage/settings'
  })
}

const goToFeedback = () => {
  uni.navigateTo({
    url: '/pages/userPackage/feedback'
  })
}

const goToAbout = () => {
  uni.navigateTo({
    url: '/pages/userPackage/about'
  })
}

const goToMessages = () => {
  uni.navigateTo({
    url: '/pages/userPackage/messages'
  })
}

const handleMenuClick = (type) => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

// 处理头像加载失败
const handleAvatarError = () => {
  if (userInfo.value) {
    userInfo.value.avatar = '/static/errimg.png'
  }
}
</script>

<style lang="scss">
.page-container {
  position: relative;
  min-height: 100vh;
  background: #f5f5f5;
}

.bg-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 400rpx;
  z-index: 0;
}

.scroll-container {
  position: relative;
  z-index: 1;
  height: 100vh;
}

.profile-container {
  padding: 0;
  padding-top: 88rpx;
}

.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  .nav-title {
    color: #fff;
    font-size: 36rpx;
    font-weight: 500;
  }
}

.user-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin: 24rpx;
  margin-top: 160rpx;
  position: relative;
  z-index: 1;
  width: calc(100% - 48rpx);
  box-sizing: border-box;

  .user-info {
    display: flex;
    align-items: center;
    margin-bottom: 32rpx;
    position: relative;

    .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      margin-right: 24rpx;
    }

    .info-content {
      flex: 1;

      .nickname {
        font-size: 36rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 8rpx;
      }

      .user-level {
        font-size: 24rpx;
        color: #999;
      }
    }

    .message-btn {
      width: 80rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      position: relative;

      .badge {
        position: absolute;
        top: 0;
        right: 0;
        width: 16rpx;
        height: 16rpx;
        background: #ff4d4f;
        border-radius: 50%;
        border: 2rpx solid #fff;
      }
    }
  }

  .user-stats {
    display: flex;
    justify-content: space-around;
    border-top: 1rpx solid #f0f0f0;
    padding-top: 32rpx;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;

      .num {
        font-size: 32rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 8rpx;
      }

      .label {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

.menu-list {
  .menu-group {
    background: #fff;
    border-radius: 20rpx;
    margin: 0 24rpx 24rpx;
    overflow: hidden;
    width: calc(100% - 48rpx);
    box-sizing: border-box;

    .menu-item {
      display: flex;
      align-items: center;
      padding: 32rpx 24rpx;
      font-size: 28rpx;
      color: #333;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .ml-auto {
        margin-left: auto;
      }
    }
  }
}
</style>
