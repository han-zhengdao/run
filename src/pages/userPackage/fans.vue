<template>
  <view class="page-container">
    <!-- 背景图 -->
    <image class="bg-image" src="/static/userbg.png" mode="aspectFill"></image>

    <!-- 页面标题 -->
    <view class="page-header">
      <view class="header-left" @click="goBack">
        <text class="i-carbon-arrow-left text-36rpx text-white"></text>
      </view>
      <text class="page-title">我的粉丝</text>
    </view>

    <!-- 滚动区域 -->
    <scroll-view class="scroll-container" scroll-y @scrolltolower="loadMore" refresher-enabled
      @refresherrefresh="onRefresh" :refresher-triggered="refreshing">
      <view class="fans-container">
        <view class="fans-list" v-if="fansList.length > 0">
          <view class="fans-item" v-for="(item, index) in fansList" :key="index">
            <view class="user-info">
              <image class="avatar" :src="item.avatar" mode="aspectFill" />
              <view class="info-content">
                <view class="nickname">{{ item.nickname }}</view>
                <view class="user-stats">
                  <text class="stat-item">{{ item.followingCount }} 关注</text>
                  <text class="stat-divider">·</text>
                  <text class="stat-item">Lv.{{ item.level }}</text>
                </view>
              </view>
            </view>
            <view class="follow-btn" :class="{ followed: item.isFollowed }" @click="handleFollow(item)">
              {{ item.isFollowed ? '已关注' : '关注' }}
            </view>
          </view>
        </view>
        <view class="empty-placeholder" v-else-if="!loading">
          <view class="empty-content">
            <view class="empty-icon">
              <text class="icon-text">💖</text>
            </view>
            <text class="empty-text">还没有粉丝</text>
            <text class="empty-desc">去首页发现更多有趣的人吧~</text>
            <view class="empty-action">
              <view class="action-btn" @click="goToHome">
                <text class="btn-icon">🏠</text>
                <text>去首页</text>
              </view>
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
import { toggleFollow } from '@/utils/followUtils'
import eventBus, { EVENTS } from '@/utils/eventBus'

const fansList = ref([]) // 空数组显示缺省页
const loading = ref(false)
const refreshing = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const hasMore = ref(true)
const { API_USER_FOLLOWERS_LIST, API_USER_FOLLOW } = useRequest()

// 获取粉丝列表
const getFollowersList = async (isLoadMore = false) => {
  try {
    if (!isLoadMore) {
      loading.value = true
      currentPage.value = 1
      fansList.value = []
    }

    const response = await API_USER_FOLLOWERS_LIST({
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })

    if (response.status === 0 && response.data && response.data.list) {
      const newList = response.data.list.map((user) => ({
        id: user.id,
        nickname: user.nickname || '未知用户',
        avatar: user.avatar || '/static/logo.jpg',
        level: user.level || 1,
        levelName: user.level >= 6 ? '高级会员' : '普通会员',
        followersCount: user.followers_count || 0,
        followingCount: user.following_count || 0,
        isFollowed: user.is_following || false, // 当前用户是否关注了这个粉丝
        followTime: user.follow_time
      }))

      if (isLoadMore) {
        fansList.value = [...fansList.value, ...newList]
      } else {
        fansList.value = newList
      }

      hasMore.value = newList.length === pageSize.value
      if (hasMore.value) {
        currentPage.value++
      }
    }
  } catch (error) {
    console.error('获取粉丝列表失败:', error)
    uni.showToast({
      title: '获取粉丝列表失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    if (refreshing.value) {
      refreshing.value = false
    }
  }
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  getFollowersList(false)
}

// 加载更多
const loadMore = () => {
  if (hasMore.value && !loading.value) {
    getFollowersList(true)
  }
}

// 处理关注/取消关注
const handleFollow = async (item) => {
  try {
    const result = await toggleFollow(item.id, item.isFollowed)
    if (result && result.success) {
      item.isFollowed = result.isFollowing
      // 发送事件通知其他页面更新关注状态
      eventBus.emit(EVENTS.FOLLOW_STATUS_CHANGED, {
        userId: item.id,
        isFollowed: item.isFollowed
      })
    }
  } catch (error) {
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  }
}

const goBack = () => {
  uni.navigateBack()
}

const goToHome = () => {
  uni.switchTab({
    url: '/pages/index/index'
  })
}

onMounted(() => {
  getFollowersList()
})

onUnmounted(() => {
  eventBus.off(EVENTS.FOLLOW_STATUS_CHANGED)
})
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
  height: 300rpx;
  z-index: 0;
}

.page-header {
  position: relative;
  z-index: 1;
  padding: 120rpx 24rpx 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  .header-left {
    position: absolute;
    left: 24rpx;
    padding: 20rpx;
  }

  .page-title {
    color: #fff;
    font-size: 36rpx;
    font-weight: 500;
  }
}

.scroll-container {
  position: relative;
  z-index: 1;
  height: calc(100vh - 200rpx);
}

.fans-container {
  padding: 0 24rpx 100rpx;
}

.fans-list {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;

  .fans-item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .user-info {
      flex: 1;
      display: flex;
      align-items: center;

      .avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        margin-right: 20rpx;
        flex-shrink: 0;
      }

      .info-content {
        flex: 1;

        .nickname {
          font-size: 28rpx;
          color: #333;
          margin-bottom: 8rpx;
          font-weight: 500;
        }

        .user-stats {
          font-size: 24rpx;
          color: #999;

          .stat-item {
            margin-right: 8rpx;
          }

          .stat-divider {
            margin: 0 8rpx;
          }
        }
      }
    }

    .follow-btn {
      padding: 12rpx 24rpx;
      border-radius: 50rpx;
      font-size: 24rpx;
      background: #1da1f2;
      color: #fff;
      border: none;

      &.followed {
        background: #f0f0f0;
        color: #666;
      }
    }
  }
}

.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 40rpx;
  text-align: center;
  min-height: 60vh;

  .empty-content {
    .empty-icon {
      margin-bottom: 40rpx;

      .icon-text {
        font-size: 120rpx;
        opacity: 0.8;
      }
    }

    .empty-text {
      font-size: 32rpx;
      color: #333;
      margin-bottom: 20rpx;
      font-weight: 500;
    }

    .empty-desc {
      font-size: 26rpx;
      color: #999;
      margin-bottom: 60rpx;
      line-height: 1.5;
      max-width: 400rpx;
    }

    .empty-action {
      .action-btn {
        display: inline-flex;
        align-items: center;
        padding: 20rpx 40rpx;
        background: #1da1f2;
        color: #fff;
        border-radius: 50rpx;
        font-size: 28rpx;
        box-shadow: 0 8rpx 20rpx rgba(29, 161, 242, 0.3);

        .btn-icon {
          margin-right: 12rpx;
          font-size: 32rpx;
        }
      }
    }
  }
}
</style>
