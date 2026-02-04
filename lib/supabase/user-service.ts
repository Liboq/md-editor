/**
 * User Service - 用户存储服务
 * 
 * 管理用户数据的存储和更新。
 */

import { supabase } from './client';
import { GitHubUser } from '@/lib/auth/github';

export interface DbUser {
  id: string;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  access_token: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 创建或更新用户（登录时调用）
 */
export async function upsertUser(
  user: GitHubUser,
  accessToken?: string
): Promise<DbUser> {
  console.log('upsertUser 开始，用户:', user.login, 'ID:', user.id);
  
  const userData = {
    id: user.id.toString(),
    login: user.login,
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url,
    access_token: accessToken || null,
    updated_at: new Date().toISOString(),
  };
  
  console.log('准备写入数据库:', JSON.stringify(userData, null, 2));
  
  const { data, error } = await supabase
    .from('users')
    .upsert(userData, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('创建/更新用户失败:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(`创建/更新用户失败: ${error.message}`);
  }

  console.log('用户写入成功:', data?.login);
  return data;
}

/**
 * 获取用户信息
 */
export async function getUser(userId: string): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('获取用户失败:', error);
    throw new Error(`获取用户失败: ${error.message}`);
  }

  return data;
}

export const userService = {
  upsertUser,
  getUser,
};

export default userService;
