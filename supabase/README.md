# Supabase 数据库迁移

本目录包含 Supabase 数据库迁移文件。

## 迁移文件

### `migrations/20240101000000_create_user_tables.sql`

创建 GitHub 登录与用户数据存储所需的数据库表：

| 表名 | 描述 |
|------|------|
| `user_profiles` | 用户基本信息（GitHub ID、用户名、头像、邮箱） |
| `user_themes` | 用户自定义主题配置 |
| `user_settings` | 用户设置（默认主题等） |
| `shared_articles` | 分享的文章内容 |

## 如何应用迁移

### 方法 1：使用 Supabase CLI（推荐）

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录 Supabase
supabase login

# 链接到你的项目
supabase link --project-ref <your-project-ref>

# 应用迁移
supabase db push
```

### 方法 2：通过 Supabase Dashboard

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 复制 `migrations/20240101000000_create_user_tables.sql` 的内容
5. 粘贴并执行

## RLS（行级安全）策略说明

所有表都启用了 RLS，确保数据安全：

### user_profiles
- 用户只能查看和更新自己的资料

### user_themes
- 用户只能管理自己的主题

### user_settings
- 用户只能管理自己的设置

### shared_articles
- 任何人都可以查看未过期的分享文章
- 只有创建者可以删除自己的分享
- 只有登录用户可以创建分享

## 配置 GitHub OAuth

在 Supabase Dashboard 中配置 GitHub OAuth：

1. 进入 **Authentication** > **Providers**
2. 启用 **GitHub** provider
3. 在 GitHub 创建 OAuth App：
   - 进入 GitHub Settings > Developer settings > OAuth Apps
   - 创建新的 OAuth App
   - Homepage URL: `https://your-app-url.com`
   - Authorization callback URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. 将 Client ID 和 Client Secret 填入 Supabase Dashboard

## 环境变量

确保在 `.env.local` 中配置以下环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```
