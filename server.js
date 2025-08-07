const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;

// 启用CORS
app.use(cors());

// 解析JSON请求体
app.use(bodyParser.json());

// 模拟用户数据
const users = [];

// 用户登录/注册接口
app.post('/api/users', (req, res) => {
  const { code, avatar, nickname } = req.body;
  
  console.log('登录请求数据:', req.body);
  
  if (!code) {
    return res.status(400).json({
      code: 1,
      message: '缺少必要参数',
      data: null
    });
  }
  
  // 模拟生成token和用户信息
  const token = 'token_' + Date.now();
  const userId = Date.now().toString();
  const userInfo = {
    id: userId,
    nickname: nickname || '微信用户',
    avatar: avatar || 'https://example.com/default-avatar.png',
    followCount: 0,
    fansCount: 0,
    likeCount: 0
  };
  
  // 保存用户信息
  users.push(userInfo);
  
  // 返回登录成功响应
  res.json({
    code: 0,
    message: '登录成功',
    data: {
      token,
      userInfo
    }
  });
});

// 获取用户信息接口
app.get('/my/userinfo', (req, res) => {
  // 模拟从token获取用户信息
  const userInfo = {
    id: '123456',
    nickname: '测试用户',
    avatar: 'https://example.com/avatar.png',
    followCount: 10,
    fansCount: 20,
    likeCount: 30
  };
  
  res.json({
    code: 0,
    message: '获取用户信息成功',
    data: userInfo
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`API服务器运行在 http://localhost:${port}`);
});