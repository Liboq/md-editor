/**
 * Markdown Worker 客户端
 * 
 * 提供类型安全的 API 调用 Web Worker 中的 Markdown 处理方法。
 * 使用 Promise 封装消息通信，调用方式就像普通函数一样。
 */

import type { RenderResult, ExtractResult, LintResult } from "./procedures";

/**
 * 等待中的请求
 */
interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

/**
 * Markdown Worker 客户端类
 * 
 * 使用示例：
 * ```typescript
 * const client = new MarkdownWorkerClient();
 * await client.ready();
 * const { html } = await client.render("# Hello World");
 * ```
 */
export class MarkdownWorkerClient {
  private worker: Worker | null = null;
  private requestId = 0;
  private pendingRequests = new Map<number, PendingRequest>();
  private readyPromise: Promise<void>;
  private readyResolve: (() => void) | null = null;
  private isReady = false;

  constructor() {
    // 创建就绪 Promise
    this.readyPromise = new Promise((resolve) => {
      this.readyResolve = resolve;
    });

    // 在浏览器环境中初始化 Worker
    if (typeof window !== "undefined") {
      this.initWorker();
    }
  }

  /**
   * 初始化 Web Worker
   */
  private initWorker() {
    try {
      // 使用 URL 构造函数创建 Worker
      this.worker = new Worker(
        new URL("./markdown.worker.ts", import.meta.url),
        { type: "module" }
      );

      this.worker.onmessage = this.handleMessage.bind(this);
      this.worker.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error("Worker 初始化失败:", error);
      // Worker 不可用时，标记为就绪（将使用降级方案）
      this.isReady = true;
      this.readyResolve?.();
    }
  }

  /**
   * 处理 Worker 消息
   */
  private handleMessage(event: MessageEvent) {
    const { type, id, result, error } = event.data;

    // 处理就绪消息
    if (type === "ready") {
      this.isReady = true;
      this.readyResolve?.();
      return;
    }

    // 处理请求响应
    const pending = this.pendingRequests.get(id);
    if (pending) {
      this.pendingRequests.delete(id);
      if (error) {
        pending.reject(new Error(error));
      } else {
        pending.resolve(result);
      }
    }
  }

  /**
   * 处理 Worker 错误
   */
  private handleError(error: ErrorEvent) {
    console.error("Worker 错误:", error);
    // 拒绝所有等待中的请求
    for (const [id, pending] of this.pendingRequests) {
      pending.reject(new Error("Worker 错误"));
      this.pendingRequests.delete(id);
    }
  }

  /**
   * 发送请求到 Worker
   */
  private sendRequest<T>(method: string, params: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error("Worker 未初始化"));
        return;
      }

      const id = ++this.requestId;
      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
      });

      this.worker.postMessage({ id, method, params });
    });
  }

  /**
   * 等待 Worker 就绪
   */
  async ready(): Promise<void> {
    return this.readyPromise;
  }

  /**
   * 检查 Worker 是否可用
   */
  get available(): boolean {
    return this.isReady && this.worker !== null;
  }

  /**
   * 渲染 Markdown 为 HTML
   * 
   * @param markdown - Markdown 源文本
   * @returns 渲染结果，包含 HTML 和耗时
   */
  async render(markdown: string): Promise<RenderResult> {
    await this.ready();
    return this.sendRequest<RenderResult>("render", { markdown });
  }

  /**
   * 从 Markdown 提取纯文本
   * 
   * @param markdown - Markdown 源文本
   * @returns 提取结果，包含纯文本和统计信息
   */
  async extract(markdown: string): Promise<ExtractResult> {
    await this.ready();
    return this.sendRequest<ExtractResult>("extract", { markdown });
  }

  /**
   * 检查并修复 Markdown 格式
   * 
   * @param markdown - Markdown 源文本
   * @returns Lint 结果，包含警告和修复后的文本
   */
  async lint(markdown: string): Promise<LintResult> {
    await this.ready();
    return this.sendRequest<LintResult>("lint", { markdown });
  }

  /**
   * 健康检查
   */
  async ping(): Promise<{ pong: true; timestamp: number }> {
    await this.ready();
    return this.sendRequest<{ pong: true; timestamp: number }>("ping", {});
  }

  /**
   * 销毁 Worker
   */
  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingRequests.clear();
  }
}

/**
 * 全局单例实例
 */
let globalClient: MarkdownWorkerClient | null = null;

/**
 * 获取全局 Worker 客户端实例
 * 
 * 使用单例模式，避免创建多个 Worker
 */
export function getMarkdownWorker(): MarkdownWorkerClient {
  if (!globalClient) {
    globalClient = new MarkdownWorkerClient();
  }
  return globalClient;
}

/**
 * 销毁全局 Worker 客户端
 */
export function destroyMarkdownWorker() {
  if (globalClient) {
    globalClient.destroy();
    globalClient = null;
  }
}
