<template>
  <view class="page-container">
    <!-- 背景图 -->
    <image class="bg-image" src="/static/userbg.png" mode="aspectFill"></image>

    <!-- 自定义导航栏 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-left" @click="goBack">
        <text class="i-carbon-arrow-left text-32rpx" />
      </view>
      <view class="nav-title">意见反馈</view>
    </view>

    <!-- 内容区域 -->
    <view class="content-container">
      <view class="feedback-form">
        <view class="form-item">
          <text class="label">标题</text>
          <input class="input" type="text" v-model="title" placeholder="请输入反馈标题" maxlength="50" />
          <text class="word-count">{{ title.length }}/50</text>
        </view>

        <view class="form-item">
          <text class="label">内容</text>
          <textarea class="textarea" v-model="content" placeholder="请详细描述您遇到的问题或建议..." maxlength="500" />
          <text class="word-count">{{ content.length }}/500</text>
        </view>

        <button class="submit-btn" @click="handleSubmit">提交反馈</button>
      </view>
    </view>
  </view>
</template>

<script setup>
  import { ref } from 'vue'

  const statusBarHeight = ref(0)
  const title = ref('')
  const content = ref('')

  // 获取状态栏高度
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight

  // 返回上一页
  const goBack = () => {
    uni.navigateBack()
  }

  // 提交反馈
  const handleSubmit = () => {
    if (!title.value.trim()) {
      uni.showToast({
        title: '请输入反馈标题',
        icon: 'none'
      })
      return
    }

    if (!content.value.trim()) {
      uni.showToast({
        title: '请输入反馈内容',
        icon: 'none'
      })
      return
    }

    // TODO: 调用后端API提交反馈
    uni.showLoading({
      title: '提交中...'
    })

    // 模拟API调用
    setTimeout(() => {
      uni.hideLoading()
      uni.showToast({
        title: '提交成功',
        icon: 'success'
      })

      // 清空表单
      title.value = ''
      content.value = ''

      // 返回上一页
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
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

  .feedback-form {
    background: #fff;
    border-radius: 20rpx;
    padding: 32rpx;
    width: 100%;
    box-sizing: border-box;

    .form-item {
      margin-bottom: 32rpx;
      position: relative;

      .label {
        display: block;
        font-size: 28rpx;
        color: #333;
        margin-bottom: 16rpx;
      }

      .input {
        width: 100%;
        height: 80rpx;
        background: #f5f5f5;
        border-radius: 12rpx;
        padding: 0 24rpx;
        font-size: 28rpx;
        color: #333;
        box-sizing: border-box;
      }

      .textarea {
        width: 100%;
        height: 320rpx;
        background: #f5f5f5;
        border-radius: 12rpx;
        padding: 24rpx;
        font-size: 28rpx;
        color: #333;
        box-sizing: border-box;
      }

      .word-count {
        position: absolute;
        right: 24rpx;
        bottom: 24rpx;
        font-size: 24rpx;
        color: #999;
      }
    }

    .submit-btn {
      width: 100%;
      height: 88rpx;
      background: #007AFF;
      border-radius: 44rpx;
      color: #fff;
      font-size: 32rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 48rpx;

      &:active {
        opacity: 0.8;
      }
    }
  }
</style>