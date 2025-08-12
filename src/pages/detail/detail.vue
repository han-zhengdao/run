<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-left" @click="goBack">
        <text class="i-carbon-arrow-left text-32rpx" />
      </view>
      <view class="nav-title">帖子详情</view>
    </view>

    <!-- 内容区域 -->
    <view class="content-container">
      <view v-if="postDetail" class="post-detail">
        <!-- 帖子头部 -->
        <view class="post-header">
          <image class="avatar" :src="postDetail.avatar" @click="goToUserProfile(postDetail)"
            @error="handleAvatarError" />
          <view class="user-info" @click="goToUserProfile(postDetail)">
            <view class="nickname">
              {{ postDetail.nickname }}<text class="level">{{ postDetail.level }}</text>
            </view>
            <view class="time">{{ postDetail.time }}</view>
          </view>
          <view :class="['follow-btn', postDetail.isFollowed ? 'followed' : '']" @click="handleFollow(postDetail)">
            <text>{{ postDetail.isFollowed ? '已关注' : '关注' }}</text>
          </view>
        </view>

        <!-- 帖子内容 -->
        <view class="post-content">
          <text>{{ postDetail.content }}</text>
        </view>

        <!-- 帖子图片 -->
        <view v-if="postDetail.images && postDetail.images.length" class="post-images">
          <image v-for="(img, idx) in postDetail.images" :key="idx" :src="img" class="post-img" mode="aspectFit"
            @click="previewImage(postDetail.images, idx)" @error="handleImageError($event, idx)" />
        </view>

        <!-- 帖子统计 -->
        <view class="post-stats">
          <view class="stat-item">
            <text class="i-carbon-chat text-32rpx mr-2" />
            <text>{{ postDetail.comments }}</text>
          </view>
          <view class="stat-item">
            <text class="i-carbon-view text-32rpx mr-2" />
            <text>{{ postDetail.views }}</text>
          </view>
          <view class="stat-item" @click="handleLike(postDetail)">
            <text :class="['i-carbon-favorite text-32rpx mr-2', postDetail.isLiked ? 'liked' : '']" />
            <text>{{ postDetail.likes }}</text>
          </view>
          <view class="stat-item" @click="handleReport(postDetail)">
            <text class="i-carbon-overflow-menu-horizontal text-32rpx" />
          </view>
        </view>

        <!-- 评论区域 -->
        <view class="comments-section">
          <view class="comments-header">
            <text class="comments-title">评论 {{ postDetail.comments }}</text>
          </view>

          <!-- 评论列表 -->
          <view class="comments-list">
            <view v-for="comment in commentsList" :key="comment.id" class="comment-item">
              <image class="comment-avatar" :src="comment.avatar" @error="handleAvatarError" />
              <view class="comment-content" @click="handleReply(comment)">
                <view class="comment-header">
                  <text class="comment-nickname">{{ comment.nickname }}</text>
                  <text v-if="comment.userId === currentUser.id" class="me-tag">我</text>
                  <text class="comment-level">{{ comment.level }}</text>
                </view>
                <view class="comment-text">{{ comment.content }}</view>
                <view class="comment-actions" @click.stop>
                  <view class="comment-action">
                    <text class="action-text">{{ comment.time }}</text>
                  </view>
                  <view class="comment-action" @click="handleReply(comment)">
                    <text class="action-text">回复</text>
                  </view>
                  <view class="comment-action like-action" @click="handleCommentLike(comment)">
                    <text :class="['i-carbon-favorite text-32rpx mr-1', comment.isLiked ? 'liked' : '']"
                      style="color: #999999" />
                    <text class="action-text">{{ comment.likes || '' }}</text>
                  </view>
                  <view class="comment-action report-action" @click="handleCommentReport(comment)">
                    <text class="i-carbon-overflow-menu-horizontal text-32rpx" style="color: #999999" />
                  </view>
                </view>

                <!-- 回复列表 -->
                <view v-if="comment.replies && comment.replies.length" class="replies-list">
                  <view v-for="(reply, index) in getVisibleReplies(comment)" :key="reply.id" class="reply-item">
                    <image class="reply-avatar" :src="reply.avatar" @error="handleAvatarError" />
                    <view class="reply-content" @click.stop="handleReplyToReply(reply, comment)">
                      <view class="reply-header">
                        <text class="reply-nickname">{{ reply.nickname }}</text>
                        <text v-if="reply.userId === currentUser.id" class="me-tag">我</text>
                        <text class="reply-level">{{ reply.level }}</text>
                        <text v-if="reply.replyTo" class="reply-arrow">▶</text>
                        <text v-if="reply.replyTo" class="reply-target">{{ reply.replyTo }}</text>
                      </view>
                      <view class="reply-text">
                        {{ reply.content }}
                      </view>
                      <view class="reply-actions" @click.stop>
                        <view class="reply-action">
                          <text class="action-text">{{ reply.time }}</text>
                        </view>
                        <view class="reply-action" @click="handleReplyToReply(reply, comment)">
                          <text class="action-text">回复</text>
                        </view>
                        <view class="reply-action like-action" @click="handleReplyLike(reply)">
                          <text :class="[
                            'i-carbon-favorite text-32rpx mr-1',
                            reply.isLiked ? 'liked' : ''
                          ]" style="color: #999999" />
                          <text class="action-text">{{ reply.likes || '' }}</text>
                        </view>
                        <view class="reply-action report-action" @click="handleReplyReport(reply)">
                          <text class="i-carbon-overflow-menu-horizontal text-32rpx" style="color: #999999" />
                        </view>
                      </view>
                    </view>
                  </view>

                  <!-- 展开/收起按钮 -->
                  <view v-if="comment.replies.length > 3" class="replies-toggle" @click.stop="toggleReplies(comment)">
                    <text class="toggle-text">
                      {{
                        comment.showAllReplies
                          ? '— 收起 '
                          : `— 展开更多 (${comment.replies.length - 3}条) `
                      }}
                    </text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载中 -->
      <view v-else class="loading">
        <text>{{ loading ? '加载中...' : '暂无数据' }}</text>
      </view>
    </view>

    <!-- 评论输入框 -->
    <view class="comment-input-container">
      <view class="comment-input-wrapper">
        <image class="input-avatar" :src="currentUser.avatar" />
        <input class="comment-input" :placeholder="replyTarget ? `回复 @${replyTarget.nickname}` : `回复 ${postDetail?.nickname || ''}`
          " v-model="commentText" @confirm="submitComment" confirm-type="send" />
        <view v-if="replyTarget" class="cancel-reply-btn" @click="cancelReply">
          <text class="i-carbon-close text-24rpx" />
        </view>
        <view class="send-btn" @click="submitComment" :class="{ active: commentText.trim() }">
          <text class="i-carbon-send text-32rpx" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRequest } from '@/api/index'
import {
  formatUserLevel,
  formatRelativeTime,
  getAvatarUrl,
  formatNickname
} from '@/utils/timeFormat'

const statusBarHeight = ref(0)
const postDetail = ref(null)
const postId = ref('')
const loading = ref(false)

// 评论相关数据
const commentsList = ref([])
const commentText = ref('')
const replyTarget = ref(null)
const userAvatar = ref('/static/errimg.png')

// 当前用户信息
const currentUser = ref({
  id: 'current_user_id',
  nickname: '用户昵称',
  level: 'Lv.5',
  avatar: '/static/errimg.png'
})

// 默认图片路径
const defaultAvatar = '/static/errimg.png'
const defaultImage = '/static/errimg.png'

// 获取状态栏高度
const systemInfo = uni.getSystemInfoSync()
statusBarHeight.value = systemInfo.statusBarHeight

// 获取页面参数
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  postId.value = currentPage.options.id || currentPage.$route?.params?.id

  if (postId.value) {
    loadPostDetail()
    loadComments()
  }
})

// 加载帖子详情
const loadPostDetail = async () => {
  loading.value = true
  try {
    const { API_ARTICLE_GET_DETAIL } = useRequest()
    const response = await API_ARTICLE_GET_DETAIL(postId.value)

    if (response.status === 0) {
      const data = response.data
      const baseURL = import.meta.env.VITE_APP_API_BASEURL || 'http://localhost:3001'

      // 将API返回的数据映射到组件需要的格式
      postDetail.value = {
        id: data.id,
        nickname: formatNickname(data.nickname, data.user_id),
        level: formatUserLevel(data.level),
        avatar: getAvatarUrl(data.avatar),
        time: formatRelativeTime(data.created_at),
        content: data.content,
        images: (data.image_urls || []).map((url) =>
          url.startsWith('http') ? url : `${baseURL}${url}`
        ),
        views: data.view_count,
        likes: data.like_count,
        comments: data.comment_count,
        isLiked: false, // 这个需要根据实际业务逻辑设置
        isFollowed: false, // 这个需要根据实际业务逻辑设置
        category: data.cate_name,
        userId: data.user_id
      }
    } else {
      throw new Error(response.message || '获取文章详情失败')
    }
  } catch (error) {
    console.error('加载帖子详情失败:', error)
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    // 如果没有上一页，跳转到首页
    uni.reLaunch({
      url: '/pages/index/index'
    })
  }
}

// 跳转到用户主页
const goToUserProfile = (user) => {
  uni.navigateTo({
    url: `/pages/userPackage/userProfile?id=${user.id}`
  })
}

// 处理关注
const handleFollow = (user) => {
  user.isFollowed = !user.isFollowed
  uni.showToast({
    title: user.isFollowed ? '已关注' : '已取消关注',
    icon: 'none'
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

// 处理举报
const handleReport = (post) => {
  uni.showActionSheet({
    itemList: ['举报违规内容', '举报垃圾信息', '举报其他'],
    success: (res) => {
      uni.showToast({
        title: '举报成功',
        icon: 'success'
      })
    }
  })
}

// 预览图片
const previewImage = (images, current) => {
  uni.previewImage({
    urls: images,
    current
  })
}

// 处理头像加载失败
const handleAvatarError = () => {
  if (postDetail.value) {
    postDetail.value.avatar = defaultAvatar
  }
}

// 处理帖子图片加载失败
const handleImageError = (event, index) => {
  if (postDetail.value && postDetail.value.images && postDetail.value.images[index]) {
    postDetail.value.images[index] = defaultImage
  }
}

// 加载评论列表
const loadComments = () => {
  // 模拟评论数据
  commentsList.value = [
    {
      id: 1,
      userId: 'user_a_id',
      nickname: '用户A',
      level: formatUserLevel(3),
      avatar: '/static/errimg.png',
      content: '这个帖子很有意思！',
      time: formatRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000)),
      likes: 5,
      isLiked: false,
      showAllReplies: false,
      replies: [
        {
          id: 11,
          userId: 'user_b_id',
          nickname: '用户B',
          level: formatUserLevel(2),
          avatar: '/static/errimg.png',
          content: '我也觉得很棒',
          replyTo: '用户A',
          time: formatRelativeTime(new Date(Date.now() - 1 * 60 * 60 * 1000)),
          likes: 2,
          isLiked: false
        },
        {
          id: 12,
          userId: 'user_d_id',
          nickname: '用户D',
          level: formatUserLevel(1),
          avatar: '/static/errimg.png',
          content: '同意楼上的观点',
          replyTo: '用户B',
          time: formatRelativeTime(new Date(Date.now() - 50 * 60 * 1000)),
          likes: 1,
          isLiked: false
        },
        {
          id: 13,
          userId: 'user_e_id',
          nickname: '用户E',
          level: formatUserLevel(4),
          avatar: '/static/errimg.png',
          content: '学习了，感谢分享',
          replyTo: '用户A',
          time: formatRelativeTime(new Date(Date.now() - 30 * 60 * 1000)),
          likes: 3,
          isLiked: false
        },
        {
          id: 14,
          userId: 'user_f_id',
          nickname: '用户F',
          level: formatUserLevel(2),
          avatar: '/static/errimg.png',
          content: '很有启发性的内容',
          replyTo: '用户A',
          time: formatRelativeTime(new Date(Date.now() - 20 * 60 * 1000)),
          likes: 0,
          isLiked: false
        }
      ]
    },
    {
      id: 2,
      userId: 'user_c_id',
      nickname: '用户C',
      level: formatUserLevel(5),
      avatar: '/static/errimg.png',
      content: '感谢分享，学到了很多！',
      time: formatRelativeTime(new Date(Date.now() - 3 * 60 * 60 * 1000)),
      likes: 8,
      isLiked: true,
      showAllReplies: false,
      replies: []
    }
  ]
}

// 提交评论
const submitComment = async () => {
  if (!commentText.value.trim()) {
    uni.showToast({
      title: '请输入评论内容',
      icon: 'none'
    })
    return
  }

  try {
    const { API_COMMENT_CREATE, API_COMMENT_REPLY } = useRequest()
    let response

    if (replyTarget.value) {
      // 回复评论
      response = await API_COMMENT_REPLY(replyTarget.value.id, commentText.value.trim())
      
      if (response.status === 0) {
        const targetComment = commentsList.value.find((c) => c.id === replyTarget.value.id)
        if (targetComment) {
          const newReply = {
            id: response.data.replyId,
            userId: currentUser.value.id,
            nickname: currentUser.value.nickname,
            level: currentUser.value.level,
            avatar: currentUser.value.avatar,
            content: response.data.content,
            replyTo: replyTarget.value.nickname,
            time: formatRelativeTime(new Date(response.data.created_at)),
            likes: 0,
            isLiked: false
          }
          targetComment.replies.push(newReply)
        }
        replyTarget.value = null
      }
    } else {
      // 发表新评论
      response = await API_COMMENT_CREATE(postDetail.value.id, commentText.value.trim())
      
      if (response.status === 0) {
        const newComment = {
          id: response.data.commentId,
          userId: currentUser.value.id,
          nickname: currentUser.value.nickname,
          level: currentUser.value.level,
          avatar: currentUser.value.avatar,
          content: response.data.content,
          time: formatRelativeTime(new Date(response.data.created_at)),
          likes: 0,
          isLiked: false,
          showAllReplies: false,
          replies: []
        }
        commentsList.value.unshift(newComment)
      }
    }

    if (response.status === 0) {
      // 更新评论数
      if (postDetail.value) {
        postDetail.value.comments++
      }

      commentText.value = ''
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

// 处理回复点赞
const handleReplyLike = async (reply) => {
  try {
    const { API_COMMENT_LIKE } = useRequest()
    const response = await API_COMMENT_LIKE(reply.id)

    if (response.status === 0) {
      // 根据接口返回的状态更新UI
      reply.isLiked = response.data.isLiked
      reply.likes += response.data.isLiked ? 1 : -1

      uni.showToast({
        title: response.message,
        icon: 'none'
      })
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('点赞回复失败:', error)
    uni.showToast({
      title: '操作失败：' + error.message,
      icon: 'none'
    })
  }
}

// 回复评论
const handleReply = (comment) => {
  replyTarget.value = comment
}

// 回复回复
const handleReplyToReply = (reply, parentComment) => {
  replyTarget.value = {
    id: parentComment.id,
    nickname: reply.nickname
  }
}

// 举报评论
const handleCommentReport = (comment) => {
  uni.showActionSheet({
    itemList: ['举报违规内容', '举报垃圾信息', '举报其他'],
    success: (res) => {
      uni.showToast({
        title: '举报成功',
        icon: 'success'
      })
    }
  })
}

// 举报回复
const handleReplyReport = (reply) => {
  uni.showActionSheet({
    itemList: ['举报违规内容', '举报垃圾信息', '举报其他'],
    success: (res) => {
      uni.showToast({
        title: '举报成功',
        icon: 'success'
      })
    }
  })
}

// 取消回复
const cancelReply = () => {
  replyTarget.value = null
}

// 切换回复展开/收起状态
const toggleReplies = (comment) => {
  comment.showAllReplies = !comment.showAllReplies
}

// 获取可见的回复列表
const getVisibleReplies = (comment) => {
  if (!comment.replies || comment.replies.length === 0) {
    return []
  }

  if (comment.showAllReplies) {
    return comment.replies
  } else {
    return comment.replies.slice(0, 3)
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #fff;
}

.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 88rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1rpx solid #f0f0f0;

  .nav-left {
    position: absolute;
    left: 24rpx;
    padding: 20rpx;
  }

  .nav-title {
    font-size: 36rpx;
    font-weight: 500;
    color: #333;
  }
}

.content-container {
  padding-top: calc(88rpx + 44px);
  padding-bottom: 200rpx;
}

.post-detail {
  background: #fff;
  padding: 32rpx 24rpx;
  margin-bottom: 24rpx;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;

  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 24rpx;
  }

  .user-info {
    flex: 1;

    .nickname {
      font-size: 30rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 8rpx;

      .level {
        font-size: 30rpx;
        color: #ff9800;
        margin-left: 8rpx;
      }
    }

    .time {
      font-size: 24rpx;
      color: #999;
    }
  }

  .follow-btn {
    padding: 12rpx 24rpx;
    background: #000;
    color: #fff;
    border-radius: 50rpx;
    font-size: 24rpx;

    &.followed {
      background: #f0f0f0;
      color: #666;
    }
  }
}

.post-content {
  font-size: 30rpx;
  line-height: 1.6;
  color: #333;
  margin-bottom: 24rpx;
}

.post-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 24rpx;

  .post-img {
    width: 220rpx;
    height: 220rpx;
    border-radius: 8rpx;
  }
}

.post-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 30rpx 0 0 0;
  padding: 0 20rpx;

  .stat-item {
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

.loading {
  text-align: center;
  padding: 100rpx 0;
  font-size: 28rpx;
  color: #999;
}

// 评论区域样式
.comments-section {
  margin-top: 40rpx;
  border-top: 1rpx solid #f0f0f0;
  padding-top: 32rpx;
}

.comments-header {
  margin-bottom: 32rpx;
}

.comments-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.comments-list {
  .comment-item {
    display: flex;
    margin-bottom: 32rpx;

    .comment-avatar {
      width: 64rpx;
      height: 64rpx;
      border-radius: 50%;
      margin-right: 24rpx;
      flex-shrink: 0;
    }

    .comment-content {
      flex: 1;

      .comment-header {
        display: flex;
        align-items: center;
        margin-bottom: 16rpx;

        .comment-nickname {
          font-size: 28rpx;
          font-weight: normal;
          color: #b0b1b5;
          margin-right: 16rpx;
        }

        .comment-level {
          font-size: 28rpx;
          color: #ff9800;
          margin-right: 16rpx;
        }

        .comment-time {
          font-size: 24rpx;
          color: #b0b1b5;
        }
      }

      .comment-text {
        font-size: 30rpx;
        color: #333;
        line-height: 1.5;
        margin-bottom: 6rpx;
      }

      .comment-actions {
        display: flex;
        align-items: center;

        .comment-action {
          display: flex;
          align-items: center;
          margin-right: 32rpx;
          padding: 6rpx 0;

          .action-text {
            font-size: 24rpx;
            color: #b0b1b5;
          }

          .liked {
            color: #ff0059 !important;
          }
        }

        .like-action {
          margin-left: auto;
          margin-right: 32rpx;
        }

        .report-action {
          margin-right: 0;
        }
      }
    }
  }
}

.replies-toggle {
  margin-top: 16rpx;
  padding: 12rpx 0;
  text-align: center;
  cursor: pointer;

  .toggle-text {
    font-size: 26rpx;
    color: #1890ff;

    &:hover {
      color: #40a9ff;
    }

    &:active {
      color: #096dd9;
    }
  }
}

.replies-list {
  margin-top: 24rpx;

  .reply-item {
    display: flex;
    margin-bottom: 24rpx;

    .reply-avatar {
      width: 48rpx;
      height: 48rpx;
      border-radius: 50%;
      margin-right: 16rpx;
      flex-shrink: 0;
    }

    .reply-content {
      flex: 1;

      .reply-header {
        display: flex;
        align-items: center;
        margin-bottom: 12rpx;

        .reply-nickname {
          font-size: 28rpx;
          font-weight: normal;
          color: #b0b1b5;
          margin-right: 12rpx;
        }

        .reply-level {
          font-size: 28rpx;
          color: #ff9800;
          margin-right: 12rpx;
        }

        .reply-arrow {
          font-size: 24rpx;
          color: #999;
          margin: 0 8rpx;
        }

        .reply-target {
          font-size: 28rpx;
          font-weight: normal;
          color: #b0b1b5;
        }

        .reply-time {
          font-size: 24rpx;
          color: #b0b1b5;
        }
      }

      .reply-text {
        font-size: 30rpx;
        color: #333;
        line-height: 1.5;
        margin-bottom: 6rpx;

        .reply-to {
          color: #1890ff;
        }
      }

      .reply-actions {
        display: flex;
        align-items: center;

        .reply-action {
          display: flex;
          align-items: center;
          margin-right: 24rpx;
          padding: 4rpx 0;

          .action-text {
            font-size: 24rpx;
            color: #b0b1b5;
          }

          .liked {
            color: #ff0059 !important;
          }
        }

        .like-action {
          margin-left: auto;
          margin-right: 32rpx;
        }

        .report-action {
          margin-right: 0;
        }
      }
    }
  }
}

// 评论输入框样式
.comment-input-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
  padding: 24rpx;
  z-index: 999;
}

.comment-input-wrapper {
  display: flex;
  align-items: center;

  .input-avatar {
    width: 56rpx;
    height: 56rpx;
    border-radius: 50%;
    margin-right: 16rpx;
    flex-shrink: 0;
  }

  .comment-input {
    flex: 1;
    background: #f8f8f8;
    border-radius: 32rpx;
    padding: 16rpx 24rpx;
    font-size: 28rpx;
    color: #333;
    border: none;
    outline: none;
  }

  .cancel-reply-btn {
    margin-left: 16rpx;
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    transition: all 0.3s;

    &:active {
      background: #e0e0e0;
    }
  }

  .send-btn {
    margin-left: 16rpx;
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    transition: all 0.3s;

    &.active {
      background: #1890ff;
      color: #fff;
    }
  }
}

.me-tag {
  display: flex;
  margin-right: 16rpx;
  padding: 2rpx 8rpx 4rpx;
  background: #1890ff;
  color: #fff;
  font-size: 22rpx;
  align-items: center;
  justify-content: center;
  height: 28rpx;
  border-radius: 6rpx;
  line-height: 1;
}
</style>
