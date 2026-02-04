/**
 * 文章列表页面
 * 
 * 显示用户的所有文章，支持创建、编辑、删除操作。
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { articleService, Article } from '@/lib/supabase/article-service';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Plus, 
  FileText, 
  Trash2, 
  ArrowLeft,
  Clock,
  MoreVertical
} from 'lucide-react';

export default function ArticlesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // 未登录跳转
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // 加载文章列表
  useEffect(() => {
    if (user) {
      loadArticles();
    }
  }, [user]);

  const loadArticles = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await articleService.getArticles(user.id.toString());
      setArticles(data);
    } catch (error) {
      console.error('加载文章失败:', error);
      toast.error('加载文章列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建新文章
  const handleCreate = async () => {
    if (!user) return;

    try {
      setCreating(true);
      const article = await articleService.createArticle({
        user_id: user.id.toString(),
        title: '未命名文档',
        content: '',
      });
      toast.success('文章创建成功');
      router.push(`/editor?article=${article.id}`);
    } catch (error) {
      console.error('创建文章失败:', error);
      toast.error('创建文章失败');
    } finally {
      setCreating(false);
    }
  };

  // 删除文章
  const handleDelete = async (articleId: string) => {
    try {
      setDeletingId(articleId);
      await articleService.deleteArticle(articleId);
      setArticles(prev => prev.filter(a => a.id !== articleId));
      toast.success('文章已删除');
    } catch (error) {
      console.error('删除文章失败:', error);
      toast.error('删除文章失败');
    } finally {
      setDeletingId(null);
      setMenuOpenId(null);
    }
  };

  // 打开文章编辑
  const handleEdit = (articleId: string) => {
    router.push(`/editor?article=${articleId}`);
  };

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;
    
    return date.toLocaleDateString('zh-CN');
  };

  // 获取文章预览文本
  const getPreviewText = (content: string) => {
    const text = content.replace(/[#*`>\-\[\]()!]/g, '').trim();
    return text.length > 100 ? text.slice(0, 100) + '...' : text || '暂无内容';
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* 头部 */}
      <header className="border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-950 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="h-9 w-9 cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              我的文章
            </h1>
          </div>
          <Button
            onClick={handleCreate}
            disabled={creating}
            className="gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {creating ? '创建中...' : '新建文章'}
          </Button>
        </div>
      </header>

      {/* 文章列表 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              还没有文章
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              点击上方按钮创建你的第一篇文章
            </p>
            <Button onClick={handleCreate} disabled={creating} className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              新建文章
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className="group relative border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition-all duration-200 cursor-pointer"
                onClick={() => handleEdit(article.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate mb-1">
                      {article.title || '未命名文档'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {getPreviewText(article.content)}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 dark:text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(article.updated_at)}</span>
                    </div>
                  </div>
                  
                  {/* 操作菜单 */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === article.id ? null : article.id);
                      }}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    
                    {menuOpenId === article.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(null);
                          }}
                        />
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                          <button
                            className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(article.id);
                            }}
                            disabled={deletingId === article.id}
                          >
                            <Trash2 className="h-4 w-4" />
                            {deletingId === article.id ? '删除中...' : '删除'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
