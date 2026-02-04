# 需求文档

## 简介

本功能为 Markdown 编辑器应用添加 GitHub 登录认证和用户数据存储能力。用户可以通过 GitHub OAuth 登录，系统将存储用户的基本信息、自定义主题配置和默认主题选择。同时支持文章预览的在线分享功能，无需登录即可查看分享的内容。

## 术语表

- **Auth_System**: 基于 Supabase Auth 的认证系统，负责处理 GitHub OAuth 登录流程
- **User_Profile**: 用户基本信息数据模型，包含 GitHub 用户信息
- **Theme_Config**: 用户自定义主题配置数据，包含完整的主题样式定义
- **Session_Manager**: 会话管理器，负责 Token 校验和会话有效期管理
- **Share_Service**: 文章分享服务，负责生成和解析分享链接

## 需求

### 需求 1：GitHub OAuth 登录

**用户故事：** 作为用户，我希望能够使用 GitHub 账号登录，以便快速访问应用并同步我的数据。

#### 验收标准

1. WHEN 用户点击登录按钮 THEN Auth_System SHALL 重定向用户到 GitHub OAuth 授权页面
2. WHEN GitHub 授权成功并回调 THEN Auth_System SHALL 创建用户会话并存储用户信息到数据库
3. WHEN 用户已登录 THEN Auth_System SHALL 在界面显示用户头像和用户名
4. WHEN 用户点击登出按钮 THEN Auth_System SHALL 清除会话并重定向到未登录状态
5. IF GitHub 授权失败或被拒绝 THEN Auth_System SHALL 显示友好的错误提示并保持未登录状态

### 需求 2：用户信息存储

**用户故事：** 作为系统，我需要存储用户的基本信息，以便在用户登录时识别和关联用户数据。

#### 验收标准

1. WHEN 用户首次登录 THEN User_Profile SHALL 创建新的用户记录，包含 GitHub ID、用户名、头像 URL 和邮箱
2. WHEN 用户再次登录 THEN User_Profile SHALL 更新用户的最后登录时间和可能变更的 GitHub 信息
3. THE User_Profile SHALL 使用 GitHub ID 作为用户唯一标识符
4. WHEN 查询用户信息 THEN User_Profile SHALL 返回完整的用户数据对象

### 需求 3：自定义主题配置存储

**用户故事：** 作为用户，我希望我的自定义主题配置能够保存到云端，以便在不同设备上使用相同的主题。

#### 验收标准

1. WHEN 用户保存自定义主题 THEN Theme_Config SHALL 将主题配置同步到数据库
2. WHEN 用户登录 THEN Theme_Config SHALL 从数据库加载用户的所有自定义主题
3. WHEN 用户删除自定义主题 THEN Theme_Config SHALL 从数据库中移除对应的主题记录
4. WHEN 用户更新自定义主题 THEN Theme_Config SHALL 更新数据库中对应的主题记录
5. THE Theme_Config SHALL 存储完整的主题样式定义，包括所有 CSS 属性
6. WHEN 用户未登录 THEN Theme_Config SHALL 仅使用本地存储保存自定义主题

### 需求 4：默认主题存储

**用户故事：** 作为用户，我希望我选择的默认主题能够保存到云端，以便在不同设备上自动应用相同的主题。

#### 验收标准

1. WHEN 用户切换激活主题 THEN Theme_Config SHALL 将当前主题 ID 同步到数据库
2. WHEN 用户登录 THEN Theme_Config SHALL 从数据库加载用户的默认主题设置并自动应用
3. IF 用户的默认主题不存在（已删除） THEN Theme_Config SHALL 回退到系统默认主题
4. WHEN 用户未登录 THEN Theme_Config SHALL 仅使用本地存储保存默认主题选择

### 需求 5：会话管理与 Token 校验

**用户故事：** 作为系统，我需要管理用户会话的有效期，以确保安全性和用户体验的平衡。

#### 验收标准

1. WHEN 用户登录成功 THEN Session_Manager SHALL 创建有效期为 7 天的会话
2. WHEN 用户访问应用 THEN Session_Manager SHALL 自动检查会话有效性
3. IF 会话已过期 THEN Session_Manager SHALL 自动登出用户并提示重新登录
4. WHEN 会话即将过期（剩余 1 天内） THEN Session_Manager SHALL 自动刷新会话延长有效期
5. THE Session_Manager SHALL 使用 Supabase 的内置会话管理机制

### 需求 6：文章预览在线分享

**用户故事：** 作为用户，我希望能够分享我的文章预览给他人，让他们无需登录即可查看。

#### 验收标准

1. WHEN 用户点击分享按钮 THEN Share_Service SHALL 生成包含文章内容和主题的分享链接
2. WHEN 访客打开分享链接 THEN Share_Service SHALL 显示文章预览，无需登录
3. THE Share_Service SHALL 在分享内容中包含应用的主题样式
4. WHEN 分享的文章被访问 THEN Share_Service SHALL 以只读模式展示内容
5. IF 分享链接无效或内容不存在 THEN Share_Service SHALL 显示友好的错误页面
6. THE Share_Service SHALL 支持设置分享内容的过期时间（可选，默认永不过期）

### 需求 7：数据同步策略

**用户故事：** 作为系统，我需要合理处理本地数据和云端数据的同步，以确保数据一致性。

#### 验收标准

1. WHEN 用户登录 THEN Theme_Config SHALL 合并本地自定义主题和云端主题（云端优先）
2. WHEN 本地存在云端没有的主题 THEN Theme_Config SHALL 将本地主题上传到云端
3. WHEN 云端存在本地没有的主题 THEN Theme_Config SHALL 将云端主题下载到本地
4. WHEN 同一主题在本地和云端都存在但内容不同 THEN Theme_Config SHALL 使用更新时间较新的版本
5. WHEN 用户登出 THEN Theme_Config SHALL 保留本地数据但停止云端同步
