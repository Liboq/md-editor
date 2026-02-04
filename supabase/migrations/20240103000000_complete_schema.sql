-- ============================================================================
-- 完整数据库架构 - GitHub OAuth 直接登录版本
-- 
-- 不依赖 Supabase Auth，使用 GitHub 用户 ID (TEXT) 作为用户标识
-- 
-- 表结构：
-- 1. users - 用户表（存储 GitHub 用户信息）
-- 2. articles - 文章表（支持自动保存和手动保存）
-- 3. user_themes - 用户自定义主题
-- 4. shared_articles - 分享的文章
-- ============================================================================

-- 先删除旧表（如果存在）
DROP TABLE IF EXISTS shared_articles CASCADE;
DROP TABLE IF EXISTS user_themes CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- ============================================================================
-- 1. users 表 - 存储 GitHub 用户信息
-- ============================================================================
CREATE TABLE users (
  id TEXT PRIMARY KEY,                    -- GitHub 用户 ID
  login TEXT NOT NULL,                    -- GitHub 用户名
  name TEXT,                              -- 显示名称
  email TEXT,                             -- 邮箱
  avatar_url TEXT,                        -- 头像 URL
  access_token TEXT,                      -- GitHub access_token（可选，用于后续 API 调用）
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_users_login ON users(login);

-- ============================================================================
-- 2. articles 表 - 存储用户文章
-- ============================================================================
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '未命名文档',  -- 文章标题
  content TEXT NOT NULL DEFAULT '',          -- Markdown 内容
  theme_id TEXT,                             -- 使用的主题 ID
  is_auto_save BOOLEAN DEFAULT true,         -- 是否启用自动保存
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_articles_user_id ON articles(user_id);
CREATE INDEX idx_articles_updated_at ON articles(updated_at DESC);

-- ============================================================================
-- 3. user_themes 表 - 存储用户自定义主题
-- ============================================================================
CREATE TABLE user_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme_id TEXT NOT NULL,                    -- 主题唯一标识符
  name TEXT NOT NULL,                        -- 主题名称
  description TEXT,                          -- 主题描述
  styles JSONB NOT NULL,                     -- 主题样式
  custom_css TEXT,                           -- 自定义 CSS
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, theme_id)
);

CREATE INDEX idx_user_themes_user_id ON user_themes(user_id);

-- ============================================================================
-- 4. user_settings 表 - 存储用户设置
-- ============================================================================
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  default_theme_id TEXT,
  settings JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- ============================================================================
-- 5. shared_articles 表 - 存储分享的文章
-- ============================================================================
CREATE TABLE shared_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
  markdown TEXT NOT NULL,                    -- Markdown 内容快照
  theme_id TEXT NOT NULL,                    -- 主题 ID
  theme_styles JSONB NOT NULL,               -- 主题样式快照
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ                     -- 过期时间（NULL = 永不过期）
);

CREATE INDEX idx_shared_articles_user_id ON shared_articles(user_id);

-- ============================================================================
-- 自动更新 updated_at 触发器
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_themes_updated_at BEFORE UPDATE ON user_themes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS 策略（允许所有操作，安全性由应用层 JWT 验证保证）
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_articles ENABLE ROW LEVEL SECURITY;

-- 允许所有操作（通过 anon key 访问，安全性由应用层保证）
CREATE POLICY "Allow all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON articles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON user_themes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON user_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON shared_articles FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 表注释
-- ============================================================================
COMMENT ON TABLE users IS '用户表 - 存储 GitHub OAuth 登录的用户信息';
COMMENT ON TABLE articles IS '文章表 - 存储用户的 Markdown 文章，支持自动保存';
COMMENT ON TABLE user_themes IS '用户主题表 - 存储用户自定义的主题配置';
COMMENT ON TABLE shared_articles IS '分享文章表 - 存储分享的文章快照';

COMMENT ON COLUMN articles.is_auto_save IS '是否启用自动保存，默认开启';
COMMENT ON COLUMN shared_articles.theme_styles IS '主题样式快照，确保分享内容样式不受原主题更新影响';
