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
          <view v-if="postDetail.userId !== currentUser.id"
            :class="['follow-btn', postDetail.isFollowed ? 'followed' : '']" @click="handleFollow(postDetail)">
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
            <text>{{ totalCommentsCount }}</text>
          </view>
          <view class="stat-item">
            <text class="i-carbon-view text-32rpx mr-2" />
            <text>{{ postDetail.views }}</text>
          </view>
          <view class="stat-item" @click="handleLike(postDetail)">
            <text :class="['i-carbon-favorite text-32rpx mr-2', postDetail.isLiked ? 'liked' : '']" />
            <text>{{ postDetail.likes }}</text>
          </view>
          <view class="stat-item" @click="handleReport('post', postDetail.id)">
            <text class="i-carbon-overflow-menu-horizontal text-32rpx" />
          </view>
        </view>

        <!-- 评论区域 -->
        <view class="comments-section">
          <view class="comments-header">
            <text class="comments-title">评论 {{ totalCommentsCount }}</text>
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
                    <text :class="['i-carbon-favorite text-32rpx mr-1', comment.isLiked ? 'liked' : '']" />
                    <text class="action-text">{{ comment.likes || '' }}</text>
                  </view>
                  <view class="comment-action report-action" @click="handleReport('comment', comment.id)">
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
                          ]" />
                          <text class="action-text">{{ reply.likes || '' }}</text>
                        </view>
                        <view class="reply-action report-action" @click="handleReport('reply', reply.id)">
                          <text class="i-carbon-overflow-menu-horizontal text-32rpx" style="color: #999999" />
                        </view>
                      </view>
                    </view>
                  </view>
                </view>

                <!-- 展开/收起按钮 -->
                <view v-if="comment.replyCount > 0" class="replies-toggle-container" @click.stop>
                  <view class="replies-toggle" @click.stop="toggleReplies(comment)">
                    <text class="toggle-text">
                      {{ getToggleButtonText(comment) }}
                    </text>
                  </view>
                  <view v-if="comment.expandLevel > 0" class="collapse-btn" @click.stop="collapseReplies(comment)">
                    <text class="collapse-text">收起</text>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRequest } from '@/api'
import {
  formatRelativeTime,
  formatUserLevel,
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
  id: null,
  nickname: '用户昵称',
  level: 'Lv.5',
  avatar: '/static/errimg.png'
})

// 默认图片路径
const defaultAvatar = '/static/errimg.png'
const defaultImage = '/static/errimg.png'

// 评论和回复的总数（使用API返回的total字段）
const totalCommentsCount = ref(0)

// 获取状态栏高度
const systemInfo = uni.getSystemInfoSync()
statusBarHeight.value = systemInfo.statusBarHeight

// 获取页面参数
onMounted(async () => {
  // 获取当前用户信息
  try {
    const { API_USER_GET_INFO } = useRequest()
    const userRes = await API_USER_GET_INFO()
    if (userRes.status === 0 && userRes.data) {
      currentUser.value = {
        id: userRes.data.id,
        nickname: userRes.data.nickname || '用户昵称',
        level: userRes.data.level || 'Lv.1',
        avatar: userRes.data.avatar || '/static/errimg.png'
      }
    }
  } catch (error) {
    console.warn('获取用户信息失败:', error)
  }

  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  postId.value = currentPage.options.id || currentPage.$route?.params?.id

  if (postId.value) {
    // 确保先获取用户信息，再加载帖子详情，这样关注状态判断才准确
    await loadPostDetail()
    await loadComments()
  }

  // 监听关注状态变更事件
  uni.$on('followStatusChanged', (data) => {
    if (postDetail.value && postDetail.value.userId === data.userId) {
      postDetail.value.isFollowed = data.isFollowed
    }
  })
})

// 页面卸载时移除事件监听
onUnmounted(() => {
  uni.$off('followStatusChanged')
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
        isLiked: data.is_liked || false,
        isFollowed: false, // 初始设置为false，后续通过API获取
        category: data.cate_name,
        userId: data.user_id
      }

      // 如果不是自己的帖子，获取准确的关注状态
      if (currentUser.value.id && data.user_id !== currentUser.value.id) {
        await checkFollowStatus(data.user_id)
      }

      console.log('详情页关注状态设置:', {
        currentUserId: currentUser.value.id,
        postUserId: data.user_id,
        finalIsFollowed: postDetail.value.isFollowed,
        isOwnPost: currentUser.value.id && data.user_id === currentUser.value.id
      })

      // 增加帖子浏览量
      try {
        const { API_POST_INCREASE_VIEW_COUNT } = useRequest()
        const viewResponse = await API_POST_INCREASE_VIEW_COUNT(postId.value)
        if (viewResponse.status === 0) {
          postDetail.value.views++ // 成功后手动增加浏览量
          console.log('浏览量增加成功')
        } else {
          console.error('增加浏览量失败:', viewResponse.message)
        }
      } catch (viewError) {
        console.error('增加浏览量失败:', viewError)
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

// 检查关注状态
const checkFollowStatus = async (targetUserId) => {
  try {
    const { API_USER_FOLLOW_STATUS } = useRequest()
    const response = await API_USER_FOLLOW_STATUS(targetUserId)

    if (response.status === 0 && response.data) {
      postDetail.value.isFollowed = response.data.isFollowing || false
      console.log('详情页关注状态检查:', {
        targetUserId: String(targetUserId),
        isFollowed: postDetail.value.isFollowed
      })
    } else {
      postDetail.value.isFollowed = false
    }
  } catch (error) {
    console.error('检查关注状态失败:', error)
    postDetail.value.isFollowed = false
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
const handleFollow = async (user) => {
  try {
    const { API_USER_FOLLOW } = useRequest()
    const response = await API_USER_FOLLOW(user.userId)

    if (response.status === 0) {
      // 根据接口返回的状态更新UI
      user.isFollowed = response.data.isFollowing

      uni.showToast({
        title: response.message,
        icon: 'none'
      })

      // 发送关注状态变更事件，通知其他页面更新
      uni.$emit('followStatusChanged', {
        userId: user.userId,
        isFollowed: response.data.isFollowing
      })
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('关注操作失败:', error)
    uni.showToast({
      title: '操作失败：' + error.message,
      icon: 'none'
    })
  }
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
const loadComments = async () => {
  if (!postId.value) return

  try {
    const { API_COMMENT_GET_LIST } = useRequest()
    const response = await API_COMMENT_GET_LIST({
      articleId: postId.value,
      pageNum: 1,
      pageSize: 10
    })

    if (response.status === 0) {
      const data = response.data
      const baseURL = import.meta.env.VITE_APP_API_BASEURL || 'http://localhost:3001'

      // 将API返回的数据映射到组件需要的格式
      const comments = (data.list || []).map((comment) => {
        return {
          id: comment.id,
          userId: comment.user.id,
          nickname: formatNickname(comment.user.nickname, comment.user.id),
          level: formatUserLevel(comment.user.level),
          avatar: getAvatarUrl(comment.user.avatar),
          content: comment.content,
          time: formatRelativeTime(comment.created_at),
          likes: comment.like_count,
          isLiked: comment.is_liked,
          showAllReplies: false,
          replies: [], // 初始化为空数组，后续加载回复
          replyCount: comment.reply_count || 0, // 使用API返回的回复数量
          expandLevel: 0 // 展开级别：0-收起，1-展开10条，2-展开20条，3-全部展开
        }
      })

      // 设置初始显示状态为收起
      comments.forEach((comment) => {
        comment.showAllReplies = false
      })

      commentsList.value = comments
      // 更新总评论数（使用API返回的total字段）
      totalCommentsCount.value = response.data.total || 0
    } else {
      throw new Error(response.message || '获取评论列表失败')
    }
  } catch (error) {
    console.error('加载评论列表失败:', error)
    uni.showToast({
      title: error.message || '加载评论失败',
      icon: 'none'
    })
    // 如果API调用失败，使用空数组
    commentsList.value = []
  }
}

// 加载回复列表
const loadReplies = async (comment, targetCount = null) => {
  try {
    const { API_REPLY_GET_LIST } = useRequest()

    // 根据目标数量确定需要加载的数据量
    let pageSize = 10 // 默认加载10条
    if (targetCount) {
      pageSize = Math.min(targetCount, comment.replyCount) // 不超过总回复数
    } else if (comment.replyCount <= 20) {
      pageSize = comment.replyCount // 如果总数不超过20，直接加载全部
    } else {
      pageSize = 30 // 否则加载30条，足够支持分批展开
    }

    const params = {
      commentId: comment.id,
      pageNum: 1,
      pageSize
    }

    const response = await API_REPLY_GET_LIST(params)

    if (response.status === 0) {
      const data = response.data

      // 将API返回的回复数据映射到组件需要的格式
      comment.replies = (data.list || []).map((reply) => ({
        id: reply.id,
        userId: reply.user.id,
        nickname: formatNickname(reply.user.nickname, reply.user.id),
        level: formatUserLevel(reply.user.level),
        avatar: getAvatarUrl(reply.user.avatar),
        content: reply.content,
        time: formatRelativeTime(reply.created_at),
        likes: reply.like_count,
        isLiked: reply.is_liked,
        replyTo: null // 根据实际需求设置回复目标
      }))
      // 成功加载回复数据
    } else {
      console.log('该评论暂无回复或获取回复失败:', response.message)
      // 如果获取回复失败，设置为空数组
      comment.replies = []
    }
  } catch (error) {
    console.log(`加载评论${comment.id}的回复失败，可能该评论暂无回复:`, error.message)
    // 如果API调用失败，设置为空数组
    comment.replies = []
  }
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
          targetComment.replyCount++ // 增加回复计数
          // 将新回复添加到回复列表的开头，以便立即显示
          targetComment.replies.unshift(newReply)
          console.log('新回复已添加:', newReply)
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
        // 将新评论添加到评论列表的开头，以便立即显示
        commentsList.value.unshift(newComment)
        totalCommentsCount.value++ // 增加评论总数
        console.log('新评论已添加:', newComment)
      }
    }

    if (response.status === 0) {
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
    const { API_REPLY_LIKE } = useRequest()
    const response = await API_REPLY_LIKE(reply.id)

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

// 举报相关状态
// 举报相关状态
const reportedItems = ref(new Set()) // 存储已举报的 target_type-target_id 组合

// 处理举报
const handleReport = (type, targetId) => {
  const reportKey = `${type}-${targetId}`
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
          target_type: type,
          target_id: targetId,
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

// 回复回复
const handleReplyToReply = (reply, parentComment) => {
  replyTarget.value = {
    id: parentComment.id,
    nickname: reply.nickname
  }
}

// 取消回复
const cancelReply = () => {
  replyTarget.value = null
}

// 切换回复展开状态（只处理展开逻辑）
const toggleReplies = async (comment) => {
  if (comment.expandLevel === 0) {
    // 收起状态 -> 展开3条
    if (comment.replies.length === 0 && comment.replyCount > 0) {
      await loadReplies(comment, Math.min(3, comment.replyCount))
    }
    comment.expandLevel = 1
    comment.showAllReplies = true
  } else {
    // 继续展开更多回复
    const currentVisible = getVisibleRepliesCount(comment)
    const nextVisible = currentVisible + 10

    if (nextVisible < comment.replyCount) {
      // 继续展开更多回复
      if (comment.replies.length < nextVisible) {
        await loadReplies(comment, nextVisible)
      }
      comment.expandLevel++
    } else if (currentVisible < comment.replyCount) {
      // 展开全部剩余回复
      if (comment.replies.length < comment.replyCount) {
        await loadReplies(comment, comment.replyCount)
      }
      comment.expandLevel++
    }
  }
}

// 收起回复
const collapseReplies = (comment) => {
  comment.expandLevel = 0
  comment.showAllReplies = false
}

// 获取当前应该显示的回复数量
const getVisibleRepliesCount = (comment) => {
  if (comment.expandLevel === 0) return 0
  if (comment.expandLevel === 1) return Math.min(3, comment.replyCount)
  return Math.min(3 + (comment.expandLevel - 1) * 10, comment.replyCount)
}

// 获取可见的回复列表
const getVisibleReplies = (comment) => {
  if (!comment.replies || comment.replies.length === 0) {
    return []
  }

  const visibleCount = getVisibleRepliesCount(comment)
  return comment.replies.slice(0, visibleCount)
}

// 获取展开按钮文本
const getToggleButtonText = (comment) => {
  const totalCount = comment.replyCount
  const currentVisible = getVisibleRepliesCount(comment)

  if (comment.expandLevel === 0) {
    return `— 查看回复 (${totalCount}条)`
  }

  if (currentVisible >= totalCount) {
    return '— 已全部展开'
  }

  const remaining = totalCount - currentVisible
  return `— 查看更多回复 (${remaining}条)`
}
</script>

<style lang="scss" scoped>
.page-container {

  /* 举报弹窗样式 */
  .report-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;

    .modal-content {
      background-color: #fff;
      padding: 40rpx;
      border-radius: 16rpx;
      width: 80%;
      max-width: 600rpx;

      .modal-title {
        font-size: 36rpx;
        font-weight: bold;
        margin-bottom: 30rpx;
        text-align: center;
      }

      .reason-item {
        display: flex;
        align-items: center;
        margin-bottom: 20rpx;

        radio {
          transform: scale(0.8);
          /* 调整单选框大小 */
          margin-right: 10rpx;
        }

        text {
          font-size: 30rpx;
        }
      }

      .modal-actions {
        display: flex;
        justify-content: space-around;
        margin-top: 40rpx;

        button {
          width: 45%;
          padding: 15rpx 0;
          border-radius: 10rpx;
          font-size: 32rpx;
          text-align: center;
          border: none;
          cursor: pointer;

          &.cancel-btn {
            background-color: #f0f0f0;
            color: #333;
          }

          &.submit-btn {
            background-color: #007bff;
            color: #fff;
          }
        }
      }
    }
  }

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

    .i-carbon-favorite {
      color: #999999;
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

          .i-carbon-favorite {
            color: #999999;
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

.replies-toggle-container {
  margin-top: 16rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.replies-toggle {
  padding: 12rpx 0;
  text-align: left;
  cursor: pointer;

  .toggle-text {
    font-size: 28rpx;
    color: #1da1f2;

    &:hover {
      color: #40a9ff;
    }

    &:active {
      color: #096dd9;
    }
  }
}

.collapse-btn {
  padding: 12rpx 0;
  cursor: pointer;

  .collapse-text {
    font-size: 28rpx;
    color: #999;

    &:hover {
      color: #666;
    }

    &:active {
      color: #333;
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

          .i-carbon-favorite {
            color: #999999;
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
