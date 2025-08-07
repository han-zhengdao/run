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
              <image class="avatar" :src="item.avatar" @click.stop="goToUserProfile(item)" />
              <view class="user-info" @click.stop="goToUserProfile(item)">
                <view class="nickname">
                  {{ item.nickname }}<text class="level">{{ item.level }}</text>
                </view>
                <view class="time">{{ item.time }}</view>
              </view>
              <view :class="['follow-btn', item.isFollowed ? 'followed' : '']" @click.stop="handleFollow(item)">
                <text>{{ item.isFollowed ? '已关注' : '关注' }}</text>
              </view>
            </view>
            <view class="feed-content" @click="goToPostDetail(item)">{{ item.content }}</view>
            <view v-if="item.images && item.images.length" class="feed-images">
              <image v-for="(img, idx) in item.images" :key="idx" :src="img" class="feed-img" mode="aspectFit"
                @click.stop="previewImage(item.images, idx)" />
            </view>
            <view class="feed-footer">
              <view class="footer-item" @click.stop="handleLike(item)">
                <text :class="['i-carbon-favorite text-32rpx mr-2', item.isLiked ? 'liked' : '']" />
                <text>{{ item.likes }}</text>
              </view>
              <view class="footer-item">
                <text class="i-carbon-view text-32rpx mr-2" />
                <text>{{ item.views }}</text>
              </view>
              <view class="footer-item" @click="goToPostDetail(item)">
                <text class="i-carbon-chat text-32rpx mr-2" />
                <text>{{ item.comments }}</text>
              </view>
            </view>
            <view class="divider"></view>
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
// 引入API和必要的组件<script setup>
import { ref, onMounted } from 'vue'
import { useRequest } from '@/api'
import { formatRelativeTime, formatUserLevel, getAvatarUrl, formatNickname } from '@/utils/timeFormat'

const { API_POST_GET_LIST, API_ARTICLE_GET_CATEGORIES } = useRequest()

// 状态定义
const categories = ref([{ id: 0, name: '全部' }])
const activeCategory = ref(0)
const postList = ref([])
const isRefreshing = ref(false)
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)

// 广告相关状态
const adStatus = ref({})
const adList = ref({})

// 获取文章列表
const getPostList = async () => {
  try {
    loading.value = true
    const res = await API_POST_GET_LIST({
      pagenum: pageNum.value,
      pagesize: pageSize.value
    })
    if (res.status === 0) {
      const newArticles = res.data.articles.map((item) => ({
        id: item.id,
        avatar: getAvatarUrl(item.user_avatar),
        nickname: formatNickname(item.user_nickname, item.user_id),
        level: formatUserLevel(item.user_level),
        time: formatRelativeTime(item.created_at),
        content: item.content,
        images: item.image_urls || [],
        likes: item.like_count || 0,
        views: item.view_count || 0,
        comments: item.comment_count || 0,
        isLiked: false
      }))
      
      if (pageNum.value === 1) {
        postList.value = newArticles
      } else {
        postList.value = [...postList.value, ...newArticles]
      }
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
    uni.showToast({
      title: '获取文章列表失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    isRefreshing.value = false
  }
}

// 下拉刷新
const onRefresh = async () => {
  isRefreshing.value = true
  pageNum.value = 1
  await getPostList()
}

// 加载更多
const loadMore = async () => {
  if (loading.value) return
  pageNum.value++
  await getPostList()
}

// 切换分类
const switchCategory = (id) => {
  activeCategory.value = id
  pageNum.value = 1
  getPostList()
}

// 获取当前分类的文章列表
const getCategoryList = (categoryId) => {
  return postList.value
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
    url: `/pages/post/detail?id=${item.id}`
  })
}

// 处理点赞
const handleLike = (item) => {
  item.isLiked = !item.isLiked
  item.likes += item.isLiked ? 1 : -1
}

// 跳转到发帖页面
const goToPost = () => {
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

// 处理关注
const handleFollow = (item) => {
  item.isFollowed = !item.isFollowed
  uni.showToast({
    title: item.isFollowed ? '关注成功' : '取消关注',
    icon: 'success'
  })
}

// 预览图片
const previewImage = (images, current) => {
  uni.previewImage({
    urls: images,
    current: current
  })
}

// 获取分类列表
const getCategories = async () => {
  try {
    const res = await API_ARTICLE_GET_CATEGORIES()
    if (res.status === 0) {
      // 在分类列表前添加"全部"选项
      categories.value = [{ id: 0, name: '全部' }, ...res.data]
    } else {
      console.error('获取分类失败:', res.message)
    }
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

// 页面加载时获取分类列表和文章列表
onMounted(async () => {
  await getCategories()
  getPostList()
})
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
            font-size: 22rpx;
            color: #ff9800;
            margin-left: 8rpx;
          }
        }

        .time {
          font-size: 22rpx;
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
      gap: 60rpx;
      align-items: center;
      margin: 30rpx 0 0 0;

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

.follow-btn {
  padding: 8rpx 24rpx;
  background: #1da1f2;
  color: #fff;
  border-radius: 30rpx;
  font-size: 24rpx;
  margin-left: 20rpx;

  &.followed {
    background: #f0f0f0;
    color: #666;
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
</style>
