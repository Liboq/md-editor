/**
 * useAutoSave Hook - 自动保存功能
 * 
 * 提供文章的自动保存和手动保存功能。
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { articleService, Article } from '@/lib/supabase/article-service';

interface UseAutoSaveOptions {
  /** 用户 ID */
  userId: string | undefined;
  /** 自动保存间隔（毫秒），默认 30 秒 */
  interval?: number;
  /** 是否启用自动保存 */
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  /** 当前文章 */
  article: Article | null;
  /** 是否正在保存 */
  isSaving: boolean;
  /** 是否有未保存的更改 */
  hasUnsavedChanges: boolean;
  /** 最后保存时间 */
  lastSavedAt: Date | null;
  /** 加载文章 */
  loadArticle: (articleId: string) => Promise<void>;
  /** 创建新文章 */
  createNewArticle: () => Promise<Article | null>;
  /** 更新内容（触发自动保存） */
  updateContent: (content: string) => void;
  /** 更新标题 */
  updateTitle: (title: string) => void;
  /** 手动保存 */
  saveNow: () => Promise<void>;
  /** 加载状态 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
}

export function useAutoSave({
  userId,
  interval = 30000,
  enabled = true,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [article, setArticle] = useState<Article | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 用于存储待保存的内容
  const pendingContentRef = useRef<string | null>(null);
  const pendingTitleRef = useRef<string | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 执行保存操作
  const performSave = useCallback(async () => {
    if (!article) return;

    const contentToSave = pendingContentRef.current;
    const titleToSave = pendingTitleRef.current;

    if (contentToSave === null && titleToSave === null) return;

    setIsSaving(true);
    setError(null);

    try {
      const updates: { content?: string; title?: string } = {};
      if (contentToSave !== null) updates.content = contentToSave;
      if (titleToSave !== null) updates.title = titleToSave;

      await articleService.updateArticle(article.id, updates);

      // 更新本地状态
      setArticle((prev) =>
        prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null
      );

      // 清除待保存内容
      if (contentToSave !== null) pendingContentRef.current = null;
      if (titleToSave !== null) pendingTitleRef.current = null;

      setHasUnsavedChanges(false);
      setLastSavedAt(new Date());
    } catch (err) {
      console.error('保存失败:', err);
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setIsSaving(false);
    }
  }, [article]);

  // 设置自动保存定时器
  useEffect(() => {
    if (!enabled || !article) return;

    autoSaveTimerRef.current = setInterval(() => {
      if (hasUnsavedChanges) {
        performSave();
      }
    }, interval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [enabled, article, interval, hasUnsavedChanges, performSave]);

  // 加载文章
  const loadArticle = useCallback(async (articleId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const loadedArticle = await articleService.getArticle(articleId);
      setArticle(loadedArticle);
      setHasUnsavedChanges(false);
      pendingContentRef.current = null;
      pendingTitleRef.current = null;
    } catch (err) {
      console.error('加载文章失败:', err);
      setError(err instanceof Error ? err.message : '加载文章失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 创建新文章
  const createNewArticle = useCallback(async (): Promise<Article | null> => {
    if (!userId) return null;

    setIsLoading(true);
    setError(null);

    try {
      const newArticle = await articleService.createArticle({ user_id: userId });
      setArticle(newArticle);
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date());
      return newArticle;
    } catch (err) {
      console.error('创建文章失败:', err);
      setError(err instanceof Error ? err.message : '创建文章失败');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // 更新内容
  const updateContent = useCallback((content: string) => {
    pendingContentRef.current = content;
    setHasUnsavedChanges(true);
  }, []);

  // 更新标题
  const updateTitle = useCallback((title: string) => {
    pendingTitleRef.current = title;
    setHasUnsavedChanges(true);
  }, []);

  // 手动保存
  const saveNow = useCallback(async () => {
    await performSave();
  }, [performSave]);

  // 组件卸载时保存
  useEffect(() => {
    return () => {
      if (hasUnsavedChanges && article) {
        // 同步保存（尽力而为）
        performSave();
      }
    };
  }, [hasUnsavedChanges, article, performSave]);

  return {
    article,
    isSaving,
    hasUnsavedChanges,
    lastSavedAt,
    loadArticle,
    createNewArticle,
    updateContent,
    updateTitle,
    saveNow,
    isLoading,
    error,
  };
}

export default useAutoSave;
