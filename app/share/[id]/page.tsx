/**
 * 分享预览页面
 * 
 * 显示分享的文章内容，应用保存的主题样式。
 * 无需登录即可访问。
 * 
 * @验证需求: 6.2 - 访客打开分享链接时显示文章预览，无需登录
 * @验证需求: 6.3 - 在分享内容中包含应用的主题样式
 * @验证需求: 6.4 - 以只读模式展示内容
 * @验证需求: 6.5 - 分享链接无效或内容不存在时显示友好的错误页面
 */

import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { parseMarkdown } from '@/lib/markdown/parser';
import { generateThemeCSS } from '@/lib/themes/theme-styles';
import { codeThemes, generateCodeThemeCSS } from '@/lib/code-theme/code-themes';

// 禁用缓存，确保每次都获取最新数据
export const revalidate = 0;
export const dynamic = 'force-dynamic';

// 客户端组件用于注入样式
import ShareContent from './ShareContent';

interface SharePageProps {
  params: Promise<{ id: string }>;
}

async function getShareContent(shareId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const { data, error } = await supabase
    .from('shared_articles')
    .select('*')
    .eq('id', shareId)
    .single();

  if (error || !data) {
    return null;
  }

  // 检查是否过期
  if (data.expires_at) {
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      return null;
    }
  }

  return data;
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  
  // 验证 UUID 格式
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  const shareContent = await getShareContent(id);

  if (!shareContent) {
    notFound();
  }

  // 解析 Markdown
  const htmlContent = parseMarkdown(shareContent.markdown);
  
  // 处理 theme_styles - 可能是字符串或对象
  let themeStylesData = shareContent.theme_styles;
  
  // 调试：输出原始数据
  console.log('=== 分享页面调试 ===');
  console.log('theme_styles 类型:', typeof themeStylesData);
  console.log('theme_styles 原始值:', JSON.stringify(themeStylesData).substring(0, 500));
  
  if (typeof themeStylesData === 'string') {
    try {
      themeStylesData = JSON.parse(themeStylesData);
      console.log('解析后的 theme_styles:', JSON.stringify(themeStylesData).substring(0, 500));
    } catch (e) {
      console.error('解析 theme_styles 失败:', e);
      themeStylesData = null;
    }
  }
  
  // 生成主题样式 - 创建临时主题对象
  // 检查是否有 customCSS（自定义主题）
  const customCSS = themeStylesData?.customCSS as string | undefined;
  
  const tempTheme = {
    id: shareContent.theme_id || 'shared-theme',
    name: 'Shared Theme',
    description: '',
    isBuiltIn: false,
    styles: themeStylesData,
    customCSS: customCSS || undefined,
  };
  
  const themeStyles = generateThemeCSS(tempTheme);
  
  // 生成代码主题样式
  const codeThemeId = shareContent.code_theme_id || 'github';
  const codeTheme = codeThemes.find(t => t.id === codeThemeId) || codeThemes[0];
  const codeThemeStyles = generateCodeThemeCSS(codeTheme);
  
  console.log('生成的 CSS 长度:', themeStyles.length);
  console.log('生成的 CSS 前500字符:', themeStyles.substring(0, 500));
  console.log('customCSS 存在:', !!customCSS);
  console.log('代码主题:', codeThemeId);
  console.log('=== 调试结束 ===');

  return (
    <ShareContent 
      htmlContent={htmlContent}
      themeStyles={themeStyles}
      codeThemeStyles={codeThemeStyles}
    />
  );
}

export async function generateMetadata({ params }: SharePageProps) {
  const { id } = await params;
  
  return {
    title: '分享的文章 - Markdown 编辑器',
    description: '查看分享的 Markdown 文章',
    openGraph: {
      title: '分享的文章',
      description: '查看分享的 Markdown 文章',
      type: 'article',
      url: `/share/${id}`,
    },
  };
}
