<template>
  <view class="page-container">
    <!-- 背景图 -->
    <image class="bg-image" src="/static/userbg.png" mode="aspectFill"></image>

    <!-- 页面标题 -->
    <view class="page-header">
      <view class="header-left" @click="goBack">
        <text class="i-carbon-arrow-left text-36rpx text-white"></text>
      </view>
      <text class="page-title">我的帖子</text>
    </view>

    <!-- 滚动区域 -->
    <scroll-view class="scroll-container" scroll-y @scrolltolower="loadMore" refresher-enabled
      @refresherrefresh="onRefresh" :refresher-triggered="refreshing">
      <view class="posts-container">
        <view class="posts-list">
          <view class="post-item" v-for="item in postsList" :key="item.id">
            <view class="post-header">
              <image class="avatar" :src="item.user_avatar || '/static/logo.jpg'" mode="aspectFill" />
              <view class="user-info">
                <view class="nickname">{{ item.user_nickname || '我' }}</view>
                <view class="post-time">{{ formatTime(item.created_at) }}</view>
              </view>
            </view>
            <view class="post-content" @click="goToPost(item.id)">
              <text>{{ item.content }}</text>
              <view class="post-images" v-if="item.image_urls && item.image_urls.length">
                <image v-for="(img, imgIndex) in item.image_urls" :key="imgIndex" :src="img || '/static/errimg.png'"
                  mode="aspectFill" @click.stop="previewImage(item.image_urls, imgIndex)"
                  @error="handleImageError(item.image_urls, imgIndex)" />
              </view>
            </view>
            <view class="post-stats">
              <view class="stat-item">
                <text class="i-carbon-favorite text-28rpx mr-2" :class="item.isLiked ? 'liked' : ''" />
                <text>{{ item.like_count || 0 }}</text>
              </view>
              <view class="stat-item">
                <text class="i-carbon-view text-28rpx mr-2" />
                <text>{{ item.view_count || 0 }}</text>
              </view>
              <view class="stat-item">
                <text class="i-carbon-chat text-28rpx mr-2" />
                <text>{{ item.comment_count || 0 }}</text>
              </view>
              <view class="stat-item">
                <text class="i-carbon-category text-28rpx mr-2" />
                <text>{{ item.cate_name || '未分类' }}</text>
              </view>
              <!-- 三点按钮 -->
              <view class="more-actions" @click="showArticleActionMenu(item)">
                <text class="three-dots">⋮</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载状态 -->
        <view class="loading" v-if="isLoading">加载中...</view>
        <view class="no-more" v-if="noMore && postsList.length > 0">没有更多了</view>
        <view class="empty-state" v-if="!isLoading && postsList.length === 0">
          <text class="i-carbon-document text-80rpx text-gray-300"></text>
          <text class="empty-text">还没有发布过文章</text>
          <button class="btn-publish" @click="goToPublish">发布第一篇文章</button>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作菜单 -->
    <view class="action-modal" v-if="showActionMenu" @click="hideActionMenu">
      <view class="action-content" @click.stop>
        <view class="action-item" @click="shareArticle(currentArticle)">
          <text class="i-carbon-share text-32rpx mr-2"></text>
          <text>分享</text>
        </view>
        <view class="action-item delete-item" @click="deleteArticle(currentArticle)">
          <text class="i-carbon-trash-can text-32rpx mr-2 text-red-500"></text>
          <text class="text-red-500">删除</text>
        </view>
        <view class="action-cancel" @click="hideActionMenu">
          <text>取消</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRequest } from '@/api'
import { formatTime } from '@/utils/timeFormat'

const isLoading = ref(false)
const noMore = ref(false)
const refreshing = ref(false)
const postsList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const showActionMenu = ref(false)
const currentArticle = ref(null)

const { API_MY_ARTICLES_GET_LIST, API_MY_ARTICLE_DELETE } = useRequest()

// 将相对路径转换为绝对URL
const toAbsoluteUrl = (url) => {
  if (!url) return url
  if (typeof url !== 'string') return url
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${import.meta.env.VITE_APP_API_BASEURL}${url}`
  return url
}

// 处理帖子图片错误，设置为默认占位图
const handleImageError = (imageUrls, index) => {
  if (imageUrls && imageUrls[index] !== undefined) {
    imageUrls[index] = '/static/errimg.png'
  }
}

onMounted(() => {
  loadMyArticles()
})

// 获取我的文章列表
const loadMyArticles = async (isRefresh = false) => {
  if (isLoading.value) return

  if (isRefresh) {
    currentPage.value = 1
    noMore.value = false
  }

  isLoading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }

    const response = await API_MY_ARTICLES_GET_LIST(params)

    if (response.status === 0) {
      const { articles, total } = response.data

      // 规范化图片与头像URL
      const normalized = (articles || []).map((a) => ({
        ...a,
        user_avatar: a.user_avatar ? toAbsoluteUrl(a.user_avatar) : a.user_avatar,
        image_urls: Array.isArray(a.image_urls) ? a.image_urls.map((u) => toAbsoluteUrl(u)) : []
      }))

      if (isRefresh) {
        postsList.value = normalized
      } else {
        postsList.value = [...postsList.value, ...normalized]
      }

      noMore.value = currentPage.value * pageSize.value >= total
      currentPage.value++
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('获取我的文章失败:', error)
    uni.showToast({
      title: '获取文章失败：' + error.message,
      icon: 'none'
    })
  } finally {
    isLoading.value = false
    if (refreshing.value) {
      refreshing.value = false
    }
  }
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  loadMyArticles(true)
}

// 加载更多
const loadMore = () => {
  if (!noMore.value && !isLoading.value) {
    loadMyArticles()
  }
}

// 显示操作菜单
const showArticleActionMenu = (article) => {
  currentArticle.value = article
  showActionMenu.value = true
}

// 隐藏操作菜单
const hideActionMenu = () => {
  showActionMenu.value = false
  currentArticle.value = null
}

// 分享文章
const shareArticle = (article) => {
  hideActionMenu()
  uni.showToast({
    title: '分享功能开发中',
    icon: 'none'
  })
}

// 删除文章
const deleteArticle = async (article) => {
  hideActionMenu()

  uni.showModal({
    title: '确认删除',
    content: '确定要删除这篇文章吗？删除后无法恢复。',
    confirmText: '删除',
    confirmColor: '#ff4757',
    success: async (res) => {
      if (res.confirm) {
        try {
          const response = await API_MY_ARTICLE_DELETE(article.id)

          if (response.status === 0) {
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
            // 从列表中移除该文章
            const index = postsList.value.findIndex((item) => item.id === article.id)
            if (index > -1) {
              postsList.value.splice(index, 1)
            }
          } else {
            throw new Error(response.message)
          }
        } catch (error) {
          console.error('删除文章失败:', error)
          uni.showToast({
            title: '删除失败：' + error.message,
            icon: 'none'
          })
        }
      }
    }
  })
}

const goBack = () => {
  uni.navigateBack()
}

const goToPost = (postId) => {
  uni.navigateTo({
    url: `/pages/detail/detail?id=${postId}`
  })
}

const goToPublish = () => {
  uni.navigateTo({
    url: '/pages/post/post'
  })
}

const previewImage = (images, current) => {
  // 过滤掉占位图
  const validImages = (images || []).filter((u) => u && u !== '/static/errimg.png')
  if (validImages.length === 0) {
    uni.showToast({ title: '暂无可预览图片', icon: 'none' })
    return
  }
  uni.previewImage({
    urls: validImages,
    current: validImages[current] || validImages[0]
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
  border-radius: 20rpx;
  overflow: hidden;

  .post-item {
    padding: 24rpx;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .post-header {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16rpx;

      .avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        margin-right: 20rpx;
        flex-shrink: 0;
      }

      .user-info {
        flex: 1;

        .nickname {
          font-size: 28rpx;
          color: #333;
          margin-bottom: 4rpx;
          font-weight: 500;
        }

        .post-time {
          font-size: 24rpx;
          color: #999;
          margin-bottom: 4rpx;
        }

        .post-status {
          display: inline-block;
          padding: 4rpx 12rpx;
          border-radius: 12rpx;
          font-size: 22rpx;

          &.published {
            background: #e8f5e8;
            color: #52c41a;
          }

          &.draft {
            background: #fff7e6;
            color: #fa8c16;
          }
        }
      }
    }

    .post-content {
      margin-bottom: 16rpx;

      text {
        font-size: 28rpx;
        color: #333;
        line-height: 1.6;
      }

      .post-images {
        display: flex;
        flex-wrap: wrap;
        margin-top: 16rpx;
        gap: 8rpx;

        image {
          width: 220rpx;
          height: 220rpx;
          border-radius: 12rpx;
          object-fit: cover;
        }
      }
    }

    .post-stats {
      display: flex;
      gap: 40rpx;
      align-items: center;
      margin-top: 20rpx;
      position: relative;

      .stat-item {
        display: flex;
        align-items: center;
        font-size: 24rpx;
        color: #888;

        .liked {
          color: #1da1f2;
        }
      }

      .more-actions {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        padding: 10rpx;
        margin-left: 20rpx;

        .three-dots {
          font-size: 36rpx;
          color: #666;
          font-weight: bold;
        }
      }
    }
  }
}

.loading,
.no-more {
  text-align: center;
  padding: 24rpx;
  color: #999;
  font-size: 24rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  text-align: center;

  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin: 20rpx 0 40rpx 0;
  }

  .btn-publish {
    background: #1da1f2;
    color: #fff;
    border: none;
    border-radius: 50rpx;
    padding: 20rpx 40rpx;
    font-size: 28rpx;
  }
}

.action-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;

  .action-content {
    background: #fff;
    width: 100%;
    border-radius: 20rpx 20rpx 0 0;
    padding: 40rpx 24rpx;

    .action-item {
      display: flex;
      align-items: center;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      font-size: 28rpx;
      color: #333;

      &:last-child {
        border-bottom: none;
      }

      &.delete-item {
        border-bottom: none;
      }
    }

    .action-cancel {
      text-align: center;
      padding: 24rpx 0;
      margin-top: 20rpx;
      border-top: 1rpx solid #f0f0f0;
      font-size: 28rpx;
      color: #666;
    }
  }
}
</style>
