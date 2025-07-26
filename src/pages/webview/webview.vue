<template>
  <view class="webview-container">
    <web-view :src="url" @message="handleMessage"></web-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 获取页面参数中的URL
const url = ref('')

onMounted(() => {
  // 获取路由参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const pageUrl = currentPage.options?.url
  
  if (pageUrl) {
    // 解码URL
    url.value = decodeURIComponent(pageUrl)
    console.log('WebView加载URL:', url.value)
  } else {
    uni.showToast({
      title: 'URL参数缺失',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})

// 处理web-view的消息
const handleMessage = (event) => {
  console.log('接收到web-view消息:', event.detail)
}
</script>

<style>
.webview-container {
  width: 100%;
  height: 100vh;
}
</style>