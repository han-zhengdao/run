<template>
  <view class="page-container">
    <!-- 背景图 -->
    <image class="bg-image" src="/static/userbg.png" mode="aspectFill"></image>

    <!-- 自定义导航栏 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-left" @click="goBack">
        <text class="i-carbon-arrow-left text-40rpx" />
      </view>
      <view class="nav-title">帖子详情</view>
    </view>

    <!-- 滚动区域 -->
    <scroll-view class="scroll-container" scroll-y @scrolltolower="loadMoreComments">
      <!-- 帖子内容 -->
      <view class="post-container">
        <view class="post-card">
          <view class="post-header">
            <image class="avatar" :src="postInfo.avatar" @click="goToUserProfile(postInfo)" />
            <view class="user-info" @click="goToUserProfile(postInfo)">
              <view class="nickname">
                {{ postInfo.nickname }}<text class="level"> Lv.{{ postInfo.level }}</text>
              </view>
              <view class="time">{{ postInfo.time }}</view>
            </view>
            <view :class="['follow-btn', postInfo.isFollowed ? 'followed' : '']" @click="handleFollow(postInfo)">
              <text>{{ postInfo.isFollowed ? '已关注' : '关注' }}</text>
            </view>
          </view>
          <view class="post-content">{{ postInfo.content }}</view>
          <view v-if="postInfo.images && postInfo.images.length" class="post-images">
            <image v-for="(img, idx) in postInfo.images" :key="idx" :src="img" class="post-img" mode="aspectFill"
              @click="previewImage(postInfo.images, idx)" />
          </view>
          <view class="post-footer">
            <view class="footer-item" @click="handleLike(postInfo)">
              <text :class="['i-carbon-favorite text-32rpx mr-2', postInfo.isLiked ? 'liked' : '']" />
              <text>{{ postInfo.likes }}</text>
            </view>
            <view class="footer-item">
              <text class="i-carbon-view text-32rpx mr-2" />
              <text>{{ postInfo.views }}</text>
            </view>
            <view class="footer-item">
              <text class="i-carbon-chat text-32rpx mr-2" />
              <text>{{ postInfo.comments }}</text>
            </view>
          </view>
        </view>

        <!-- 评论列表 -->
        <view class="comments-section">
          <view class="section-title">全部评论</view>
          <view class="comment-list">
            <view class="comment-item" v-for="comment in comments" :key="comment.id">
              <image class="avatar" :src="comment.avatar" @click="goToUserProfile(comment)" />
              <view class="comment-content">
                <view class="comment-header">
                  <view class="user-info" @click="goToUserProfile(comment)">
                    <text class="nickname">{{ comment.nickname }}</text>
                    <text class="time">{{ comment.time }}</text>
                  </view>
                  <view class="comment-actions">
                    <view class="action-item" @click="handleCommentLike(comment)">
                      <text :class="[
                        'i-carbon-favorite text-24rpx mr-2',
                        comment.isLiked ? 'liked' : ''
                      ]" />
                      <text>{{ comment.likes }}</text>
                    </view>
                    <view class="action-item" @click="handleReply(comment)">
                      <text class="i-carbon-reply text-24rpx mr-2" />
                      <text>回复</text>
                    </view>
                  </view>
                </view>
                <view class="comment-text">
                  <text v-if="comment.replyTo" class="reply-to">回复 <text class="nickname">@{{ comment.replyTo.nickname
                      }}</text>：</text>
                  {{ comment.content }}
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 评论输入框 -->
    <view class="comment-input-wrapper">
      <input class="comment-input" v-model="commentContent"
        :placeholder="replyTo ? `回复 ${replyTo.nickname}：` : '说点什么...'" :focus="showKeyboard" @confirm="submitComment"
        @blur="handleInputBlur" />
      <view class="send-btn" @click="submitComment">发送</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRequest } from '@/api'
import { toggleFollow } from '@/utils/followUtils'

const statusBarHeight = ref(0)
const postId = ref('')
const showKeyboard = ref(false)
const commentContent = ref('')
const replyTo = ref(null)

// 帖子信息
const postInfo = ref({
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
  isFollowed: false,
  isLiked: false
})

// 评论列表
const comments = ref([
  {
    id: 1,
    avatar: '/static/avatar2.jpg',
    nickname: '小红',
    time: '1小时前',
    content: '加油！',
    likes: 5,
    isLiked: false
  },
  {
    id: 2,
    avatar: '/static/avatar3.jpg',
    nickname: '老王',
    time: '30分钟前',
    content: '我也在学习Vue3，一起进步！',
    likes: 3,
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
  postId.value = currentPage.options?.postId

  // 这里可以根据postId获取帖子信息和评论列表
  // fetchPostInfo(postId.value)
  // fetchComments(postId.value)
})

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 跳转到用户主页
const goToUserProfile = (user) => {
  uni.navigateTo({
    url: `/pages/userPackage/userProfile?userId=${user.id}`
  })
}

// 处理关注
const handleFollow = async (user) => {
  try {
    const result = await toggleFollow(user.id, user.isFollowed)
    if (result && result.success) {
      user.isFollowed = result.isFollowing
    }
  } catch (error) {
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  }
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
const handleLike = async (post) => {
  try {
    const { API_POST_LIKE } = useRequest()
    const response = await API_POST_LIKE(post.id)

    if (response.status === 0) {
      // 根据接口返回的状态更新UI
      post.isLiked = response.data.isLiked
      post.likes += response.data.isLiked ? 1 : -1

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

// 处理评论点赞
const handleCommentLike = async (comment) => {
  try {
    const { API_COMMENT_LIKE } = useRequest()
    const response = await API_COMMENT_LIKE(comment.id)

    if (response.status === 0) {
      // 根据接口返回的状态更新UI
      comment.isLiked = response.data.isLiked
      comment.likes += response.data.isLiked ? 1 : -1

      uni.showToast({
        title: response.message,
        icon: 'none'
      })
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('点赞评论失败:', error)
    uni.showToast({
      title: '操作失败：' + error.message,
      icon: 'none'
    })
  }
}

// 处理回复评论
const handleReply = (comment) => {
  replyTo.value = comment
  showKeyboard.value = true
  // 聚焦输入框
  uni
    .createSelectorQuery()
    .select('.comment-input')
    .boundingClientRect()
    .exec((res) => {
      if (res[0]) {
        uni.pageScrollTo({
          scrollTop: res[0].top,
          duration: 300
        })
      }
    })
}

// 处理输入框失焦
const handleInputBlur = () => {
  showKeyboard.value = false
  if (!commentContent.value) {
    replyTo.value = null
  }
}

// 提交评论
const submitComment = async () => {
  if (!commentContent.value.trim()) {
    uni.showToast({
      title: '请输入评论内容',
      icon: 'none'
    })
    return
  }

  try {
    const { API_COMMENT_CREATE, API_COMMENT_REPLY } = useRequest()
    let response

    if (replyTo.value) {
      // 回复评论
      response = await API_COMMENT_REPLY(replyTo.value.id, commentContent.value.trim())

      if (response.status === 0) {
        // 创建新回复对象
        const newReply = {
          id: response.data.replyId,
          userId: 1, // 当前用户ID
          nickname: '当前用户',
          avatar: '/static/avatar1.jpg',
          content: response.data.content,
          time: '刚刚',
          likes: 0,
          isLiked: false,
          replyTo: {
            userId: replyTo.value.userId,
            nickname: replyTo.value.nickname
          }
        }

        comments.value.unshift(newReply)
        replyTo.value = null
      }
    } else {
      // 发表新评论
      response = await API_COMMENT_CREATE(postInfo.value.id, commentContent.value.trim())

      if (response.status === 0) {
        // 创建新评论对象
        const newComment = {
          id: response.data.commentId,
          userId: 1, // 当前用户ID
          nickname: '当前用户',
          avatar: '/static/avatar1.jpg',
          content: response.data.content,
          time: '刚刚',
          likes: 0,
          isLiked: false,
          replyTo: null
        }

        comments.value.unshift(newComment)
      }
    }

    if (response.status === 0) {
      commentContent.value = ''
      showKeyboard.value = false

      // 更新帖子评论数
      if (postInfo.value) {
        postInfo.value.comments++
      }

      uni.showToast({
        title: response.message,
        icon: 'success'
      })
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('操作失败:', error)
    uni.showToast({
      title: '操作失败：' + error.message,
      icon: 'none'
    })
  }
}

// 加载更多评论
const loadMoreComments = () => {
  // 这里添加加载更多评论的逻辑
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
  height: calc(100vh - 120rpx - env(safe-area-inset-bottom));
  padding-bottom: calc(130rpx + env(safe-area-inset-bottom));
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
  justify-content: center;
  color: #fff;

  .nav-left {
    position: absolute;
    left: 24rpx;
    bottom: 0;
    padding: 20rpx;
    display: flex;
    align-items: center;
  }

  .nav-title {
    font-size: 36rpx;
    font-weight: 500;
  }
}

.post-container {
  padding: 0;
  padding-top: 88rpx;
}

.post-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin: 24rpx;
  margin-top: 160rpx;
  position: relative;
  z-index: 1;
  width: calc(100% - 48rpx);
  box-sizing: border-box;

  .post-header {
    display: flex;
    align-items: center;
    margin-bottom: 32rpx;

    .avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      margin-right: 24rpx;
    }

    .user-info {
      flex: 1;

      .nickname {
        font-size: 32rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 8rpx;

        .level {
          font-size: 24rpx;
          color: #ff9800;
          margin-left: 8rpx;
        }
      }

      .time {
        font-size: 24rpx;
        color: #999;
      }
    }
  }

  .post-content {
    font-size: 30rpx;
    color: #333;
    line-height: 1.6;
    margin-bottom: 24rpx;
  }

  .post-images {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 24rpx;

    .post-img {
      width: 220rpx;
      height: 220rpx;
      border-radius: 12rpx;
      object-fit: cover;
    }
  }

  .post-footer {
    display: flex;
    gap: 48rpx;
    padding-top: 24rpx;
    border-top: 1rpx solid #f0f0f0;

    .footer-item {
      display: flex;
      align-items: center;
      font-size: 26rpx;
      color: #666;

      .liked {
        color: #1da1f2;
      }
    }
  }
}

.comments-section {
  background: #fff;
  border-radius: 20rpx;
  margin: 24rpx;
  padding: 32rpx;
  width: calc(100% - 48rpx);
  box-sizing: border-box;

  .section-title {
    font-size: 32rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 32rpx;
  }

  .comment-list {
    .comment-item {
      display: flex;
      margin-bottom: 32rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .avatar {
        width: 64rpx;
        height: 64rpx;
        border-radius: 50%;
        margin-right: 24rpx;
      }

      .comment-content {
        flex: 1;

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12rpx;

          .user-info {
            .nickname {
              font-size: 28rpx;
              font-weight: 500;
              color: #333;
              margin-right: 16rpx;
            }

            .time {
              font-size: 24rpx;
              color: #999;
            }
          }

          .comment-actions {
            display: flex;
            gap: 32rpx;

            .action-item {
              display: flex;
              align-items: center;
              font-size: 24rpx;
              color: #666;

              .liked {
                color: #1da1f2;
              }
            }
          }
        }

        .comment-text {
          font-size: 28rpx;
          color: #333;
          line-height: 1.5;

          .reply-to {
            color: #666;

            .nickname {
              color: #1da1f2;
            }
          }
        }
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

.comment-input-wrapper {
  position: fixed;
  bottom: 10rpx;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  border-top: 1rpx solid #f0f0f0;
  z-index: 100;
  box-sizing: border-box;
  height: calc(120rpx + env(safe-area-inset-bottom));

  .comment-input {
    flex: 1;
    height: 72rpx;
    background: #f5f5f5;
    border-radius: 36rpx;
    padding: 0 32rpx;
    font-size: 28rpx;
    color: #333;
  }

  .send-btn {
    margin-left: 24rpx;
    font-size: 28rpx;
    color: #1da1f2;
    padding: 0 20rpx;
  }
}
</style>
