<template>
  <view class="login-container">
    <image class="logo" src="/static/logo.jpg" mode="aspectFill" />
    <view class="title">微信一键登录</view>
    <button class="login-btn" open-type="getUserInfo" @getuserinfo="onGetUserInfo" :loading="loading"
      :disabled="loading">
      {{ loading ? '登录中...' : '微信授权登录' }}
    </button>
    <view v-if="userInfo">
      <image :src="userInfo.avatarUrl" class="avatar" mode="aspectFill" />
      <view class="nickname">{{ userInfo.nickName }}</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useRequest } from '@/api' // 引入API模块

const userInfo = ref(null)
const loading = ref(false)
const { API_USER_LOGIN } = useRequest() // 获取用户登录API

async function onGetUserInfo(e) {
  if (loading.value) {
    return
  }

  if (e.detail.userInfo) {
    loading.value = true
    userInfo.value = e.detail.userInfo
    try {
      // 每次点击都重新获取 code
      const loginRes = await uni.login({ provider: 'weixin' })
      const code = loginRes.code

      // 发送新 code 到后端
      const res = await API_USER_LOGIN({
        code, // 临时登录凭证
        avatar: e.detail.userInfo.avatarUrl,
        nickname: e.detail.userInfo.nickName
      })

      uni.showToast({
        title: res.message || '登录成功',
        icon: 'success'
      })
      // 根据后端返回格式：{ status: 0, message: '登录成功', data: { nickname, avatar, token, refreshToken } }
      const { token, refreshToken, nickname, avatar } = res.data
      // 存储token和refreshToken
      uni.setStorageSync('token', token)
      uni.setStorageSync('refreshToken', refreshToken)
      // 存储用户信息
      const userInfo = {
        nickname: nickname || e.detail.userInfo.nickName,
        avatar: avatar || e.detail.userInfo.avatarUrl
      }
      uni.setStorageSync('userInfo', userInfo)
      uni.reLaunch({
        url: '/pages/index/index'
      })
    } catch (error) {
      uni.showToast({
        title: (error && error.message) || '网络错误，请重试',
        icon: 'none'
      })
    } finally {
      loading.value = false
    }
  } else {
    uni.showToast({
      title: '授权失败',
      icon: 'none'
    })
  }
}
</script>

<style lang="scss">
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f5f5f5;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 40rpx;
  border-radius: 50%;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 60rpx;
}

.login-btn {
  width: 80vw;
  height: 88rpx;
  background: #07c160;
  color: #fff;
  font-size: 32rpx;
  border-radius: 44rpx;
  margin-bottom: 40rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin: 20rpx auto 10rpx auto;
}

.nickname {
  font-size: 28rpx;
  color: #333;
  text-align: center;
}
</style>
