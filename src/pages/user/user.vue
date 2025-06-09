<template>
  <view class="profile-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-info">
        <image class="avatar" src="/static/avatar1.jpg" mode="aspectFill" />
        <view class="info-content">
          <view class="nickname">小明</view>
          <view class="user-id">ID: 123456</view>
        </view>
      </view>
      <view class="user-stats">
        <view class="stat-item">
          <text class="num">128</text>
          <text class="label">关注</text>
        </view>
        <view class="stat-item">
          <text class="num">256</text>
          <text class="label">粉丝</text>
        </view>
        <view class="stat-item">
          <text class="num">64</text>
          <text class="label">获赞</text>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-list">
      <view class="menu-group">
        <view class="menu-item" @click="handleMenuClick('myPosts')">
          <text class="i-carbon-document text-32rpx mr-2" />
          <text>我的帖子</text>
          <text class="i-carbon-chevron-right text-24rpx ml-auto" />
        </view>
        <view class="menu-item" @click="handleMenuClick('myLikes')">
          <text class="i-carbon-thumbs-up text-32rpx mr-2" />
          <text>我的点赞</text>
          <text class="i-carbon-chevron-right text-24rpx ml-auto" />
        </view>
        <view class="menu-item" @click="handleMenuClick('myComments')">
          <text class="i-carbon-chat text-32rpx mr-2" />
          <text>我的评论</text>
          <text class="i-carbon-chevron-right text-24rpx ml-auto" />
        </view>
      </view>

      <view class="menu-group">
        <view class="menu-item" @click="handleMenuClick('settings')">
          <text class="i-carbon-settings text-32rpx mr-2" />
          <text>设置</text>
          <text class="i-carbon-chevron-right text-24rpx ml-auto" />
        </view>
        <view class="menu-item" @click="handleMenuClick('feedback')">
          <text class="i-carbon-help text-32rpx mr-2" />
          <text>意见反馈</text>
          <text class="i-carbon-chevron-right text-24rpx ml-auto" />
        </view>
        <view class="menu-item" @click="handleMenuClick('about')">
          <text class="i-carbon-information text-32rpx mr-2" />
          <text>关于我们</text>
          <text class="i-carbon-chevron-right text-24rpx ml-auto" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
  const handleMenuClick = (type) => {
    uni.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  }
</script>

<style lang="scss">
  .profile-container {
    min-height: 100vh;
    background: #f5f5f5;
    padding: 24rpx;
  }

  .user-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 32rpx;
    margin-bottom: 24rpx;

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

        .user-id {
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
      margin-bottom: 24rpx;
      overflow: hidden;

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
