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
          @scrolltolower="() => loadMore(cat.id)"
          :refresher-enabled="true"
          :refresher-triggered="isRefreshing"
          @refresherrefresh="onRefresh"
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
                  {{ item.nickname }}<text class="level">{{ item.level }}</text>
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
                mode="aspectFit"
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
  import { useRequest } from '@/api'

  // 获取API
  const { 
    API_ARTICLE_GET_CATEGORIES, 
    API_AD_GET_LIST, 
    API_AD_RECORD_CLICK, 
    API_POST_GET_LIST, 
    API_POST_LIKE, 
    API_POST_FOLLOW_USER 
  } = useRequest()

  // 分类数据
  const categories = ref([])
  const activeCategory = ref(0)

  // 获取文章分类列表
  const fetchCategories = async () => {
    try {
      const res = await API_ARTICLE_GET_CATEGORIES()
      if (res.data.status === 0 && Array.isArray(res.data.data)) {
        // 确保返回的数据是数组
        categories.value = res.data.data.length > 0 ? res.data.data : [{
          id: 0,
          name: '全部'
        }]
        // 默认选中第一个分类
        activeCategory.value = categories.value[0]?.id || 0
        
        // 初始化广告状态
        initAdStatus()
        
        // 初始化并获取广告数据
        await initAdList()
        
        // 获取文章列表数据
        const posts = await getPostList(activeCategory.value, 1)
        if (Array.isArray(posts)) {
          list.value = posts
        }
      } else {
        uni.showToast({
          title: res.data.message || '获取分类失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('获取分类失败:', error)
      uni.showToast({
        title: '获取分类失败',
        icon: 'none'
      })
    }
  }

  // 文章列表数据
  const list = ref([])

  // 切换分类
  const switchCategory = async (categoryId) => {
    if (activeCategory.value === categoryId) return
    
    activeCategory.value = categoryId
    // 重置页码并重新加载数据
    page.value = 1
    hasMore.value = true
    list.value = []
    
    try {
      // 获取该分类的文章列表
      const newData = await getPostList(categoryId, 1)
      list.value = newData
      
      if (newData.length === 0) {
        uni.showToast({
          title: '暂无数据',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('切换分类失败:', error)
      uni.showToast({
        title: '切换分类失败',
        icon: 'none'
      })
    }
  }

  // 处理滑动切换
  const handleSwiperChange = async (e) => {
    const index = e.detail.current
    const categoryId = categories.value[index].id
    
    // 如果分类已经改变，则重新加载数据
    if (activeCategory.value !== categoryId) {
      activeCategory.value = categoryId
      // 重置页码并重新加载数据
      page.value = 1
      hasMore.value = true
      // 获取该分类的文章列表
      const newData = await getPostList(categoryId, 1)
      list.value = newData
    }
  }

  // 获取swiper对应的索引
  const getSwiperIndex = (categoryId) => {
    return categories.value.findIndex((cat) => cat.id === categoryId)
  }

  // 获取对应分类的内容列表
  const getCategoryList = (categoryId) => {
    // 如果是全部分类（id为0）或者没有指定分类，返回所有列表
    if (categoryId === 0) {
      return list.value
    }
    // 根据分类ID过滤列表
    return list.value.filter(item => item.category_id === categoryId)
  }

  // 广告控制
  const adStatus = ref({
    0: true, // 全部
    // 其他分类的广告状态将根据实际分类动态设置
  })
  
  // 当分类数据加载完成后，初始化每个分类的广告状态
  const initAdStatus = () => {
    categories.value.forEach(cat => {
      if (adStatus.value[cat.id] === undefined) {
        adStatus.value[cat.id] = true
      }
    })
  }

  const adList = ref({
    // 广告数据将从服务器获取
  })
  
  // 获取广告数据
  const fetchAdList = async (categoryId = 0) => {
    try {
      const res = await API_AD_GET_LIST(categoryId)
      if (res.data.status === 0) {
        // 更新指定分类的广告数据
        adList.value[categoryId] = res.data.data
      }
    } catch (error) {
      console.error('获取广告失败:', error)
    }
  }
  
  // 初始化广告列表
  const initAdList = async () => {
    // 先获取全部分类的广告
    await fetchAdList(0)
    
    // 然后获取每个分类的广告
    for (const cat of categories.value) {
      if (cat.id !== 0) { // 跳过"全部"分类，因为已经获取过了
        await fetchAdList(cat.id)
      }
    }
  }

  // 关闭广告
  const closeAd = (categoryId) => {
    adStatus.value[categoryId] = false
  }

  // 处理广告点击
  const handleAdClick = async (ad) => {
    try {
      // 记录广告点击
      await API_AD_RECORD_CLICK(ad.id)
      
      // 如果有链接，则跳转
      if (ad.link) {
        // 根据链接类型决定跳转方式
        if (ad.link.startsWith('http')) {
          // 外部链接，使用web-view打开
          uni.navigateTo({
            url: `/pages/webview/webview?url=${encodeURIComponent(ad.link)}`
          })
        } else {
          // 内部页面，直接跳转
          uni.navigateTo({
            url: ad.link
          })
        }
      }
    } catch (error) {
      console.error('记录广告点击失败:', error)
    }
  }

  // 预览图片
  const previewImage = (urls, current) => {
    // 确保urls是一个数组
    const imageUrls = Array.isArray(urls) ? urls : [urls]
    uni.previewImage({
      urls: imageUrls,
      current: imageUrls[current] || imageUrls[0],
      indicator: 'number',
      loop: imageUrls.length > 1 // 只有多张图片时才启用循环
    })
  }

  // 跳转到用户主页
  const goToUserProfile = (item) => {
    if (!item.user_id) {
      uni.showToast({
        title: '用户信息不存在',
        icon: 'none'
      })
      return
    }
    uni.navigateTo({
      url: `/pages/user/profile?id=${item.user_id}`
    })
  }

  // 处理关注
  const handleFollow = async (item) => {
    if (!item.user_id) {
      uni.showToast({
        title: '用户信息不存在',
        icon: 'none'
      })
      return
    }
    try {
      const isFollow = !item.isFollowed
      const res = await API_POST_FOLLOW_USER(item.user_id, isFollow)
      
      if (res.data.status === 0) {
        item.isFollowed = isFollow
        uni.showToast({
          title: isFollow ? '关注成功' : '已取消关注',
          icon: 'none'
        })
      } else {
        uni.showToast({
          title: res.data.message || '操作失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('关注操作失败:', error)
      uni.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  }

  // 跳转到文章详情页
  const goToPostDetail = (item) => {
    uni.navigateTo({
      url: `/pages/post/detail?id=${item.id}`
    })
  }



  // 处理点赞
  const handleLike = async (item) => {
    try {
      const isLike = !item.isLiked
      const res = await API_POST_LIKE(item.id, isLike)
      
      if (res.data.status === 0) {
        item.isLiked = isLike
        item.likes += isLike ? 1 : -1
        uni.showToast({
          title: isLike ? '点赞成功' : '已取消点赞',
          icon: 'none'
        })
      } else {
        uni.showToast({
          title: res.data.message || '操作失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('点赞操作失败:', error)
      uni.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  }

  // 下拉刷新状态
  const isRefreshing = ref(false)
  // 是否正在加载
  const isLoading = ref(false)
  // 是否还有更多数据
  const hasMore = ref(true)
  // 当前页码
  const page = ref(1)

  // 等级名称映射
  const getLevelName = (level) => {
    const levelNames = {
      1: '深海窥屏鱼类',
      2: '偶尔冒泡的锦鲤',
      3: '冲鸭冲鸭冲鸭',
      4: '永动机型话痨',
      5: '人形自走热点',
      6: '神龙见首不见尾的传说'
    }
    return levelNames[level] || '未知等级'
  }

  // 获取文章列表数据
  const getPostList = async (categoryId, page, pageSize = 10) => {
    try {
      const res = await API_POST_GET_LIST({
        categoryId,
        pagenum: page,
        pagesize: pageSize
      })
      
      if (res.data.status === 0 && res.data.data && Array.isArray(res.data.data.list)) {
        // 更新页码信息
        page.value = res.data.data.pagenum || page.value
        // 处理返回的数据，添加用户信息和图片
        const processedData = res.data.data.list.map(item => ({
          id: item.id,
          category_id: item.category_id,
          content: item.content,
          images: (item.images && item.images.length > 0) ? item.images.map(img => img.startsWith('http') ? img : `${import.meta.env.VITE_APP_API_BASEURL}/uploads/${img}`) : [], // 处理图片URL
          avatar: item.user?.avatar ? (item.user.avatar.startsWith('http') ? item.user.avatar : `${import.meta.env.VITE_APP_API_BASEURL}/uploads/${item.user.avatar}`) : '/static/logo.jpg', // 用户头像处理
          nickname: item.user?.nickname || '用户' + item.user_id,
          user_id: item.user_id, // 添加用户ID
          level: getLevelName(item.level || item.user?.level || 1),
          time: item.created_at?.split('T')[0], // 只显示年月日
          likes: item.like_count || 0,
          views: item.view_count || 0,
          comments: item.comment_count || 0,
          isLiked: item.is_liked || false,
          isFollowed: item.is_followed || false
        }))
        // 只在刷新或初始加载时重置列表
        if (page === 1) {
          list.value = processedData
        }
        return processedData
      } else {
        uni.showToast({
          title: res.data.message || '获取文章列表失败',
          icon: 'none'
        })
        return []
      }
    } catch (error) {
      uni.showToast({
        title: '获取文章列表失败',
        icon: 'none'
      })
      return []
    }
  }

  // 加载更多
  const loadMore = async (categoryId) => {
    if (!hasMore.value || isLoading.value) return
    
    isLoading.value = true
    try {
      const newData = await getPostList(categoryId, page.value + 1, 10)
      
      if (!newData || !Array.isArray(newData) || newData.length === 0) {
        hasMore.value = false
        uni.showToast({
          title: '没有更多数据了',
          icon: 'none'
        })
        return
      }

      // 确保不重复添加数据
      const newIds = new Set(newData.map(item => item.id))
      const existingIds = new Set(list.value.map(item => item.id))
      const uniqueNewData = newData.filter(item => !existingIds.has(item.id))
      
      if (uniqueNewData.length > 0) {
        list.value.push(...uniqueNewData)
        hasMore.value = true
      } else {
        hasMore.value = false
      }
    } catch (error) {
      uni.showToast({
        title: '加载失败',
        icon: 'none'
      })
      hasMore.value = true
    } finally {
      isLoading.value = false
    }
  }

  // 下拉刷新
  const onRefresh = async () => {
    if (isRefreshing.value) return
    
    isRefreshing.value = true
    page.value = 1
    hasMore.value = true
    
    try {
      const newData = await getPostList(activeCategory.value, 1)
      if (newData && Array.isArray(newData)) {
        list.value = newData
        if (newData.length > 0) {
          uni.showToast({
            title: '刷新成功',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: '暂无数据',
            icon: 'none'
          })
        }
      }
    } catch (error) {
      console.error('刷新失败:', error)
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
  
  // 初始化数据
  onMounted(async () => {
    try {
      // 获取分类数据
      await fetchCategories()
    } catch (error) {
      console.error('初始化数据失败:', error)
      uni.showToast({
        title: '初始化数据失败',
        icon: 'none'
      })
    }
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
