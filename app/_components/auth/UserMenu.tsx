/**
 * UserMenu 组件 - 用户菜单
 * 
 * 显示用户头像和用户名，提供登出功能。
 * 
 * @验证需求: 1.3 - 用户已登录时在界面显示用户头像和用户名
 * @验证需求: 1.4 - 点击登出按钮时清除会话
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { FileText, LogOut } from 'lucide-react';

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className }: UserMenuProps) {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      logout();
      // 退出后跳转到落地页
      router.push('/');
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      setIsLoggingOut(false);
      setShowMenu(false);
    }
  };

  const handleGoToArticles = () => {
    setShowMenu(false);
    router.push('/articles');
  };

  if (loading || !user) {
    return null;
  }

  return (
    <div className={`relative ${className || ''}`}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.login}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {user.login.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
          {user.name || user.login}
        </span>
        <svg
          className="h-4 w-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {showMenu && (
        <>
          {/* 点击外部关闭菜单 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          
          {/* 下拉菜单 */}
          <div className="absolute right-0 mt-2 w-48 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.name || user.login}
                </p>
                {user.email && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                )}
              </div>
              
              {/* 我的文章 */}
              <button
                onClick={handleGoToArticles}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                我的文章
              </button>
              
              {/* 登出 */}
              <button
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? '登出中...' : '登出'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UserMenu;
