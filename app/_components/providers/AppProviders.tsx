/**
 * AppProviders 组件 - 应用级 Provider 包装器
 * 
 * 将 AuthProvider 和 ThemeProvider 连接起来，
 * 使 ThemeProvider 能够访问认证状态以进行云端同步。
 * 
 * @验证需求: 1.2 - 添加 AuthProvider
 */

'use client';

import { ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth/auth-context';
import { ThemeProvider } from '@/lib/themes/theme-context';
import { CodeThemeProvider } from '@/lib/code-theme/code-theme-context';
import { TooltipProvider } from '@/components/ui/tooltip';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * 内部组件：连接 Auth 和 Theme
 */
function ThemeProviderWithAuth({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <ThemeProvider userId={user?.id?.toString()} isAuthenticated={isAuthenticated}>
      <CodeThemeProvider>
        {children}
      </CodeThemeProvider>
    </ThemeProvider>
  );
}

/**
 * 应用级 Provider 包装器
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <ThemeProviderWithAuth>
        <TooltipProvider delayDuration={300}>
          {children}
        </TooltipProvider>
      </ThemeProviderWithAuth>
    </AuthProvider>
  );
}

export default AppProviders;
