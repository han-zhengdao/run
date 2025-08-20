<template>
  <view class="page-container">
    <!-- 背景图 -->
    <image class="bg-image" src="/static/userbg.png" mode="aspectFill"></image>

    <!-- 页面标题 -->
    <view class="page-header">
      <view class="header-left" @click="goBack">
        <text class="i-carbon-arrow-left text-36rpx text-white"></text>
      </view>
      <text class="page-title">我的点赞</text>
    </view>

    <!-- 滚动区域 -->
    <scroll-view class="scroll-container" scroll-y @scrolltolower="loadMore" refresher-enabled
      @refresherrefresh="onRefresh" :refresher-triggered="refreshing">
      <view class="posts-container">
        <view class="posts-list">
          <!-- 帖子点赞 -->
          <view class="like-item post-like" v-for="item in postLikes" :key="item.likeId">
            <!-- 我的信息 -->
            <view class="my-info">
              <image class="avatar" :src="myUserInfo.avatar || '/static/logo.jpg'" mode="aspectFill"
                @error="handleAvatarError" />
              <view class="user-info">
                <view class="nickname">{{ myUserInfo.nickname }}</view>
                <view class="meta-info">
                  <text class="level">{{ myUserInfo.levelName }}</text>
                  <text class="dot">·</text>
                  <text class="like-time">{{ formatTime(item.likeTime) }}</text>
                </view>
              </view>
              <view class="like-badge">
                <text class="like-icon">👍</text>
                <text class="like-text">赞同了</text>
              </view>
            </view>

            <!-- 被点赞的内容 -->
            <view class="liked-content" @click="goToPost(item.target.id)">
              <view class="content-main">
                <text class="content-text">{{ item.target.content }}</text>
                <view class="post-images" v-if="item.target.imageUrls && item.target.imageUrls.length">
                  <image v-for="(img, imgIndex) in item.target.imageUrls" :key="imgIndex"
                    :src="img || '/static/errimg.png'" mode="aspectFill"
                    @click.stop="previewImage(item.target.imageUrls, imgIndex)"
                    @error="handleImageError($event, item.target.imageUrls, imgIndex)" />
                </view>
              </view>
              <view class="content-meta">
                <view class="stats">
                  <text class="stat-item">{{ item.target.likeCount }} 赞同</text>
                  <text class="stat-divider">·</text>
                  <text class="stat-item">{{ item.target.commentCount }} 评论</text>
                  <text class="stat-divider">·</text>
                  <text class="stat-item">{{ item.target.viewCount }} 浏览</text>
                </view>
                <view class="category-tag">{{ item.target.categoryName }}</view>
              </view>
            </view>
          </view>

          <!-- 评论点赞 -->
          <view class="like-item comment-like" v-for="item in commentLikes" :key="item.likeId">
            <!-- 我的信息 -->
            <view class="my-info">
              <image class="avatar" :src="myUserInfo.avatar || '/static/logo.jpg'" mode="aspectFill"
                @error="handleAvatarError" />
              <view class="user-info">
                <view class="nickname">{{ myUserInfo.nickname }}</view>
                <view class="meta-info">
                  <text class="level">{{ myUserInfo.levelName }}</text>
                  <text class="dot">·</text>
                  <text class="like-time">{{ formatTime(item.likeTime) }}</text>
                </view>
              </view>
              <view class="like-badge">
                <text class="like-icon">💬</text>
                <text class="like-text">赞同了评论</text>
              </view>
            </view>

            <!-- 上下文：所属帖子 -->
            <view class="context-section" @click="goToPost(item.post.id)">
              <view class="context-content">
                <text class="context-label">评论于</text>
                <text class="post-title">{{ item.post.content }}</text>
              </view>
              <view class="context-meta">
                <text class="stat-item">{{ item.post.likeCount }} 赞同</text>
                <text class="stat-divider">·</text>
                <text class="stat-item">{{ item.post.commentCount }} 评论</text>
                <text class="stat-divider">·</text>
                <text class="stat-item">{{ item.post.categoryName }}</text>
              </view>
            </view>

            <!-- 被点赞的内容：评论 -->
            <view class="liked-content comment-content" @click="goToPost(item.post.id)">
              <view class="content-main">
                <text class="content-text">{{ item.target.content }}</text>
              </view>
              <view class="content-meta">
                <view class="stats">
                  <text class="stat-item">{{ item.target.likeCount }} 赞同</text>
                  <text class="stat-divider">·</text>
                  <text class="stat-item">{{ item.target.replyCount }} 回复</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 回复点赞 -->
          <view class="like-item reply-like" v-for="item in replyLikes" :key="item.likeId">
            <!-- 我的信息 -->
            <view class="my-info">
              <image class="avatar" :src="myUserInfo.avatar || '/static/logo.jpg'" mode="aspectFill"
                @error="handleAvatarError" />
              <view class="user-info">
                <view class="nickname">{{ myUserInfo.nickname }}</view>
                <view class="meta-info">
                  <text class="level">{{ myUserInfo.levelName }}</text>
                  <text class="dot">·</text>
                  <text class="like-time">{{ formatTime(item.likeTime) }}</text>
                </view>
              </view>
              <view class="like-badge">
                <text class="like-icon">↩️</text>
                <text class="like-text">赞同了回复</text>
              </view>
            </view>

            <!-- 上下文：所属帖子 -->
            <view class="context-section" @click="goToPost(item.post.id)">
              <view class="context-content">
                <text class="context-label">回复于</text>
                <text class="post-title">{{ item.post.content }}</text>
              </view>
              <view class="context-meta">
                <text class="stat-item">{{ item.post.likeCount }} 赞同</text>
                <text class="stat-divider">·</text>
                <text class="stat-item">{{ item.post.commentCount }} 评论</text>
                <text class="stat-divider">·</text>
                <text class="stat-item">{{ item.post.categoryName }}</text>
              </view>
            </view>

            <!-- 上下文：被回复的评论 -->
            <view class="context-section comment-context" @click="goToPost(item.post.id)">
              <view class="context-content">
                <text class="context-label">回复评论</text>
                <text class="comment-content">{{ item.comment.content }}</text>
              </view>
              <view class="context-meta">
                <text class="stat-item">{{ item.comment.likeCount }} 赞同</text>
                <text class="stat-divider">·</text>
                <text class="stat-item">{{ item.comment.replyCount }} 回复</text>
              </view>
            </view>

            <!-- 被点赞的内容：回复 -->
            <view class="liked-content reply-content" @click="goToPost(item.post.id)">
              <view class="content-main">
                <text class="content-text">{{ item.target.content }}</text>
              </view>
              <view class="content-meta">
                <view class="stats">
                  <text class="stat-item">{{ item.target.likeCount }} 赞同</text>
                  <text class="stat-divider">·</text>
                  <text class="stat-item">{{ item.target.replyCount }} 回复</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载更多 -->
        <view class="load-more" v-if="!noMore && likedPosts.length > 0">
          <text class="load-text">{{ isLoading ? '加载中...' : '上拉加载更多' }}</text>
        </view>

        <!-- 没有更多数据 -->
        <view class="no-more" v-if="noMore && likedPosts.length > 0">
          <text class="no-more-text">没有更多数据了</text>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-if="!isLoading && likedPosts.length === 0">
          <image class="empty-icon" src="/static/images/index_i_no.png" mode="aspectFit"></image>
          <text class="empty-text">暂无点赞记录</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRequest } from '@/api'
import { formatTime } from '@/utils/timeFormat'

const { API_MY_LIKES_LIST, API_USER_GET_INFO } = useRequest()

const isLoading = ref(false)
const refreshing = ref(false)
const noMore = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const likedPosts = ref([])
const total = ref(0)
const myUserInfo = ref({
  avatar: '/static/logo.jpg',
  nickname: '我',
  levelName: 'Lv.1'
})

// 计算属性：按类型过滤点赞记录
const postLikes = computed(() => {
  return likedPosts.value.filter((item) => item.type === 'post')
})

const commentLikes = computed(() => {
  return likedPosts.value.filter((item) => item.type === 'comment')
})

const replyLikes = computed(() => {
  return likedPosts.value.filter((item) => item.type === 'reply')
})

// 获取我的用户信息
const getMyUserInfo = async () => {
  try {
    const response = await API_USER_GET_INFO()
    if (response.status === 0 && response.data) {
      myUserInfo.value = {
        avatar: response.data.avatar || '/static/logo.jpg',
        nickname: response.data.nickname || '我',
        levelName: response.data.levelName || 'Lv.1'
      }
    }
  } catch (error) {
    // 静默处理错误，使用默认值
  }
}

// 处理图片URL，将相对路径转换为绝对路径
const processImageUrls = (imageUrls) => {
  if (!imageUrls || !Array.isArray(imageUrls)) return []

  return imageUrls.map((url) => {
    if (url && url.startsWith('/')) {
      return `${import.meta.env.VITE_APP_API_BASEURL}${url}`
    }
    return url
  })
}

// 获取点赞列表
const getLikesList = async (isRefresh = false) => {
  try {
    if (isRefresh) {
      currentPage.value = 1
      noMore.value = false
    }

    if (noMore.value || isLoading.value) return

    isLoading.value = true
    const response = await API_MY_LIKES_LIST({
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })

    if (response.status === 0 && response.data) {
      const newList = response.data.list || []
      total.value = response.data.total || 0

      // 处理图片URL和头像URL
      const processedList = newList.map((item) => {
        // 处理帖子图片
        if (item.target && item.target.imageUrls) {
          item.target.imageUrls = processImageUrls(item.target.imageUrls)
        }
        // 处理作者头像
        if (item.author && item.author.avatar) {
          item.author.avatar = processImageUrls([item.author.avatar])[0]
        }
        return item
      })

      if (isRefresh) {
        likedPosts.value = processedList
      } else {
        likedPosts.value.push(...processedList)
      }

      // 判断是否还有更多数据
      if (newList.length < pageSize.value) {
        noMore.value = true
      } else {
        currentPage.value++
      }
    } else {
      uni.showToast({
        title: response.message || '获取点赞列表失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '获取点赞列表失败',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  await getLikesList(true)
  refreshing.value = false
}

// 加载更多
const loadMore = () => {
  if (isLoading.value || noMore.value) return
  getLikesList()
}

// 跳转到用户页面
const goToUser = (userId) => {
  uni.navigateTo({
    url: `/pages/userPackage/userProfile?userId=${userId}`
  })
}

// 跳转到帖子详情
const goToPost = (postId) => {
  uni.navigateTo({
    url: `/pages/detail/detail?id=${postId}`
  })
}

// 处理头像加载错误
const handleAvatarError = () => {
  myUserInfo.value.avatar = '/static/logo.jpg'
}

// 处理图片加载错误
const handleImageError = (event, imageUrls, index) => {
  if (imageUrls && imageUrls[index]) {
    imageUrls[index] = '/static/errimg.png'
  }
}

// 预览图片
const previewImage = (images, current) => {
  // 过滤掉无效的图片URL
  const validImages = images.filter((img) => img && img !== '/static/errimg.png')

  if (validImages.length === 0) {
    uni.showToast({
      title: '暂无图片可预览',
      icon: 'none'
    })
    return
  }

  uni.previewImage({
    urls: validImages,
    current: validImages[current] || validImages[0]
  })
}

const goBack = () => {
  uni.navigateBack()
}

onMounted(() => {
  getMyUserInfo()
  getLikesList(true)
})
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
  height: 300rpx;
  z-index: 0;
}

.page-header {
  position: relative;
  z-index: 1;
  padding: 120rpx 24rpx 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  .header-left {
    position: absolute;
    left: 24rpx;
    padding: 20rpx;
  }

  .page-title {
    color: #fff;
    font-size: 36rpx;
    font-weight: 500;
  }
}

.scroll-container {
  position: relative;
  z-index: 1;
  height: calc(100vh - 200rpx);
}

.posts-container {
  padding: 0 24rpx 100rpx;
}

.posts-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

  .like-item {
    padding: 32rpx 24rpx;
    border-bottom: 1rpx solid #f0f0f0;
    transition: background-color 0.2s ease;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background-color: #f8f9fa;
    }

    .my-info {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 24rpx;

      .avatar {
        width: 72rpx;
        height: 72rpx;
        border-radius: 50%;
        margin-right: 16rpx;
        flex-shrink: 0;
        border: 2rpx solid #f0f0f0;
      }

      .user-info {
        flex: 1;
        min-width: 0;

        .nickname {
          font-size: 30rpx;
          color: #1a1a1a;
          font-weight: 600;
          margin-bottom: 6rpx;
          line-height: 1.4;
        }

        .meta-info {
          display: flex;
          align-items: center;
          font-size: 24rpx;
          color: #8590a6;

          .level {
            color: #8590a6;
          }

          .dot {
            margin: 0 8rpx;
            color: #8590a6;
          }

          .like-time {
            color: #8590a6;
          }
        }
      }

      .like-badge {
        display: flex;
        align-items: center;
        background: #f6f6f6;
        border-radius: 20rpx;
        padding: 8rpx 16rpx;
        margin-left: 16rpx;

        .like-icon {
          font-size: 24rpx;
          margin-right: 6rpx;
        }

        .like-text {
          font-size: 24rpx;
          color: #8590a6;
          font-weight: 500;
        }
      }
    }

    .context-section {
      background: #f8f9fa;
      border-radius: 8rpx;
      padding: 16rpx;
      margin-bottom: 16rpx;
      border-left: 4rpx solid #e8e8e8;

      .context-content {
        margin-bottom: 8rpx;

        .context-label {
          font-size: 24rpx;
          color: #8590a6;
          margin-right: 8rpx;
          font-weight: 500;
        }

        .post-title,
        .comment-title {
          font-size: 26rpx;
          color: #1a1a1a;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      .context-meta {
        display: flex;
        align-items: center;
        font-size: 22rpx;
        color: #8590a6;

        .stat-item {
          color: #8590a6;
        }

        .stat-divider {
          margin: 0 6rpx;
          color: #8590a6;
        }
      }

      &.comment-context {
        background: #f0f0f0;
        border-left-color: #d0d0d0;
      }
    }

    .liked-content {
      background: #fff;
      border: 1rpx solid #f0f0f0;
      border-radius: 12rpx;
      padding: 20rpx;
      border-left: 4rpx solid #0084ff;

      .content-main {
        margin-bottom: 16rpx;

        .content-text {
          font-size: 28rpx;
          color: #1a1a1a;
          line-height: 1.6;
          margin-bottom: 12rpx;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .post-images {
          display: flex;
          flex-wrap: wrap;
          gap: 8rpx;
          margin-top: 12rpx;

          image {
            width: 160rpx;
            height: 160rpx;
            border-radius: 8rpx;
            object-fit: cover;
            border: 1rpx solid #f0f0f0;
          }
        }
      }

      .content-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .stats {
          display: flex;
          align-items: center;
          font-size: 24rpx;
          color: #8590a6;

          .stat-item {
            color: #8590a6;
          }

          .stat-divider {
            margin: 0 8rpx;
            color: #8590a6;
          }
        }

        .category-tag {
          background: #f0f0f0;
          color: #8590a6;
          font-size: 22rpx;
          padding: 4rpx 12rpx;
          border-radius: 12rpx;
          font-weight: 500;
        }
      }

      &.comment-content {
        border-left-color: #00c853;
      }

      &.reply-content {
        border-left-color: #ff9800;
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 160rpx 24rpx;

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 32rpx;
    display: block;
    opacity: 0.6;
  }

  .empty-text {
    font-size: 36rpx;
    color: #1a1a1a;
    margin-bottom: 16rpx;
    display: block;
    font-weight: 600;
  }

  .empty-desc {
    font-size: 28rpx;
    color: #8590a6;
    display: block;
    line-height: 1.5;
  }
}

.loading,
.no-more {
  text-align: center;
  padding: 32rpx;
  color: #8590a6;
  font-size: 26rpx;
  font-weight: 500;
}
</style>
