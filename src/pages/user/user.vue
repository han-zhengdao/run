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
            <image class="avatar" src="/static/logo.jpg" mode="aspectFill" />
            <view class="info-content">
              <view class="nickname">小明</view>
              <view class="user-level">Lv.3 普通会员</view>
            </view>
          </view>
          <view class="user-stats">
            <view class="stat-item" @click="goToFollow">
              <text class="num">128</text>
              <text class="label">关注</text>
            </view>
            <view class="stat-item" @click="goToFans">
              <text class="num">256</text>
              <text class="label">粉丝</text>
            </view>
            <view class="stat-item" @click="goToLikes">
              <text class="num">128</text>
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
import { ref, onMounted } from 'vue'

const statusBarHeight = ref(0)

onMounted(() => {
  // 获取状态栏高度
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight
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

const goToLikes = () => {
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

const handleMenuClick = (type) => {
  uni.showToast({
    title: '功能开发中',
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

      .avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        margin-right: 24rpx;
      }

      .info-content {
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
