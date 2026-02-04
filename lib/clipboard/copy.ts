/**
 * 复制功能模块
 * 
 * 使用 clipboard.js 实现更可靠的复制功能，
 * 支持复制 HTML 内容到微信公众号编辑器。
 */

import ClipboardJS from "clipboard";

/**
 * 复制 HTML 内容到剪贴板
 * 
 * 使用 clipboard.js 实现，通过创建临时元素触发复制。
 * 同时设置 text/html 和 text/plain 格式，确保微信公众号兼容。
 * 
 * @param html - 要复制的 HTML 内容
 * @returns 是否复制成功
 */
export async function copyHTML(html: string): Promise<boolean> {
  return new Promise((resolve) => {
    // 创建临时按钮
    const btn = document.createElement("button");
    btn.style.position = "fixed";
    btn.style.left = "-9999px";
    btn.style.top = "-9999px";
    btn.setAttribute("data-clipboard-text", "placeholder");
    document.body.appendChild(btn);

    // 创建 clipboard.js 实例
    const clipboard = new ClipboardJS(btn, {
      text: () => stripHtml(html),
    });

    // 监听复制事件，手动设置 HTML 格式
    const copyHandler = (e: ClipboardEvent) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData("text/html", html);
        e.clipboardData.setData("text/plain", stripHtml(html));
      }
    };

    document.addEventListener("copy", copyHandler);

    clipboard.on("success", () => {
      cleanup();
      resolve(true);
    });

    clipboard.on("error", () => {
      cleanup();
      // 尝试降级方案
      copyHTMLFallback(html).then(resolve);
    });

    function cleanup() {
      document.removeEventListener("copy", copyHandler);
      clipboard.destroy();
      document.body.removeChild(btn);
    }

    // 触发点击
    btn.click();
  });
}

/**
 * 复制纯文本到剪贴板
 * @param text - 要复制的文本
 * @returns 是否复制成功
 */
export async function copyText(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    // 创建临时按钮
    const btn = document.createElement("button");
    btn.style.position = "fixed";
    btn.style.left = "-9999px";
    btn.setAttribute("data-clipboard-text", text);
    document.body.appendChild(btn);

    const clipboard = new ClipboardJS(btn);

    clipboard.on("success", () => {
      clipboard.destroy();
      document.body.removeChild(btn);
      resolve(true);
    });

    clipboard.on("error", () => {
      clipboard.destroy();
      document.body.removeChild(btn);
      // 降级方案
      resolve(copyTextFallback(text));
    });

    btn.click();
  });
}

/**
 * 降级方案：使用 execCommand + clipboardData.setData 复制 HTML
 */
async function copyHTMLFallback(html: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    // 创建隐藏的 input 元素
    let input = document.getElementById("copy-placeholder") as HTMLInputElement;
    if (!input) {
      input = document.createElement("input");
      input.id = "copy-placeholder";
      input.style.position = "absolute";
      input.style.left = "-9999px";
      input.style.zIndex = "-9999";
      document.body.appendChild(input);
    }

    input.value = "copy";
    input.setSelectionRange(0, input.value.length);
    input.focus();

    const copyHandler = (e: ClipboardEvent) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData("text/html", html);
        e.clipboardData.setData("text/plain", stripHtml(html));
      }
      document.removeEventListener("copy", copyHandler);
      resolve(true);
    };

    document.addEventListener("copy", copyHandler);

    const success = document.execCommand("copy");
    if (!success) {
      document.removeEventListener("copy", copyHandler);
      resolve(false);
    }
  });
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
  document.body.appendChild(textarea);

  textarea.select();
  const success = document.execCommand("copy");

  document.body.removeChild(textarea);
  return success;
}

/**
 * 从 HTML 中提取纯文本
 */
function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
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
