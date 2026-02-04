/**
 * Auth Context - 认证上下文（GitHub OAuth 版本）
 * 
 * 使用 GitHub OAuth 直接登录，不依赖 Supabase Auth。
 * 开发环境下可使用测试账号自动登录。
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
import {
  GitHubUser,
  redirectToGitHubAuth,
  loginWithGitHubCode,
  logout as authLogout,
  getToken,
  setToken,
  getStoredUser,
  setStoredUser,
  getCurrentUser,
} from './github';
import { userService } from '@/lib/supabase/user-service';

// 开发环境测试用户
const DEV_TEST_USER: GitHubUser = {
  id: 12345678,
  login: 'test-user',
  name: '测试用户',
  email: 'test@example.com',
  avatar_url: 'https://avatars.githubusercontent.com/u/12345678?v=4',
};

// 是否为开发环境
const isDev = process.env.NODE_ENV === 'development';

/**
 * Auth Context 值接口
 */
export interface AuthContextValue {
  /** 当前用户 */
  user: GitHubUser | null;
  /** 加载状态 */
  loading: boolean;
  /** 是否已登录 */
  isAuthenticated: boolean;
  /** 登录方法（跳转到 GitHub） */
  login: () => void;
  /** 登出方法 */
  logout: () => void;
  /** 使用 code 登录（回调时使用） */
  loginWithCode: (code: string) => Promise<void>;
  /** 错误信息 */
  error: string | null;
  /** 清除错误 */
  clearError: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化：检查本地存储的用户信息或使用开发测试账号
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 开发环境：自动使用测试账号
        if (isDev) {
          const storedUser = getStoredUser();
          if (storedUser) {
            setUser(storedUser);
            // 确保用户存在于数据库中
            try {
              await userService.upsertUser(storedUser, 'dev-test-token');
            } catch (e) {
              console.warn('开发环境：同步用户到数据库失败（可忽略）:', e);
            }
          } else {
            // 自动登录测试账号
            setUser(DEV_TEST_USER);
            setStoredUser(DEV_TEST_USER);
            setToken('dev-test-token');
            // 将测试用户写入数据库
            try {
              await userService.upsertUser(DEV_TEST_USER, 'dev-test-token');
            } catch (e) {
              console.warn('开发环境：创建测试用户到数据库失败（可忽略）:', e);
            }
          }
          setLoading(false);
          return;
        }

        // 生产环境：从本地存储获取
        const storedUser = getStoredUser();
        const token = getToken();

        if (storedUser && token) {
          setUser(storedUser);
          // 后台验证 token 是否有效
          const currentUser = await getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setStoredUser(currentUser);
          } else {
            // Token 无效
            setUser(null);
          }
        }
      } catch (err) {
        console.error('初始化认证失败:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 跳转到 GitHub 登录
  const login = useCallback(() => {
    setError(null);
    // 开发环境：直接使用测试账号
    if (isDev) {
      setUser(DEV_TEST_USER);
      setStoredUser(DEV_TEST_USER);
      setToken('dev-test-token');
      // 将测试用户写入数据库
      userService.upsertUser(DEV_TEST_USER, 'dev-test-token').catch((e) => {
        console.warn('开发环境：创建测试用户到数据库失败（可忽略）:', e);
      });
      return;
    }
    redirectToGitHubAuth();
  }, []);

  // 使用 code 登录
  const loginWithCode = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loginWithGitHubCode(code);
      setToken(response.token);
      setStoredUser(response.user);
      setUser(response.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : '登录失败';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 登出
  const logout = useCallback(() => {
    authLogout();
    setUser(null);
    setError(null);
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    loginWithCode,
    error,
    clearError,
  }), [user, loading, login, logout, loginWithCode, error, clearError]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }
  return context;
}

export { AuthContext };
