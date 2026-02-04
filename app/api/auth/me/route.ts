/**
 * 获取当前用户 API
 * 
 * 验证 JWT token 并返回用户信息。
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: '未提供认证信息' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; login: string };
      
      // 返回基本用户信息（实际项目中可以从数据库获取完整信息）
      return NextResponse.json({
        id: decoded.userId,
        login: decoded.login,
      });
    } catch {
      return NextResponse.json(
        { message: 'Token 无效或已过期' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { message: '获取用户信息失败' },
      { status: 500 }
    );
  }
}
