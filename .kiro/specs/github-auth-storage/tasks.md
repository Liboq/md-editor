# 实现计划: GitHub 登录与用户数据存储

## 概述

本计划将 GitHub OAuth 登录和用户数据存储功能分解为可执行的编码任务。实现采用 TypeScript，基于现有的 Next.js 和 Supabase 技术栈。

## 任务

- [x] 1. 数据库表结构和类型定义
  - [x] 1.1 创建 Supabase 数据库迁移文件
    - 创建 `user_profiles` 表
    - 创建 `user_themes` 表
    - 创建 `user_settings` 表
    - 创建 `shared_articles` 表
    - 配置 RLS 策略
    - _需求: 2.1, 2.3, 3.5, 6.2_
  - [x] 1.2 创建 TypeScript 类型定义 (`lib/supabase/types.ts`)
    - 定义 `UserProfile`、`UserTheme`、`UserSettings`、`SharedArticle` 接口
    - _需求: 2.4, 3.5_

- [x] 2. 认证服务实现
  - [x] 2.1 创建 Auth Service (`lib/supabase/auth.ts`)
    - 实现 `signInWithGitHub` 方法
    - 实现 `signOut` 方法
    - 实现 `getCurrentUser` 方法
    - 实现 `onAuthStateChange` 监听器
    - 实现 `getSession` 方法
    - _需求: 1.1, 1.4, 5.1, 5.2_
  - [x] 2.2 创建 Auth Context (`lib/supabase/auth-context.tsx`)
    - 实现 `AuthProvider` 组件
    - 实现 `useAuth` hook
    - 处理用户资料的自动创建/更新
    - _需求: 1.2, 1.3, 2.1, 2.2_
  - [ ]* 2.3 编写 Auth Service 属性测试
    - **属性 1: 用户信息持久化往返**
    - **验证: 需求 2.1, 2.2, 2.3, 2.4**

- [x] 3. 检查点 - 确保认证功能正常
  - 确保所有测试通过，如有问题请询问用户。

- [x] 4. 主题服务实现
  - [x] 4.1 创建 Theme Service (`lib/supabase/theme-service.ts`)
    - 实现 `saveTheme` 方法
    - 实现 `getThemes` 方法
    - 实现 `deleteTheme` 方法
    - 实现 `saveDefaultTheme` 方法
    - 实现 `getDefaultTheme` 方法
    - _需求: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2_
  - [ ]* 4.2 编写 Theme Service 属性测试
    - **属性 2: 主题数据往返一致性**
    - **验证: 需求 3.5**
  - [ ]* 4.3 编写 Theme CRUD 属性测试
    - **属性 3: 主题 CRUD 操作正确性**
    - **验证: 需求 3.1, 3.2, 3.3, 3.4, 4.1**

- [x] 5. 同步服务实现
  - [x] 5.1 创建 Sync Service (`lib/supabase/sync-service.ts`)
    - 实现 `syncThemes` 方法
    - 实现合并策略（云端优先，时间戳比较）
    - 实现 `getSyncStatus` 方法
    - _需求: 7.1, 7.2, 7.3, 7.4_
  - [ ]* 5.2 编写 Sync Service 属性测试
    - **属性 5: 同步合并策略正确性**
    - **验证: 需求 7.1, 7.2, 7.3, 7.4**

- [x] 6. 检查点 - 确保主题和同步服务正常
  - 确保所有测试通过，如有问题请询问用户。

- [x] 7. 分享服务实现
  - [x] 7.1 创建 Share Service (`lib/supabase/share-service.ts`)
    - 实现 `createShare` 方法
    - 实现 `getShare` 方法
    - 实现 `deleteShare` 方法
    - _需求: 6.1, 6.2, 6.3, 6.6_
  - [ ]* 7.2 编写 Share Service 属性测试
    - **属性 4: 分享内容往返一致性**
    - **验证: 需求 6.1, 6.2, 6.3, 6.6**

- [x] 8. 集成 Theme Context
  - [x] 8.1 修改 Theme Context (`lib/themes/theme-context.tsx`)
    - 集成 Auth Context 检测登录状态
    - 登录时触发云端同步
    - 登出时停止同步但保留本地数据
    - _需求: 3.6, 4.4, 7.5_
  - [ ]* 8.2 编写 Theme Context 集成测试
    - 测试登录后同步流程
    - 测试登出后数据保留
    - _需求: 3.6, 4.4, 7.5_

- [x] 9. UI 组件实现
  - [x] 9.1 创建 LoginButton 组件 (`app/_components/auth/LoginButton.tsx`)
    - 实现 GitHub 登录按钮
    - 显示加载状态
    - _需求: 1.1_
  - [x] 9.2 创建 UserMenu 组件 (`app/_components/auth/UserMenu.tsx`)
    - 显示用户头像和用户名
    - 实现登出功能
    - _需求: 1.3, 1.4_
  - [x] 9.3 创建 ShareDialog 组件 (`app/_components/share/ShareDialog.tsx`)
    - 实现分享对话框
    - 生成分享链接
    - 支持复制链接
    - _需求: 6.1_
  - [x] 9.4 创建分享预览页面 (`app/share/[id]/page.tsx`)
    - 实现分享内容展示
    - 应用主题样式
    - 处理无效链接
    - _需求: 6.2, 6.3, 6.4, 6.5_

- [x] 10. 检查点 - 确保 UI 组件正常
  - 确保所有测试通过，如有问题请询问用户。

- [x] 11. 集成到主应用
  - [x] 11.1 更新应用布局 (`app/layout.tsx`)
    - 添加 AuthProvider
    - _需求: 1.2_
  - [x] 11.2 更新主页面 (`app/page.tsx`)
    - 集成 LoginButton/UserMenu
    - 集成 ShareDialog
    - _需求: 1.1, 1.3, 6.1_

- [x] 12. 最终检查点 - 确保所有功能正常
  - 确保所有测试通过，如有问题请询问用户。

## 备注

- 标记 `*` 的任务为可选任务，可跳过以加快 MVP 开发
- 每个任务都引用了具体的需求以便追溯
- 检查点用于确保增量验证
- 属性测试验证通用正确性属性
- 单元测试验证具体示例和边界情况
