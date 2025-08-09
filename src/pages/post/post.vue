<template>
  <view class="page-container">
    <!-- 背景图 -->
    <image class="bg-image" src="/static/userbg.png" mode="aspectFill"></image>

    <!-- 自定义导航栏 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-left" @click="goBack">
        <text class="i-carbon-arrow-left text-32rpx" />
      </view>
      <view class="nav-title">发布帖子</view>
    </view>

    <!-- 内容区域 -->
    <view class="content-container">
      <view class="post-form">
        <!-- 内容输入 -->
        <view class="form-item">
          <textarea class="content-input" v-model="content" placeholder="分享新鲜事..." maxlength="1000" />
          <view class="word-count">{{ content.length }}/1000</view>
        </view>

        <!-- 图片上传 -->
        <view class="form-item">
          <view class="image-uploader">
            <view class="image-item" v-for="(img, index) in images" :key="index">
              <image :src="img" mode="aspectFill" />
              <view class="delete-btn" @click="deleteImage(index)">
                <text class="i-carbon-close text-24rpx" />
              </view>
            </view>
            <view class="upload-btn" @click="chooseImage" v-if="images.length < 9">
              <text class="i-carbon-image text-48rpx" />
              <text class="upload-text">添加图片</text>
            </view>
          </view>
        </view>

        <!-- 分类选择 -->
        <view class="form-item">
          <view class="category-select" @tap="showCategoryPicker">
            <text class="label">选择分类</text>
            <view class="selected-category">
              <text :class="['category-text', !selectedCategory ? 'placeholder' : '']">
                {{ selectedCategory ? selectedCategory.name : '请选择' }}
              </text>
              <text class="i-carbon-chevron-right text-24rpx" />
            </view>
          </view>
        </view>
      </view>

      <!-- 底部发布按钮 -->
      <view class="bottom-btn" @click="handlePublish">
        <text>发布</text>
      </view>
    </view>

    <!-- 分类选择弹出层 -->
    <view class="category-popup" v-if="showCategoryPopup">
      <view class="popup-mask" :class="{ 'mask-show': showCategoryPopup }" @tap="closeCategoryPopup"></view>
      <view class="popup-content" :class="{ 'content-show': showCategoryPopup }">
        <view class="popup-header">
          <text class="popup-title">选择分类</text>
          <text class="close-btn" @tap="closeCategoryPopup">×</text>
        </view>
        <view class="category-list">
          <view class="category-item" v-for="cat in categories" :key="cat.id" @tap="selectCategory(cat)">
            {{ cat.name }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRequest } from '@/api'

const { API_ARTICLE_GET_CATEGORIES, API_ARTICLE_ADD, API_UPLOAD_TEMP_IMAGE } = useRequest()

const statusBarHeight = ref(0)
const content = ref('')
const images = ref([]) // 本地图片路径
const uploadedImages = ref([]) // 已上传的临时图片路径
const selectedCategory = ref(null)
const showCategoryPopup = ref(false)

// 分类数据
const categories = ref([])

// 获取分类列表
const fetchCategories = async () => {
  try {
    console.log('开始获取分类列表...')
    const res = await API_ARTICLE_GET_CATEGORIES()
    console.log('分类接口响应:', res)

    if (res.status === 0) {
      categories.value = res.data
      console.log('分类列表获取成功:', categories.value)
    } else {
      console.error('分类接口返回错误:', res)
      let errorMsg = res.message || '获取分类失败'

      // 特殊处理身份认证失败
      if (res.status === 1 && res.message?.includes('身份认证失败')) {
        errorMsg = '请先登录后再发布帖子'
        // 跳转到登录页面
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/login/login'
          })
        }, 1500)
      }

      uni.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 3000
      })
    }
  } catch (error) {
    console.error('获取分类失败:', error)
    uni.showToast({
      title: '网络错误，请检查网络连接',
      icon: 'none',
      duration: 3000
    })
  }
}

// 组件挂载时初始化
onMounted(async () => {
  // 获取状态栏高度
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight

  // 获取分类列表
  await fetchCategories()
})

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 选择图片
const chooseImage = () => {
  if (images.value.length >= 6) {
    uni.showToast({
      title: '最多只能上传6张图片',
      icon: 'none'
    })
    return
  }
  uni.chooseImage({
    count: 6 - images.value.length,
    success: async (res) => {
      // 显示上传进度
      uni.showLoading({
        title: '上传图片中...'
      })

      try {
        // 逐个上传图片到临时目录
        for (const filePath of res.tempFilePaths) {
          const uploadRes = await API_UPLOAD_TEMP_IMAGE(filePath)
          if (uploadRes.status === 0) {
            images.value.push(filePath) // 本地预览路径
            // 从返回的image_urls数组中获取临时路径
            if (uploadRes.data.image_urls && uploadRes.data.image_urls.length > 0) {
              // 提取文件名（使用split方法获取最后的文件名部分）
              const tempPath = uploadRes.data.image_urls[0].split('/').pop()
              uploadedImages.value.push(tempPath) // 服务器临时文件名
            }
          } else {
            throw new Error(uploadRes.message || '上传失败')
          }
        }

        uni.hideLoading()
        uni.showToast({
          title: '图片上传成功',
          icon: 'success'
        })
      } catch (error) {
        uni.hideLoading()
        console.error('图片上传失败:', error)
        uni.showToast({
          title: error.message || '图片上传失败',
          icon: 'none'
        })
      }
    }
  })
}

// 删除图片
const deleteImage = (index) => {
  images.value.splice(index, 1)
  uploadedImages.value.splice(index, 1)
}

// 显示分类选择器
const showCategoryPicker = () => {
  showCategoryPopup.value = true
}

// 关闭分类选择器
const closeCategoryPopup = () => {
  showCategoryPopup.value = false
}

// 选择分类
const selectCategory = (category) => {
  selectedCategory.value = category
  closeCategoryPopup()
}

// 发布文章
const handlePublish = async () => {
  if (!content.value.trim()) {
    uni.showToast({
      title: '请输入内容',
      icon: 'none'
    })
    return
  }

  if (!selectedCategory.value) {
    uni.showToast({
      title: '请选择分类',
      icon: 'none'
    })
    return
  }

  try {
    uni.showLoading({
      title: '发布中...'
    })

    const postData = {
      content: content.value,
      cate_id: selectedCategory.value.id,
      tempImages: uploadedImages.value
    }

    const res = await API_ARTICLE_ADD(postData)

    if (res.status === 0) {
      uni.showToast({
        title: res.message || '发布成功',
        icon: 'success'
      })

      // 清空表单
      content.value = ''
      images.value = []
      uploadedImages.value = []
      selectedCategory.value = null

      // 跳转到首页并刷新
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index',
          success: () => {
            // 通过事件总线通知首页刷新
            uni.$emit('refreshHomePage')
          }
        })
      }, 800)
    } else {
      uni.showToast({
        title: res.message || '发布失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('发布失败:', error)
    uni.showToast({
      title: '发布失败，请重试',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
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
  padding-top: 280rpx;
}

.post-form {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  width: 100%;
  box-sizing: border-box;

  .form-item {
    margin-bottom: 32rpx;
    position: relative;

    .content-input {
      width: 100%;
      height: 400rpx;
      font-size: 32rpx;
      color: #333;
      line-height: 1.6;
      padding: 0;
    }

    .word-count {
      position: absolute;
      right: 0;
      bottom: 0;
      font-size: 24rpx;
      color: #999;
    }

    .image-uploader {
      display: flex;
      flex-wrap: wrap;
      gap: 20rpx;

      .image-item {
        width: 200rpx;
        height: 200rpx;
        position: relative;

        image {
          width: 100%;
          height: 100%;
          border-radius: 12rpx;
        }

        .delete-btn {
          position: absolute;
          right: -10rpx;
          top: -10rpx;
          width: 40rpx;
          height: 40rpx;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }
      }

      .upload-btn {
        width: 200rpx;
        height: 200rpx;
        background: #f5f5f5;
        border-radius: 12rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #999;

        .upload-text {
          font-size: 24rpx;
          margin-top: 8rpx;
        }
      }
    }

    .category-select {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      .label {
        font-size: 28rpx;
        color: #333;
      }

      .selected-category {
        display: flex;
        align-items: center;
        color: #666;
        font-size: 28rpx;

        .category-text {
          margin-right: 8rpx;

          &.placeholder {
            color: #999;
          }
        }
      }
    }
  }
}

.bottom-btn {
  margin-top: 40rpx;
  height: 88rpx;
  background: #1da1f2;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  box-shadow: 0 4rpx 16rpx rgba(29, 161, 242, 0.3);

  &:active {
    transform: scale(0.98);
  }
}

.category-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;

  .popup-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.3s ease;

    &.mask-show {
      opacity: 1;
    }
  }

  .popup-content {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    border-radius: 24rpx 24rpx 0 0;
    padding: 32rpx;
    transform: translateY(100%);
    transition: transform 0.5s ease;

    &.content-show {
      transform: translateY(0);
    }

    .popup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32rpx;

      .popup-title {
        font-size: 32rpx;
        font-weight: 500;
        color: #333;
      }

      .close-btn {
        font-size: 40rpx;
        color: #999;
        padding: 0 20rpx;
      }
    }

    .category-list {
      max-height: 60vh;
      overflow-y: auto;
      padding-bottom: 50px;

      .category-item {
        padding: 24rpx 0;
        font-size: 28rpx;
        color: #333;
        border-bottom: 1rpx solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        &:active {
          background: #f5f5f5;
        }
      }
    }
  }
}
</style>
