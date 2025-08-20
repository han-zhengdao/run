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
        <!-- 反馈类型选择 -->
        <view class="form-item">
          <text class="label">反馈类型 <text class="required">*</text></text>
          <picker class="picker" :value="typeIndex" :range="typeOptions" range-key="name" @change="onTypeChange">
            <view class="picker-content">
              <text class="picker-text" :class="{ placeholder: typeIndex === -1 }">
                {{ typeIndex === -1 ? '请选择反馈类型' : typeOptions[typeIndex].name }}
              </text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="label">反馈标题 <text class="required">*</text></text>
          <input class="input" type="text" v-model="title" placeholder="请输入反馈标题" maxlength="100" />
          <text class="word-count">{{ title.length }}/100</text>
        </view>

        <view class="form-item">
          <text class="label">反馈内容 <text class="required">*</text></text>
          <textarea class="textarea" v-model="content" placeholder="请详细描述您遇到的问题或建议..." maxlength="2000" />
          <text class="word-count">{{ content.length }}/2000</text>
        </view>

        <view class="form-item">
          <text class="label">联系方式</text>
          <input class="input" type="text" v-model="contactInfo" placeholder="请输入您的联系方式" maxlength="100" />
          <text class="word-count">{{ contactInfo.length }}/100</text>
        </view>

        <button class="submit-btn" :disabled="submitting" @click="handleSubmit">
          {{ submitting ? '提交中...' : '提交反馈' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useRequest } from '@/api'

const { API_FEEDBACK_SUBMIT } = useRequest()

const statusBarHeight = ref(0)
const typeIndex = ref(-1)
const title = ref('')
const content = ref('')
const contactInfo = ref('')
const submitting = ref(false)

// 反馈类型选项
const typeOptions = ref([
  { value: 1, name: '功能建议' },
  { value: 2, name: '界面优化' },
  { value: 3, name: '内容问题' },
  { value: 4, name: '性能问题' },
  { value: 5, name: '其他' }
])

// 获取状态栏高度
const systemInfo = uni.getSystemInfoSync()
statusBarHeight.value = systemInfo.statusBarHeight

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 反馈类型选择
const onTypeChange = (e) => {
  typeIndex.value = parseInt(e.detail.value)
}

// 表单验证
const validateForm = () => {
  if (typeIndex.value === -1) {
    uni.showToast({
      title: '请选择反馈类型',
      icon: 'none'
    })
    return false
  }

  if (!title.value.trim()) {
    uni.showToast({
      title: '请输入反馈标题',
      icon: 'none'
    })
    return false
  }

  if (title.value.trim().length < 1 || title.value.trim().length > 100) {
    uni.showToast({
      title: '反馈标题长度应在1-100字符之间',
      icon: 'none'
    })
    return false
  }

  if (!content.value.trim()) {
    uni.showToast({
      title: '请输入反馈内容',
      icon: 'none'
    })
    return false
  }

  if (content.value.trim().length < 1 || content.value.trim().length > 2000) {
    uni.showToast({
      title: '反馈内容长度应在1-2000字符之间',
      icon: 'none'
    })
    return false
  }

  if (contactInfo.value.trim().length > 100) {
    uni.showToast({
      title: '联系方式长度不能超过100字符',
      icon: 'none'
    })
    return false
  }

  return true
}

// 提交反馈
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  if (submitting.value) {
    return
  }

  submitting.value = true

  try {
    const feedbackData = {
      type: typeOptions.value[typeIndex.value].value,
      title: title.value.trim(),
      content: content.value.trim(),
      contact_info: contactInfo.value.trim() || undefined
    }

    const response = await API_FEEDBACK_SUBMIT(feedbackData)

    if (response.status === 0) {
      uni.showToast({
        title: response.message || '意见反馈提交成功，感谢您的建议！',
        icon: 'success',
        duration: 2000
      })

      // 清空表单
      typeIndex.value = -1
      title.value = ''
      content.value = ''
      contactInfo.value = ''

      // 返回上一页
      setTimeout(() => {
        uni.navigateBack()
      }, 2000)
    } else {
      uni.showToast({
        title: response.message || '提交失败，请稍后重试',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('提交反馈失败:', error)
    uni.showToast({
      title: '网络错误，请检查网络连接后重试',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
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

      .required {
        color: #ff4757;
        margin-left: 4rpx;
      }
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

    .picker {
      width: 100%;
    }

    .picker-content {
      width: 100%;
      height: 80rpx;
      background: #f5f5f5;
      border-radius: 12rpx;
      padding: 0 24rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;

      .picker-text {
        font-size: 32rpx;
        color: #333;

        &.placeholder {
          color: #999;
        }
      }

      .picker-arrow {
        font-size: 24rpx;
        color: #999;
      }
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
    background: #007aff;
    border-radius: 44rpx;
    color: #fff;
    font-size: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 48rpx;
    border: none;

    &:active {
      opacity: 0.8;
    }

    &:disabled {
      background: #ccc;
      opacity: 0.6;
    }
  }
}
</style>
