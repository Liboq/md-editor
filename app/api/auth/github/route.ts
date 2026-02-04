/**
 * GitHub OAuth 登录 API
 * 
 * 使用 GitHub code 交换 access_token，然后获取用户信息。
 * 同时将用户信息存入数据库。
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { userService } from '@/lib/supabase/user-service';

const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export async function POST(request: NextRequest) {
  try {
    // 检查环境变量是否配置
    if (!GITHUB_CLIENT_ID) {
      console.error('GITHUB_CLIENT_ID 未配置');
      return NextResponse.json(
        { message: '服务器配置错误：缺少 GitHub Client ID' },
        { status: 500 }
      );
    }

    if (!GITHUB_CLIENT_SECRET) {
      console.error('GITHUB_CLIENT_SECRET 未配置');
      return NextResponse.json(
        { message: '服务器配置错误：缺少 GitHub Client Secret' },
        { status: 500 }
      );
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { message: '缺少授权码' },
        { status: 400 }
      );
    }

    console.log('开始 GitHub OAuth 登录，code 长度:', code.length);

    // 1. 使用 code 交换 access_token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('GitHub token 请求失败:', tokenResponse.status, tokenResponse.statusText);
      return NextResponse.json(
        { message: `GitHub 服务请求失败: ${tokenResponse.status}` },
        { status: 502 }
      );
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('GitHub token error:', tokenData);
      // 常见错误：bad_verification_code 表示 code 已过期或已使用
      const errorMessages: Record<string, string> = {
        'bad_verification_code': '授权码无效或已过期，请重新登录',
        'incorrect_client_credentials': '服务器配置错误，请联系管理员',
        'redirect_uri_mismatch': '回调地址不匹配，请联系管理员',
      };
      return NextResponse.json(
        { message: errorMessages[tokenData.error] || tokenData.error_description || '获取 access_token 失败' },
        { status: 400 }
      );
    }

    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('GitHub 返回的 access_token 为空:', tokenData);
      return NextResponse.json(
        { message: '获取 access_token 失败' },
        { status: 400 }
      );
    }

    console.log('成功获取 access_token');

    // 2. 使用 access_token 获取用户信息
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      console.error('获取 GitHub 用户信息失败:', userResponse.status, userResponse.statusText);
      return NextResponse.json(
        { message: `获取用户信息失败: ${userResponse.status}` },
        { status: 400 }
      );
    }

    const githubUser = await userResponse.json();

    // 3. 获取用户邮箱（如果公开邮箱为空）
    let email = githubUser.email;
    if (!email) {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (emailsResponse.ok) {
        const emails = await emailsResponse.json();
        const primaryEmail = emails.find((e: { primary: boolean }) => e.primary);
        email = primaryEmail?.email || null;
      }
    }

    // 4. 构建用户对象
    const user = {
      id: githubUser.id,
      login: githubUser.login,
      avatar_url: githubUser.avatar_url,
      email,
      name: githubUser.name,
    };

    // 5. 将用户信息存入数据库
    try {
      await userService.upsertUser(user, accessToken);
      console.log('用户信息已保存到数据库:', user.login);
    } catch (dbError) {
      // 数据库错误不阻止登录，只记录日志
      console.error('保存用户到数据库失败:', dbError);
    }

    // 6. 生成 JWT token
    const token = jwt.sign(
      { userId: user.id, login: user.login },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('登录成功:', user.login);

    return NextResponse.json({ user, token });
  } catch (error) {
    console.error('GitHub login error:', error);
    const message = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { message: `登录失败: ${message}` },
      { status: 500 }
    );
  }
}
