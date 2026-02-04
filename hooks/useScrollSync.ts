"use client";

import { useCallback, useRef, useEffect } from "react";

export interface UseScrollSyncOptions {
  enabled: boolean;
}

export interface UseScrollSyncReturn {
  editorRef: React.RefObject<HTMLTextAreaElement | null>;
  previewContainerRef: React.RefObject<HTMLDivElement | null>;
  handleEditorScroll: () => void;
  handlePreviewScroll: () => void;
}

/**
 * 滚动同步 hook
 * 支持编辑器和预览面板的双向滚动同步
 */
export function useScrollSync({ enabled }: UseScrollSyncOptions): UseScrollSyncReturn {
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const isScrollingRef = useRef<"editor" | "preview" | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 清除滚动锁定
  const clearScrollLock = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = null;
    }, 100);
  }, []);

  // 编辑器滚动 -> 同步预览
  const handleEditorScroll = useCallback(() => {
    if (!enabled) return;
    if (isScrollingRef.current === "preview") return;

    const editor = editorRef.current;
    const preview = previewContainerRef.current;
    if (!editor || !preview) return;

    isScrollingRef.current = "editor";

    // 计算编辑器滚动百分比
    const editorScrollHeight = editor.scrollHeight - editor.clientHeight;
    if (editorScrollHeight <= 0) {
      clearScrollLock();
      return;
    }

    const scrollPercentage = editor.scrollTop / editorScrollHeight;

    // 按比例同步预览滚动位置
    const previewScrollHeight = preview.scrollHeight - preview.clientHeight;
    if (previewScrollHeight > 0) {
      preview.scrollTop = scrollPercentage * previewScrollHeight;
    }

    clearScrollLock();
  }, [enabled, clearScrollLock]);

  // 预览滚动 -> 同步编辑器
  const handlePreviewScroll = useCallback(() => {
    if (!enabled) return;
    if (isScrollingRef.current === "editor") return;

    const editor = editorRef.current;
    const preview = previewContainerRef.current;
    if (!editor || !preview) return;

    isScrollingRef.current = "preview";

    // 计算预览滚动百分比
    const previewScrollHeight = preview.scrollHeight - preview.clientHeight;
    if (previewScrollHeight <= 0) {
      clearScrollLock();
      return;
    }

    const scrollPercentage = preview.scrollTop / previewScrollHeight;

    // 按比例同步编辑器滚动位置
    const editorScrollHeight = editor.scrollHeight - editor.clientHeight;
    if (editorScrollHeight > 0) {
      editor.scrollTop = scrollPercentage * editorScrollHeight;
    }

    clearScrollLock();
  }, [enabled, clearScrollLock]);

  // 清理
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    editorRef,
    previewContainerRef,
    handleEditorScroll,
    handlePreviewScroll,
  };
}
