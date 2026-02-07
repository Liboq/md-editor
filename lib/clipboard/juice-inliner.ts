/**
 * 使用 juice 库实现 CSS 内联化
 * 
 * juice 会解析 CSS 选择器，找到匹配的 HTML 元素，
 * 把样式规则写入 style 属性，确保复制到微信公众号时样式保留。
 */

import juice from "juice";
import type { Theme } from "@/lib/themes/types";
import type { CodeTheme } from "@/lib/code-theme/code-themes";
import { generateThemeCSS } from "@/lib/themes/theme-styles";
import { generateCodeThemeCSS } from "@/lib/code-theme/code-themes";
import { adaptForWechat } from "./wechat-adapter";

/**
 * juice 配置选项
 */
const JUICE_OPTIONS: juice.Options = {
  // 移除 <style> 标签
  removeStyleTags: true,
  // 保留媒体查询（虽然微信不支持，但不影响）
  preserveMediaQueries: false,
  // 保留字体
  preserveFontFaces: false,
  // 保留关键帧（微信不支持动画）
  preserveKeyFrames: false,
  // 保留伪元素（微信不支持，但 juice 会跳过）
  preservePseudos: false,
  // 插入保留的 CSS
  insertPreservedExtraCss: false,
  // 应用宽度属性
  applyWidthAttributes: true,
  // 应用高度属性
  applyHeightAttributes: true,
  // 应用属性黑名单
  applyAttributesTableElements: true,
};

/**
 * 解析 CSS 变量为实际值
 * 微信不支持 CSS 变量，需要转换为实际颜色值
 */
function resolveCssVariables(css: string): string {
  // 常见的 CSS 变量映射（基于 Tailwind/shadcn 默认值）
  const cssVariables: Record<string, string> = {
    // 背景和前景
    '--background': '#ffffff',
    '--foreground': '#0a0a0a',
    // 边框
    '--border': '#e5e5e5',
    // 主色
    '--primary': '#171717',
    '--primary-foreground': '#fafafa',
    // 次要色
    '--secondary': '#f5f5f5',
    '--secondary-foreground': '#171717',
    // 静音色
    '--muted': '#f5f5f5',
    '--muted-foreground': '#737373',
    // 强调色
    '--accent': '#f5f5f5',
    '--accent-foreground': '#171717',
    // 卡片
    '--card': '#ffffff',
    '--card-foreground': '#0a0a0a',
    // 弹出层
    '--popover': '#ffffff',
    '--popover-foreground': '#0a0a0a',
    // 输入框
    '--input': '#e5e5e5',
    // 环形
    '--ring': '#0a0a0a',
    // 圆角
    '--radius': '0.5rem',
  };

  let result = css;

  // 替换 hsl(var(--xxx)) 格式
  result = result.replace(/hsl\(var\((--[\w-]+)\)\)/g, (match, varName) => {
    return cssVariables[varName] || match;
  });

  // 替换 var(--xxx) 格式
  result = result.replace(/var\((--[\w-]+)\)/g, (match, varName) => {
    return cssVariables[varName] || match;
  });

  return result;
}

/**
 * 包裹裸文本，防止微信把 strong/em 后面的文本解析为 section
 * 例如：<strong>标题</strong>：后面的文本 -> <strong>标题</strong><span style="...">：后面的文本</span>
 * 
 * 处理范围：li、p、td、th、blockquote 等块级元素内的裸文本
 */
function wrapBareText(html: string): string {
  // 需要处理的块级元素
  const blockElements = ['li', 'p', 'td', 'th', 'blockquote', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  
  // 用于包裹文本的 span 样式
  const spanStyle = 'box-sizing: border-box; margin: 0;';
  
  let result = html;
  
  for (const tag of blockElements) {
    // 匹配块级元素内的内容
    const regex = new RegExp(`(<${tag}[^>]*>)([\\s\\S]*?)(<\\/${tag}>)`, 'gi');
    
    result = result.replace(regex, (_, tagOpen, content, tagClose) => {
      // 在内容中，将 </strong>、</em>、</b>、</i>、</code> 后面的裸文本用 span 包裹
      let processed = content;
      
      // 匹配 </strong>、</em>、</b>、</i>、</code> 后面紧跟的文本（不以 < 开头的内容）
      processed = processed.replace(
        /(<\/(?:strong|em|b|i|code)[^>]*>)([^<]+)/gi,
        (_m: string, closeTag: string, text: string) => {
          // 如果文本只有空白，不处理
          if (!text.trim()) return `${closeTag}${text}`;
          return `${closeTag}<span style="${spanStyle}">${text}</span>`;
        }
      );
      
      // 处理开头的裸文本（在第一个标签之前的文本）
      // 例如：<p>文本<strong>粗体</strong></p> -> <p><span>文本</span><strong>粗体</strong></p>
      processed = processed.replace(
        /^([^<]+)(<(?:strong|em|b|i|code|a|span)[^>]*>)/i,
        (m: string, text: string, openTag: string) => {
          // 如果文本只有空白，不处理
          if (!text.trim()) return m;
          return `<span style="${spanStyle}">${text}</span>${openTag}`;
        }
      );
      
      return `${tagOpen}${processed}${tagClose}`;
    });
  }
  
  return result;
}

/**
 * 生成基础样式（重置和通用样式）
 */
function generateBaseCSS(): string {
  return `
    /* 基础重置 */
    * {
      box-sizing: border-box;
    }
    
    /* 容器样式 */
    .preview-content {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #333333;
    }
    
    /* 标题通用样式 */
    h1, h2, h3, h4, h5, h6 {
      font-weight: 600;
      line-height: 1.3;
      margin-top: 1em;
      margin-bottom: 0.5em;
    }
    
    /* 段落 */
    p {
      margin-bottom: 1em;
      line-height: 1.8;
    }
    
    /* 链接 */
    a {
      color: #0066cc;
      text-decoration: none;
    }
    
    /* 粗体和斜体 */
    strong, b {
      font-weight: bold;
    }
    
    em, i {
      font-style: italic;
    }
    
    /* 行内代码 */
    code {
      background: #f5f5f5;
      color: #c7254e;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: Consolas, Monaco, monospace;
      font-size: 0.9em;
    }
    
    /* 代码块 */
    pre {
      margin: 1em 0;
      padding: 0;
      background: transparent;
    }
    
    pre code {
      display: block;
      background: #f6f8fa;
      color: #24292e;
      padding: 1em;
      border-radius: 6px;
      font-family: Consolas, Monaco, monospace;
      font-size: 0.9em;
      line-height: 1.5;
      overflow-x: auto;
      white-space: pre;
    }
    
    /* 引用 */
    blockquote {
      background: #f9f9f9;
      border-left: 4px solid #ddd;
      color: #666666;
      padding: 1em;
      margin: 1em 0;
      font-style: italic;
    }
    
    /* 列表 */
    ul, ol {
      margin-left: 2em;
      margin-bottom: 1em;
      line-height: 1.8;
    }
    
    li {
      margin-bottom: 0.25em;
    }
    
    /* 表格 */
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 0.5em 1em;
      text-align: left;
    }
    
    th {
      background: #f5f5f5;
      font-weight: 600;
    }
    
    /* 图片 */
    img {
      max-width: 100%;
      border-radius: 4px;
      margin: 1em 0;
    }
    
    /* 分割线 */
    hr {
      border: none;
      border-top: 1px solid #ddd;
      margin: 2em 0;
    }
    
    /* 语言标签 - 在 section 内、pre 上方、与 code 贴合 */
    .code-lang-label {
      display: block;
      text-align: right;
      font-size: 12px;
      font-weight: 700;
      color: #fff;
      background: #3b82f6;
      padding: 4px 12px;
      margin: 0;
      border-radius: 6px 6px 0 0;
      font-family: system-ui, -apple-system, sans-serif;
      letter-spacing: 0.5px;
    }
  `;
}

/**
 * 使用 juice 将 CSS 内联到 HTML
 * 
 * @param html - 原始 HTML 内容
 * @param theme - 主题配置
 * @param codeTheme - 代码主题配置
 * @returns 带内联样式的 HTML
 */
export function inlineStyles(
  html: string,
  theme?: Theme,
  codeTheme?: CodeTheme
): string {
  // 1. 生成所有 CSS
  const baseCSS = generateBaseCSS();
  const themeCSS = theme ? generateThemeCSS(theme) : "";
  const codeCSS = codeTheme ? generateCodeThemeCSS(codeTheme) : "";
  
  // 2. 合并 CSS 并解析 CSS 变量
  let fullCSS = `${baseCSS}\n${themeCSS}\n${codeCSS}`;
  fullCSS = resolveCssVariables(fullCSS);
  
  // 3. 包装 HTML（确保有根元素）
  const wrappedHtml = `<div class="preview-content">${html}</div>`;
  
  // 4. 使用 juice 内联样式
  try {
    let inlinedHtml = juice.inlineContent(wrappedHtml, fullCSS, JUICE_OPTIONS);
    
    // 5. 包裹裸文本，防止微信解析问题
    inlinedHtml = wrapBareText(inlinedHtml);
    
    return inlinedHtml;
  } catch (error) {
    console.error("juice 内联样式失败:", error);
    // 失败时返回原始 HTML
    return wrappedHtml;
  }
}

/**
 * 完整的微信公众号复制处理流程
 * 1. 使用 juice 内联样式
 * 2. 应用微信适配器处理
 * 3. 清理多余的空白和换行
 * 
 * @param html - 原始 HTML
 * @param theme - 主题配置
 * @param codeTheme - 代码主题配置
 * @returns 处理后的 HTML
 */
export function prepareForWechat(
  html: string,
  theme?: Theme,
  codeTheme?: CodeTheme
): string {
  // 1. 使用 juice 内联样式
  let result = inlineStyles(html, theme, codeTheme);
  
  // 2. 应用微信适配器
  result = adaptForWechat(result, {
    preserveCodeSpaces: true,
    preserveCodeLineBreaks: true,
    convertTaskLists: true,
    sanitizeStyles: true,
    removeIds: true,
  });
  
  // 3. 清理多余的空白和换行（juice 可能产生）
  // 移除标签之间的多余换行和空白
  result = result.replace(/>\s+</g, '><');
  // 移除开头和结尾的空白
  result = result.trim();
  
  return result;
}
