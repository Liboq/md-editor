import { marked } from "marked";

// 配置 marked 使用 GFM (GitHub Flavored Markdown)
// async: false 确保同步解析
marked.setOptions({
  gfm: true,
  breaks: true,
  async: false,
});

/**
 * 预处理 Markdown 文本
 * 处理没有空格的标题格式，如 ###标题 -> ### 标题
 */
function preprocessMarkdown(markdown: string): string {
  // 匹配行首的 # 号后面直接跟非空格非#字符的情况
  // 例如: ###标题 -> ### 标题
  return markdown.replace(/^(#{1,6})([^\s#])/gm, "$1 $2");
}

/**
 * 将行内代码内容分割为带 span 的 HTML，支持在标点处换行
 */
function splitCodeContent(text: string): string {
  // 匹配标点符号（逗号、分号、冒号、点、斜杠等）
  const parts = text.split(/([,;:.\/\\|])/g);
  
  return parts
    .filter(part => part !== "")
    .map(part => {
      // 标点符号使用 pun 类，其他使用 pln 类
      const isPunctuation = /^[,;:.\/\\|]$/.test(part);
      const className = isPunctuation ? "pun" : "pln";
      return `<span class="${className}">${part}</span>`;
    })
    .join("");
}

/**
 * 后处理 HTML，将行内 code 元素内容分割为 span
 * 不处理 pre 内的 code（代码块）
 */
function postprocessInlineCode(html: string): string {
  // 匹配不在 pre 标签内的 code 元素
  // 使用正则替换行内 code
  return html.replace(/<code>([^<]+)<\/code>/g, (match, content) => {
    const splitContent = splitCodeContent(content);
    return `<code class="code-inline">${splitContent}</code>`;
  });
}

/**
 * 解析 Markdown 文本为 HTML
 * @param markdown - Markdown 源文本
 * @returns 解析后的 HTML 字符串
 */
export function parseMarkdown(markdown: string): string {
  if (!markdown || markdown.trim() === "") {
    return "";
  }

  try {
    // 预处理：修复没有空格的标题
    const preprocessed = preprocessMarkdown(markdown);
    // 使用 { async: false } 确保同步返回字符串
    let html = marked.parse(preprocessed, { async: false }) as string;
    // 后处理：分割行内代码内容
    html = postprocessInlineCode(html);
    return html;
  } catch (error) {
    console.error("Markdown 解析错误:", error);
    // 解析失败时返回转义后的纯文本
    return escapeHtml(markdown);
  }
}

/**
 * 转义 HTML 特殊字符
 */
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

/**
 * 检查 HTML 是否包含特定元素
 * 用于测试验证
 */
export function htmlContainsElement(html: string, tagName: string): boolean {
  const regex = new RegExp(`<${tagName}[^>]*>`, "i");
  return regex.test(html);
}

/**
 * 获取 HTML 中所有指定标签
 */
export function getHtmlElements(html: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    matches.push(match[0]);
  }
  return matches;
}
