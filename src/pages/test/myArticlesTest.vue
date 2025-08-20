<template>
    <view class="test-container">
        <view class="test-header">
            <text class="test-title">用户文章管理功能测试</text>
        </view>

        <view class="test-section">
            <text class="section-title">API测试</text>

            <view class="test-buttons">
                <button class="test-btn" @click="testGetArticles">获取文章列表</button>
                <button class="test-btn" @click="testGetPublishedArticles">获取已发布文章</button>
                <button class="test-btn" @click="testGetDraftArticles">获取草稿文章</button>
                <button class="test-btn" @click="testFullFlow">完整流程测试</button>
            </view>
        </view>

        <view class="test-section" v-if="testResults.length > 0">
            <text class="section-title">测试结果</text>

            <view class="results-container">
                <view class="result-item" v-for="(result, index) in testResults" :key="index" :class="result.type">
                    <text class="result-time">{{ result.time }}</text>
                    <text class="result-message">{{ result.message }}</text>
                    <text class="result-data" v-if="result.data">{{
                        JSON.stringify(result.data, null, 2)
                        }}</text>
                </view>
            </view>
        </view>

        <view class="test-section">
            <text class="section-title">页面跳转测试</text>

            <view class="test-buttons">
                <button class="test-btn" @click="goToPostsPage">跳转到我的帖子页面</button>
                <button class="test-btn" @click="goToPublishPage">跳转到发布页面</button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue'
import {
    getMyArticlesExample,
    getPublishedArticlesExample,
    getDraftArticlesExample,
    articleManagementFlowExample
} from '@/api/examples/my-articles-example'

const testResults = ref([])

// 添加测试结果
const addTestResult = (type, message, data = null) => {
    const time = new Date().toLocaleTimeString()
    testResults.value.unshift({
        type,
        time,
        message,
        data
    })

    // 限制结果数量
    if (testResults.value.length > 10) {
        testResults.value = testResults.value.slice(0, 10)
    }
}

// 测试获取文章列表
const testGetArticles = async () => {
    try {
        addTestResult('info', '开始获取文章列表...')
        const articles = await getMyArticlesExample()
        addTestResult('success', `获取文章列表成功，共 ${articles.length} 篇文章`, articles)
    } catch (error) {
        addTestResult('error', `获取文章列表失败: ${error.message}`)
    }
}

// 测试获取已发布文章
const testGetPublishedArticles = async () => {
    try {
        addTestResult('info', '开始获取已发布文章...')
        const articles = await getPublishedArticlesExample()
        addTestResult('success', `获取已发布文章成功，共 ${articles.length} 篇文章`, articles)
    } catch (error) {
        addTestResult('error', `获取已发布文章失败: ${error.message}`)
    }
}

// 测试获取草稿文章
const testGetDraftArticles = async () => {
    try {
        addTestResult('info', '开始获取草稿文章...')
        const articles = await getDraftArticlesExample()
        addTestResult('success', `获取草稿文章成功，共 ${articles.length} 篇文章`, articles)
    } catch (error) {
        addTestResult('error', `获取草稿文章失败: ${error.message}`)
    }
}

// 测试完整流程
const testFullFlow = async () => {
    try {
        addTestResult('info', '开始完整流程测试...')
        await articleManagementFlowExample()
        addTestResult('success', '完整流程测试完成')
    } catch (error) {
        addTestResult('error', `完整流程测试失败: ${error.message}`)
    }
}

// 跳转到我的帖子页面
const goToPostsPage = () => {
    uni.navigateTo({
        url: '/pages/userPackage/posts'
    })
}

// 跳转到发布页面
const goToPublishPage = () => {
    uni.navigateTo({
        url: '/pages/post/post'
    })
}
</script>

<style lang="scss">
.test-container {
    padding: 40rpx;
    background: #f5f5f5;
    min-height: 100vh;
}

.test-header {
    text-align: center;
    margin-bottom: 40rpx;

    .test-title {
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
    }
}

.test-section {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;

    .section-title {
        font-size: 32rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 20rpx;
        display: block;
    }
}

.test-buttons {
    display: flex;
    flex-direction: column;
    gap: 20rpx;

    .test-btn {
        background: #1da1f2;
        color: #fff;
        border: none;
        border-radius: 12rpx;
        padding: 20rpx;
        font-size: 28rpx;

        &:active {
            background: #0d8bd9;
        }
    }
}

.results-container {
    max-height: 600rpx;
    overflow-y: auto;

    .result-item {
        padding: 20rpx;
        border-radius: 12rpx;
        margin-bottom: 16rpx;
        border-left: 8rpx solid #ddd;

        &.success {
            background: #f6ffed;
            border-left-color: #52c41a;
        }

        &.error {
            background: #fff2f0;
            border-left-color: #ff4d4f;
        }

        &.info {
            background: #f0f9ff;
            border-left-color: #1890ff;
        }

        .result-time {
            font-size: 22rpx;
            color: #999;
            display: block;
            margin-bottom: 8rpx;
        }

        .result-message {
            font-size: 26rpx;
            color: #333;
            display: block;
            margin-bottom: 8rpx;
        }

        .result-data {
            font-size: 22rpx;
            color: #666;
            display: block;
            background: #f8f9fa;
            padding: 16rpx;
            border-radius: 8rpx;
            white-space: pre-wrap;
            word-break: break-all;
        }
    }
}
</style>
