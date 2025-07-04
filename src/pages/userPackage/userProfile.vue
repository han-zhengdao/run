<template>
  <view class="page-container">
    <!-- 背景图 -->
    <image class="bg-image" src="/static/userbg.png" mode="aspectFill"></image>
    
    <!-- 自定义导航栏 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-left" @click="goBack">
        <text class="i-carbon-arrow-left text-40rpx" />
      </view>
      <view class="nav-title">用户主页</view>
    </view>
    
    <!-- 滚动区域 -->
    <scroll-view class="scroll-container" scroll-y>
      <view class="profile-container">
        <!-- 用户信息卡片 -->
        <view class="user-card">
          <view class="user-info">
            <image class="avatar" :src="userInfo.avatar" mode="aspectFill" />
            <view class="info-content">
              <view class="nickname">{{ userInfo.nickname }}</view>
              <view class="user-level">Lv.{{ userInfo.level }} 普通会员</view>
            </view>
            <view class="follow-btn" :class="{ followed: userInfo.isFollowed }" @click="handleFollow">
              <text>{{ userInfo.isFollowed ? '已关注' : '关注' }}</text>
            </view>
          </view>
          <view class="user-stats">
            <view class="stat-item" @click="goToFollow">
              <text class="num">{{ userInfo.followCount }}</text>
              <text class="label">关注</text>
            </view>
            <view class="stat-item" @click="goToFans">
              <text class="num">{{ userInfo.fansCount }}</text>
              <text class="label">粉丝</text>
            </view>
            <view class="stat-item" @click="goToLikes">
              <text class="num">{{ userInfo.likesCount }}</text>
              <text class="label">获赞</text>
            </view>
          </view>
        </view>

        <!-- 帖子列表 -->
        <view class="posts-list">
          <view class="feed-item" v-for="item in userPosts" :key="item.id" @click="goToPostDetail(item)">
            <view class="feed-content">{{ item.content }}</view>
            <view v-if="item.images && item.images.length" class="feed-images">
              <image
                v-for="(img, idx) in item.images"
                :key="idx"
                :src="img"
                class="feed-img"
                mode="aspectFill"
                @click="previewImage(item.images, idx)"
              />
            </view>
            <view class="feed-footer">
              <view class="footer-item" @click="handleLike(item)">
                <text :class="['i-carbon-favorite text-32rpx mr-2', item.isLiked ? 'liked' : '']" />
                <text>{{ item.likes }}</text>
              </view>
              <view class="footer-item">
                <text class="i-carbon-view text-32rpx mr-2" />
                <text>{{ item.views }}</text>
              </view>
              <view class="footer-item">
                <text class="i-carbon-chat text-32rpx mr-2" />
                <text>{{ item.comments }}</text>
              </view>
            </view>
            <view class="divider"></view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const statusBarHeight = ref(0)
const userId = ref('')

// 用户信息
const userInfo = ref({
  avatar: '/static/avatar1.jpg',
  nickname: '小明',
  level: 5,
  followCount: 128,
  fansCount: 256,
  likesCount: 128,
  isFollowed: false
})

// 用户帖子列表
const userPosts = ref([
  {
    id: 1,
    content: '今天学习了Vue3，感觉很棒！',
    images: ['/static/demo1.jpg'],
    likes: 23,
    views: 120,
    comments: 5,
    isLiked: false
  },
  {
    id: 2,
    content: '谁能推荐一下好用的UI库？',
    images: [],
    likes: 12,
    views: 80,
    comments: 2,
    isLiked: false
  }
])

onMounted(() => {
  // 获取状态栏高度
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight
  
  // 获取路由参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  userId.value = currentPage.options?.userId
  
  // 这里可以根据userId获取用户信息和帖子列表
  // fetchUserInfo(userId.value)
  // fetchUserPosts(userId.value)
})

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 处理关注
const handleFollow = () => {
  userInfo.value.isFollowed = !userInfo.value.isFollowed
  uni.showToast({
    title: userInfo.value.isFollowed ? '关注成功' : '已取消关注',
    icon: 'none'
  })
}

// 预览图片
const previewImage = (urls, current) => {
  uni.previewImage({
    urls,
    current: urls[current],
    indicator: 'number',
    loop: true
  })
}

// 处理点赞
const handleLike = (item) => {
  item.isLiked = !item.isLiked
  item.likes += item.isLiked ? 1 : -1
  uni.showToast({
    title: item.isLiked ? '点赞成功' : '已取消点赞',
    icon: 'none'
  })
}

// 跳转到关注列表
const goToFollow = () => {
  uni.navigateTo({
    url: `/pages/userPackage/follow?userId=${userId.value}`
  })
}

// 跳转到粉丝列表
const goToFans = () => {
  uni.navigateTo({
    url: `/pages/userPackage/fans?userId=${userId.value}`
  })
}

// 跳转到获赞列表
const goToLikes = () => {
  uni.navigateTo({
    url: `/pages/userPackage/likes?userId=${userId.value}`
  })
}

// 跳转到帖子详情
const goToPostDetail = (item) => {
  uni.navigateTo({
    url: `/pages/userPackage/postDetail?postId=${item.id}`
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

.scroll-container {
  position: relative;
  z-index: 1;
  height: 100vh;
}

.profile-container {
  padding: 0;
  padding-top: 88rpx;
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
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }
  
  .nav-title {
    flex: 1;
    text-align: center;
    color: #fff;
    font-size: 36rpx;
    font-weight: 500;
  }
}

.user-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin: 24rpx;
  margin-top: 160rpx;
  position: relative;
  z-index: 1;
  width: calc(100% - 48rpx);
  box-sizing: border-box;

  .user-info {
    display: flex;
    align-items: center;
    margin-bottom: 32rpx;
    position: relative;

    .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      margin-right: 24rpx;
    }

    .info-content {
      flex: 1;
      .nickname {
        font-size: 36rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 8rpx;
      }

      .user-level {
        font-size: 24rpx;
        color: #999;
      }
    }
  }

  .user-stats {
    display: flex;
    justify-content: space-around;
    border-top: 1rpx solid #f0f0f0;
    padding-top: 32rpx;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;

      .num {
        font-size: 32rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 8rpx;
      }

      .label {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

.follow-btn {
  padding: 8rpx 24rpx;
  background: #1da1f2;
  color: #fff;
  border-radius: 30rpx;
  font-size: 24rpx;
  
  &.followed {
    background: #f0f0f0;
    color: #666;
  }
}

.posts-list {
  .feed-item {
    background: #fff;
    padding: 32rpx;
    margin: 0 24rpx 24rpx;
    border-radius: 20rpx;
    width: calc(100% - 48rpx);
    box-sizing: border-box;

    .feed-content {
      font-size: 30rpx;
      color: #222;
      line-height: 1.6;
      margin-bottom: 16rpx;
    }

    .feed-images {
      display: flex;
      gap: 12rpx;
      margin-bottom: 16rpx;
      .feed-img {
        width: 180rpx;
        height: 180rpx;
        border-radius: 10rpx;
        object-fit: cover;
      }
    }

    .feed-footer {
      display: flex;
      gap: 60rpx;
      align-items: center;
      
      .footer-item {
        display: flex;
        align-items: center;
        font-size: 26rpx;
        color: #888;
        
        .liked {
          color: #1da1f2;
        }
      }
    }

    .divider {
      height: 1rpx;
      background: #f0f0f0;
      margin-top: 32rpx;
    }
  }
}
</style> 