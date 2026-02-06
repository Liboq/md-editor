/**
 * 复制功能模块
 * 
 * 参考 OnlineMarkdown 的实现方式，使用 clipboard.js 实现复制功能。
 * 支持复制带样式的 HTML 内容到微信公众号编辑器。
 */

import ClipboardJS from "clipboard";
import { adaptForWechat, type WechatAdapterOptions } from "./wechat-adapter";

// 导出微信适配器
export { adaptForWechat, type WechatAdapterOptions } from "./wechat-adapter";
export { needsWechatAdaptation } from "./wechat-adapter";

/**
 * 从 HTML 中提取纯文本
 */
function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

/**
 * 初始化复制按钮
 * 
 * 参考 OnlineMarkdown 的实现：
 * var clipboard = new Clipboard('.copy-button');
 * 
 * @param selector - 复制按钮的选择器
 * @param getContent - 获取要复制内容的函数
 * @param onSuccess - 复制成功回调
 * @param onError - 复制失败回调
 * @returns ClipboardJS 实例
 */
export function initCopyButton(
  selector: string | Element,
  getContent: () => string,
  onSuccess?: () => void,
  onError?: (err: Error) => void
): ClipboardJS {
  const clipboard = new ClipboardJS(selector, {
    text: () => getContent(),
  });

  clipboard.on("success", (e) => {
    e.clearSelection();
    onSuccess?.();
  });

  clipboard.on("error", () => {
    onError?.(new Error("复制失败"));
  });

  return clipboard;
}

/**
 * 复制 HTML 内容到剪贴板（微信公众号兼容）
 * 
 * 核心实现：使用 Clipboard API 的 write 方法，
 * 设置 text/html MIME 类型，这样粘贴到微信公众号时能保留样式。
 * 
 * 参考文档中的实现：
 * ```javascript
 * const blob = new Blob([inlined], { type: 'text/html' })
 * await navigator.clipboard.write([
 *   new ClipboardItem({ 'text/html': blob })
 * ])
 * ```
 * 
 * @param html - 要复制的 HTML 内容
 * @param wechatOptions - 微信适配选项（可选）
 * @returns 是否复制成功
 */
export async function copyHTML(
  html: string,
  wechatOptions?: WechatAdapterOptions
): Promise<boolean> {
  // 应用微信适配
  const adaptedHtml = wechatOptions ? adaptForWechat(html, wechatOptions) : html;
  
  // 优先使用现代 Clipboard API（支持 text/html MIME 类型）
  if (navigator.clipboard?.write) {
    try {
      const htmlBlob = new Blob([adaptedHtml], { type: "text/html" });
      const textBlob = new Blob([stripHtml(adaptedHtml)], { type: "text/plain" });
      
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": htmlBlob,
          "text/plain": textBlob,
        }),
      ]);
      return true;
    } catch (err) {
      console.warn("Clipboard API 写入失败，降级到 execCommand:", err);
      // 降级到 execCommand 方式
    }
  }
  
  // 降级方案：使用 execCommand + copy 事件
  return copyHTMLWithExecCommand(adaptedHtml);
}

/**
 * 使用 execCommand 复制 HTML（降级方案）
 */
function copyHTMLWithExecCommand(html: string): Promise<boolean> {
  return new Promise((resolve) => {
    // 创建临时容器，放入要复制的 HTML
    const container = document.createElement("div");
    container.innerHTML = html;
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    container.style.opacity = "0";
    container.style.pointerEvents = "none";
    container.style.userSelect = "text";
    container.setAttribute("contenteditable", "true");
    document.body.appendChild(container);

    // 选中容器内容
    const range = document.createRange();
    range.selectNodeContents(container);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    // 监听 copy 事件，设置 HTML 格式
    const copyHandler = (e: ClipboardEvent) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData("text/html", html);
        e.clipboardData.setData("text/plain", stripHtml(html));
      }
    };

    document.addEventListener("copy", copyHandler, true);

    // 执行复制
    let success = false;
    try {
      success = document.execCommand("copy");
    } catch {
      success = false;
    }

    // 清理
    document.removeEventListener("copy", copyHandler, true);
    selection?.removeAllRanges();
    document.body.removeChild(container);

    resolve(success);
  });
}

/**
 * 复制纯文本到剪贴板
 */
export async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 降级到 execCommand
    }
  }
  return copyTextFallback(text);
}

/**
 * 降级方案：使用 execCommand 复制文本
 */
function copyTextFallback(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);

  textarea.focus();
  textarea.select();

  let success = false;
  try {
    success = document.execCommand("copy");
  } catch {
    success = false;
  }

  document.body.removeChild(textarea);
  return success;
}

/**
 * 检查剪贴板 API 是否可用
 */
export function isClipboardSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.clipboard !== "undefined" &&
    typeof navigator.clipboard.write === "function"
  );
}
