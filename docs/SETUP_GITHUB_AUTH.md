# GitHub 登录配置指南

本文档介绍如何配置 GitHub OAuth 登录功能。

## 前置条件

- 已有 [GitHub](https://github.com) 账号

## 步骤 1：创建 GitHub OAuth App

1. 登录 GitHub，进入 **Settings** > **Developer settings** > **OAuth Apps**
2. 点击 **New OAuth App**
3. 填写应用信息：
   - **Application name**: `Markdown Editor`（或你喜欢的名称）
   - **Homepage URL**: `http://localhost:3000`（开发环境）或你的生产域名
   - **Authorization callback URL**: `http://localhost:3000/login`（开发环境）或 `https://你的域名/login`
4. 点击 **Register application**
5. 记录 **Client ID**
6. 点击 **Generate a new client secret**，记录 **Client Secret**

## 步骤 2：配置环境变量

在项目根目录创建或编辑 `.env.local` 文件：

```env
# GitHub OAuth
NEXT_PUBLIC_GITHUB_CLIENT_ID=你的_Client_ID
GITHUB_CLIENT_SECRET=你的_Client_Secret

# JWT 密钥（用于生成登录 token，请使用随机字符串）
JWT_SECRET=your-random-secret-key-here
```

生成随机 JWT 密钥的方法：
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 或使用在线工具生成 32+ 字符的随机字符串
```

## 步骤 3：安装依赖

```bash
npm install jsonwebtoken
npm install -D @types/jsonwebtoken
```

## 步骤 4：启动应用

```bash
npm run dev
```

访问 `http://localhost:3000`，未登录时会自动跳转到登录页面。

## 登录流程说明

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   用户点击   │     │   GitHub    │     │   后端 API  │
│  登录按钮    │────▶│  授权页面   │────▶│  交换 token │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   进入编辑器 │◀────│  保存用户   │◀────│  返回用户   │
│    页面     │     │  信息到本地  │     │  信息+JWT   │
└─────────────┘     └─────────────┘     └─────────────┘
```

1. 用户点击「GitHub 登录」按钮
2. 跳转到 GitHub 授权页面
3. 用户授权后，GitHub 重定向回 `/login?code=xxx`
4. 前端检测到 `code` 参数，调用后端 API `/api/auth/github`
5. 后端使用 `code` 向 GitHub 交换 `access_token`
6. 后端使用 `access_token` 获取用户信息
7. 后端生成 JWT token 并返回用户信息
8. 前端保存 token 和用户信息到 localStorage
9. 跳转到编辑器主页面

## 文件结构

```
lib/auth/
├── github.ts          # GitHub OAuth 工具函数
└── auth-context.tsx   # React 认证上下文

app/
├── login/
│   └── page.tsx       # 登录页面
├── api/auth/
│   ├── github/
│   │   └── route.ts   # GitHub 登录 API
│   └── me/
│       └── route.ts   # 获取当前用户 API
└── page.tsx           # 主页面（需登录）
```

## 常见问题

### Q: 点击登录后跳转到 GitHub 但授权失败？

检查：
1. `NEXT_PUBLIC_GITHUB_CLIENT_ID` 是否正确配置
2. GitHub OAuth App 的 **Authorization callback URL** 是否与当前访问地址匹配

### Q: 授权成功但登录失败？

检查：
1. `GITHUB_CLIENT_SECRET` 是否正确配置
2. 查看浏览器控制台和服务端日志的错误信息
3. 确保 `jsonwebtoken` 依赖已安装

### Q: 登录成功但刷新页面后登出了？

检查：
1. localStorage 中是否保存了 `md-editor-token` 和 `md-editor-user`
2. JWT_SECRET 是否在服务重启后发生变化（会导致旧 token 失效）

## 生产环境部署

部署到生产环境时：

1. 更新 GitHub OAuth App：
   - **Homepage URL**: `https://你的域名`
   - **Authorization callback URL**: `https://你的域名/login`

2. 更新环境变量：
   - 确保 `JWT_SECRET` 使用强随机字符串
   - 不要在代码中硬编码任何密钥

3. 建议使用 HTTPS 确保 token 传输安全

## 安全注意事项

- `GITHUB_CLIENT_SECRET` 和 `JWT_SECRET` 是敏感信息，不要提交到代码仓库
- JWT token 有效期为 7 天，可在 `app/api/auth/github/route.ts` 中修改
- 生产环境建议使用更短的 token 有效期并实现 refresh token 机制
