-- 添加代码主题 ID 字段到 shared_articles 表
-- 用于存储分享时选择的代码块高亮主题

ALTER TABLE shared_articles
ADD COLUMN IF NOT EXISTS code_theme_id TEXT DEFAULT 'github';

-- 添加注释
COMMENT ON COLUMN shared_articles.code_theme_id IS '代码块高亮主题 ID，默认为 github';
