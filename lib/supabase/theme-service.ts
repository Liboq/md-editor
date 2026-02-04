/**
 * Theme Service - 主题云端存储服务
 * 
 * 负责主题数据的云端存储和同步操作。
 * 提供主题的 CRUD 操作和默认主题设置管理。
 * 
 * @验证需求: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2
 */

import { supabase } from './client';
import { DB_TABLES, UserTheme } from './types';
import { Theme } from '@/lib/themes/types';

/**
 * Theme Service 接口定义
 */
export interface ThemeServiceInterface {
  /** 保存自定义主题到云端 */
  saveTheme(userId: string, theme: Theme): Promise<void>;
  /** 获取用户的所有自定义主题 */
  getThemes(userId: string): Promise<Theme[]>;
  /** 删除自定义主题 */
  deleteTheme(userId: string, themeId: string): Promise<void>;
  /** 保存默认主题设置 */
  saveDefaultTheme(userId: string, themeId: string): Promise<void>;
  /** 获取默认主题设置 */
  getDefaultTheme(userId: string): Promise<string | null>;
}

/**
 * 将 Theme 对象转换为数据库存储格式
 * @param userId 用户 ID
 * @param theme 主题对象
 * @returns 数据库存储格式的主题数据
 */
function themeToDbFormat(userId: string, theme: Theme): Omit<UserTheme, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    theme_id: theme.id,
    name: theme.name,
    description: theme.description || null,
    styles: theme.styles,
    custom_css: theme.customCSS || null,
  };
}

/**
 * 将数据库格式转换为 Theme 对象
 * @param dbTheme 数据库中的主题记录
 * @returns Theme 对象
 */
function dbToThemeFormat(dbTheme: UserTheme): Theme {
  return {
    id: dbTheme.theme_id,
    name: dbTheme.name,
    description: dbTheme.description || '',
    isBuiltIn: false, // 云端存储的都是自定义主题
    styles: dbTheme.styles,
    customCSS: dbTheme.custom_css || undefined,
  };
}

/**
 * 保存自定义主题到云端
 * 
 * 如果主题已存在（根据 theme_id 判断），则更新；否则创建新记录。
 * 使用 upsert 操作确保原子性。
 * 
 * @param userId 用户 ID
 * @param theme 要保存的主题对象
 * @throws 如果保存失败则抛出错误
 * 
 * @验证需求: 3.1, 3.4
 */
export async function saveTheme(userId: string, theme: Theme): Promise<void> {
  const dbData = themeToDbFormat(userId, theme);
  
  const { error } = await supabase
    .from(DB_TABLES.USER_THEMES)
    .upsert(
      {
        ...dbData,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,theme_id',
      }
    );

  if (error) {
    console.error('保存主题失败:', error);
    throw new Error(`保存主题失败: ${error.message}`);
  }
}

/**
 * 获取用户的所有自定义主题
 * 
 * 从云端获取指定用户的所有自定义主题配置。
 * 按更新时间降序排列，最新修改的主题排在前面。
 * 
 * @param userId 用户 ID
 * @returns 用户的所有自定义主题数组
 * @throws 如果获取失败则抛出错误
 * 
 * @验证需求: 3.2
 */
export async function getThemes(userId: string): Promise<Theme[]> {
  const { data, error } = await supabase
    .from(DB_TABLES.USER_THEMES)
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('获取主题失败:', error);
    throw new Error(`获取主题失败: ${error.message}`);
  }

  return (data || []).map(dbToThemeFormat);
}

/**
 * 删除自定义主题
 * 
 * 从云端删除指定的自定义主题。
 * 只能删除属于当前用户的主题（由 RLS 策略保证）。
 * 
 * @param userId 用户 ID
 * @param themeId 要删除的主题 ID
 * @throws 如果删除失败则抛出错误
 * 
 * @验证需求: 3.3
 */
export async function deleteTheme(userId: string, themeId: string): Promise<void> {
  const { error } = await supabase
    .from(DB_TABLES.USER_THEMES)
    .delete()
    .eq('user_id', userId)
    .eq('theme_id', themeId);

  if (error) {
    console.error('删除主题失败:', error);
    throw new Error(`删除主题失败: ${error.message}`);
  }
}

/**
 * 保存默认主题设置
 * 
 * 将用户选择的默认主题 ID 保存到 user_settings 表。
 * 如果用户设置记录不存在，则创建新记录；否则更新现有记录。
 * 
 * @param userId 用户 ID
 * @param themeId 默认主题 ID
 * @throws 如果保存失败则抛出错误
 * 
 * @验证需求: 4.1
 */
export async function saveDefaultTheme(userId: string, themeId: string): Promise<void> {
  const { error } = await supabase
    .from(DB_TABLES.USER_SETTINGS)
    .upsert(
      {
        user_id: userId,
        default_theme_id: themeId,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    );

  if (error) {
    console.error('保存默认主题失败:', error);
    throw new Error(`保存默认主题失败: ${error.message}`);
  }
}

/**
 * 获取默认主题设置
 * 
 * 从 user_settings 表获取用户的默认主题 ID。
 * 如果用户没有设置默认主题，返回 null。
 * 
 * @param userId 用户 ID
 * @returns 默认主题 ID，如果未设置则返回 null
 * @throws 如果获取失败则抛出错误
 * 
 * @验证需求: 4.2
 */
export async function getDefaultTheme(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from(DB_TABLES.USER_SETTINGS)
    .select('default_theme_id')
    .eq('user_id', userId)
    .single();

  if (error) {
    // PGRST116 表示没有找到记录，这是正常情况
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('获取默认主题失败:', error);
    throw new Error(`获取默认主题失败: ${error.message}`);
  }

  return data?.default_theme_id || null;
}

/**
 * Theme Service 对象
 * 
 * 提供所有主题相关操作的统一接口。
 * 可用于依赖注入和测试模拟。
 */
export const themeService: ThemeServiceInterface = {
  saveTheme,
  getThemes,
  deleteTheme,
  saveDefaultTheme,
  getDefaultTheme,
};

export default themeService;
