<template>
  <view class="page-container">
    <!-- 背景图 -->
    <image class="bg-image" src="/static/userbg.png" mode="aspectFill"></image>
    
    <!-- 自定义导航栏 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-left" @click="goBack">
        <text class="i-carbon-arrow-left text-36rpx text-white"></text>
      </view>
      <view class="nav-title">获赞列表</view>
    </view>
    
    <!-- 滚动区域 -->
    <scroll-view class="scroll-container" scroll-y>
      <view class="likes-container">
        <view class="likes-list">
          <view class="likes-item" v-for="(item, index) in likesList" :key="index">
            <view class="user-info">
              <image class="avatar" :src="item.avatar" mode="aspectFill" />
              <view class="info-content">
                <view class="nickname">{{ item.nickname }}</view>
                <view class="user-level">Lv.{{ item.level }} {{ item.levelName }}</view>
              </view>
            </view>
            <view class="post-info" @click="goToPost(item.postId)">
              <view class="post-content">{{ item.postContent }}</view>
              <view class="post-time">{{ item.time }}</view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const statusBarHeight = ref(0)
const likesList = ref([
  {
    id: 1,
    nickname: '用户A',
    avatar: '/static/logo.jpg',
    level: 4,
    levelName: '普通会员',
    time: '2024-03-20 14:30',
    postId: '123',
    postContent: '今天天气真好，出去走走~ #生活 #日常'
  },
  {
    id: 2,
    nickname: '用户B',
    avatar: '/static/logo.jpg',
    level: 6,
    levelName: '高级会员',
    time: '2024-03-20 13:15',
    postId: '124',
    postContent: '分享一个超好吃的餐厅，强烈推荐！ #美食 #探店'
  },
  {
    id: 3,
    nickname: '用户C',
    avatar: '/static/logo.jpg',
    level: 3,
    levelName: '普通会员',
    time: '2024-03-20 12:45',
    postId: '125',
    postContent: '新买的相机到了，拍几张试试效果 #摄影 #器材'
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

.likes-container {
  padding: 0;
  padding-top: 288rpx;
  padding-bottom: 100rpx; /* 留出底部空间 */
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

.likes-list {
  background: #fff;
  border-radius: 20rpx;
  margin: 24rpx;
  overflow: hidden;

  .likes-item {
    padding: 24rpx;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .user-info {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;

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

    .post-info {
      background: #f8f8f8;
      border-radius: 12rpx;
      padding: 16rpx;
      margin-left: 100rpx;

      .post-content {
        font-size: 26rpx;
        color: #333;
        margin-bottom: 8rpx;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }

      .post-time {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}
</style> 