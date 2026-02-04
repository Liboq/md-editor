/**
 * 登录页面
 * 
 * 未登录用户访问应用时显示此页面。
 * 处理 GitHub OAuth 回调。
 */

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

/**
 * 加载状态组件
 */
function LoadingSpinner({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}

/**
 * 登录内容组件（使用 useSearchParams）
 */
function LoginContent() {
  const { isAuthenticated, loading, login, loginWithCode, error } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // 处理 GitHub OAuth 错误（用户拒绝授权等）
  useEffect(() => {
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        'access_denied': '您取消了授权，请重新登录',
        'redirect_uri_mismatch': '回调地址配置错误，请联系管理员',
      };
      setLoginError(errorMessages[errorParam] || errorDescription || `授权失败: ${errorParam}`);
    }
  }, [errorParam, errorDescription]);

  // 处理 GitHub OAuth 回调
  useEffect(() => {
    if (code && !isAuthenticated && !isLoggingIn) {
      setIsLoggingIn(true);
      setLoginError(null);
      loginWithCode(code)
        .then(() => {
          router.replace('/articles');
        })
        .catch((err) => {
          console.error('登录失败:', err);
          setLoginError(err.message || '登录失败，请重试');
          // 清除 URL 中的 code 参数
          router.replace('/login');
        })
        .finally(() => {
          setIsLoggingIn(false);
        });
    }
  }, [code, isAuthenticated, isLoggingIn, loginWithCode, router]);

  // 已登录则跳转到文章列表
  useEffect(() => {
    if (!loading && isAuthenticated && !code) {
      router.replace('/articles');
    }
  }, [isAuthenticated, loading, router, code]);

  if (loading || isLoggingIn) {
    return <LoadingSpinner message={isLoggingIn ? '正在登录...' : '加载中...'} />;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <img src="/logo.jpg" alt="轻语" className="w-16 h-16 mx-auto mb-4 rounded-lg" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              轻语
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              支持实时预览和多主题的 Markdown 编辑器
            </p>
          </div>

          <div className="mb-8 space-y-3">
            {['多种内置主题，支持自定义主题', '云端同步主题配置，多设备无缝切换', '一键复制到微信公众号，保留样式', '分享文章链接，无需登录即可查看'].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {(error || loginError) && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded text-center">
                {error || loginError}
              </div>
            )}
            <button
              onClick={login}
              className="w-full flex items-center justify-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              使用 GitHub 登录
            </button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              使用 GitHub 账号登录即可开始使用
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          登录即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
}

/**
 * 登录页面（包裹 Suspense）
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="加载中..." />}>
      <LoginContent />
    </Suspense>
  );
}
