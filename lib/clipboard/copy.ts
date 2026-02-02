/**
 * 复制 HTML 内容到剪贴板
 * @param html - 要复制的 HTML 内容
 * @returns 是否复制成功
 */
export async function copyHTML(html: string): Promise<boolean> {
  try {
    // 使用 Clipboard API 复制富文本
    const blob = new Blob([html], { type: "text/html" });
    const clipboardItem = new ClipboardItem({
      "text/html": blob,
      "text/plain": new Blob([stripHtml(html)], { type: "text/plain" }),
    });

    await navigator.clipboard.write([clipboardItem]);
    return true;
  } catch (error) {
    console.error("复制 HTML 失败:", error);

    // 降级方案：使用 execCommand
    try {
      return copyHTMLFallback(html);
    } catch (fallbackError) {
      console.error("降级复制也失败:", fallbackError);
      return false;
    }
  }
}

/**
 * 复制纯文本到剪贴板
 * @param text - 要复制的文本
 * @returns 是否复制成功
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("复制文本失败:", error);

    // 降级方案
    try {
      return copyTextFallback(text);
    } catch (fallbackError) {
      console.error("降级复制也失败:", fallbackError);
      return false;
    }
  }
}

/**
 * 降级方案：使用 execCommand 复制 HTML
 */
function copyHTMLFallback(html: string): boolean {
  const container = document.createElement("div");
  container.innerHTML = html;
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  document.body.appendChild(container);

  const range = document.createRange();
  range.selectNodeContents(container);

  const selection = window.getSelection();
  if (!selection) {
    document.body.removeChild(container);
    return false;
  }

  selection.removeAllRanges();
  selection.addRange(range);

  const success = document.execCommand("copy");

  selection.removeAllRanges();
  document.body.removeChild(container);

  return success;
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
