/**
 * ShareDialog 组件 - 分享对话框
 * 
 * 实现文章分享功能，生成分享链接并支持复制。
 * 
 * @验证需求: 6.1 - 生成包含文章内容和主题的分享链接
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/supabase/auth-context';
import { useTheme } from '@/lib/themes/theme-context';
import { createShare, generateShareUrl } from '@/lib/supabase/share-service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ShareDialogProps {
  markdown: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ markdown, open, onOpenChange }: ShareDialogProps) {
  const { isAuthenticated } = useAuth();
  const { activeTheme } = useTheme();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateShare = async () => {
    if (!isAuthenticated) {
      setError('请先登录后再分享');
      return;
    }

    if (!markdown.trim()) {
      setError('文章内容不能为空');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const shareId = await createShare({
        markdown,
        themeId: activeTheme.id,
        themeStyles: activeTheme.styles,
      });
      
      const url = generateShareUrl(shareId);
      setShareUrl(url);
    } catch (err) {
      console.error('创建分享失败:', err);
      setError(err instanceof Error ? err.message : '创建分享失败');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleClose = () => {
    setShareUrl(null);
    setError(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>分享文章</DialogTitle>
          <DialogDescription>
            生成分享链接，让他人无需登录即可查看您的文章
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isAuthenticated ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                请先登录后再分享文章
              </p>
            </div>
          ) : !shareUrl ? (
            <>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>将使用当前主题样式：<strong>{activeTheme.name}</strong></p>
                <p className="mt-1 text-xs text-gray-500">
                  分享后，访客将看到与您相同的排版效果
                </p>
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                  {error}
                </div>
              )}

              <Button
                onClick={handleCreateShare}
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? '生成中...' : '生成分享链接'}
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="sm"
                >
                  {copied ? '已复制' : '复制'}
                </Button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                任何人都可以通过此链接查看您的文章
              </p>

              <Button
                onClick={() => setShareUrl(null)}
                variant="outline"
                className="w-full"
              >
                生成新链接
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ShareDialog;
