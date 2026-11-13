# Mock API 使用说明

## 🌐 概述

### **1. 无需修改前端代码**
Mock会自动拦截所有 `/onboard/` 开头的请求，前端代码无需任何修改：

```javascript
// 这些URL会被Mock自动拦截，无需修改
applicantFamilyList: 'http://localhost:9931/onboard/applicant/family/list',
applicantFamilyCreate: 'http://localhost:9931/onboard/applicant/family/create',
applicantFamilyUpdate: 'http://localhost:9931/onboard/applicant/family/update',
```

### **2. Mock拦截原理**
- Mock插件在开发环境中自动启动
- 拦截所有匹配的API请求
- 返回预定义的模拟数据
- 支持完整的CRUD操作

### **3. 开发调试**
- 浏览器控制台会显示Mock请求日志
- 可以查看Mock数据的请求和响应
- 支持热重载，修改Mock数据后立即生效

## 🚀 快速启动

### 📁 文件结构

**Mock服务端口：** `http://localhost:5173`（与前端开发服务器相同）

**Mock API路径：** 自动拦截以下路径：
- `/onboard/applicant/*` - 应聘者管理
- `/onboard/allocate/*` - 应聘分配
- `/onboard/evaluate/*` - 面试评估
- `/onboard/offer/*` - 录用反馈

```
mock/
├── onboard/              # 入职管理Mock模块
│   ├── index.js         # Mock API 主入口
│   ├── data/            # 基础数据源
│   │   └── data.js      # 模拟数据
│   └── js/              # API实现
│       ├── onboard.js   # 应聘者管理 API
│       ├── allocate.js  # 应聘分配 API
│       ├── evaluate.js  # 面试评估 API
│       └── offer.js     # 录用反馈 API
└── README.md             # 使用说明
```

### 配置 vite.config.js

```js
export default defineConfig(({command, mode}) => {
  return {
    plugins: [
      vue(),
      viteMockServe({
        enable: true, // 是否开启
        logger: true, 
        supportTs: false,
        injectCode: `
          import { setupProdMockServer } from './mock/mockProdServer';
          setupProdMockServer();
        `,
      })
    ],
  }
})
```

### 🔗 启动开发服务器

```bash
# 使用 npm
npm install mockjs vite-plugin-mock --save-dev

# 或者使用 yarn
yarn add mockjs vite-plugin-mock --dev

# 或者使用 pnpm
pnpm add mockjs vite-plugin-mock --save-dev

# 启动
npm run dev
```

