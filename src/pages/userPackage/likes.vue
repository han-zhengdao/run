<template>
  <view class="page-container">
    <!-- 背景图 -->
    <image class="bg-image" src="/static/userbg.png" mode="aspectFill"></image>

    <!-- 页面标题 -->
    <view class="page-header">
      <view class="header-left" @click="goBack">
        <text class="i-carbon-arrow-left text-36rpx text-white"></text>
      </view>
      <text class="page-title">获赞列表</text>
    </view>

    <!-- 滚动区域 -->
    <scroll-view class="scroll-container" scroll-y @scrolltolower="loadMore" refresher-enabled
      @refresherrefresh="onRefresh" :refresher-triggered="refreshing">
      <view class="likes-container">
        <view class="likes-list" v-if="likesList.length > 0">
          <view class="like-item" v-for="(item, index) in likesList" :key="index">
            <!-- 点赞者信息（注意：展示点赞者信息，而非我的信息） -->
            <view class="my-info">
              <image class="avatar" :src="item.liker?.avatar || '/static/logo.jpg'" mode="aspectFill"
                @error="onAvatarError(item)" />
              <view class="user-info">
                <view class="nickname">{{ item.liker?.nickname || '用户' }}</view>
                <view class="meta-info">
                  <text class="level">{{
                    item.liker?.levelName || 'Lv.' + (item.liker?.level || 1)
                    }}</text>
                  <text class="dot">·</text>
                  <text class="like-time">{{ formatTime(item.likeTime) }}</text>
                </view>
              </view>
              <view class="like-badge">
                <text class="like-icon">{{
                  item.type === 'post' ? '👍' : item.type === 'comment' ? '💬' : '↩️'
                  }}</text>
                <text class="like-text">{{
                  item.type === 'post'
                    ? '赞同了'
                    : item.type === 'comment'
                      ? '赞同了评论'
                      : '赞同了回复'
                }}</text>
              </view>
            </view>

            <!-- 不同类型的上下文与被赞内容 -->
            <!-- 文章被赞 -->
            <view class="liked-content post-like" v-if="item.type === 'post'" @click="goToPost(item.target.id)">
              <view class="content-main">
                <text class="content-text">{{ item.target.content }}</text>
                <view class="post-images" v-if="item.target.imageUrls && item.target.imageUrls.length">
                  <image v-for="(img, imgIndex) in item.target.imageUrls" :key="imgIndex"
                    :src="img || '/static/errimg.png'" mode="aspectFill"
                    @click.stop="previewImage(item.target.imageUrls, imgIndex)"
                    @error="handleImageError(item.target.imageUrls, imgIndex)" />
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

            <!-- 评论被赞 -->
            <view class="context-section" v-if="item.type === 'comment' && item.post" @click="goToPost(item.post.id)">
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
            <view class="liked-content comment-like" v-if="item.type === 'comment'" @click="goToPost(item.post?.id)">
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

            <!-- 回复被赞 -->
            <view class="context-section" v-if="item.type === 'reply' && item.post" @click="goToPost(item.post.id)">
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
            <view class="context-section comment-context" v-if="item.type === 'reply' && item.comment"
              @click="goToPost(item.post?.id)">
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
            <view class="liked-content reply-like" v-if="item.type === 'reply'" @click="goToPost(item.post?.id)">
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
        <view class="loading-placeholder" v-else-if="loading">
          <view class="loading-content">
            <view class="loading-icon">
              <text class="loading-text">加载中...</text>
            </view>
          </view>
        </view>
        <view class="error-placeholder" v-else-if="hasError">
          <view class="error-content">
            <view class="error-icon">
              <text class="error-text">⚠️</text>
            </view>
            <text class="error-title">加载失败</text>
            <text class="error-desc">系统暂时无法获取获赞数据</text>
            <view class="error-action">
              <view class="retry-btn" @click="retryGetLikes">
                <text class="btn-icon">🔄</text>
                <text>重新加载</text>
              </view>
            </view>
          </view>
        </view>
        <view class="empty-placeholder" v-else>
          <view class="empty-content">
            <view class="empty-icon">
              <text class="icon-text">👍</text>
            </view>
            <text class="empty-text">还没有收到赞哦</text>
            <text class="empty-desc">去首页发现更多精彩内容吧~</text>
            <view class="empty-action">
              <view class="action-btn" @click="goToHome">
                <text class="btn-icon">🏠</text>
                <text>去首页</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRequest } from '@/api'
import eventBus, { EVENTS } from '@/utils/eventBus'
import { formatTime } from '@/utils/timeFormat'

const loading = ref(false)
const refreshing = ref(false)
const hasError = ref(false)
const likesList = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const hasMore = ref(true)

const { API_USER_LIKES_LIST } = useRequest()

// 将相对路径转为绝对URL
const toAbsoluteUrl = (url) => {
  if (!url || typeof url !== 'string') return url
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${import.meta.env.VITE_APP_API_BASEURL}${url}`
  return url
}

// 头像兜底
const onAvatarError = (item) => {
  if (item && item.liker) {
    item.liker.avatar = '/static/logo.jpg'
  }
}

// 图片错误兜底
const handleImageError = (imageUrls, index) => {
  if (Array.isArray(imageUrls) && index >= 0) {
    imageUrls[index] = '/static/errimg.png'
  }
}

// 预览图片（过滤占位图）
const previewImage = (images, current) => {
  const valid = (images || []).filter((u) => u && u !== '/static/errimg.png')
  if (valid.length === 0) {
    uni.showToast({ title: '暂无可预览图片', icon: 'none' })
    return
  }
  uni.previewImage({ urls: valid, current: valid[current] || valid[0] })
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  currentPage.value = 1
  hasMore.value = true
  getLikesList(false)
}

// 加载更多
const loadMore = () => {
  if (hasMore.value && !loading.value) {
    getLikesList(true)
  }
}

// 获取获赞列表
const getLikesList = async (isLoadMore = false) => {
  try {
    if (!isLoadMore) {
      loading.value = true
      hasError.value = false
    }

    const response = await API_USER_LIKES_LIST({
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })

    if (response.status === 0) {
      const rawList = response.data.list || []
      // 规范URL
      const newList = rawList.map((it) => {
        const liker = it.liker
          ? { ...it.liker, avatar: toAbsoluteUrl(it.liker.avatar) }
          : it.liker
        const target = it.target
          ? {
            ...it.target,
            imageUrls: Array.isArray(it.target.imageUrls)
              ? it.target.imageUrls.map((u) => toAbsoluteUrl(u))
              : []
          }
          : it.target
        const post = it.post
          ? {
            ...it.post,
            imageUrls: Array.isArray(it.post.imageUrls)
              ? it.post.imageUrls.map((u) => toAbsoluteUrl(u))
              : []
          }
          : it.post
        const comment = it.comment || null
        return { ...it, liker, target, post, comment }
      })
      const total = response.data.total || 0

      if (isLoadMore) {
        likesList.value = [...likesList.value, ...newList]
      } else {
        likesList.value = newList
      }

      hasMore.value = newList.length === pageSize.value
      if (hasMore.value) {
        currentPage.value++
      }

      // 同步获赞总数到用户页面
      if (!isLoadMore && total !== undefined) {
        try {
          eventBus.emit(EVENTS.USER_LIKES_COUNT_CHANGED, {
            type: 'set',
            count: total
          })
        } catch (eventError) {
          console.error('事件总线更新失败:', eventError)
        }
      }
    } else {
      throw new Error(response.message || '获取获赞列表失败')
    }
  } catch (error) {
    console.error('获取获赞列表失败:', error)
    hasError.value = true
    uni.showToast({
      title: '获取获赞列表失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    if (refreshing.value) {
      refreshing.value = false
    }
  }
}

// 重试获取获赞列表
const retryGetLikes = () => {
  currentPage.value = 1
  hasMore.value = true
  getLikesList(false)
}

// 获取内容类型图标
const getContentTypeIcon = (type) => {
  const icons = {
    post: '📝',
    comment: '💬',
    reply: '↩️'
  }
  return icons[type] || '👍'
}

// 获取内容类型文本
const getContentTypeText = (type) => {
  const texts = {
    post: '文章',
    comment: '评论',
    reply: '回复'
  }
  return texts[type] || '内容'
}

// 截断内容
const truncateContent = (content, maxLength = 50) => {
  if (!content) return ''
  return content.length > maxLength ? content.substring(0, maxLength) + '...' : content
}

// 跳转到帖子详情
const goToPost = (postId) => {
  uni.navigateTo({
    url: `/pages/detail/detail?id=${postId}`
  })
}

const goBack = () => {
  uni.navigateBack()
}

const goToHome = () => {
  uni.switchTab({
    url: '/pages/index/index'
  })
}

onMounted(() => {
  getLikesList()
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

.likes-container {
  padding: 0 24rpx 100rpx;
}

.likes-list {
  background: #fff;
  border-radius: 20rpx;
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

          image {
            width: 180rpx;
            height: 180rpx;
            border-radius: 8rpx;
            object-fit: cover;
          }
        }
      }

      .content-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .stats {
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

        .category-tag {
          font-size: 20rpx;
          color: #8590a6;
          background: #f6f6f6;
          padding: 4rpx 12rpx;
          border-radius: 12rpx;
        }
      }

      &.comment-like {
        border-left-color: #52c41a;
      }

      &.reply-like {
        border-left-color: #fa8c16;
      }
    }
  }
}

.loading-placeholder,
.error-placeholder,
.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 40rpx;
  text-align: center;
  min-height: 60vh;

  .loading-content,
  .error-content,
  .empty-content {

    .loading-icon,
    .error-icon,
    .empty-icon {
      margin-bottom: 40rpx;

      .loading-text,
      .error-text,
      .icon-text {
        font-size: 120rpx;
        opacity: 0.8;
      }
    }

    .error-title,
    .empty-text {
      font-size: 32rpx;
      color: #333;
      margin-bottom: 20rpx;
      font-weight: 500;
    }

    .error-desc,
    .empty-desc {
      font-size: 26rpx;
      color: #999;
      margin-bottom: 60rpx;
      line-height: 1.5;
      max-width: 400rpx;
    }

    .error-action,
    .empty-action {

      .retry-btn,
      .action-btn {
        display: inline-flex;
        align-items: center;
        padding: 20rpx 40rpx;
        background: #1da1f2;
        color: #fff;
        border-radius: 50rpx;
        font-size: 28rpx;
        box-shadow: 0 8rpx 20rpx rgba(29, 161, 242, 0.3);

        .btn-icon {
          margin-right: 12rpx;
          font-size: 32rpx;
        }
      }
    }
  }
}
</style>
