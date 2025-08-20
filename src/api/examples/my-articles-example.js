/**
 * 用户文章管理API使用示例
 */

import { useRequest } from '../index'

const {
  API_MY_ARTICLES_GET_LIST,
  API_MY_ARTICLE_GET_DETAIL,
  API_MY_ARTICLE_UPDATE,
  API_MY_ARTICLE_DELETE
} = useRequest()

/**
 * 获取我的文章列表示例
 */
export const getMyArticlesExample = async () => {
  try {
    // 获取第一页文章列表
    const response = await API_MY_ARTICLES_GET_LIST({
      pageNum: 1,
      pageSize: 10
    })

    if (response.status === 0) {
      console.log('获取文章列表成功:', response.data)
      return response.data.articles
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
    throw error
  }
}

/**
 * 筛选已发布文章示例
 */
export const getPublishedArticlesExample = async () => {
  try {
    const response = await API_MY_ARTICLES_GET_LIST({
      pageNum: 1,
      pageSize: 10,
      state: '已发布'
    })

    if (response.status === 0) {
      console.log('获取已发布文章成功:', response.data)
      return response.data.articles
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('获取已发布文章失败:', error)
    throw error
  }
}

/**
 * 筛选草稿文章示例
 */
export const getDraftArticlesExample = async () => {
  try {
    const response = await API_MY_ARTICLES_GET_LIST({
      pageNum: 1,
      pageSize: 10,
      state: '草稿'
    })

    if (response.status === 0) {
      console.log('获取草稿文章成功:', response.data)
      return response.data.articles
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('获取草稿文章失败:', error)
    throw error
  }
}

/**
 * 获取文章详情用于编辑示例
 */
export const getArticleForEditExample = async (articleId) => {
  try {
    const response = await API_MY_ARTICLE_GET_DETAIL(articleId)

    if (response.status === 0) {
      console.log('获取文章详情成功:', response.data)
      return response.data
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
    throw error
  }
}

/**
 * 更新文章示例
 */
export const updateArticleExample = async (articleId) => {
  try {
    const articleData = {
      content: '这是更新后的文章内容...',
      category_id: 1,
      state: '已发布'
    }

    const response = await API_MY_ARTICLE_UPDATE(articleId, articleData)

    if (response.status === 0) {
      console.log('更新文章成功:', response.message)
      return response
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('更新文章失败:', error)
    throw error
  }
}

/**
 * 删除文章示例
 */
export const deleteArticleExample = async (articleId) => {
  try {
    const response = await API_MY_ARTICLE_DELETE(articleId)

    if (response.status === 0) {
      console.log('删除文章成功:', response.message)
      return response
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('删除文章失败:', error)
    throw error
  }
}

/**
 * 完整的文章管理流程示例
 */
export const articleManagementFlowExample = async () => {
  try {
    console.log('=== 开始文章管理流程 ===')

    // 1. 获取我的文章列表
    console.log('1. 获取文章列表...')
    const articles = await getMyArticlesExample()
    console.log(`获取到 ${articles.length} 篇文章`)

    if (articles.length > 0) {
      const firstArticle = articles[0]
      console.log('第一篇文章:', firstArticle)

      // 2. 获取文章详情
      console.log('2. 获取文章详情...')
      const articleDetail = await getArticleForEditExample(firstArticle.id)
      console.log('文章详情:', articleDetail)

      // 3. 更新文章
      console.log('3. 更新文章...')
      await updateArticleExample(firstArticle.id)

      // 4. 删除文章（谨慎操作）
      console.log('4. 删除文章...')
      // await deleteArticleExample(firstArticle.id) // 注释掉，避免误删
    }

    console.log('=== 文章管理流程完成 ===')
  } catch (error) {
    console.error('文章管理流程失败:', error)
  }
}

// 导出所有示例函数
export default {
  getMyArticlesExample,
  getPublishedArticlesExample,
  getDraftArticlesExample,
  getArticleForEditExample,
  updateArticleExample,
  deleteArticleExample,
  articleManagementFlowExample
}
