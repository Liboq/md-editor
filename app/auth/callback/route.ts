/**
 * OAuth 回调处理路由
 * 
 * 处理 GitHub OAuth 授权成功后的回调请求。
 * Supabase 会将授权码发送到此端点，我们需要交换访问令牌。
 * 
 * @验证需求: 1.2 - GitHub 授权成功并回调时创建用户会话
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const origin = requestUrl.origin;

  // 处理 OAuth 错误（用户拒绝授权等情况）
  // @验证需求: 1.5 - GitHub 授权失败或被拒绝时显示友好的错误提示
  if (error) {
    console.error('OAuth 错误:', error, errorDescription);
    // 重定向到首页并带上错误参数
    return NextResponse.redirect(
      `${origin}?auth_error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  // 如果没有授权码，重定向到首页
  if (!code) {
    return NextResponse.redirect(origin);
  }

  // 创建 Supabase 客户端并交换授权码
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 使用授权码交换会话
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('交换授权码失败:', exchangeError);
      return NextResponse.redirect(
        `${origin}?auth_error=${encodeURIComponent('登录失败，请重试')}`
      );
    }

    // 授权成功，重定向到首页
    return NextResponse.redirect(origin);
  } catch (err) {
    console.error('OAuth 回调处理异常:', err);
    return NextResponse.redirect(
      `${origin}?auth_error=${encodeURIComponent('登录过程中发生错误')}`
    );
  }
}
