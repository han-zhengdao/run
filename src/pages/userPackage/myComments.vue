<template>
  <view class="page-container">
    <!-- 背景图 -->
    <image class="bg-image" src="/static/userbg.png" mode="aspectFill"></image>

    <!-- 自定义导航栏 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-left" @click="goBack">
        <text class="i-carbon-arrow-left text-36rpx text-white"></text>
      </view>
      <view class="nav-title">我的评论</view>
    </view>

    <!-- 滚动区域 -->
    <scroll-view class="scroll-container" scroll-y @scrolltolower="loadMore">
      <view class="comments-container">
        <view class="comments-list">
          <view class="comment-item" v-for="(item, index) in commentsList" :key="index">
            <!-- 帖子信息 -->
            <view class="post-info" @click="goToPost(item.postId)">
              <view class="post-content">{{ item.postContent }}</view>
              <text class="i-carbon-chevron-right text-24rpx"></text>
            </view>
            <!-- 评论信息 -->
            <view class="comment-content">
              <view class="comment-header">
                <image class="avatar" :src="item.avatar" mode="aspectFill" />
                <view class="user-info">
                  <view class="nickname">{{ item.nickname }}</view>
                  <view class="comment-time">{{ item.time }}</view>
                </view>
              </view>
              <view class="comment-text">{{ item.content }}</view>
              <view class="comment-actions">
                <view class="action-item" @click="handleLike(item)">
                  <text :class="['i-carbon-favorite text-32rpx mr-2', item.isLiked ? 'liked' : '']" />
                  <text>{{ item.likeCount }}</text>
                </view>
                <view class="action-item" @click="handleReply(item)">
                  <text class="i-carbon-chat text-32rpx mr-2" />
                  <text>回复</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="loading" v-if="isLoading">加载中...</view>
        <view class="no-more" v-if="noMore">没有更多了</view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRequest } from '@/api'

const statusBarHeight = ref(0)
const isLoading = ref(false)
const noMore = ref(false)
const commentsList = ref([
  {
    id: 101,
    postId: 1,
    postContent: '今天天气真好，出去走走~ #生活 #日常',
    avatar: '/static/logo.jpg',
    nickname: '我',
    time: '2024-03-20 14:30',
    content: '天气确实不错，我也准备出去走走',
    likeCount: 5,
    isLiked: false
  },
  {
    id: 102,
    postId: 2,
    postContent: '分享一个超好吃的餐厅，强烈推荐！ #美食 #探店',
    avatar: '/static/logo.jpg',
    nickname: '我',
    time: '2024-03-19 16:45',
    content: '这家店我也去过，确实很好吃！',
    likeCount: 3,
    isLiked: true
  },
  {
    id: 103,
    postId: 3,
    postContent: '新买的相机到了，拍几张试试效果 #摄影 #器材',
    avatar: '/static/logo.jpg',
    nickname: '我',
    time: '2024-03-18 10:20',
    content: '拍得真不错，构图很好！',
    likeCount: 8,
    isLiked: false
  }
])

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight
})

const goBack = () => {
  uni.navigateBack()
}

const goToPost = (postId) => {
  uni.navigateTo({
    url: `/pages/post/detail?id=${postId}`
  })
}

const handleLike = async (item) => {
  try {
    const { API_COMMENT_LIKE } = useRequest()
    const response = await API_COMMENT_LIKE(item.id)

    if (response.status === 0) {
      // 根据接口返回的状态更新UI
      item.isLiked = response.data.isLiked
      item.likeCount += response.data.isLiked ? 1 : -1

      uni.showToast({
        title: response.message,
        icon: 'none'
      })
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('点赞评论失败:', error)
    uni.showToast({
      title: '操作失败：' + error.message,
      icon: 'none'
    })
  }
}

const handleReply = (item) => {
  uni.navigateTo({
    url: `/pages/post/detail?id=${item.postId}&focus=comment`
  })
}

const loadMore = () => {
  if (isLoading.value || noMore.value) return
  isLoading.value = true

  // 模拟加载更多数据
  setTimeout(() => {
    noMore.value = true
    isLoading.value = false
  }, 1000)
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

.comments-container {
  padding: 0;
  padding-top: 288rpx;
  padding-bottom: 100rpx;
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

.comments-list {
  background: #fff;
  border-radius: 20rpx;
  margin: 24rpx;
  overflow: hidden;

  .comment-item {
    padding: 24rpx;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .post-info {
      display: flex;
      align-items: center;
      padding: 16rpx;
      background: #f8f8f8;
      border-radius: 8rpx;
      margin-bottom: 16rpx;
      cursor: pointer;

      .post-content {
        flex: 1;
        font-size: 26rpx;
        color: #666;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: 16rpx;
      }
    }

    .comment-content {
      .comment-header {
        display: flex;
        align-items: center;
        margin-bottom: 16rpx;

        .avatar {
          width: 64rpx;
          height: 64rpx;
          border-radius: 50%;
          margin-right: 16rpx;
        }

        .user-info {
          .nickname {
            font-size: 28rpx;
            color: #333;
            margin-bottom: 4rpx;
          }

          .comment-time {
            font-size: 24rpx;
            color: #999;
          }
        }
      }

      .comment-text {
        font-size: 28rpx;
        color: #333;
        line-height: 1.6;
        margin-bottom: 16rpx;
      }

      .comment-actions {
        display: flex;
        gap: 40rpx;
        align-items: center;

        .action-item {
          display: flex;
          align-items: center;
          font-size: 26rpx;
          color: #888;

          .liked {
            color: #1da1f2;
          }
        }
      }
    }
  }
}

.loading,
.no-more {
  text-align: center;
  padding: 24rpx;
  color: #999;
  font-size: 24rpx;
}
</style>