<template>
  <view class="login-container">
    <image class="logo" src="/static/logo.jpg" mode="aspectFill" />
    <view class="title">微信一键登录</view>
    <button class="login-btn" open-type="getUserInfo" @getuserinfo="onGetUserInfo">
      微信授权登录
    </button>
    <view v-if="userInfo">
      <image :src="userInfo.avatarUrl" class="avatar" mode="aspectFill" />
      <view class="nickname">{{ userInfo.nickName }}</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
const userInfo = ref(null)

function onGetUserInfo(e) {
  if (e.detail.userInfo) {
    userInfo.value = e.detail.userInfo
    // 调用后端API进行登录/注册
    uni.request({
      url: 'http://localhost:3000/api/users/login', // 你的后端登录接口
      method: 'POST',
      data: {
        avatarUrl: e.detail.userInfo.avatarUrl,
        nickName: e.detail.userInfo.nickName,
        // 如果需要openid或unionid，还需要额外获取，这里假设后端只用头像昵称
        // code: '从uni.login获取的code' // 如果后端需要通过code换取openid
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 0) { // 假设后端返回 code=0 表示成功
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })
          // 保存用户登录态，例如 token 或用户信息
          // uni.setStorageSync('token', res.data.data.token)
          // uni.setStorageSync('userInfo', res.data.data.userInfo)
          
          // 跳转到首页或其他需要登录的页面
          uni.reLaunch({
            url: '/pages/index/index'
          })
        } else {
          uni.showToast({
            title: res.data.message || '登录失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('登录请求失败', err)
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      }
    })
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