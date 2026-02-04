/**
 * GitHub OAuth 登录服务
 * 
 * 直接使用 GitHub OAuth，不依赖 Supabase Auth。
 * 通过后端 API 交换 code 获取用户信息。
 */

const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '';

/**
 * 跳转到 GitHub 授权页面
 */
export function redirectToGitHubAuth(): void {
  const redirectUri = `${window.location.origin}/login`;
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user%20user:email`;
  
  window.location.href = authUrl;
}

/**
 * GitHub 用户信息接口
 */
export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  email: string | null;
  name: string | null;
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  user: GitHubUser;
  token: string;
}

/**
 * 使用 GitHub code 登录
 * 
 * @param code GitHub OAuth 回调返回的 code
 * @returns 登录响应数据
 */
export async function loginWithGitHubCode(code: string): Promise<LoginResponse> {
  const response = await fetch('/api/auth/github', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '登录失败');
  }

  return response.json();
}

/**
 * 获取当前登录用户
 * 
 * @returns 用户信息或 null
 */
export async function getCurrentUser(): Promise<GitHubUser | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Token 无效，清除
      if (response.status === 401) {
        removeToken();
      }
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

/**
 * 登出
 */
export function logout(): void {
  removeToken();
  removeUser();
}

// Token 存储
const TOKEN_KEY = 'md-editor-token';
const USER_KEY = 'md-editor-user';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser(): GitHubUser | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setStoredUser(user: GitHubUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
}
