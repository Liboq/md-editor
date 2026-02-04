/**
 * Article Service - 文章存储服务
 * 
 * 提供文章的 CRUD 操作，支持自动保存和手动保存。
 */

import { supabase } from './client';

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

export interface CreateArticleInput {
  user_id: string;
  title?: string;
  content?: string;
  theme_id?: string;
}

export interface UpdateArticleInput {
  title?: string;
  content?: string;
  theme_id?: string;
  is_auto_save?: boolean;
}

/**
 * 获取用户的所有文章
 */
export async function getArticles(userId: string): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('获取文章列表失败:', error);
    throw new Error(`获取文章列表失败: ${error.message}`);
  }

  return data || [];
}

/**
 * 获取单篇文章
 */
export async function getArticle(articleId: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', articleId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('获取文章失败:', error);
    throw new Error(`获取文章失败: ${error.message}`);
  }

  return data;
}

/**
 * 创建新文章
 */
export async function createArticle(input: CreateArticleInput): Promise<Article> {
  const { data, error } = await supabase
    .from('articles')
    .insert({
      user_id: input.user_id,
      title: input.title || '未命名文档',
      content: input.content || '',
      theme_id: input.theme_id || null,
    })
    .select()
    .single();

  if (error) {
    console.error('创建文章失败:', error);
    throw new Error(`创建文章失败: ${error.message}`);
  }

  return data;
}

/**
 * 更新文章
 */
export async function updateArticle(
  articleId: string,
  input: UpdateArticleInput
): Promise<Article> {
  const { data, error } = await supabase
    .from('articles')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', articleId)
    .select()
    .single();

  if (error) {
    console.error('更新文章失败:', error);
    throw new Error(`更新文章失败: ${error.message}`);
  }

  return data;
}

/**
 * 删除文章
 */
export async function deleteArticle(articleId: string): Promise<void> {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', articleId);

  if (error) {
    console.error('删除文章失败:', error);
    throw new Error(`删除文章失败: ${error.message}`);
  }
}

/**
 * 保存文章内容（用于自动保存和手动保存）
 */
export async function saveArticleContent(
  articleId: string,
  content: string
): Promise<void> {
  const { error } = await supabase
    .from('articles')
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', articleId);

  if (error) {
    console.error('保存文章内容失败:', error);
    throw new Error(`保存文章内容失败: ${error.message}`);
  }
}

export const articleService = {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  saveArticleContent,
};

export default articleService;
