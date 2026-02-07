/**
 * Markdown Worker 模块导出
 * 
 * 提供 Web Worker 方式的 Markdown 渲染，避免阻塞主线程。
 */

export {
  MarkdownWorkerClient,
  getMarkdownWorker,
  destroyMarkdownWorker,
} from "./client";

export { useMarkdownWorker } from "./useMarkdownWorker";

export type {
  RenderResult,
  RenderWithStylesResult,
  ExtractResult,
  LintResult,
} from "./procedures";
