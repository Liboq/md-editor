/**
 * Markdown Worker 的过程定义
 * 
 * 定义 Worker 端暴露的方法类型。
 * 这些方法在 Web Worker 中执行，避免阻塞主线程。
 */

/**
 * 渲染结果类型
 */
export interface RenderResult {
  html: string;
  /** 渲染耗时（毫秒） */
  duration: number;
}

/**
 * 提取结果类型
 */
export interface ExtractResult {
  /** 纯文本内容 */
  text: string;
  /** 字数统计 */
  wordCount: number;
  /** 字符数统计 */
  charCount: number;
}

/**
 * Lint 结果类型
 */
export interface LintResult {
  /** 是否有效 */
  valid: boolean;
  /** 警告信息 */
  warnings: string[];
  /** 修复后的 Markdown（如果有修复） */
  fixed?: string;
}

/**
 * 渲染 Markdown 为 HTML
 */
export function renderMarkdown(
  markdown: string,
  parseMarkdown: (md: string) => string
): RenderResult {
  const start = performance.now();
  const html = parseMarkdown(markdown);
  const duration = performance.now() - start;
  return { html, duration };
}

/**
 * 从 Markdown 提取纯文本
 */
export function extractText(markdown: string): ExtractResult {
  // 移除代码块
  let text = markdown.replace(/```[\s\S]*?```/g, "");
  // 移除行内代码
  text = text.replace(/`[^`]+`/g, "");
  // 移除链接，保留文本
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  // 移除图片
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "");
  // 移除标题标记
  text = text.replace(/^#{1,6}\s+/gm, "");
  // 移除粗体/斜体标记
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/\*([^*]+)\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");
  text = text.replace(/_([^_]+)_/g, "$1");
  // 移除删除线
  text = text.replace(/~~([^~]+)~~/g, "$1");
  // 移除引用标记
  text = text.replace(/^>\s+/gm, "");
  // 移除列表标记
  text = text.replace(/^[\s]*[-*+]\s+/gm, "");
  text = text.replace(/^[\s]*\d+\.\s+/gm, "");
  // 移除分割线
  text = text.replace(/^[-*_]{3,}$/gm, "");
  // 移除多余空行
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();

  // 统计
  const charCount = text.length;
  // 中文按字符计数，英文按单词计数
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = text
    .replace(/[\u4e00-\u9fa5]/g, " ")
    .split(/\s+/)
    .filter((w: string) => w.length > 0).length;
  const wordCount = chineseChars + englishWords;

  return { text, wordCount, charCount };
}

/**
 * 检查 Markdown 格式并尝试修复
 */
export function lintMarkdown(markdown: string): LintResult {
  const warnings: string[] = [];
  let fixed = markdown;
  let hasChanges = false;

  // 检查并修复：标题后没有空格
  const headingNoSpace = /^(#{1,6})([^\s#])/gm;
  if (headingNoSpace.test(fixed)) {
    warnings.push("标题 # 后应该有空格");
    fixed = fixed.replace(/^(#{1,6})([^\s#])/gm, "$1 $2");
    hasChanges = true;
  }

  // 检查并修复：列表项后没有空格
  const listNoSpace = /^([\s]*[-*+])([^\s])/gm;
  if (listNoSpace.test(fixed)) {
    warnings.push("列表标记后应该有空格");
    fixed = fixed.replace(/^([\s]*[-*+])([^\s])/gm, "$1 $2");
    hasChanges = true;
  }

  // 检查：未闭合的代码块
  const codeBlockCount = (fixed.match(/```/g) || []).length;
  if (codeBlockCount % 2 !== 0) {
    warnings.push("存在未闭合的代码块");
  }

  // 检查：未闭合的粗体/斜体
  const boldCount = (fixed.match(/\*\*/g) || []).length;
  if (boldCount % 2 !== 0) {
    warnings.push("存在未闭合的粗体标记 **");
  }

  return {
    valid: warnings.length === 0,
    warnings,
    fixed: hasChanges ? fixed : undefined,
  };
}
