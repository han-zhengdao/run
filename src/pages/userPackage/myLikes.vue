<template>
  <view class="page-container">
    <!-- 背景图 -->
    <image class="bg-image" src="/static/userbg.png" mode="aspectFill"></image>
    
    <!-- 自定义导航栏 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-left" @click="goBack">
        <text class="i-carbon-arrow-left text-36rpx text-white"></text>
      </view>
      <view class="nav-title">我的点赞</view>
    </view>
    
    <!-- 滚动区域 -->
    <scroll-view class="scroll-container" scroll-y @scrolltolower="loadMore">
      <view class="posts-container">
        <view class="posts-list">
          <view class="post-item" v-for="(item, index) in likedPosts" :key="index">
            <view class="post-header">
              <image class="avatar" :src="item.avatar" mode="aspectFill" />
              <view class="user-info">
                <view class="nickname">{{ item.nickname }}</view>
                <view class="post-time">{{ item.time }}</view>
              </view>
            </view>
            <view class="post-content" @click="goToPost(item.id)">
              <text>{{ item.content }}</text>
              <view class="post-images" v-if="item.images && item.images.length">
                <image 
                  v-for="(img, imgIndex) in item.images" 
                  :key="imgIndex"
                  :src="img"
                  mode="aspectFill"
                  @click.stop="previewImage(item.images, imgIndex)"
                />
              </view>
            </view>
            <view class="post-actions">
              <view class="action-item" @click="handleLike(item)">
                <text :class="['i-carbon-favorite text-32rpx mr-2', item.isLiked ? 'liked' : '']" />
                <text>{{ item.likeCount }}</text>
              </view>
              <view class="action-item">
                <text class="i-carbon-view text-32rpx mr-2" />
                <text>{{ item.views }}</text>
              </view>
              <view class="action-item" @click="handleComment(item)">
                <text class="i-carbon-chat text-32rpx mr-2" />
                <text>{{ item.commentCount }}</text>
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

const statusBarHeight = ref(0)
const isLoading = ref(false)
const noMore = ref(false)
const likedPosts = ref([
  {
    id: 1,
    nickname: '张三',
    avatar: '/static/avatar1.jpg',
    time: '2024-03-20 14:30',
    content: '今天天气真好，出去走走~ #生活 #日常',
    images: ['/static/post1.jpg', '/static/post2.jpg'],
    commentCount: 12,
    views: 120,
    likeCount: 28,
    isLiked: true
  },
  {
    id: 2,
    nickname: '李四',
    avatar: '/static/avatar2.jpg',
    time: '2024-03-19 16:45',
    content: '分享一个超好吃的餐厅，强烈推荐！ #美食 #探店',
    images: ['/static/post3.jpg'],
    commentCount: 8,
    views: 80,
    likeCount: 15,
    isLiked: true
  },
  {
    id: 3,
    nickname: '王五',
    avatar: '/static/avatar3.jpg',
    time: '2024-03-18 10:20',
    content: '新买的相机到了，拍几张试试效果 #摄影 #器材',
    images: ['/static/post4.jpg', '/static/post5.jpg', '/static/post6.jpg'],
    commentCount: 20,
    views: 300,
    likeCount: 42,
    isLiked: true
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

const previewImage = (images, current) => {
  uni.previewImage({
    urls: images,
    current: images[current]
  })
}

const handleComment = (item) => {
  uni.navigateTo({
    url: `/pages/post/detail?id=${item.id}&focus=comment`
  })
}

const handleLike = (item) => {
  item.isLiked = !item.isLiked
  item.likeCount += item.isLiked ? 1 : -1
  uni.showToast({
    title: item.isLiked ? '已点赞' : '已取消点赞',
    icon: 'none'
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

.posts-container {
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

.posts-list {
  background: #fff;
  border-radius: 20rpx;
  margin: 24rpx;
  overflow: hidden;

  .post-item {
    padding: 24rpx;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .post-header {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;

      .avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        margin-right: 20rpx;
      }

      .user-info {
        .nickname {
          font-size: 28rpx;
          color: #333;
          margin-bottom: 4rpx;
        }

        .post-time {
          font-size: 24rpx;
          color: #999;
        }
      }
    }

    .post-content {
      font-size: 28rpx;
      color: #333;
      line-height: 1.6;
      margin-bottom: 16rpx;

      .post-images {
        display: flex;
        flex-wrap: wrap;
        gap: 8rpx;
        margin-top: 16rpx;

        image {
          width: 220rpx;
          height: 220rpx;
          border-radius: 8rpx;
        }
      }
    }

    .post-actions {
      display: flex;
      gap: 60rpx;
      align-items: center;
      margin: 30rpx 0 0 0;
      
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

.loading, .no-more {
  text-align: center;
  padding: 24rpx;
  color: #999;
  font-size: 24rpx;
}
</style> 