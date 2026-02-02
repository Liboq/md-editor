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
  
  // 生成主题样式 - 创建临时主题对象
  const tempTheme = {
    id: shareContent.theme_id,
    name: 'Shared Theme',
    description: '',
    isBuiltIn: false,
    styles: shareContent.theme_styles,
  };
  const themeStyles = generateThemeCSS(tempTheme);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* 顶部提示栏 */}
      <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            这是一篇分享的文章
          </span>
          <a
            href="/"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            创建自己的文章 →
          </a>
        </div>
      </div>

      {/* 文章内容 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
        <article
          className="preview-content prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </main>

      {/* 底部信息 */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-8">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            由 Markdown 编辑器生成 ·{' '}
            <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
              立即体验
            </a>
          </p>
        </div>
      </footer>
    </div>
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
