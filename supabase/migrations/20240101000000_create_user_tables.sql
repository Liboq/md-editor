-- ============================================================================
-- GitHub 登录与用户数据存储 - 数据库迁移文件
-- 
-- 本迁移文件创建以下表：
-- 1. user_profiles - 存储用户基本信息
-- 2. user_themes - 存储用户自定义主题
-- 3. user_settings - 存储用户设置（包括默认主题）
-- 4. shared_articles - 存储分享的文章
--
-- 需求引用: 2.1, 2.3, 3.5, 6.2
-- ============================================================================

-- ============================================================================
-- 1. user_profiles 表 - 存储用户基本信息
-- 需求 2.1: 创建新的用户记录，包含 GitHub ID、用户名、头像 URL 和邮箱
-- 需求 2.3: 使用 GitHub ID 作为用户唯一标识符
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  -- 主键关联 Supabase Auth 用户
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- GitHub 唯一标识符
  github_id TEXT UNIQUE NOT NULL,
  -- GitHub 用户名
  username TEXT NOT NULL,
  -- GitHub 头像 URL
  avatar_url TEXT,
  -- 用户邮箱
  email TEXT,
  -- 创建时间
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- 更新时间（用于记录最后登录时间）
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 创建索引以加速查询
CREATE INDEX IF NOT EXISTS idx_user_profiles_github_id ON user_profiles(github_id);

-- 创建更新时间自动更新触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 启用 RLS（行级安全）
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS 策略：用户只能查看自己的资料
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- RLS 策略：用户只能更新自己的资料
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS 策略：允许通过触发器插入用户资料（用于 OAuth 回调）
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 2. user_themes 表 - 存储用户自定义主题
-- 需求 3.5: 存储完整的主题样式定义，包括所有 CSS 属性
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_themes (
  -- 主键
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 关联用户
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  -- 主题唯一标识符（用户自定义）
  theme_id TEXT NOT NULL,
  -- 主题名称
  name TEXT NOT NULL,
  -- 主题描述
  description TEXT,
  -- 主题样式（JSONB 格式存储完整的 CSS 属性）
  styles JSONB NOT NULL,
  -- 自定义 CSS（可选）
  custom_css TEXT,
  -- 创建时间
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- 更新时间
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- 确保同一用户的主题 ID 唯一
  UNIQUE(user_id, theme_id)
);

-- 创建索引以加速查询
CREATE INDEX IF NOT EXISTS idx_user_themes_user_id ON user_themes(user_id);

-- 创建更新时间自动更新触发器
CREATE TRIGGER update_user_themes_updated_at
  BEFORE UPDATE ON user_themes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 启用 RLS
ALTER TABLE user_themes ENABLE ROW LEVEL SECURITY;

-- RLS 策略：用户可以管理自己的所有主题（SELECT, INSERT, UPDATE, DELETE）
CREATE POLICY "Users can manage own themes" ON user_themes
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 3. user_settings 表 - 存储用户设置（包括默认主题）
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_settings (
  -- 主键
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 关联用户（一对一关系）
  user_id UUID UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  -- 默认主题 ID
  default_theme_id TEXT,
  -- 其他设置（JSONB 格式，便于扩展）
  settings JSONB DEFAULT '{}' NOT NULL,
  -- 创建时间
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- 更新时间
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 创建索引以加速查询
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- 创建更新时间自动更新触发器
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 启用 RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS 策略：用户可以管理自己的设置
CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 4. shared_articles 表 - 存储分享的文章
-- 需求 6.2: 访客打开分享链接时显示文章预览，无需登录
-- ============================================================================
CREATE TABLE IF NOT EXISTS shared_articles (
  -- 主键（用作分享链接 ID）
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 关联用户（可为空，用户删除后保留分享内容）
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  -- Markdown 内容
  markdown TEXT NOT NULL,
  -- 使用的主题 ID
  theme_id TEXT NOT NULL,
  -- 主题样式快照（JSONB 格式，确保分享内容样式不受主题更新影响）
  theme_styles JSONB NOT NULL,
  -- 创建时间
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- 过期时间（可选，NULL 表示永不过期）
  expires_at TIMESTAMPTZ
);

-- 创建索引以加速查询
CREATE INDEX IF NOT EXISTS idx_shared_articles_user_id ON shared_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_articles_expires_at ON shared_articles(expires_at);

-- 启用 RLS
ALTER TABLE shared_articles ENABLE ROW LEVEL SECURITY;

-- RLS 策略：任何人都可以查看分享的文章（无需登录）
-- 同时检查是否过期
CREATE POLICY "Anyone can view shared articles" ON shared_articles
  FOR SELECT USING (
    expires_at IS NULL OR expires_at > NOW()
  );

-- RLS 策略：只有创建者可以删除自己的分享
CREATE POLICY "Users can delete own shares" ON shared_articles
  FOR DELETE USING (auth.uid() = user_id);

-- RLS 策略：登录用户可以创建分享
CREATE POLICY "Authenticated users can create shares" ON shared_articles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 添加表注释
-- ============================================================================
COMMENT ON TABLE user_profiles IS '用户基本信息表，存储 GitHub OAuth 登录的用户数据';
COMMENT ON TABLE user_themes IS '用户自定义主题表，存储用户创建的主题配置';
COMMENT ON TABLE user_settings IS '用户设置表，存储用户的偏好设置（如默认主题）';
COMMENT ON TABLE shared_articles IS '分享文章表，存储用户分享的 Markdown 文章及其主题样式';

COMMENT ON COLUMN user_profiles.github_id IS 'GitHub 用户唯一标识符';
COMMENT ON COLUMN user_profiles.updated_at IS '最后更新时间，也用于记录最后登录时间';
COMMENT ON COLUMN user_themes.styles IS '完整的主题样式定义，包含所有 CSS 属性';
COMMENT ON COLUMN user_themes.custom_css IS '用户自定义的额外 CSS 代码';
COMMENT ON COLUMN shared_articles.theme_styles IS '主题样式快照，确保分享内容样式不受原主题更新影响';
COMMENT ON COLUMN shared_articles.expires_at IS '分享过期时间，NULL 表示永不过期';
