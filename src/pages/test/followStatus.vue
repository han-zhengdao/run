<template>
  <view class="container">
    <view class="header">
      <text class="title">关注状态查询测试</text>
    </view>
    
    <view class="form">
      <view class="input-group">
        <text class="label">用户ID:</text>
        <input 
          v-model="userId" 
          type="number" 
          placeholder="请输入要查询的用户ID" 
          class="input"
        />
      </view>
      
      <button @click="checkFollowStatus" class="btn" :disabled="loading">
        {{ loading ? '查询中...' : '查询关注状态' }}
      </button>
    </view>
    
    <view v-if="result" class="result">
      <text class="result-title">查询结果:</text>
      <view class="result-content">
        <text>用户ID: {{ result.userId }}</text>
        <text>关注状态: {{ result.isFollowing ? '已关注' : '未关注' }}</text>
        <text>响应时间: {{ result.timestamp }}</text>
      </view>
    </view>
    
    <view class="code-example">
      <text class="code-title">API调用示例:</text>
      <view class="code-block">
        <text class="code">{{ codeExample }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useRequest } from '@/api'

const userId = ref('')
const loading = ref(false)
const result = ref(null)

const { API_USER_FOLLOW_STATUS } = useRequest()

// 查询关注状态
const checkFollowStatus = async () => {
  if (!userId.value) {
    uni.showToast({
      title: '请输入用户ID',
      icon: 'none'
    })
    return
  }
  
  loading.value = true
  result.value = null
  
  try {
    const response = await API_USER_FOLLOW_STATUS(userId.value)
    
    if (response.status === 0) {
      result.value = {
        userId: userId.value,
        isFollowing: response.data.isFollowing,
        timestamp: new Date().toLocaleString()
      }
      
      console.log('关注状态查询结果:', response.data)
    } else {
      throw new Error(response.message || '查询失败')
    }
  } catch (error) {
    console.error('查询关注状态失败:', error)
    uni.showToast({
      title: error.message || '查询失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 代码示例
const codeExample = `// 查询是否关注用户ID为123的用户
fetch('/my/interaction/follow-status?userId=123', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
.then(response => response.json())
.then(data => {
  if (data.status === 0) {
    console.log('关注状态:', data.data.isFollowing)
  }
})`
</script>

<style lang="scss" scoped>
.container {
  padding: 40rpx;
  background: #f5f5f5;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 60rpx;
  
  .title {
    font-size: 48rpx;
    font-weight: bold;
    color: #333;
  }
}

.form {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  
  .input-group {
    margin-bottom: 40rpx;
    
    .label {
      display: block;
      font-size: 32rpx;
      color: #666;
      margin-bottom: 20rpx;
    }
    
    .input {
      width: 100%;
      height: 80rpx;
      border: 2rpx solid #e0e0e0;
      border-radius: 10rpx;
      padding: 0 20rpx;
      font-size: 32rpx;
      box-sizing: border-box;
      
      &:focus {
        border-color: #007aff;
      }
    }
  }
  
  .btn {
    width: 100%;
    height: 80rpx;
    background: #007aff;
    color: #fff;
    border: none;
    border-radius: 10rpx;
    font-size: 32rpx;
    
    &:disabled {
      background: #ccc;
    }
  }
}

.result {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  
  .result-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    display: block;
  }
  
  .result-content {
    text {
      display: block;
      font-size: 30rpx;
      color: #666;
      margin-bottom: 10rpx;
    }
  }
}

.code-example {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  
  .code-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    display: block;
  }
  
  .code-block {
    background: #f8f8f8;
    border-radius: 10rpx;
    padding: 20rpx;
    
    .code {
      font-family: 'Courier New', monospace;
      font-size: 24rpx;
      color: #333;
      line-height: 1.5;
      white-space: pre-wrap;
    }
  }
}
</style>