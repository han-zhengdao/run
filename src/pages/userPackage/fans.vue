<template>
  <view class="page-container">
    <!-- 背景图 -->
    <image class="bg-image" src="/static/userbg.png" mode="aspectFill"></image>

    <!-- 自定义导航栏 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-left" @click="goBack">
        <text class="i-carbon-arrow-left text-36rpx text-white"></text>
      </view>
      <view class="nav-title">我的粉丝</view>
    </view>

    <!-- 滚动区域 -->
    <scroll-view class="scroll-container" scroll-y>
      <view class="fans-container">
        <view class="fans-list">
          <view class="fans-item" v-for="(item, index) in fansList" :key="index">
            <view class="user-info">
              <image class="avatar" :src="item.avatar" mode="aspectFill" />
              <view class="info-content">
                <view class="nickname">{{ item.nickname }}</view>
                <view class="user-level">Lv.{{ item.level }} {{ item.levelName }}</view>
              </view>
            </view>
            <view class="follow-btn" :class="{ followed: item.isFollowed }" @click="handleFollow(item)">
              {{ item.isFollowed ? '已关注' : '关注' }}
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRequest } from '@/api'

const statusBarHeight = ref(0)
const fansList = ref([])
const loading = ref(false)
const { API_USER_FOLLOWERS_LIST, API_USER_FOLLOW, API_USER_FOLLOWING_LIST } = useRequest()

// 获取粉丝列表
const getFollowersList = async () => {
  try {
    loading.value = true

    // 同时获取粉丝列表和关注列表
    const [followersRes, followingRes] = await Promise.all([
      API_USER_FOLLOWERS_LIST({ pageSize: 50 }),
      API_USER_FOLLOWING_LIST({ pageSize: 50 })
    ])

    if (followersRes.status === 0 && followersRes.data && followersRes.data.users) {
      // 获取当前用户关注的用户ID集合
      const followingUserIds = new Set()
      if (followingRes.status === 0 && followingRes.data && followingRes.data.users) {
        followingRes.data.users.forEach((user) => {
          followingUserIds.add(user.user_id)
        })
      }

      fansList.value = followersRes.data.users.map((user) => ({
        id: user.user_id,
        nickname: user.nickname,
        avatar: user.avatar || '/static/logo.jpg',
        level: user.level || 1,
        levelName: user.level >= 6 ? '高级会员' : '普通会员',
        isFollowed: followingUserIds.has(user.user_id)
      }))
    }
  } catch (error) {
    console.error('获取粉丝列表失败:', error)
    uni.showToast({
      title: '获取粉丝列表失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight
  getFollowersList()
})

const goBack = () => {
  uni.navigateBack()
}

const handleFollow = async (item) => {
  try {
    const response = await API_USER_FOLLOW(item.id)

    if (response.status === 0) {
      item.isFollowed = response.data.isFollowing
      uni.showToast({
        title: response.message,
        icon: 'none'
      })
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('关注操作失败:', error)
    uni.showToast({
      title: '操作失败：' + error.message,
      icon: 'none'
    })
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

.fans-container {
  padding: 0;
  padding-top: 288rpx;
  padding-bottom: 100rpx;
  /* 留出底部空间 */
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

  .nav-left {
    position: absolute;
    left: 24rpx;
    padding: 20rpx;
  }

  .nav-title {
    color: #fff;
    font-size: 36rpx;
    font-weight: 500;
  }
}

.fans-list {
  background: #fff;
  border-radius: 20rpx;
  margin: 24rpx;
  overflow: hidden;

  .fans-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .user-info {
      display: flex;
      align-items: center;

      .avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        margin-right: 20rpx;
      }

      .info-content {
        .nickname {
          font-size: 28rpx;
          color: #333;
          margin-bottom: 8rpx;
        }

        .user-level {
          font-size: 24rpx;
          color: #999;
        }
      }
    }

    .follow-btn {
      padding: 12rpx 32rpx;
      border-radius: 32rpx;
      font-size: 24rpx;
      color: #fff;
      background: #007aff;

      &.followed {
        background: #f0f0f0;
        color: #999;
      }
    }
  }
}
</style>
