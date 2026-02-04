-- ============================================================================
-- GitHub OAuth 直接登录 - 数据库迁移文件
-- 
-- 本迁移文件创建以下表（不依赖 Supabase Auth）：
-- 1. user_themes - 存储用户自定义主题
-- 2. shared_articles - 存储分享的文章
--
-- user_id 使用 TEXT 类型存储 GitHub 用户 ID
-- ============================================================================

-- ============================================================================
-- 1. user_themes 表 - 存储用户自定义主题
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- GitHub 用户 ID（TEXT 类型）
  user_id TEXT NOT NULL,
  theme_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  styles JSONB NOT NULL,
  custom_css TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, theme_id)
);

CREATE INDEX IF NOT EXISTS idx_user_themes_user_id ON user_themes(user_id);

-- 启用 RLS 但允许匿名访问（通过 API 验证）
ALTER TABLE user_themes ENABLE ROW LEVEL SECURITY;

-- 允许所有操作（安全性由应用层 JWT 验证保证）
CREATE POLICY "Allow all operations" ON user_themes FOR ALL USING (true);

-- ============================================================================
-- 2. shared_articles 表 - 存储分享的文章
-- ============================================================================
CREATE TABLE IF NOT EXISTS shared_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- GitHub 用户 ID（TEXT 类型，可为空）
  user_id TEXT,
  markdown TEXT NOT NULL,
  theme_id TEXT NOT NULL,
  theme_styles JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_shared_articles_user_id ON shared_articles(user_id);

ALTER TABLE shared_articles ENABLE ROW LEVEL SECURITY;

-- 允许所有操作
CREATE POLICY "Allow all operations" ON shared_articles FOR ALL USING (true);
