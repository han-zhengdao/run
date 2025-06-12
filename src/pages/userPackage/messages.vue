<template>
  <view class="page-container">
    <!-- 背景图 -->
    <image class="bg-image" src="/static/userbg.png" mode="aspectFill"></image>

    <!-- 自定义导航栏 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-left" @click="goBack">
        <text class="i-carbon-arrow-left text-32rpx" />
      </view>
      <view class="nav-title">消息通知</view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-container">
      <!-- 系统通知入口 -->
      <view class="message-list">
        <view class="message-item" @click="toggleSystemList">
          <view class="item-left">
            <text class="i-carbon-notification text-40rpx" />
            <view class="item-info">
              <text class="title">系统通知</text>
              <text class="desc">系统公告、活动通知等</text>
            </view>
          </view>
          <view class="item-right">
            <view class="badge" v-if="systemUnread > 0">{{ systemUnread }}</view>
            <text class="i-carbon-chevron-right text-24rpx" :class="{ 'rotate-90': showSystemList }" />
          </view>
        </view>
        
        <!-- 系统通知列表 -->
        <view class="system-list" v-if="showSystemList">
          <view class="message-card" 
            v-for="(item, index) in systemList" 
            :key="index" 
            @click="showSystemDetail(item)"
          >
            <view class="card-header">
              <image class="avatar" :src="item.avatar" mode="aspectFill" />
              <view class="header-info">
                <view class="name">{{ item.name }}</view>
                <view class="time">{{ item.time }}</view>
              </view>
            </view>
            <view class="card-content">{{ item.content }}</view>
          </view>
          
          <!-- 加载更多 -->
          <view class="load-more" v-if="systemHasMore" @click="loadMoreSystem">
            <text v-if="systemLoading">加载中...</text>
            <text v-else>加载更多</text>
          </view>
        </view>
      </view>

      <!-- 互动消息入口 -->
      <view class="message-list">
        <view class="message-item" @click="toggleInteractionList">
          <view class="item-left">
            <text class="i-carbon-chat text-40rpx" />
            <view class="item-info">
              <text class="title">互动消息</text>
              <text class="desc">评论、点赞、回复等</text>
            </view>
          </view>
          <view class="item-right">
            <view class="badge" v-if="interactionUnread > 0">{{ interactionUnread }}</view>
            <text class="i-carbon-chevron-right text-24rpx" :class="{ 'rotate-90': showInteractionList }" />
          </view>
        </view>
        
        <!-- 互动消息列表 -->
        <view class="interaction-list" v-if="showInteractionList">
          <view class="message-card" 
            v-for="(item, index) in interactionList" 
            :key="index" 
            @click="showInteractionDetail(item)"
          >
            <view class="card-header">
              <image class="avatar" :src="item.avatar" mode="aspectFill" />
              <view class="header-info">
                <view class="name">{{ item.name }}</view>
                <view class="time">{{ item.time }}</view>
              </view>
            </view>
            <view class="card-content">{{ item.content }}</view>
            <view class="card-footer">
              <view class="source-content">原文：{{ item.sourceContent }}</view>
            </view>
          </view>
          
          <!-- 加载更多 -->
          <view class="load-more" v-if="hasMore" @click="loadMore">
            <text v-if="loading">加载中...</text>
            <text v-else>加载更多</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const statusBarHeight = ref(0)
const systemUnread = ref(2)
const interactionUnread = ref(5)
const showSystemList = ref(false)
const showInteractionList = ref(false)
const loading = ref(false)
const systemLoading = ref(false)
const hasMore = ref(true)
const systemHasMore = ref(true)
const page = ref(1)
const systemPage = ref(1)
const pageSize = 10

// 模拟系统通知数据
const systemList = ref([
  {
    id: 1,
    avatar: '/static/logo.jpg',
    name: '系统通知',
    time: '10分钟前',
    content: '欢迎使用润邻生活圈，这里有最新的社区动态和邻里互动。'
  },
  {
    id: 2,
    avatar: '/static/logo.jpg',
    name: '系统通知',
    time: '1小时前',
    content: '社区活动：本周六将举办邻里节，欢迎参加！'
  }
])

// 模拟互动消息数据
const interactionList = ref([
  {
    id: 1,
    avatar: '/static/avatar1.jpg',
    name: '小明',
    time: '30分钟前',
    content: '点赞了你的帖子',
    sourceContent: '今天天气真好，准备去公园散步...'
  },
  {
    id: 2,
    avatar: '/static/avatar2.jpg',
    name: '小红',
    time: '1小时前',
    content: '评论了你的帖子：这个建议很棒！',
    sourceContent: '分享一下我的装修经验...'
  }
])

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight
})

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 切换系统通知列表显示
const toggleSystemList = () => {
  showSystemList.value = !showSystemList.value
}

// 切换互动消息列表显示
const toggleInteractionList = () => {
  showInteractionList.value = !showInteractionList.value
}

// 显示系统通知详情
const showSystemDetail = (item) => {
  uni.navigateTo({
    url: `/pages/userPackage/systemDetail?id=${item.id}`
  })
}

// 显示互动消息详情
const showInteractionDetail = (item) => {
  uni.navigateTo({
    url: `/pages/userPackage/interactionDetail?id=${item.id}`
  })
}

// 加载更多系统通知
const loadMoreSystem = async () => {
  if (systemLoading.value) return
  
  systemLoading.value = true
  try {
    // 模拟加载更多数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newData = [
      {
        id: systemList.value.length + 1,
        avatar: '/static/logo.jpg',
        name: '系统通知',
        time: '2小时前',
        content: '社区公告：请各位居民注意垃圾分类，共建美好家园。'
      }
    ]
    
    systemList.value.push(...newData)
    systemPage.value++
    
    // 模拟没有更多数据
    if (systemPage.value > 3) {
      systemHasMore.value = false
    }
  } finally {
    systemLoading.value = false
  }
}

// 加载更多互动消息
const loadMore = async () => {
  if (loading.value) return
  
  loading.value = true
  try {
    // 模拟加载更多数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newData = [
      {
        id: interactionList.value.length + 1,
        avatar: '/static/avatar3.jpg',
        name: '小张',
        time: '2小时前',
        content: '回复了你的评论：同意你的观点',
        sourceContent: '关于小区垃圾分类的建议...'
      }
    ]
    
    interactionList.value.push(...newData)
    page.value++
    
    // 模拟没有更多数据
    if (page.value > 3) {
      hasMore.value = false
    }
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss">
    .page-container {
    min-height: 100vh;
    background: #f5f5f5;
    position: relative;
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
    background: transparent;
    
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
    padding-top: calc(288rpx + var(--status-bar-height) + 24rpx);
    }

    .message-list {
    background: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    margin-bottom: 24rpx;
    
    .message-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 32rpx 24rpx;
        
        .item-left {
        display: flex;
        align-items: center;
        
        .item-info {
            margin-left: 24rpx;
            
            .title {
            font-size: 30rpx;
            color: #333;
            font-weight: 500;
            margin-bottom: 8rpx;
            display: block;
            }
            
            .desc {
            font-size: 24rpx;
            color: #999;
            }
        }
        }
        
        .item-right {
        display: flex;
        align-items: center;
        
        .badge {
            min-width: 32rpx;
            height: 32rpx;
            padding: 0 8rpx;
            background: #ff4d4f;
            border-radius: 16rpx;
            color: #fff;
            font-size: 22rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12rpx;
        }
        
        .rotate-90 {
            transform: rotate(90deg);
        }
        }
    }
    }

    .system-list,
    .interaction-list {
    .message-card {
        background: #fff;
        padding: 24rpx;
        border-top: 1rpx solid #f0f0f0;
        
        .card-header {
        display: flex;
        align-items: center;
        margin-bottom: 16rpx;
        
        .avatar {
            width: 80rpx;
            height: 80rpx;
            border-radius: 50%;
            margin-right: 16rpx;
        }
        
        .header-info {
            flex: 1;
            
            .name {
            font-size: 28rpx;
            color: #333;
            font-weight: 500;
            margin-bottom: 4rpx;
            }
            
            .time {
            font-size: 24rpx;
            color: #999;
            }
        }
        }
        
        .card-content {
        font-size: 28rpx;
        color: #333;
        line-height: 1.6;
        margin-bottom: 16rpx;
        }
    }
    
    .load-more {
        text-align: center;
        padding: 24rpx;
        color: #999;
        font-size: 26rpx;
    }
    }

    .interaction-list {
    .message-card {
        .card-footer {
        background: #f8f8f8;
        padding: 16rpx;
        border-radius: 12rpx;
        
        .source-content {
            font-size: 26rpx;
            color: #666;
            line-height: 1.5;
        }
        }
    }
    }
</style> 