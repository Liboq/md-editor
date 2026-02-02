/**
 * Share Service - 文章分享服务
 * 
 * 负责文章分享功能的实现，包括创建分享、获取分享内容和删除分享。
 * 分享的文章可以被任何人访问（无需登录），但只有创建者可以删除。
 * 
 * @验证需求: 6.1, 6.2, 6.3, 6.6
 */

import { supabase } from './client';
import { DB_TABLES, SharedArticle, CreateSharedArticleInput } from './types';
import { ThemeStyles } from '@/lib/themes/types';

/**
 * 分享内容接口
 * 用于创建和获取分享时的数据结构
 */
export interface ShareContent {
  /** 分享 ID（创建时可选，获取时必有） */
  id?: string;
  /** 文章 Markdown 内容 */
  markdown: string;
  /** 使用的主题 ID */
  themeId: string;
  /** 主题样式配置快照 */
  themeStyles: ThemeStyles;
  /** 分享创建时间 */
  createdAt?: string;
  /** 分享过期时间（null 表示永不过期） */
  expiresAt?: string | null;
}

/**
 * Share Service 接口定义
 */
export interface ShareServiceInterface {
  /** 创建分享 */
  createShare(content: ShareContent): Promise<string>;
  /** 获取分享内容 */
  getShare(shareId: string): Promise<ShareContent | null>;
  /** 删除分享 */
  deleteShare(shareId: string): Promise<void>;
}

/**
 * 分享服务错误类型
 */
export class ShareError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'ShareError';
  }
}

/**
 * 将 ShareContent 转换为数据库存储格式
 * @param content 分享内容
 * @param userId 用户 ID（可选）
 * @returns 数据库存储格式的分享数据
 */
function shareContentToDbFormat(
  content: ShareContent,
  userId: string | null
): CreateSharedArticleInput {
  return {
    user_id: userId,
    markdown: content.markdown,
    theme_id: content.themeId,
    theme_styles: content.themeStyles,
    expires_at: content.expiresAt || null,
  };
}

/**
 * 将数据库格式转换为 ShareContent
 * @param dbShare 数据库中的分享记录
 * @returns ShareContent 对象
 */
function dbToShareContent(dbShare: SharedArticle): ShareContent {
  return {
    id: dbShare.id,
    markdown: dbShare.markdown,
    themeId: dbShare.theme_id,
    themeStyles: dbShare.theme_styles,
    createdAt: dbShare.created_at,
    expiresAt: dbShare.expires_at,
  };
}

/**
 * 创建分享
 * 
 * 将文章内容和主题样式保存到数据库，生成唯一的分享 ID。
 * 需要用户登录才能创建分享。
 * 
 * @param content 要分享的内容，包括 Markdown 文本和主题样式
 * @returns 分享 ID，用于生成分享链接
 * @throws {ShareError} 当创建失败时抛出
 * 
 * @验证需求: 6.1 - 生成包含文章内容和主题的分享链接
 * @验证需求: 6.3 - 在分享内容中包含应用的主题样式
 * @验证需求: 6.6 - 支持设置分享内容的过期时间
 */
export async function createShare(content: ShareContent): Promise<string> {
  // 获取当前用户
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new ShareError(
      '创建分享需要登录',
      'UNAUTHORIZED'
    );
  }

  // 验证内容
  if (!content.markdown || content.markdown.trim().length === 0) {
    throw new ShareError(
      '分享内容不能为空',
      'INVALID_CONTENT'
    );
  }

  if (!content.themeId) {
    throw new ShareError(
      '必须指定主题',
      'INVALID_THEME'
    );
  }

  if (!content.themeStyles) {
    throw new ShareError(
      '必须提供主题样式',
      'INVALID_THEME_STYLES'
    );
  }

  // 创建分享记录
  const dbData = shareContentToDbFormat(content, user.id);
  
  const { data, error } = await supabase
    .from(DB_TABLES.SHARED_ARTICLES)
    .insert(dbData)
    .select('id')
    .single();

  if (error) {
    console.error('创建分享失败:', error);
    throw new ShareError(
      '创建分享失败，请稍后重试',
      error.code,
      error
    );
  }

  if (!data?.id) {
    throw new ShareError(
      '创建分享失败：未返回分享 ID',
      'NO_ID_RETURNED'
    );
  }

  return data.id;
}

/**
 * 获取分享内容
 * 
 * 根据分享 ID 获取分享的文章内容和主题样式。
 * 无需登录即可访问，但会检查分享是否已过期。
 * 
 * @param shareId 分享 ID
 * @returns 分享内容，如果不存在或已过期则返回 null
 * @throws {ShareError} 当获取失败时抛出
 * 
 * @验证需求: 6.2 - 访客打开分享链接时显示文章预览，无需登录
 * @验证需求: 6.3 - 在分享内容中包含应用的主题样式
 */
export async function getShare(shareId: string): Promise<ShareContent | null> {
  // 验证分享 ID 格式（UUID 格式）
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!shareId || !uuidRegex.test(shareId)) {
    return null;
  }

  const { data, error } = await supabase
    .from(DB_TABLES.SHARED_ARTICLES)
    .select('*')
    .eq('id', shareId)
    .single();

  if (error) {
    // PGRST116 表示没有找到记录
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('获取分享失败:', error);
    throw new ShareError(
      '获取分享内容失败',
      error.code,
      error
    );
  }

  if (!data) {
    return null;
  }

  // 检查是否已过期
  if (data.expires_at) {
    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    if (expiresAt < now) {
      // 分享已过期，返回 null
      return null;
    }
  }

  return dbToShareContent(data as SharedArticle);
}

/**
 * 删除分享
 * 
 * 删除指定的分享记录。只有分享的创建者才能删除。
 * 需要用户登录，且只能删除自己创建的分享。
 * 
 * @param shareId 要删除的分享 ID
 * @throws {ShareError} 当删除失败时抛出
 * 
 * @验证需求: 6.1 - 用户可以管理自己的分享
 */
export async function deleteShare(shareId: string): Promise<void> {
  // 获取当前用户
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new ShareError(
      '删除分享需要登录',
      'UNAUTHORIZED'
    );
  }

  // 验证分享 ID 格式
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!shareId || !uuidRegex.test(shareId)) {
    throw new ShareError(
      '无效的分享 ID',
      'INVALID_SHARE_ID'
    );
  }

  // 删除分享（RLS 策略会确保只能删除自己的分享）
  const { error } = await supabase
    .from(DB_TABLES.SHARED_ARTICLES)
    .delete()
    .eq('id', shareId)
    .eq('user_id', user.id);

  if (error) {
    console.error('删除分享失败:', error);
    throw new ShareError(
      '删除分享失败，请稍后重试',
      error.code,
      error
    );
  }
}

/**
 * 获取用户的所有分享
 * 
 * 获取当前登录用户创建的所有分享列表。
 * 按创建时间降序排列。
 * 
 * @returns 用户的分享列表
 * @throws {ShareError} 当获取失败时抛出
 */
export async function getUserShares(): Promise<ShareContent[]> {
  // 获取当前用户
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new ShareError(
      '获取分享列表需要登录',
      'UNAUTHORIZED'
    );
  }

  const { data, error } = await supabase
    .from(DB_TABLES.SHARED_ARTICLES)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取分享列表失败:', error);
    throw new ShareError(
      '获取分享列表失败',
      error.code,
      error
    );
  }

  return (data || []).map((item) => dbToShareContent(item as SharedArticle));
}

/**
 * 生成分享链接
 * 
 * 根据分享 ID 生成完整的分享 URL。
 * 
 * @param shareId 分享 ID
 * @returns 完整的分享链接
 */
export function generateShareUrl(shareId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/share/${shareId}`;
  }
  // 服务端渲染时返回相对路径
  return `/share/${shareId}`;
}

/**
 * Share Service 对象
 * 
 * 提供所有分享相关操作的统一接口。
 * 可用于依赖注入和测试模拟。
 */
export const shareService: ShareServiceInterface = {
  createShare,
  getShare,
  deleteShare,
};

export default shareService;
