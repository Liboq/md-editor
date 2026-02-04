/**
 * Auth Context - 认证上下文
 * 
 * 提供认证状态的 React Context，包括用户信息、登录状态和认证方法。
 * 自动处理用户资料的创建和更新。
 * 
 * @验证需求: 1.2, 1.3, 2.1, 2.2
 */

'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { User } from '@supabase/supabase-js';
import {
  signInWithGitHub,
  signOut as authSignOut,
  getCurrentUser,
  onAuthStateChange,
  extractGitHubUserInfo,
  getSession,
  isSessionExpiringSoon,
  refreshSession,
} from './auth';
import { supabase } from './client';
import { UserProfile, DB_TABLES, CreateUserProfileInput } from './types';

/**
 * Auth Context 值接口
 * 定义了 Context 提供的所有状态和方法
 */
export interface AuthContextValue {
  /** 当前 Supabase Auth 用户 */
  user: User | null;
  
  /** 用户资料（来自 user_profiles 表） */
  profile: UserProfile | null;
  
  /** 加载状态 */
  loading: boolean;
  
  /** 登录方法 */
  signIn: () => Promise<void>;
  
  /** 登出方法 */
  signOut: () => Promise<void>;
  
  /** 是否已登录 */
  isAuthenticated: boolean;
  
  /** 错误信息 */
  error: string | null;
  
  /** 清除错误 */
  clearError: () => void;
}

/**
 * AuthProvider 组件属性
 */
interface AuthProviderProps {
  children: ReactNode;
}

// 创建 Context，默认值为 undefined
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * 创建或更新用户资料
 * 
 * 当用户首次登录时创建新的用户记录，
 * 再次登录时更新用户的最后登录时间和可能变更的 GitHub 信息。
 * 
 * @param user Supabase Auth 用户对象
 * @returns 用户资料对象
 * @验证需求: 2.1 - 首次登录创建用户记录
 * @验证需求: 2.2 - 再次登录更新用户信息
 */
async function upsertUserProfile(user: User): Promise<UserProfile | null> {
  const githubInfo = extractGitHubUserInfo(user);
  
  // 检查用户是否已存在
  const { data: existingProfile, error: fetchError } = await supabase
    .from(DB_TABLES.USER_PROFILES)
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (fetchError && fetchError.code !== 'PGRST116') {
    // PGRST116 表示没有找到记录，这是正常的首次登录情况
    console.error('获取用户资料失败:', fetchError);
    return null;
  }
  
  if (existingProfile) {
    // 用户已存在，更新信息
    // @验证需求: 2.2 - 再次登录时更新用户的最后登录时间和可能变更的 GitHub 信息
    const { data: updatedProfile, error: updateError } = await supabase
      .from(DB_TABLES.USER_PROFILES)
      .update({
        username: githubInfo.username,
        avatar_url: githubInfo.avatarUrl,
        email: githubInfo.email,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('更新用户资料失败:', updateError);
      return existingProfile as UserProfile;
    }
    
    return updatedProfile as UserProfile;
  }
  
  // 用户不存在，创建新记录
  // @验证需求: 2.1 - 首次登录创建新的用户记录
  const newProfile: CreateUserProfileInput = {
    id: user.id,
    github_id: githubInfo.githubId,
    username: githubInfo.username,
    avatar_url: githubInfo.avatarUrl,
    email: githubInfo.email,
  };
  
  const { data: createdProfile, error: createError } = await supabase
    .from(DB_TABLES.USER_PROFILES)
    .insert(newProfile)
    .select()
    .single();
  
  if (createError) {
    console.error('创建用户资料失败:', createError);
    return null;
  }
  
  return createdProfile as UserProfile;
}

/**
 * 获取用户资料
 * 
 * 从数据库获取用户的完整资料信息。
 * 
 * @param userId 用户 ID
 * @returns 用户资料对象或 null
 */
async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from(DB_TABLES.USER_PROFILES)
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('获取用户资料失败:', error);
    }
    return null;
  }
  
  return data as UserProfile;
}

/**
 * AuthProvider 组件
 * 
 * 提供认证状态的 React Context Provider。
 * 自动处理用户认证状态的监听和用户资料的管理。
 * 
 * @验证需求: 1.2 - GitHub 授权成功后创建用户会话并存储用户信息
 * @验证需求: 1.3 - 用户已登录时在界面显示用户头像和用户名
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * 处理用户状态变化
   * 当用户登录或登出时，更新状态并处理用户资料
   */
  const handleUserChange = useCallback(async (newUser: User | null) => {
    setUser(newUser);
    
    if (newUser) {
      // 用户已登录，获取或创建用户资料
      try {
        const userProfile = await upsertUserProfile(newUser);
        setProfile(userProfile);
      } catch (err) {
        console.error('处理用户资料失败:', err);
        setError('获取用户信息失败');
      }
    } else {
      // 用户已登出，清除资料
      setProfile(null);
    }
  }, []);
  
  /**
   * 初始化认证状态
   * 检查当前会话并设置初始用户状态
   */
  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        // 获取当前用户
        const currentUser = await getCurrentUser();
        
        if (mounted) {
          if (currentUser) {
            await handleUserChange(currentUser);
          }
          setLoading(false);
        }
        
        // 检查会话是否即将过期，如果是则刷新
        const session = await getSession();
        if (session && isSessionExpiringSoon(session)) {
          await refreshSession();
        }
      } catch (err) {
        console.error('初始化认证状态失败:', err);
        if (mounted) {
          setLoading(false);
          setError('初始化认证失败');
        }
      }
    };
    
    initAuth();
    
    // 监听认证状态变化
    const unsubscribe = onAuthStateChange(async (newUser) => {
      if (mounted) {
        await handleUserChange(newUser);
        setLoading(false);
      }
    });
    
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [handleUserChange]);
  
  /**
   * 登录方法
   * 触发 GitHub OAuth 登录流程
   * 
   * @验证需求: 1.1 - 点击登录按钮时重定向到 GitHub OAuth 授权页面
   */
  const signIn = useCallback(async () => {
    setError(null);
    try {
      await signInWithGitHub();
    } catch (err) {
      const message = err instanceof Error ? err.message : '登录失败';
      setError(message);
      throw err;
    }
  }, []);
  
  /**
   * 登出方法
   * 清除用户会话
   * 
   * @验证需求: 1.4 - 点击登出按钮时清除会话
   */
  const signOut = useCallback(async () => {
    setError(null);
    try {
      await authSignOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : '登出失败';
      setError(message);
      throw err;
    }
  }, []);
  
  /**
   * 清除错误
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  /**
   * Context 值
   * 使用 useMemo 优化性能，避免不必要的重渲染
   */
  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
    error,
    clearError,
  }), [user, profile, loading, signIn, signOut, error, clearError]);
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 * 
 * 方便组件访问认证状态的自定义 Hook。
 * 必须在 AuthProvider 内部使用。
 * 
 * @returns AuthContextValue 认证上下文值
 * @throws 如果在 AuthProvider 外部使用则抛出错误
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, profile, isAuthenticated, signIn, signOut } = useAuth();
 *   
 *   if (!isAuthenticated) {
 *     return <button onClick={signIn}>登录</button>;
 *   }
 *   
 *   return (
 *     <div>
 *       <span>欢迎, {profile?.username}</span>
 *       <button onClick={signOut}>登出</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }
  
  return context;
}

/**
 * 导出 Context 以便测试使用
 */
export { AuthContext };
