/**
 * Supabase 数据库类型定义
 * 
 * 本文件定义了与 Supabase 数据库表对应的 TypeScript 接口类型。
 * 这些类型用于确保类型安全的数据库操作。
 */

import { ThemeStyles } from '@/lib/themes/types';

/**
 * 用户资料接口
 * 对应数据库表: user_profiles
 * 
 * 存储用户的基本信息，包括 GitHub OAuth 认证信息。
 * 
 * @验证需求: 2.1, 2.2, 2.3, 2.4
 */
export interface UserProfile {
  /** 用户唯一标识符，与 Supabase Auth 用户 ID 关联 */
  id: string;
  /** GitHub 用户 ID，用于唯一标识 GitHub 账号 */
  github_id: string;
  /** GitHub 用户名 */
  username: string;
  /** GitHub 头像 URL */
  avatar_url: string | null;
  /** 用户邮箱地址 */
  email: string | null;
  /** 记录创建时间 */
  created_at: string;
  /** 记录更新时间 */
  updated_at: string;
}

/**
 * 用户主题接口
 * 对应数据库表: user_themes
 * 
 * 存储用户的自定义主题配置，包括完整的样式定义。
 * 
 * @验证需求: 3.5
 */
export interface UserTheme {
  /** 主题记录唯一标识符 */
  id: string;
  /** 关联的用户 ID */
  user_id: string;
  /** 主题 ID（用于本地和云端同步匹配） */
  theme_id: string;
  /** 主题名称 */
  name: string;
  /** 主题描述 */
  description: string | null;
  /** 主题样式配置，包含所有 CSS 属性 */
  styles: ThemeStyles;
  /** 自定义 CSS 代码 */
  custom_css: string | null;
  /** 记录创建时间 */
  created_at: string;
  /** 记录更新时间 */
  updated_at: string;
}

/**
 * 用户设置接口
 * 对应数据库表: user_settings
 * 
 * 存储用户的应用设置，包括默认主题选择。
 * 
 * @验证需求: 4.1, 4.2
 */
export interface UserSettings {
  /** 设置记录唯一标识符 */
  id: string;
  /** 关联的用户 ID */
  user_id: string;
  /** 用户选择的默认主题 ID */
  default_theme_id: string | null;
  /** 其他用户设置（JSON 格式） */
  settings: Record<string, unknown>;
  /** 记录创建时间 */
  created_at: string;
  /** 记录更新时间 */
  updated_at: string;
}

/**
 * 分享文章接口
 * 对应数据库表: shared_articles
 * 
 * 存储用户分享的文章内容和主题样式。
 * 
 * @验证需求: 6.1, 6.2, 6.3, 6.6
 */
export interface SharedArticle {
  /** 分享记录唯一标识符，用于生成分享链接 */
  id: string;
  /** 创建分享的用户 ID（可为空，用户删除后保留分享） */
  user_id: string | null;
  /** 文章 Markdown 内容 */
  markdown: string;
  /** 使用的主题 ID */
  theme_id: string;
  /** 主题样式配置快照（确保分享内容样式一致性） */
  theme_styles: ThemeStyles;
  /** 代码块主题 ID */
  code_theme_id: string | null;
  /** 分享创建时间 */
  created_at: string;
  /** 分享过期时间（null 表示永不过期） */
  expires_at: string | null;
}

/**
 * 创建用户资料的输入类型
 * 用于创建新用户时的数据验证
 */
export type CreateUserProfileInput = Omit<UserProfile, 'id' | 'created_at' | 'updated_at'> & {
  id: string;
};

/**
 * 更新用户资料的输入类型
 * 用于更新用户信息时的数据验证
 */
export type UpdateUserProfileInput = Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;

/**
 * 创建用户主题的输入类型
 * 用于保存自定义主题时的数据验证
 */
export type CreateUserThemeInput = Omit<UserTheme, 'id' | 'created_at' | 'updated_at'>;

/**
 * 更新用户主题的输入类型
 * 用于更新主题配置时的数据验证
 */
export type UpdateUserThemeInput = Partial<Omit<UserTheme, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

/**
 * 创建分享文章的输入类型
 * 用于创建分享时的数据验证
 */
export type CreateSharedArticleInput = Omit<SharedArticle, 'id' | 'created_at'>;

/**
 * 数据库表名常量
 * 用于确保表名的一致性
 */
export const DB_TABLES = {
  USERS: 'users',
  ARTICLES: 'articles',
  USER_PROFILES: 'user_profiles',
  USER_THEMES: 'user_themes',
  USER_SETTINGS: 'user_settings',
  SHARED_ARTICLES: 'shared_articles',
} as const;

/**
 * 文章接口
 * 对应数据库表: articles
 */
export interface Article {
  id: string;
  user_id: string;
  title: string;
  content: string;
  theme_id: string | null;
  is_auto_save: boolean;
  created_at: string;
  updated_at: string;
}
