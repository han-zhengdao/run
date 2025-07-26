# API 接口管理规范

## 目录结构

```
api/
├── index.js          # API导出入口
├── request.js        # 请求配置和扩展方法
├── service.js        # Axios服务实例
├── utils.js          # API工具函数
└── modules/          # API模块目录
    ├── article.js    # 文章相关API
    ├── demo.js       # 示例API
    └── ...           # 其他API模块
```

## API模块开发规范

### 命名规范

- 模块文件名：使用小写，按功能或业务领域命名，如 `user.js`, `article.js`
- API方法名：使用 `API_模块_方法名` 格式，如 `API_USER_LOGIN`

### 注释规范

每个API方法都应该包含以下注释：

```javascript
/**
 * 方法描述
 * @param {类型} 参数名 - 参数描述
 * @returns {Promise} 返回值描述
 */
```

### URL路径规范

- 使用相对路径，不要硬编码完整URL
- 使用 `createApiPath` 或 `createApiUrl` 工具函数生成标准路径

### 示例

```javascript
import { request } from '../request'
import { createApiPath, createApiUrl } from '../utils'

export default {
  /**
   * 用户登录
   * @param {Object} data - 登录信息
   * @param {string} data.username - 用户名
   * @param {string} data.password - 密码
   * @returns {Promise} 登录结果
   */
  API_USER_LOGIN(data) {
    return request.post('/user/login', data)
  },
  
  /**
   * 获取用户信息
   * @param {string} userId - 用户ID
   * @returns {Promise} 用户信息
   */
  API_USER_GET_INFO(userId) {
    return request.get(`/user/${userId}`)
  }
}
```

## 使用方式

```javascript
import { useRequest } from '@/api'

// 在组件中
const { API_USER_LOGIN, API_USER_GET_INFO } = useRequest()

// 调用API
const login = async () => {
  try {
    const res = await API_USER_LOGIN({ username: 'admin', password: '123456' })
    // 处理响应...
  } catch (error) {
    // 处理错误...
  }
}
```

## 环境配置

在 `.env.*` 文件中配置不同环境的API基础URL：

```
# 开发环境
VITE_APP_API_BASEURL = 'http://localhost:3000'

# 生产环境
VITE_APP_API_BASEURL = 'https://api.example.com'
```

## 注意事项

1. 不要在API模块中硬编码完整URL，使用相对路径
2. 使用请求和响应拦截器统一处理认证和错误
3. 按业务领域或功能模块组织API文件
4. 使用类型注释提高代码可读性和可维护性