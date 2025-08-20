/**
 * 获赞列表示例数据
 * 用于演示获赞功能
 */

export const mockLikesData = {
  status: 0,
  message: '获取成功',
  data: {
    total: 5,
    pagenum: 1,
    pagesize: 10,
    list: [
      {
        type: 'post',
        likeId: 1,
        likeTime: '2024-03-20T14:30:00.000Z',
        liker: {
          id: 101,
          nickname: '摄影爱好者',
          avatar: '/static/logo.jpg',
          level: 6,
          levelName: '高级会员'
        },
        target: {
          id: 123,
          content: '今天天气真好，出去走走~ #生活 #日常 #摄影',
          createdAt: '2024-03-20T10:00:00.000Z',
          likeCount: 15,
          commentCount: 8,
          viewCount: 256
        }
      },
      {
        type: 'post',
        likeId: 2,
        likeTime: '2024-03-20T13:15:00.000Z',
        liker: {
          id: 102,
          nickname: '美食达人',
          avatar: '/static/logo.jpg',
          level: 4,
          levelName: '普通会员'
        },
        target: {
          id: 124,
          content: '分享一个超好吃的餐厅，强烈推荐！ #美食 #探店 #推荐',
          createdAt: '2024-03-20T09:30:00.000Z',
          likeCount: 23,
          commentCount: 12,
          viewCount: 189
        }
      },
      {
        type: 'comment',
        likeId: 3,
        likeTime: '2024-03-20T12:45:00.000Z',
        liker: {
          id: 103,
          nickname: '科技控',
          avatar: '/static/logo.jpg',
          level: 8,
          levelName: '高级会员'
        },
        target: {
          id: 456,
          content: '这个评论写得真好，说出了我的心声！',
          createdAt: '2024-03-20T11:20:00.000Z',
          likeCount: 5,
          replyCount: 2
        },
        post: {
          id: 125,
          content: '新买的相机到了，拍几张试试效果 #摄影 #器材 #开箱',
          categoryName: '摄影'
        }
      },
      {
        type: 'reply',
        likeId: 4,
        likeTime: '2024-03-20T11:20:00.000Z',
        liker: {
          id: 104,
          nickname: '旅行者',
          avatar: '/static/logo.jpg',
          level: 5,
          levelName: '普通会员'
        },
        target: {
          id: 789,
          content: '回复得很到位，完全同意你的观点！',
          createdAt: '2024-03-20T10:30:00.000Z',
          likeCount: 3
        },
        comment: {
          id: 456,
          content: '这个评论写得真好，说出了我的心声！'
        },
        post: {
          id: 126,
          content: '分享一个超好吃的餐厅，强烈推荐！ #美食 #探店 #推荐',
          categoryName: '美食'
        }
      },
      {
        type: 'post',
        likeId: 5,
        likeTime: '2024-03-20T10:30:00.000Z',
        liker: {
          id: 105,
          nickname: '设计师小王',
          avatar: '/static/logo.jpg',
          level: 7,
          levelName: '高级会员'
        },
        target: {
          id: 127,
          content: '今天的设计灵感来源于大自然，色彩搭配真的很棒！ #设计 #灵感 #自然',
          createdAt: '2024-03-20T08:45:00.000Z',
          likeCount: 31,
          commentCount: 15,
          viewCount: 423
        }
      }
    ]
  }
}

/**
 * 模拟API响应
 */
export const mockLikesAPI = (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockLikesData)
    }, 500)
  })
}
