<template>
  <!-- 内容区域 -->
  <view class="content-wrapper">
  <!-- 横向滑动分类导航 -->
    <view class="category-bar">
      <view class="nav-header">
        <image class="nav-logo" src="/static/logo.jpg" mode="aspectFit"></image>
        <text class="nav-title">润邻生活圈</text>
      </view>
      <scroll-view
        scroll-x
        show-scrollbar="false"
        class="category-scroll"
        :scroll-into-view="'category-' + activeCategory"
        scroll-with-animation
      >
    <view
      v-for="cat in categories"
      :key="cat.id"
          :id="'category-' + cat.id"
      :class="['category-item', cat.id === activeCategory ? 'active' : '']"
          @click="switchCategory(cat.id)"
    >
      {{ cat.name }}
    </view>
  </scroll-view>
    </view>

  <!-- 内容区：推特/知乎风格 -->
    <swiper
      class="feed-swiper"
      :current="getSwiperIndex(activeCategory)"
      @change="handleSwiperChange"
      :duration="300"
    >
      <swiper-item v-for="cat in categories" :key="cat.id">
        <scroll-view 
          scroll-y 
          class="feed-list"
          @scrolltolower="loadMore(cat.id)"
          :refresher-enabled="true"
          :refresher-triggered="isRefreshing"
          @refresherrefresh="onRefresh(cat.id)"
        >
          <!-- 广告栏 -->
          <view class="ad-banner" v-if="adStatus[cat.id] && adList[cat.id]?.length">
            <view class="close-btn" @click="closeAd(cat.id)">
              <text class="i-carbon-close text-24rpx" />
            </view>
            <swiper 
              class="ad-swiper" 
              :indicator-dots="false"
              :autoplay="true"
              :interval="3000"
              :duration="500"
              circular
            >
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
                  {{ item.nickname }}<text class="level"> Lv.{{ item.level }}</text>
                </view>
                <view class="time">{{ item.time }}</view>
              </view>
              <view
                :class="['follow-btn', item.isFollowed ? 'followed' : '']"
                @click.stop="handleFollow(item)"
              >
                <text>{{ item.isFollowed ? '已关注' : '关注' }}</text>
              </view>
            </view>
            <view class="feed-content" @click="goToPostDetail(item)">{{ item.content }}</view>
            <view v-if="item.images && item.images.length" class="feed-images">
              <image
                v-for="(img, idx) in item.images"
                :key="idx"
                :src="img"
                class="feed-img"
                mode="aspectFill"
                @click.stop="previewImage(item.images, idx)"
              />
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
  import { ref, computed, onMounted } from 'vue'

  // mock 分类
  const categories = ref([
    { id: 1, name: '全部' },
    { id: 2, name: '热门话题' },
    { id: 3, name: '装修设计' },
    { id: 4, name: '家具家电' },
    { id: 5, name: '邻里互助' },
    { id: 6, name: '二手闲置' },
    { id: 7, name: '兴趣圈子' },
    { id: 8, name: '农副产品' },
    { id: 9, name: '其他' }
  ])
  const activeCategory = ref(1)

  // mock 内容数据
  const list = ref([
    {
      id: 1,
      avatar: '/static/avatar1.jpg',
      nickname: '小明',
      level: 5,
      time: '2小时前',
      content: '今天学习了Vue3，感觉很棒！',
      images: ['/static/demo1.jpg'],
      likes: 23,
      views: 120,
      comments: 5,
      category: 2,
      isFollowed: false,
      isLiked: false
    },
    {
      id: 2,
      avatar: '/static/avatar2.jpg',
      nickname: '小红',
      level: 3,
      time: '1小时前',
      content: '谁能推荐一下好用的UI库？',
      images: [],
      likes: 12,
      views: 80,
      comments: 2,
      category: 3,
      isFollowed: false
    },
    {
      id: 3,
      avatar: '/static/avatar3.jpg',
      nickname: '老王',
      level: 7,
      time: '刚刚',
      content: '晒一下我的新电脑配置！',
      images: ['/static/demo1.jpg', '/static/demo1.jpg'],
      likes: 45,
      views: 300,
      comments: 18,
      category: 4,
      isFollowed: false
    },
    {
      id: 4,
      avatar: '/static/avatar4.jpg',
      nickname: '小刚',
      level: 1,
      time: '刚刚',
      content: '分享一下我的新手机！',
      images: ['/static/demo1.jpg'],
      likes: 10,
      views: 50,
      comments: 1,
      category: 5,
      isFollowed: false
    }
    // ...可继续添加更多mock数据
  ])

  // 切换分类
  const switchCategory = (categoryId) => {
    activeCategory.value = categoryId
  }

  // 处理滑动切换
  const handleSwiperChange = (e) => {
    const index = e.detail.current
    activeCategory.value = categories.value[index].id
  }

  // 获取swiper对应的索引
  const getSwiperIndex = (categoryId) => {
    return categories.value.findIndex((cat) => cat.id === categoryId)
  }

  // 获取对应分类的内容列表
  const getCategoryList = (categoryId) => {
    if (categoryId === 1) return list.value
    return list.value.filter((item) => item.category === categoryId)
  }

  // 广告控制
  const adStatus = ref({
    1: true, // 全部
    2: true, // 热门话题
    3: true, // 装修设计
    4: true, // 家具家电
    5: true, // 邻里互助
    6: true, // 二手闲置
    7: true, // 兴趣圈子
    8: true, // 农副产品
    9: true // 其他
  })

  const adList = ref({
    1: [
      { id: 1, image: '/static/ad1.jpg', link: 'https://example.com/ad1' },
      { id: 2, image: '/static/ad2.jpg', link: 'https://example.com/ad2' }
    ],
    2: [{ id: 3, image: '/static/ad1.jpg', link: 'https://example.com/ad3' }],
    3: [{ id: 4, image: '/static/ad2.jpg', link: 'https://example.com/ad4' }]
    // ... 其他分类的广告
  })

  // 关闭广告
  const closeAd = (categoryId) => {
    adStatus.value[categoryId] = false
  }

  // 处理广告点击
  const handleAdClick = (ad) => {
    console.log('广告点击:', ad)
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

  // 处理关注
  const handleFollow = (item) => {
    item.isFollowed = !item.isFollowed
    // 这里可以添加实际的关注/取消关注逻辑
    uni.showToast({
      title: item.isFollowed ? '关注成功' : '已取消关注',
      icon: 'none'
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

  // 下拉刷新状态
  const isRefreshing = ref(false)
  // 是否正在加载
  const isLoading = ref(false)
  // 是否还有更多数据
  const hasMore = ref(true)
  // 当前页码
  const page = ref(1)

  // 模拟获取数据
  const getMockData = (categoryId, pageNum) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newData = [
          {
            id: Date.now(),
            avatar: '/static/avatar1.jpg',
            nickname: '用户' + (pageNum * 4 - 3),
            level: Math.floor(Math.random() * 10) + 1,
            time: '刚刚',
            content: '这是第' + pageNum + '页的内容',
            images: ['/static/demo1.jpg'],
            likes: Math.floor(Math.random() * 100),
            views: Math.floor(Math.random() * 1000),
            comments: Math.floor(Math.random() * 50),
            category: categoryId,
            isFollowed: false,
            isLiked: false
          },
          {
            id: Date.now() + 1,
            avatar: '/static/avatar2.jpg',
            nickname: '用户' + (pageNum * 4 - 2),
            level: Math.floor(Math.random() * 10) + 1,
            time: '刚刚',
            content: '这是第' + pageNum + '页的内容',
            images: ['/static/demo1.jpg'],
            likes: Math.floor(Math.random() * 100),
            views: Math.floor(Math.random() * 1000),
            comments: Math.floor(Math.random() * 50),
            category: categoryId,
            isFollowed: false,
            isLiked: false
          }
        ]
        resolve(newData)
      }, 1000)
    })
  }

  // 加载更多
  const loadMore = async (categoryId) => {
    if (isLoading.value || !hasMore.value) return
    
    isLoading.value = true
    try {
      const newData = await getMockData(categoryId, page.value + 1)
      if (newData.length === 0) {
        hasMore.value = false
        uni.showToast({
          title: '没有更多数据了',
          icon: 'none'
        })
      } else {
        page.value++
        if (categoryId === 1) {
          list.value.push(...newData)
        } else {
          list.value.push(...newData.filter(item => item.category === categoryId))
        }
      }
    } catch (error) {
      uni.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      isLoading.value = false
    }
  }

  // 下拉刷新
  const onRefresh = async (categoryId) => {
    isRefreshing.value = true
    page.value = 1
    hasMore.value = true
    
    try {
      const newData = await getMockData(categoryId, 1)
      if (categoryId === 1) {
        list.value = newData
      } else {
        list.value = newData.filter(item => item.category === categoryId)
      }
    } catch (error) {
      uni.showToast({
        title: '刷新失败',
        icon: 'none'
      })
    } finally {
      isRefreshing.value = false
    }
  }

  // 跳转到发帖页面
  const goToPost = () => {
    uni.navigateTo({
      url: '/pages/post/post'
    })
  }

  // 跳转到用户主页
  const goToUserProfile = (item) => {
    uni.navigateTo({
      url: `/pages/userPackage/userProfile?userId=${item.id}`
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
    flex-wrap: wrap;
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
    background: linear-gradient(135deg, #a548fd 0%, #2994ff 100%, #0000CD 50%);
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
      background: linear-gradient(135deg, rgba(138, 43, 226, 0.2) 0%, rgba(30, 144, 255, 0.2) 50%, rgba(0, 0, 205, 0.2) 100%);
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
