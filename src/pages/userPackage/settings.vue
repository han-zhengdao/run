<template>
  <view class="page-container">
    <!-- 背景图 -->
    <image class="bg-image" src="/static/userbg.png" mode="aspectFill"></image>
    
    <!-- 自定义导航栏 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-left" @click="goBack">
        <text class="i-carbon-arrow-left text-36rpx text-white"></text>
      </view>
      <view class="nav-title">设置</view>
    </view>
    
    <!-- 内容区域 -->
    <view class="settings-container">
      <view class="settings-list">
        <view class="settings-group">
          <view class="settings-item" @click="handleLogout">
            <text class="label">退出登录</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const statusBarHeight = ref(0)

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight
})

const goBack = () => {
  uni.navigateBack()
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清除登录状态
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
        
        // 跳转到我的页面
        uni.reLaunch({
          url: '/pages/user/user'
        })
      }
    }
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

.settings-container {
  position: relative;
  z-index: 1;
  padding-top: 288rpx;
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

.settings-list {
  padding: 24rpx;

  .settings-group {
    background: #fff;
    border-radius: 20rpx;
    overflow: hidden;

    .settings-item {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32rpx 24rpx;
      font-size: 32rpx;
      color: #ff4d4f;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .label {
        font-weight: 500;
      }
    }
  }
}
</style> 