# 获取评论列表接口使用指南

## 接口概述

新增的获取评论列表接口 `API_COMMENT_GET_LIST` 用于获取指定文章的评论列表，支持分页查询。

## 接口信息

- **接口地址**: `GET /my/interaction/comments`
- **需要登录**: 是
- **接口方法**: `API_COMMENT_GET_LIST`

## 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| articleId | number | 是 | 文章ID |
| pageNum | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10，最大50 |

## 使用示例

### 基本用法

```javascript
import { useRequest } from '@/api/index'

const { API_COMMENT_GET_LIST } = useRequest()

// 获取评论列表
const response = await API_COMMENT_GET_LIST({
  articleId: 123,
  pageNum: 1,
  pageSize: 10
})
```

### 在Vue组件中使用

```javascript
<script setup>
import { ref, onMounted } from 'vue'
import { useRequest } from '@/api/index'

const commentsList = ref([])
const loading = ref(false)

const loadComments = async (articleId) => {
  loading.value = true
  try {
    const { API_COMMENT_GET_LIST } = useRequest()
    const response = await API_COMMENT_GET_LIST({
      articleId,
      pageNum: 1,
      pageSize: 10
    })

    if (response.status === 0) {
      commentsList.value = response.data.list
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('获取评论失败:', error)
    uni.showToast({
      title: error.message || '获取评论失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadComments(123) // 传入文章ID
})
</script>
```

## 响应数据格式

```json
{
  "status": 0,
  "message": "获取成功",
  "data": {
    "total": 25,
    "pagenum": 1,
    "pagesize": 10,
    "list": [
      {
        "id": 1,
        "content": "评论内容",
        "like_count": 5,
        "is_liked": true,
        "created_at": "2024-01-01T10:00:00.000Z",
        "user": {
          "id": 123,
          "nickname": "用户昵称",
          "avatar": "头像URL",
          "level": 2
        }
      }
    ]
  }
}
```

## 字段说明

### 响应字段

- `total`: 评论总数
- `pagenum`: 当前页码
- `pagesize`: 每页数量
- `list`: 评论列表数组

### 评论对象字段

- `id`: 评论ID
- `content`: 评论内容
- `like_count`: 点赞数量
- `is_liked`: 当前用户是否已点赞
- `created_at`: 创建时间（ISO格式）
- `user`: 评论用户信息
  - `id`: 用户ID
  - `nickname`: 用户昵称
  - `avatar`: 用户头像URL
  - `level`: 用户等级

## 注意事项

1. **登录验证**: 此接口需要用户登录，请确保请求头中包含有效的Authorization token
2. **分页限制**: pageSize最大值为50，超过将被限制为50
3. **排序规则**: 评论按创建时间倒序排列（最新的在前）
4. **错误处理**: 请妥善处理网络错误和业务错误
5. **数据格式**: 时间字段为ISO格式，需要根据需要进行格式化

## 相关接口

- `API_COMMENT_CREATE`: 发表评论
- `API_COMMENT_REPLY`: 回复评论
- `API_COMMENT_LIKE`: 点赞/取消点赞评论

## 更新日志

- **2024-01-01**: 新增获取评论列表接口
- **2024-01-01**: 集成到detail页面，替换模拟数据