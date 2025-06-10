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
            <view class="follow-btn" :class="{ 'followed': item.isFollowed }" @click="handleFollow(item)">
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

const statusBarHeight = ref(0)
const fansList = ref([
  {
    id: 1,
    nickname: '小红',
    avatar: '/static/logo.jpg',
    level: 4,
    levelName: '普通会员',
    isFollowed: false
  },
  {
    id: 2,
    nickname: '小蓝',
    avatar: '/static/logo.jpg',
    level: 6,
    levelName: '高级会员',
    isFollowed: true
  },
  {
    id: 3,
    nickname: '小绿',
    avatar: '/static/logo.jpg',
    level: 3,
    levelName: '普通会员',
    isFollowed: false
  }
])

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight
})

const goBack = () => {
  uni.navigateBack()
}

const handleFollow = (item) => {
  item.isFollowed = !item.isFollowed
  uni.showToast({
    title: item.isFollowed ? '已关注' : '已取消关注',
    icon: 'none'
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

  .fans-container {
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
        background: #007AFF;
        
        &.followed {
          background: #f0f0f0;
          color: #999;
        }
      }
    }
  }
</style> 