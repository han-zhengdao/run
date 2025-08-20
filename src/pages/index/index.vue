<template>
  <!-- 内容区域 -->
  <view class="content-wrapper">
    <!-- 横向滑动分类导航 -->
    <view class="category-bar">
      <view class="nav-header">
        <image class="nav-logo" src="/static/logo.jpg" mode="aspectFit"></image>
        <text class="nav-title">润邻生活圈</text>
      </view>
      <scroll-view scroll-x show-scrollbar="false" class="category-scroll"
        :scroll-into-view="'category-' + activeCategory" scroll-with-animation>
        <view v-for="cat in categories" :key="cat.id" :id="'category-' + cat.id"
          :class="['category-item', cat.id === activeCategory ? 'active' : '']" @click="switchCategory(cat.id)">
          {{ cat.name }}
        </view>
      </scroll-view>
    </view>

    <!-- 内容区：推特/知乎风格 -->
    <swiper class="feed-swiper" :current="getSwiperIndex(activeCategory)" @change="handleSwiperChange" :duration="300">
      <swiper-item v-for="cat in categories" :key="cat.id">
        <scroll-view scroll-y class="feed-list" @scrolltolower="() => loadMore(cat.id)" :refresher-enabled="true"
          :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh">
          <!-- 广告栏 -->
          <view class="ad-banner" v-if="adStatus[cat.id] && adList[cat.id]?.length">
            <view class="close-btn" @click="closeAd(cat.id)">
              <text class="i-carbon-close text-24rpx" />
            </view>
            <swiper class="ad-swiper" :indicator-dots="false" :autoplay="true" :interval="3000" :duration="500"
              circular>
              <swiper-item v-for="ad in adList[cat.id]" :key="ad.id">
                <image :src="ad.image" mode="aspectFill" class="ad-image" @click="handleAdClick(ad)" />
              </swiper-item>
            </swiper>
          </view>

          <view class="feed-item" v-for="item in getCategoryList(cat.id)" :key="item.id">
            <view class="feed-header">
              <image class="avatar" :src="item.avatar" @click.stop="goToUserProfile(item)"
                @error="handleAvatarError(item)" />
              <view class="user-info" @click.stop="goToUserProfile(item)">
                <view class="nickname">
                  {{ item.nickname }}<text class="level">{{ item.level }}</text>
                </view>
                <view class="time">{{ item.time }}</view>
              </view>
            </view>
            <view class="feed-content" @click="goToPostDetail(item)">
              <view :class="['content-text', item.showFullContent ? 'expanded' : 'collapsed']">
                {{ item.content }}
              </view>
              <view v-if="item.content && item.content.length > 100 && !item.showFullContent" class="show-more"
                @click.stop="toggleContent(item)">
                显示更多
              </view>
            </view>
            <view v-if="item.images && item.images.length" class="feed-images">
              <image v-for="(img, idx) in item.images" :key="idx" :src="img" class="feed-img" mode="aspectFit"
                @click.stop="previewImage(item.images, idx)" @error="handleImageError(item, idx)" />
            </view>
            <view class="feed-footer">
              <view class="footer-item" @click="goToPostDetail(item)">
                <text class="i-carbon-chat text-32rpx mr-2" />
                <text>{{ item.comments }}</text>
              </view>
              <view class="footer-item">
                <text class="i-carbon-view text-32rpx mr-2" />
                <text>{{ item.views }}</text>
              </view>
              <view class="footer-item" @click.stop="handleLike(item)">
                <text :class="['i-carbon-favorite text-32rpx mr-2', item.isLiked ? 'liked' : '']" />
                <text>{{ item.likes }}</text>
              </view>
              <view class="footer-item" @click.stop="handleReport(item)">
                <text class="i-carbon-overflow-menu-horizontal text-32rpx" />
              </view>
            </view>
            <view class="divider"></view>
          </view>

          <!-- 没有更多数据提示 -->
          <view v-if="getCategoryList(cat.id)?.length > 0 && !hasMoreData[cat.id]" class="no-more-data">
            <text class="no-more-text">没有更多内容了</text>
          </view>
        </scroll-view>
      </swiper-item>
    </swiper>
  </view>
  <!-- 悬浮发帖按钮 -->
  <view class="publish-btn" @click="goToPost">
    <text class="i-carbon-edit text-32rpx" />
  </view>
</template>

<script setup>
// 引入API和必要的组件
import { ref, onMounted, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useRequest } from '@/api'
import { handleLikeAction } from '@/utils/likeUtils'
import {
  formatRelativeTime,
  formatUserLevel,
  getAvatarUrl,
  formatNickname
} from '@/utils/timeFormat'
import { checkAuthAndRedirect } from '@/utils/auth'

const { API_POST_GET_LIST, API_ARTICLE_GET_CATEGORIES, API_USER_GET_INFO } = useRequest()

// 状态定义
const categories = ref([])
const activeCategory = ref(0)
const postList = ref({})
const isRefreshing = ref(false)
const loading = ref({})
const pageNum = ref({})
const pageSize = ref(10)
const hasMoreData = ref({}) // 记录每个分类是否还有更多数据
const currentUserId = ref(null) // 当前用户ID

// 广告相关状态
const adStatus = ref({})
const adList = ref({})

// 默认图片路径
const defaultAvatar = '/static/errimg.png'
const defaultImage = '/static/errimg.png'

// 获取文章的准确评论总数（包含回复数）
const getAccurateCommentCount = async (articleId) => {
  try {
    const { API_COMMENT_GET_LIST } = useRequest()
    const response = await API_COMMENT_GET_LIST({
      articleId,
      pageNum: 1,
      pageSize: 1 // 只需要获取总数，不需要具体数据
    })

    if (response.status === 0) {
      return response.data.total || 0
    }
  } catch (error) {
    console.log(`获取文章${articleId}的评论总数失败:`, error.message)
  }
  return 0
}

// 异步更新评论数
const updateCommentCounts = async (categoryId) => {
  const articles = postList.value[categoryId] || []
  const articlesToUpdate = articles.filter((article) => article.needsCommentUpdate)

  if (articlesToUpdate.length === 0) return

  // 批量更新评论数，避免同时发起太多请求
  for (const article of articlesToUpdate) {
    try {
      const accurateCount = await getAccurateCommentCount(article.id)
      // 更新文章的评论数
      article.comments = accurateCount
      article.needsCommentUpdate = false
    } catch (error) {
      console.log(`更新文章${article.id}评论数失败:`, error.message)
    }
    // 添加小延迟避免请求过于频繁
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}

// 获取文章列表
const getPostList = async (categoryId = activeCategory.value) => {
  try {
    loading.value = { ...loading.value, [categoryId]: true }

    // 构建API请求参数
    const params = {
      pageNum: pageNum.value[categoryId] || 1,
      pageSize: 10,
      state: 1 // 只获取已发布的文章
    }

    // 如果不是全部分类，添加分类筛选
    if (categoryId !== 0) {
      params.cate_id = categoryId
    }

    const res = await API_POST_GET_LIST(params)

    if (res.status === 0) {
      // 转换文章数据格式
      const newArticles = res.data.articles.map((item) => ({
        id: item.id,
        avatar: getAvatarUrl(item.user_avatar),
        nickname: formatNickname(item.user_nickname, item.user_id),
        level: formatUserLevel(item.user_level),
        time: formatRelativeTime(item.created_at),
        content: item.content,
        images: (item.image_urls || []).map((url) => {
          // 如果是相对路径，转换为绝对路径
          if (url && url.startsWith('/')) {
            return `${import.meta.env.VITE_APP_API_BASEURL}${url}`
          }
          return url
        }),
        likes: item.like_count || 0,
        views: item.view_count || 0,
        comments: item.total_comment_count || item.comment_count || 0, // 优先使用包含回复数的总数
        isLiked: item.is_liked || false,

        userId: item.user_id,
        showFullContent: false,
        needsCommentUpdate: !item.total_comment_count // 标记是否需要更新评论数
      }))

      // 初始化分类列表
      if (!postList.value[categoryId]) {
        postList.value[categoryId] = []
      }

      const currentPageNum = pageNum.value[categoryId] || 1

      if (currentPageNum === 1) {
        // 第一页：直接替换数据
        postList.value = { ...postList.value, [categoryId]: newArticles }
      } else {
        // 后续页：追加数据，过滤重复项
        const existingIds = new Set(postList.value[categoryId].map((item) => item.id))
        const uniqueNewArticles = newArticles.filter((item) => !existingIds.has(item.id))
        postList.value = {
          ...postList.value,
          [categoryId]: [...postList.value[categoryId], ...uniqueNewArticles]
        }
      }

      // 根据API文档计算是否还有更多数据
      // 使用API返回的pagenum和total进行计算
      const totalPages = Math.ceil(res.data.total / res.data.pagesize)
      const hasMore = res.data.pagenum < totalPages

      hasMoreData.value = { ...hasMoreData.value, [categoryId]: hasMore }

      // 异步更新需要获取准确评论数的文章
      updateCommentCounts(categoryId)
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
    uni.showToast({
      title: '获取文章列表失败',
      icon: 'none'
    })
  } finally {
    loading.value = { ...loading.value, [categoryId]: false }
    isRefreshing.value = false
  }
}

// 下拉刷新
const onRefresh = async () => {
  isRefreshing.value = true
  pageNum.value = { ...pageNum.value, [activeCategory.value]: 1 }
  await getPostList(activeCategory.value)
}

// 加载更多
const loadMore = async (categoryId) => {
  if (loading.value[categoryId]) {
    return
  }

  // 如果没有更多数据，直接返回
  if (hasMoreData.value[categoryId] === false) {
    return
  }

  // 初始化或递增页码
  if (!pageNum.value[categoryId]) {
    pageNum.value = { ...pageNum.value, [categoryId]: 1 }
  }

  // 递增页码加载下一页
  pageNum.value = { ...pageNum.value, [categoryId]: (pageNum.value[categoryId] || 1) + 1 }

  await getPostList(categoryId)
}

// 切换分类
const switchCategory = (id) => {
  activeCategory.value = id

  // 确保页码正确初始化
  if (!pageNum.value[id]) {
    pageNum.value = { ...pageNum.value, [id]: 1 }
  }

  // 初始化hasMoreData状态
  if (hasMoreData.value[id] === undefined) {
    hasMoreData.value = { ...hasMoreData.value, [id]: true }
  }

  // 如果该分类没有数据，则加载数据
  if (!postList.value[id] || postList.value[id].length === 0) {
    getPostList(id)
  }
}

// 获取当前分类的文章列表
const getCategoryList = (categoryId) => {
  return postList.value[categoryId] || []
}

// 获取轮播图索引
const getSwiperIndex = (categoryId) => {
  return categories.value.findIndex((cat) => cat.id === categoryId)
}

// 处理轮播图切换
const handleSwiperChange = (e) => {
  const index = e.detail.current
  activeCategory.value = categories.value[index].id
}

// 跳转到文章详情
const goToPostDetail = (item) => {
  uni.navigateTo({
    url: `/pages/detail/detail?id=${item.id}`
  })
}

// 处理点赞
const handleLike = async (item) => {
  // 检查是否已登录
  if (!checkAuthAndRedirect('点赞需要先登录')) {
    return
  }

  try {
    const { API_POST_LIKE } = useRequest()
    const response = await API_POST_LIKE(item.id)

    if (response.status === 0) {
      // 根据接口返回的状态更新UI
      item.isLiked = response.data.isLiked
      item.likes += response.data.isLiked ? 1 : -1

      // 如果是当前用户的帖子被点赞，更新获赞数
      try {
        if (typeof handleLikeAction === 'function') {
          handleLikeAction(response.data.isLiked, item)
        }
      } catch (actionError) {
        // 静默处理错误
      }

      uni.showToast({
        title: response.message,
        icon: 'none'
      })
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    uni.showToast({
      title: '操作失败：' + error.message,
      icon: 'none'
    })
  }
}

// 跳转到发帖页面
const goToPost = () => {
  // 检查是否已登录
  if (!checkAuthAndRedirect('发帖需要先登录')) {
    return
  }

  uni.navigateTo({
    url: '/pages/post/post'
  })
}

// 关闭广告
const closeAd = (categoryId) => {
  adStatus.value[categoryId] = false
}

// 处理广告点击
const handleAdClick = (ad) => {
  // TODO: 记录广告点击
  console.log('广告点击:', ad)
}

// 跳转到用户资料页
const goToUserProfile = (item) => {
  uni.navigateTo({
    url: `/pages/userPackage/userProfile?userId=${item.userId}`
  })
}

// 预览图片
const previewImage = (images, current) => {
  uni.previewImage({
    urls: images,
    current
  })
}

// 切换内容显示状态
const toggleContent = (item) => {
  item.showFullContent = !item.showFullContent
}

// 处理举报
const reportedItems = ref(new Set()) // 用于存储已举报的帖子ID

const handleReport = async (item) => {
  // 检查是否已登录
  if (!checkAuthAndRedirect('举报需要先登录')) {
    return
  }

  const reportKey = `post_${item.id}`
  if (reportedItems.value.has(reportKey)) {
    uni.showToast({
      title: '您已举报过此内容',
      icon: 'none'
    })
    return
  }

  uni.showActionSheet({
    itemList: ['内容违规', '垃圾信息', '其他'],
    success: async (res) => {
      const reasonOptions = ['内容违规', '垃圾信息', '其他']
      const reason = reasonOptions[res.tapIndex]

      try {
        const { API_REPORT } = useRequest()
        const response = await API_REPORT({
          target_type: 'post',
          target_id: item.id,
          reason
        })

        if (response.status === 0) {
          uni.showToast({
            title: '举报成功',
            icon: 'success'
          })
          reportedItems.value.add(reportKey) // 标记为已举报
        } else {
          uni.showToast({
            title: response.message || '举报失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('举报失败:', error)
        uni.showToast({
          title: '举报失败，请稍后再试',
          icon: 'none'
        })
      }
    },
    fail: (err) => {
      console.log('取消举报', err)
    }
  })
}

// 获取分类列表
const getCategories = async () => {
  try {
    const res = await API_ARTICLE_GET_CATEGORIES()
    if (res.status === 0) {
      // 检查是否已经存在"全部"分类，避免重复添加
      const hasAllCategory = res.data.some((cat) => cat.name === '全部')
      if (hasAllCategory) {
        categories.value = res.data
      } else {
        // 只有当不存在"全部"分类时才添加
        categories.value = [{ id: 0, name: '全部' }, ...res.data]
      }
    } else {
      console.error('获取分类失败:', res.message)
    }
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

// 页面加载时获取分类列表和文章列表
onMounted(async () => {
  // 获取分类列表（不需要登录也可访问）
  await getCategories()

  // 尝试获取当前用户信息（需要登录）
  try {
    const userRes = await API_USER_GET_INFO()
    if (userRes.status === 0 && userRes.data) {
      currentUserId.value = userRes.data.id
    }
  } catch (error) {
    // 如果获取用户信息失败，说明可能没有登录
    // 这里不做处理，因为首页可以在未登录状态下浏览
    console.warn('获取用户信息失败，可能未登录:', error)
  }

  // 确保有分类数据后再设置默认分类
  if (categories.value.length > 0) {
    // 设置默认分类为第一个分类
    activeCategory.value = categories.value[0].id
  }

  // 初始化默认分类的页码和hasMoreData状态
  pageNum.value = { ...pageNum.value, [activeCategory.value]: 1 }
  hasMoreData.value = { ...hasMoreData.value, [activeCategory.value]: true }
  getPostList(activeCategory.value)

  // 监听发布成功后的刷新事件
  uni.$on('refreshHomePage', () => {
    onRefresh()
  })
})

// 页面卸载时移除事件监听
onUnmounted(() => {
  uni.$off('refreshHomePage')
})

// 页面显示时触发
onShow(() => {
  // 每次页面显示时刷新数据，确保浏览量等实时更新
  onRefresh()
})

// 处理头像加载失败
const handleAvatarError = (item) => {
  if (item) {
    item.avatar = defaultAvatar
  }
}

// 处理帖子图片加载失败
const handleImageError = (item, index) => {
  if (item && item.images && item.images[index]) {
    item.images[index] = defaultImage
  }
}
</script>

<style lang="scss">
page,
html,
body,
#app {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  position: relative;
}

.content-wrapper {
  position: relative;
  z-index: 1;
}

.category-bar {
  width: 100vw;
  max-width: 100vw;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1rpx solid #eee;
  padding-top: var(--status-bar-height);

  .nav-header {
    height: 135rpx;
    display: flex;
    align-items: center;
    padding: 45rpx 24rpx 0rpx;
    background: #fff;

    .nav-logo {
      width: 48rpx;
      height: 48rpx;
      margin-right: 12rpx;
      border-radius: 50%;
      overflow: hidden;
    }

    .nav-title {
      font-size: 34rpx;
      font-weight: 500;
      color: #333;
    }
  }

  .category-scroll {
    width: 100%;
    white-space: nowrap;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 60rpx;
      background: linear-gradient(to right, transparent, #fff);
      pointer-events: none;
    }
  }

  .category-item {
    display: inline-block;
    padding: 18rpx 24rpx 0 24rpx;
    margin-right: 8rpx;
    font-size: 30rpx;
    color: #9095a2;
    font-weight: 700;
    background: none;
    border-radius: 0;
    box-shadow: none;
    cursor: pointer;
    position: relative;
    transition: all 0.3s ease;

    &:last-child {
      margin-right: 0;
    }

    &::after {
      content: '';
      display: block;
      margin: 0 auto;
      margin-top: 8rpx;
      width: 0;
      height: 6rpx;
      background: #1da1f2;
      border-radius: 3rpx;
      transition: all 0.3s ease;
      opacity: 0;
    }

    &.active {
      color: #222;
      font-weight: 700;
      transform: scale(1.05);

      &::after {
        width: 80%;
        opacity: 1;
      }
    }
  }
}

.feed-item,
.feed-header,
.feed-content,
.feed-images {
  max-width: 100%;
  box-sizing: border-box;
}

.feed-list {
  padding: 0 0 24rpx 0;

  .feed-item {
    padding: 32rpx 24rpx 0 24rpx;
    background: #fff;
    min-height: 200rpx;
    /* 设置固定的最小高度，类似推特 */
    display: flex;
    flex-direction: column;

    .feed-header {
      display: flex;
      align-items: center;

      .avatar {
        width: 72rpx;
        height: 72rpx;
        border-radius: 50%;
        margin-right: 18rpx;
        border: 1rpx solid #eee;
      }

      .user-info {
        flex: 1;

        .nickname {
          font-size: 30rpx;
          font-weight: 500;
          color: #222;

          .level {
            font-size: 30rpx;
            color: #ff9800;
            margin-left: 8rpx;
          }
        }

        .time {
          font-size: 24rpx;
          color: #bbb;
          margin-top: 4rpx;
        }
      }
    }

    .feed-content {
      font-size: 30rpx;
      color: #222;
      margin: 18rpx 0 10rpx 0;
      line-height: 1.6;

      .content-text {
        &.collapsed {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          overflow: hidden;
          text-overflow: ellipsis;
          max-height: 144rpx;
          /* 3行文字的高度 */
        }

        &.expanded {
          /* 展开状态不限制高度 */
          overflow: visible;
          -webkit-line-clamp: unset;
        }
      }

      .show-more {
        color: #1da1f2;
        font-size: 28rpx;
        margin-top: 8rpx;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .feed-images {
      display: flex;
      gap: 12rpx;
      margin-bottom: 10rpx;

      .feed-img {
        width: 180rpx;
        height: 180rpx;
        border-radius: 10rpx;
        object-fit: cover;
      }
    }

    .feed-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 30rpx 0 0 0;
      padding: 0 20rpx;

      .footer-item {
        display: flex;
        align-items: center;
        font-size: 26rpx;
        color: #888;
        cursor: pointer;
        padding: 8rpx 12rpx;
        border-radius: 20rpx;
        transition: all 0.2s ease;

        &:hover {
          background: #f5f5f5;
        }

        &:active {
          color: #000;
        }

        .liked {
          color: #ff0059;
        }
      }
    }

    .divider {
      height: 1rpx;
      background: #f0f0f0;
      margin: 32rpx 0 0 0;
      width: 100%;
    }
  }
}

view,
image,
text {
  max-width: 100vw;
  box-sizing: border-box;
}

.feed-list,
.feed-item,
.feed-images {
  overflow-x: hidden;
}

.feed-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  padding: 10rpx 0;

  .feed-img {
    width: 220rpx;
    height: 220rpx;
    border-radius: 8rpx;
  }
}

.feed-swiper {
  height: calc(100vh - var(--status-bar-height) - 180rpx);
}

.feed-list {
  height: 100%;
}

.ad-banner {
  width: 100%;
  height: 220rpx;
  background: #fff;
  margin-bottom: 10rpx;
  position: relative;

  .close-btn {
    position: absolute;
    right: 20rpx;
    top: 20rpx;
    width: 40rpx;
    height: 40rpx;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    color: #fff;
  }

  .ad-swiper {
    width: 100%;
    height: 100%;
  }

  .ad-image {
    width: 100%;
    height: 100%;
  }
}

.publish-btn {
  position: fixed;
  right: 32rpx;
  bottom: 120rpx;
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #a548fd 0%, #2994ff 100%, #0000cd 50%);
  box-shadow: 0 4rpx 16rpx rgba(30, 144, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 48rpx;
  z-index: 100;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.95);
    box-shadow: 0 2rpx 8rpx rgba(30, 144, 255, 0.2);
  }

  &::after {
    content: '';
    position: absolute;
    top: -4rpx;
    left: -4rpx;
    right: -4rpx;
    bottom: -4rpx;
    border-radius: 50%;
    background: linear-gradient(135deg,
        rgba(138, 43, 226, 0.2) 0%,
        rgba(30, 144, 255, 0.2) 50%,
        rgba(0, 0, 205, 0.2) 100%);
    z-index: -1;
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }

  50% {
    transform: scale(1.1);
    opacity: 0.4;
  }

  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

.no-more-data {
  padding: 60rpx 0;
  text-align: center;

  .no-more-text {
    font-size: 26rpx;
    color: #999;
    position: relative;

    &::before,
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 80rpx;
      height: 1rpx;
      background: #e0e0e0;
    }

    &::before {
      left: -100rpx;
    }

    &::after {
      right: -100rpx;
    }
  }
}
</style>
