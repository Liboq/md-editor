/**
 * Markdown Worker React Hook
 * 
 * 提供在 React 组件中使用 Web Worker 渲染 Markdown 的便捷方式。
 * 支持自动降级到主线程渲染（当 Worker 不可用时）。
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getMarkdownWorker, type RenderResult } from "./index";
import { parseMarkdown } from "../parser";

/**
 * Hook 返回值类型
 */
interface UseMarkdownWorkerResult {
  /** 渲染 Markdown 为 HTML */
  render: (markdown: string) => Promise<string>;
  /** Worker 是否可用 */
  isWorkerAvailable: boolean;
  /** 是否正在渲染 */
  isRendering: boolean;
  /** 最后一次渲染耗时（毫秒） */
  lastDuration: number | null;
}

/**
 * 使用 Web Worker 渲染 Markdown 的 Hook
 * 
 * 特性：
 * - 自动管理 Worker 生命周期
 * - Worker 不可用时自动降级到主线程
 * - 提供渲染状态和性能指标
 * 
 * @example
 * ```tsx
 * function Editor() {
 *   const { render, isWorkerAvailable } = useMarkdownWorker();
 *   const [html, setHtml] = useState("");
 * 
 *   const handleChange = async (markdown: string) => {
 *     const result = await render(markdown);
 *     setHtml(result);
 *   };
 * 
 *   return <div>{isWorkerAvailable ? "Worker 模式" : "主线程模式"}</div>;
 * }
 * ```
 */
export function useMarkdownWorker(): UseMarkdownWorkerResult {
  const [isWorkerAvailable, setIsWorkerAvailable] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [lastDuration, setLastDuration] = useState<number | null>(null);
  const workerRef = useRef(getMarkdownWorker());

  // 初始化 Worker
  useEffect(() => {
    const worker = workerRef.current;

    worker.ready().then(() => {
      setIsWorkerAvailable(worker.available);
    });

    // 组件卸载时不销毁全局 Worker（其他组件可能还在使用）
  }, []);

  /**
   * 渲染 Markdown
   * Worker 可用时使用 Worker，否则降级到主线程
   */
  const render = useCallback(async (markdown: string): Promise<string> => {
    setIsRendering(true);
    const start = performance.now();

    try {
      if (workerRef.current.available) {
        // 使用 Worker 渲染
        const result: RenderResult = await workerRef.current.render(markdown);
        setLastDuration(result.duration);
        return result.html;
      } else {
        // 降级到主线程渲染
        const html = parseMarkdown(markdown);
        setLastDuration(performance.now() - start);
        return html;
      }
    } finally {
      setIsRendering(false);
    }
  }, []);

  return {
    render,
    isWorkerAvailable,
    isRendering,
    lastDuration,
  };
}
