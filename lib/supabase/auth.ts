/**
 * Auth Service - 认证服务
 * 
 * 负责处理 GitHub OAuth 认证流程，包括登录、登出、会话管理等功能。
 * 基于 Supabase Auth 实现。
 * 
 * @验证需求: 1.1, 1.4, 5.1, 5.2
 */

import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from './client';

/**
 * Auth Service 接口定义
 */
export interface AuthService {
  /** 使用 GitHub 登录 */
  signInWithGitHub(): Promise<void>;
  
  /** 登出 */
  signOut(): Promise<void>;
  
  /** 获取当前用户 */
  getCurrentUser(): Promise<User | null>;
  
  /** 监听认证状态变化 */
  onAuthStateChange(callback: (user: User | null) => void): () => void;
  
  /** 获取会话信息 */
  getSession(): Promise<Session | null>;
}

/**
 * 认证错误类型
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * 使用 GitHub OAuth 登录
 * 
 * 重定向用户到 GitHub OAuth 授权页面。授权成功后，
 * Supabase 会自动处理回调并创建用户会话。
 * 
 * @验证需求: 1.1 - 点击登录按钮时重定向到 GitHub OAuth 授权页面
 * @throws {AuthError} 当登录请求失败时抛出
 */
export async function signInWithGitHub(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      // 授权成功后重定向回当前页面
      redirectTo: typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback`
        : undefined,
      // 请求的 GitHub OAuth 权限范围
      scopes: 'read:user user:email',
    },
  });

  if (error) {
    throw new AuthError(
      '登录失败，请稍后重试',
      error.code,
      error
    );
  }
}

/**
 * 登出当前用户
 * 
 * 清除用户会话并将用户重定向到未登录状态。
 * 
 * @验证需求: 1.4 - 点击登出按钮时清除会话
 * @throws {AuthError} 当登出请求失败时抛出
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new AuthError(
      '登出失败，请稍后重试',
      error.code,
      error
    );
  }
}

/**
 * 获取当前登录用户
 * 
 * 返回当前已认证的用户信息，如果用户未登录则返回 null。
 * 
 * @returns 当前用户对象或 null
 * @throws {AuthError} 当获取用户信息失败时抛出
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    // 如果是会话不存在的错误，返回 null 而不是抛出异常
    if (error.code === 'session_not_found' || error.code === 'bad_jwt') {
      return null;
    }
    throw new AuthError(
      '获取用户信息失败',
      error.code,
      error
    );
  }

  return user;
}

/**
 * 监听认证状态变化
 * 
 * 当用户登录、登出或会话刷新时，会触发回调函数。
 * 返回一个取消订阅函数，用于清理监听器。
 * 
 * @param callback 认证状态变化时的回调函数
 * @returns 取消订阅函数
 * @验证需求: 5.2 - 自动检查会话有效性
 */
export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event: AuthChangeEvent, session: Session | null) => {
      // 根据事件类型处理不同的认证状态变化
      switch (event) {
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
        case 'USER_UPDATED':
          callback(session?.user ?? null);
          break;
        case 'SIGNED_OUT':
          callback(null);
          break;
        case 'INITIAL_SESSION':
          // 初始会话加载完成
          callback(session?.user ?? null);
          break;
        default:
          // 其他事件也传递用户状态
          callback(session?.user ?? null);
      }
    }
  );

  // 返回取消订阅函数
  return () => {
    subscription.unsubscribe();
  };
}

/**
 * 获取当前会话信息
 * 
 * 返回当前的会话对象，包含访问令牌、刷新令牌和过期时间等信息。
 * 如果用户未登录或会话已过期，返回 null。
 * 
 * @returns 会话对象或 null
 * @验证需求: 5.1 - 创建有效期为 7 天的会话（由 Supabase 配置控制）
 * @验证需求: 5.2 - 自动检查会话有效性
 */
export async function getSession(): Promise<Session | null> {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    // 会话相关错误通常意味着用户未登录
    console.warn('获取会话失败:', error.message);
    return null;
  }

  return session;
}

/**
 * 检查会话是否即将过期
 * 
 * 如果会话在指定时间内（默认 1 天）即将过期，返回 true。
 * 可用于触发会话刷新逻辑。
 * 
 * @param session 要检查的会话对象
 * @param thresholdSeconds 过期阈值（秒），默认为 1 天
 * @returns 会话是否即将过期
 * @验证需求: 5.4 - 会话即将过期时自动刷新
 */
export function isSessionExpiringSoon(
  session: Session | null,
  thresholdSeconds: number = 24 * 60 * 60 // 默认 1 天
): boolean {
  if (!session?.expires_at) {
    return false;
  }

  const expiresAt = session.expires_at;
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = expiresAt - now;

  return timeUntilExpiry > 0 && timeUntilExpiry <= thresholdSeconds;
}

/**
 * 刷新会话
 * 
 * 使用刷新令牌获取新的访问令牌，延长会话有效期。
 * 
 * @returns 刷新后的会话对象或 null
 * @验证需求: 5.4 - 会话即将过期时自动刷新会话延长有效期
 */
export async function refreshSession(): Promise<Session | null> {
  const { data: { session }, error } = await supabase.auth.refreshSession();

  if (error) {
    console.warn('刷新会话失败:', error.message);
    return null;
  }

  return session;
}

/**
 * 从 GitHub 用户数据中提取用户信息
 * 
 * 解析 Supabase Auth 用户对象中的 GitHub 元数据，
 * 提取用户名、头像等信息。
 * 
 * @param user Supabase Auth 用户对象
 * @returns GitHub 用户信息
 */
export function extractGitHubUserInfo(user: User): {
  githubId: string;
  username: string;
  avatarUrl: string | null;
  email: string | null;
} {
  const metadata = user.user_metadata;
  
  return {
    githubId: metadata?.provider_id || metadata?.sub || '',
    username: metadata?.user_name || metadata?.preferred_username || metadata?.name || '',
    avatarUrl: metadata?.avatar_url || null,
    email: user.email || metadata?.email || null,
  };
}

/**
 * Auth Service 对象
 * 
 * 提供统一的认证服务接口，方便依赖注入和测试。
 */
export const authService: AuthService = {
  signInWithGitHub,
  signOut,
  getCurrentUser,
  onAuthStateChange,
  getSession,
};

export default authService;
