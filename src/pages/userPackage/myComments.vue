<template>
  <view class="page-container">
    <!-- 背景图 -->
    <image class="bg-image" src="/static/userbg.png" mode="aspectFill"></image>

    <!-- 页面标题 -->
    <view class="page-header">
      <view class="header-left" @click="goBack">
        <text class="i-carbon-arrow-left text-36rpx text-white"></text>
      </view>
      <text class="page-title">我的评论</text>
    </view>

    <!-- 滚动区域 -->
    <scroll-view class="scroll-container" scroll-y @scrolltolower="loadMore" refresher-enabled
      @refresherrefresh="onRefresh" :refresher-triggered="refreshing">
      <view class="comments-container">
        <view class="comments-list">
          <!-- 评论记录 -->
          <view class="comment-item" v-for="item in commentList" :key="item.target.id">
            <!-- 我的信息 -->
            <view class="my-info">
              <image class="avatar" :src="myUserInfo.avatar || '/static/logo.jpg'" mode="aspectFill"
                @error="handleAvatarError" />
              <view class="user-info">
                <view class="nickname">{{ myUserInfo.nickname }}</view>
                <view class="meta-info">
                  <text class="level">{{ myUserInfo.levelName }}</text>
                  <text class="dot">·</text>
                  <text class="comment-time">{{ formatTime(item.target.createdAt) }}</text>
                </view>
              </view>
              <view class="comment-badge">
                <text class="comment-icon">💬</text>
                <text class="comment-text">评论了</text>
              </view>
            </view>

            <!-- 帖子信息 -->
            <view class="post-context" @click="goToPost(item.post.id)">
              <view class="post-content">{{ item.post.content }}</view>
              <view class="post-images" v-if="item.post.imageUrls && item.post.imageUrls.length">
                <image v-for="(img, imgIndex) in item.post.imageUrls" :key="imgIndex" :src="img" mode="aspectFill"
                  @click.stop="previewImage(item.post.imageUrls, imgIndex)" />
              </view>
              <view class="post-stats">
                <text class="stat-item">{{ item.post.likeCount }} 赞</text>
                <text class="stat-item">{{ item.post.commentCount }} 评论</text>
                <text class="stat-item">{{ item.post.viewCount }} 浏览</text>
                <text class="stat-item">{{ item.post.categoryName }}</text>
              </view>
            </view>

            <!-- 我的评论内容 -->
            <view class="my-comment">
              <view class="comment-content">{{ item.target.content }}</view>
              <view class="comment-stats">
                <text class="stat-item">{{ item.target.likeCount }} 赞</text>
                <text class="stat-item">{{ item.target.replyCount }} 回复</text>
              </view>
            </view>
          </view>

          <!-- 回复记录 -->
          <view class="comment-item reply-item" v-for="item in replyList" :key="item.target.id">
            <!-- 我的信息 -->
            <view class="my-info">
              <image class="avatar" :src="myUserInfo.avatar || '/static/logo.jpg'" mode="aspectFill"
                @error="handleAvatarError" />
              <view class="user-info">
                <view class="nickname">{{ myUserInfo.nickname }}</view>
                <view class="meta-info">
                  <text class="level">{{ myUserInfo.levelName }}</text>
                  <text class="dot">·</text>
                  <text class="comment-time">{{ formatTime(item.target.createdAt) }}</text>
                </view>
              </view>
              <view class="comment-badge">
                <text class="comment-icon">↩️</text>
                <text class="comment-text">回复了</text>
              </view>
            </view>

            <!-- 帖子信息 -->
            <view class="post-context" @click="goToPost(item.post.id)">
              <view class="post-content">{{ item.post.content }}</view>
              <view class="post-images" v-if="item.post.imageUrls && item.post.imageUrls.length">
                <image v-for="(img, imgIndex) in item.post.imageUrls" :key="imgIndex" :src="img" mode="aspectFill"
                  @click.stop="previewImage(item.post.imageUrls, imgIndex)" />
              </view>
              <view class="post-stats">
                <text class="stat-item">{{ item.post.likeCount }} 赞</text>
                <text class="stat-item">{{ item.post.commentCount }} 评论</text>
                <text class="stat-item">{{ item.post.viewCount }} 浏览</text>
                <text class="stat-item">{{ item.post.categoryName }}</text>
              </view>
            </view>

            <!-- 被回复的评论 -->
            <view class="reply-context">
              <view class="reply-content">{{ item.comment.content }}</view>
              <view class="reply-stats">
                <text class="stat-item">{{ item.comment.likeCount }} 赞</text>
                <text class="stat-item">{{ item.comment.replyCount }} 回复</text>
              </view>
            </view>

            <!-- 我的回复内容 -->
            <view class="my-comment">
              <view class="comment-content">{{ item.target.content }}</view>
              <view class="comment-stats">
                <text class="stat-item">{{ item.target.likeCount }} 赞</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-if="!isLoading && commentsList.length === 0">
          <text class="empty-icon">💬</text>
          <text class="empty-text">还没有评论记录</text>
          <text class="empty-desc">去发表你的第一条评论吧</text>
        </view>

        <!-- 加载状态 -->
        <view class="loading" v-if="isLoading">加载中...</view>
        <view class="no-more" v-if="noMore && commentsList.length > 0">没有更多了</view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRequest } from '@/api'
import { formatTime } from '@/utils/timeFormat'

const { API_MY_COMMENTS_LIST, API_USER_GET_INFO } = useRequest()

const isLoading = ref(false)
const refreshing = ref(false)
const noMore = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const commentsList = ref([])
const total = ref(0)
const myUserInfo = ref({
  avatar: '/static/logo.jpg',
  nickname: '我',
  levelName: 'Lv.1'
})

// 计算属性：按类型过滤评论记录
const commentList = computed(() => {
  return commentsList.value.filter((item) => item.type === 'comment')
})

const replyList = computed(() => {
  return commentsList.value.filter((item) => item.type === 'reply')
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

// 获取评论列表
const getCommentsList = async (isRefresh = false) => {
  try {
    if (isRefresh) {
      currentPage.value = 1
      noMore.value = false
    }

    if (noMore.value || isLoading.value) return

    isLoading.value = true
    const response = await API_MY_COMMENTS_LIST({
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })

    if (response.status === 0 && response.data) {
      const newList = response.data.list || []
      total.value = response.data.total || 0

      // 处理图片URL和头像URL
      const processedList = newList.map((item) => {
        // 处理帖子图片
        if (item.post && item.post.imageUrls) {
          item.post.imageUrls = processImageUrls(item.post.imageUrls)
        }
        // 处理作者头像
        if (item.author && item.author.avatar) {
          item.author.avatar = processImageUrls([item.author.avatar])[0]
        }
        return item
      })

      if (isRefresh) {
        commentsList.value = processedList
      } else {
        commentsList.value.push(...processedList)
      }

      // 判断是否还有更多数据
      if (newList.length < pageSize.value) {
        noMore.value = true
      } else {
        currentPage.value++
      }
    } else {
      uni.showToast({
        title: response.message || '获取评论列表失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '获取评论列表失败',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  await getCommentsList(true)
  refreshing.value = false
}

// 加载更多
const loadMore = () => {
  if (isLoading.value || noMore.value) return
  getCommentsList()
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

// 预览图片
const previewImage = (images, current) => {
  uni.previewImage({
    urls: images,
    current: images[current]
  })
}

const goBack = () => {
  uni.navigateBack()
}

onMounted(() => {
  getMyUserInfo()
  getCommentsList(true)
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

.comments-container {
  padding: 0 24rpx 100rpx;
}

.comments-list {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;

  .comment-item {
    padding: 24rpx;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
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

          .comment-time {
            color: #8590a6;
          }
        }
      }

      .comment-badge {
        display: flex;
        align-items: center;
        background: #f6f6f6;
        border-radius: 20rpx;
        padding: 8rpx 16rpx;
        margin-left: 16rpx;

        .comment-icon {
          font-size: 24rpx;
          margin-right: 6rpx;
        }

        .comment-text {
          font-size: 24rpx;
          color: #8590a6;
          font-weight: 500;
        }
      }
    }

    .my-comment {
      background: #f8f9fa;
      border-radius: 12rpx;
      padding: 16rpx;
      margin-bottom: 16rpx;

      .comment-content {
        font-size: 28rpx;
        color: #333;
        line-height: 1.6;
        margin-bottom: 12rpx;
      }

      .comment-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 16rpx;

        .stat-item {
          font-size: 22rpx;
          color: #666;
          background: #fff;
          padding: 4rpx 12rpx;
          border-radius: 12rpx;
        }
      }
    }

    .post-context {
      background: #fff;
      border: 1rpx solid #e9ecef;
      border-radius: 12rpx;
      padding: 16rpx;
      margin-bottom: 16rpx;

      .post-content {
        font-size: 26rpx;
        color: #333;
        line-height: 1.5;
        margin-bottom: 12rpx;
      }

      .post-images {
        display: flex;
        flex-wrap: wrap;
        margin-top: 12rpx;
        gap: 8rpx;

        image {
          width: 180rpx;
          height: 180rpx;
          border-radius: 8rpx;
          object-fit: cover;
        }
      }

      .post-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 16rpx;
        margin-top: 12rpx;

        .stat-item {
          font-size: 22rpx;
          color: #666;
          background: #f8f9fa;
          padding: 4rpx 12rpx;
          border-radius: 12rpx;
        }
      }
    }

    .reply-context {
      background: #fff;
      border: 1rpx solid #e9ecef;
      border-radius: 8rpx;
      padding: 12rpx;
      margin-bottom: 12rpx;

      .reply-content {
        font-size: 24rpx;
        color: #333;
        line-height: 1.5;
        margin-bottom: 8rpx;
      }

      .reply-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 12rpx;

        .stat-item {
          font-size: 20rpx;
          color: #666;
          background: #f8f9fa;
          padding: 4rpx 8rpx;
          border-radius: 8rpx;
        }
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 120rpx 24rpx;

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 24rpx;
    display: block;
  }

  .empty-text {
    font-size: 32rpx;
    color: #333;
    margin-bottom: 12rpx;
    display: block;
  }

  .empty-desc {
    font-size: 26rpx;
    color: #999;
    display: block;
  }
}

.loading,
.no-more {
  text-align: center;
  padding: 24rpx;
  color: #999;
  font-size: 24rpx;
}
</style>
