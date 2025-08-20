<template>
  <view class="page-container">
    <!-- 背景图 -->
    <image class="bg-image" src="/static/userbg.png" mode="aspectFill"></image>

    <!-- 自定义导航栏 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-left" @click="goBack">
        <text class="i-carbon-arrow-left text-32rpx" />
      </view>
      <view class="nav-title">关于我们</view>
    </view>

    <!-- 内容区域 -->
    <view class="content-container">
      <view class="about-card">
        <image class="logo" src="/static/logo.jpg" mode="aspectFill" />
        <view class="app-name">润邻生活交流圈</view>
        <view class="version">版本 V1.0</view>
      </view>
    </view>
  </view>
</template>

<script setup>
  import { ref } from 'vue'

  const statusBarHeight = ref(0)

  // 获取状态栏高度
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight

  // 返回上一页
  const goBack = () => {
    uni.navigateBack()
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

  .custom-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2;
    height: 88rpx;
    display: flex;
    align-items: center;
    padding: 0 24rpx;

    .nav-left {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    .nav-title {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      color: #fff;
      font-size: 36rpx;
      font-weight: 500;
    }
  }

  .content-container {
    position: relative;
    z-index: 1;
    padding: 24rpx;
    padding-top: 350rpx;
  }

  .about-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 48rpx 32rpx;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;

    .logo {
      width: 160rpx;
      height: 160rpx;
      border-radius: 40rpx;
      margin-bottom: 32rpx;
    }

    .app-name {
      font-size: 36rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 16rpx;
    }

    .version {
      font-size: 28rpx;
      color: #999;
    }
  }
</style>
