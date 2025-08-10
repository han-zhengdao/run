<template>
  <view class="login-container">
    <image class="logo" src="/static/logo.jpg" mode="aspectFill" />
    <view class="title">微信一键登录</view>
    <button
      class="login-btn"
      open-type="getUserInfo"
      @getuserinfo="onGetUserInfo"
      :loading="loading"
      :disabled="loading"
    >
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

  // 防止重复请求的标志
  let isRequesting = false

  async function onGetUserInfo(e) {
    // 双重检查防止重复请求
    if (loading.value || isRequesting) {
      return
    }

    if (e.detail.userInfo) {
      loading.value = true
      isRequesting = true
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

        // 检查返回数据结构
        if (!res || res.status !== 0) {
          throw new Error(res?.message || '登录失败：服务器返回错误')
        }
        console.log('登录成功', res)

        uni.showToast({
          title: res.message || '登录成功',
          icon: 'success'
        })

        // 根据API文档，成功响应直接包含token、refreshToken和user字段
        const { token, refreshToken, user = {} } = res

        // 验证必要字段
        if (!token || typeof token !== 'string' || token.trim() === '') {
          console.error('登录失败：未获取到访问令牌')
          throw new Error('登录失败：未获取到访问令牌')
        }

        // 存储token和refreshToken
        uni.setStorageSync('token', token)
        uni.setStorageSync('refreshToken', refreshToken)

        // 存储用户信息
        const userInfo = {
          id: user.id,
          openid: user.openid,
          nickname: user.nickname || e.detail.userInfo.nickName,
          avatar: user.avatar || e.detail.userInfo.avatarUrl,
          level: user.level,
          points: user.points
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
        isRequesting = false
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
