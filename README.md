# 单词记忆 PWA 应用

基于 AI 的智能单词记忆工具，支持拍照识别、图片生成、智能复习等功能。采用 Vue 3 + Egg.js + MongoDB 技术栈，PWA 架构支持离线使用。

## 📸 功能演示

[在线体验](https://wordmemory.micoai.cn/)

### 速记首页 - 快速记单词
![速记首页](https://cdn.html-js.cn/cms/uploadfiles/images/%E9%80%9F%E8%AE%B0%E9%A6%96%E9%A1%B5.png)

### 自定义上传图片 - 拍照导入单词
![自定义上传图片](https://cdn.html-js.cn/cms/uploadfiles/images/%E8%87%AA%E5%AE%9A%E4%B9%89%E4%B8%8A%E4%BC%A0%E5%9B%BE.png)

### AI 批量识别 - 智能提取单词
![AI批量识别单词](https://cdn.html-js.cn/cms/uploadfiles/images/%E6%89%B9%E9%87%8F%E8%AF%86%E5%88%AB%E5%8D%95%E8%AF%8D.png)

### 提示词生成图片 - AI 图片记忆
![提示词生成单词图片](https://cdn.html-js.cn/cms/uploadfiles/images/%E6%8F%90%E7%A4%BA%E8%AF%8D%E7%94%9F%E5%9B%BE.png)

### AI 补充单词信息 - 自动完善详情
![AI补充单词信息](https://cdn.html-js.cn/cms/uploadfiles/images/ai%E8%A1%A5%E5%85%85%E5%8D%95%E8%AF%8D.png)

### 单词复习与列表 - 智能复习系统
![单词复习与列表](https://cdn.html-js.cn/cms/uploadfiles/images/%E5%8D%95%E8%AF%8D%E5%A4%8D%E4%B9%A0%E4%B8%8E%E5%88%97%E8%A1%A8.png)

## ✨ 核心特性

### 🎯 学习功能
- � **拍照识别单词** - AI 批量识别图片中的单词，自动导入
- 🤖 **AI 智能补充** - 自动生成音标、释义、例句等完整信息
- 🎨 **AI 图片生成** - 为单词生成记忆图片，图文结合记忆更牢
- 📝 **快速记单词** - 速记模式，高效学习新单词
- 🔄 **智能复习系统** - 基于记忆曲线的复习提醒
- 📊 **学习进度追踪** - 实时统计学习状态和进度

### 💻 技术特性
- � **PWA 支持** - 离线缓存、添加到主屏幕、原生体验
- 🔐 **邮箱验证码登录** - 安全便捷的无密码认证
- 🎫 **JWT 认证** - 无状态 Token，支持自动刷新
- 📦 **Monorepo 架构** - pnpm workspace 管理前后端
- 🐳 **Docker 部署** - 一键部署，开箱即用
- 📲 **移动端优先** - 响应式设计，完美适配手机和平板

## 🚀 快速开始

### 开发环境

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd h5-full-stack-scaffolding

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp server/env.example server/.env

# 4. 编辑 server/.env 配置以下必需项：
#    - JWT_SECRET: JWT 密钥
#    - MONGO_URL: MongoDB 连接地址
#    - MAIL_*: 邮件服务配置（用于验证码登录）
#    - DOUBAO_*: 豆包 AI API 配置（可选，用于 AI 功能）
#    - QINIU_*: 七牛云配置（可选，用于图片存储）

# 5. 启动开发服务器
pnpm dev

# 6. 访问应用
#    前端: http://localhost:8080
#    后端: http://localhost:39010
```

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- MongoDB >= 4.4

### Docker 部署

```bash
# 1. 配置环境变量
cp docker.env.example docker.env

# 2. 编辑 docker.env，必须修改以下配置：
#    - MONGO_ROOT_PASSWORD: MongoDB 密码
#    - JWT_SECRET: JWT 密钥（至少 32 字符）
#    - MAIL_*: 邮件服务配置
#    - DOUBAO_*: 豆包 AI 配置（可选）
#    - QINIU_*: 七牛云配置（可选）
vim docker.env

# 3. 构建镜像
docker build -t wordmemory/app:latest .

# 4. 启动服务
docker-compose --env-file docker.env up -d

# 5. 查看日志
docker-compose logs -f

# 6. 访问应用
#    应用地址: http://localhost:39010
#    健康检查: http://localhost:39010/api/health

# 停止服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v
```

**注意事项：**
- 首次启动需要等待 MongoDB 初始化（约 30-60 秒）
- 确保 39010 端口未被占用
- 生产环境务必修改默认密码和密钥

## 📁 项目结构

```
h5-full-stack-scaffolding/
├── client/                      # 前端 Vue 3 应用
│   ├── src/
│   │   ├── views/              # 页面组件
│   │   │   ├── Home.vue        # 首页
│   │   │   ├── Login.vue       # 登录页
│   │   │   ├── WordLearn.vue   # 单词学习页
│   │   │   ├── WordReview.vue  # 单词复习页
│   │   │   ├── WordManage.vue  # 单词管理页
│   │   │   └── WordLayout.vue  # 单词模块布局
│   │   ├── router/             # 路由配置
│   │   ├── stores/             # Pinia 状态管理
│   │   ├── api/                # API 请求封装
│   │   ├── composables/        # 组合式函数
│   │   └── components/         # 公共组件
│   └── public/                 # 静态资源 + PWA 配置
│
├── server/                      # 后端 Egg.js 应用
│   ├── app/
│   │   ├── controller/         # 控制器
│   │   │   ├── auth.js         # 认证接口
│   │   │   ├── word.js         # 单词管理
│   │   │   ├── progress.js     # 学习进度
│   │   │   ├── image.js        # AI 图片生成
│   │   │   ├── upload.js       # 文件上传
│   │   │   └── health.js       # 健康检查
│   │   ├── service/            # 业务逻辑
│   │   │   ├── auth.js         # 认证服务
│   │   │   ├── word.js         # 单词服务
│   │   │   ├── progress.js     # 进度服务
│   │   │   ├── doubao.js       # 豆包 AI 服务
│   │   │   └── image.js        # 图片服务
│   │   ├── model/              # 数据模型
│   │   │   ├── user.js         # 用户模型
│   │   │   ├── word.js         # 单词模型
│   │   │   └── progress.js     # 进度模型
│   │   ├── middleware/         # 中间件
│   │   │   ├── auth.js         # JWT 认证
│   │   │   └── errorHandler.js # 错误处理
│   │   └── router.js           # 路由配置
│   └── config/                 # 配置文件
│
├── docker/                      # Docker 配置
│   ├── mongodb/                # MongoDB 初始化脚本
│   └── nginx/                  # Nginx 配置
├── docs/                       # 文档
├── docker-compose.yml          # Docker 编排
└── package.json                # Monorepo 配置
```

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| **前端框架** | Vue 3.5 + Vite (Rolldown) |
| **UI 组件** | Vant 4.x + 自适应布局 (amfe-flexible) |
| **状态管理** | Pinia + Vue Router 4 |
| **PWA** | vite-plugin-pwa + Workbox |
| **后端框架** | Egg.js 3.0 + Node.js 18+ |
| **数据库** | MongoDB + Mongoose |
| **认证** | JWT + 邮箱验证码 (Nodemailer) |
| **AI 服务** | 豆包 AI (文本生成 + 图片生成) |
| **存储** | 七牛云 OSS |
| **部署** | Docker + Docker Compose + Nginx |
| **包管理** | pnpm workspace (Monorepo) |

## 📡 API 接口

### 认证接口
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/health` | 健康检查 | ❌ |
| POST | `/api/auth/send-code` | 发送验证码 | ❌ |
| POST | `/api/auth/login` | 登录 | ❌ |
| POST | `/api/auth/logout` | 退出登录 | ✅ |
| POST | `/api/auth/refresh-token` | 刷新 Token | ✅ |
| GET | `/api/auth/profile` | 获取用户信息 | ✅ |

### 单词管理
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/words` | 获取单词列表 | ✅ |
| GET | `/api/words/:id` | 获取单词详情 | ✅ |
| POST | `/api/words` | 创建单词 | ✅ |
| PUT | `/api/words/:id` | 更新单词 | ✅ |
| DELETE | `/api/words/:id` | 删除单词 | ✅ |
| POST | `/api/words/import-from-image` | 拍照识别单词 | ✅ |
| POST | `/api/words/generate-details` | AI 生成单词详情 | ✅ |

### 学习进度
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/progress` | 获取所有进度 | ✅ |
| GET | `/api/progress/status/:status` | 按状态获取进度 | ✅ |
| GET | `/api/progress/word/:wordId` | 获取单词进度 | ✅ |
| PUT | `/api/progress/word/:wordId` | 更新单词进度 | ✅ |
| DELETE | `/api/progress/word/:wordId` | 重置单词进度 | ✅ |
| DELETE | `/api/progress` | 重置所有进度 | ✅ |

### AI 图片生成
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/images/generate/text` | 根据文本生成图片 | ✅ |
| POST | `/api/images/generate/custom` | 自定义提示词生成图片 | ✅ |
| POST | `/api/images/generate/:wordId` | 为单词生成图片 | ✅ |

### 文件上传
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/upload/image` | 上传图片到七牛云 | ✅ |

## 🔧 常用命令

```bash
# 开发
pnpm dev              # 同时启动前后端
pnpm dev:client       # 仅前端 (localhost:8080)
pnpm dev:server       # 仅后端 (localhost:39010)

# 构建
pnpm build            # 构建前端到 server/app/public

# Docker
docker-compose up -d  # 启动服务
docker-compose down   # 停止服务
docker-compose logs -f # 查看日志

# 清理
pnpm clean            # 清理依赖和构建产物
pnpm fresh            # 重新安装依赖
```

## 🔐 环境变量配置

在 `server/.env` 文件中配置以下环境变量：

### 必需配置

```bash
# JWT 密钥（必须修改为强密码）
JWT_SECRET=your-very-strong-jwt-secret-key-at-least-32-chars

# MongoDB 连接
MONGO_URL=mongodb://username:password@host:port/database

# 邮件服务（用于验证码登录）
MAIL_HOST=smtp.example.com
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=your-email@example.com
MAIL_PASS=your-email-password
MAIL_FROM='"单词记忆" <your-email@example.com>'
```

### 可选配置（AI 功能）

```bash
# 豆包 AI 配置（用于单词详情生成和图片生成）
DOUBAO_API_KEY=your-doubao-api-key
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_TEXT_MODEL=your-text-model-endpoint
DOUBAO_IMAGE_MODEL=your-image-model-endpoint

# 七牛云配置（用于图片存储）
QINIU_ACCESS_KEY=your-qiniu-access-key
QINIU_SECRET_KEY=your-qiniu-secret-key
QINIU_BUCKET=your-bucket-name
QINIU_DOMAIN=https://your-cdn-domain.com
```

### Docker 环境变量

在 `docker.env` 文件中配置（用于 Docker 部署）：

```bash
# MongoDB
MONGO_ROOT_PASSWORD=your-mongodb-password
MONGO_INITDB_DATABASE=wordmemory

# 应用配置
JWT_SECRET=your-jwt-secret
PORT=39010

# 其他配置同上
```

## 📝 开发指南

### 添加新页面

1. 在 `client/src/views/` 创建 Vue 3 组件
2. 在 `client/src/router/index.js` 添加路由配置
3. 设置 `meta.requiresAuth: true` 控制访问权限
4. 使用 Vant 4 组件库构建 UI

```javascript
// router/index.js 示例
{
  path: '/new-page',
  name: 'NewPage',
  component: () => import('@/views/NewPage.vue'),
  meta: { requiresAuth: true, title: '新页面' }
}
```

### 添加新 API

1. **创建 Model**（如需要）
   ```javascript
   // server/app/model/example.js
   module.exports = app => {
     const { Schema } = app.mongoose;
     const ExampleSchema = new Schema({
       name: { type: String, required: true },
       userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
     }, { timestamps: true });
     return app.mongoose.model('Example', ExampleSchema);
   };
   ```

2. **创建 Service**
   ```javascript
   // server/app/service/example.js
   const Service = require('egg').Service;
   class ExampleService extends Service {
     async create(data, userId) {
       return this.ctx.model.Example.create({ ...data, userId });
     }
   }
   module.exports = ExampleService;
   ```

3. **创建 Controller**
   ```javascript
   // server/app/controller/example.js
   const Controller = require('egg').Controller;
   class ExampleController extends Controller {
     async create() {
       const { ctx } = this;
       const userId = ctx.state.user._id;
       const result = await ctx.service.example.create(ctx.request.body, userId);
       ctx.helper.success(result);
     }
   }
   module.exports = ExampleController;
   ```

4. **注册路由**
   ```javascript
   // server/app/router.js
   router.post('/api/examples', controller.example.create);
   ```

### 数据库索引优化

单词模型使用复合唯一索引，确保同一用户不能重复添加相同单词：

```javascript
WordSchema.index({ userId: 1, word: 1 }, { unique: true });
```

应用启动时会自动检查并修复索引配置（见 `server/app.js`）。

### AI 功能集成

项目集成了豆包 AI，提供以下功能：

- **文本生成**：自动生成单词的音标、释义、例句
- **图片生成**：根据单词生成记忆图片

使用示例：
```javascript
// 生成单词详情
const details = await ctx.service.word.generateDetails('apple');

// 生成单词图片
const imageUrl = await ctx.service.image.generate(wordId);
```

### PWA 配置

PWA 配置在 `client/vite.config.js` 中：

```javascript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: '单词记忆',
    short_name: '单词记忆',
    theme_color: '#1989fa',
    icons: [/* ... */]
  }
})
```

## 🐛 常见问题

### 1. MongoDB 连接失败
- 检查 MongoDB 是否启动
- 确认 `MONGO_URL` 配置正确
- 检查网络连接和防火墙设置

### 2. 邮件验证码发送失败
- 确认邮件服务配置正确
- 检查 SMTP 服务器是否允许第三方应用
- 某些邮箱需要开启"授权码"而非密码

### 3. AI 功能不可用
- 确认已配置 `DOUBAO_API_KEY`
- 检查 API 配额是否充足
- 查看服务器日志获取详细错误信息

### 4. 不同用户创建同一个单词报错
- 这是正常行为，索引确保同一用户不能重复添加
- 不同用户可以创建相同单词
- 如遇问题，检查数据库索引配置

## 📄 License

MIT

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，请通过 Issue 联系我们。
