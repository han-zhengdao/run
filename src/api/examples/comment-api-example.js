/**
 * 获取评论列表接口使用示例
 * 这个文件展示了如何使用新添加的获取评论列表API
 */

import { useRequest } from '@/api/index'

/**
 * 获取评论列表示例
 * @param {number} articleId - 文章ID
 * @param {number} pageNum - 页码，默认1
 * @param {number} pageSize - 每页数量，默认10，最大50
 */
export const getCommentsExample = async (articleId, pageNum = 1, pageSize = 10) => {
  try {
    const { API_COMMENT_GET_LIST } = useRequest()
    
    const response = await API_COMMENT_GET_LIST({
      articleId,
      pageNum,
      pageSize
    })

    if (response.status === 0) {
      console.log('获取评论列表成功:', response.data)
      
      // 响应数据结构示例：
      // {
      //   "status": 0,
      //   "message": "获取成功",
      //   "data": {
      //     "total": 25,
      //     "pagenum": 1,
      //     "pagesize": 10,
      //     "list": [
      //       {
      //         "id": 1,
      //         "content": "评论内容",
      //         "like_count": 5,
      //         "is_liked": true,
      //         "created_at": "2024-01-01T10:00:00.000Z",
      //         "user": {
      //           "id": 123,
      //           "nickname": "用户昵称",
      //           "avatar": "头像URL",
      //           "level": 2
      //         }
      //       }
      //     ]
      //   }
      // }
      
      return {
        success: true,
        data: response.data,
        total: response.data.total,
        comments: response.data.list
      }
    } else {
      throw new Error(response.message || '获取评论列表失败')
    }
  } catch (error) {
    console.error('获取评论列表失败:', error)
    return {
      success: false,
      error: error.message,
      data: null
    }
  }
}

/**
 * 在Vue组件中使用示例
 */
export const useCommentsInComponent = () => {
  // 在Vue组件的setup函数中使用
  const loadComments = async (articleId) => {
    const result = await getCommentsExample(articleId, 1, 10)
    
    if (result.success) {
      // 处理成功获取的评论数据
      const comments = result.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        likeCount: comment.like_count,
        isLiked: comment.is_liked,
        createdAt: comment.created_at,
        user: {
          id: comment.user.id,
          nickname: comment.user.nickname,
          avatar: comment.user.avatar,
          level: comment.user.level
        }
      }))
      
      console.log('处理后的评论数据:', comments)
      return comments
    } else {
      // 处理错误
      uni.showToast({
        title: result.error || '获取评论失败',
        icon: 'none'
      })
      return []
    }
  }
  
  return {
    loadComments
  }
}