/**
 * 知乎平台导出器
 * 
 * 将 Markdown/HTML 内容转换为知乎兼容的 HTML 格式。
 * 
 * 知乎平台特性：
 * - 支持 HTML 格式
 * - 代码块使用 `<pre><code>` 标签结构
 * - 支持图片（保留原始 URL）
 * - 支持 LaTeX 公式（保持原始格式）
 * - 不需要行内样式（知乎有自己的样式系统）
 * 
 * @see Requirements 3.1, 3.2, 3.3, 3.4
 */

import type { PlatformExporter, ExportResult } from '../types';
import { PLATFORMS, PLATFORM_META } from '../types';
import type { Theme } from '../../themes/types';

/**
 * 将代码块转换为知乎兼容的 `<pre><code>` 结构
 * 
 * 知乎支持的代码块格式：
 * ```html
 * <pre><code class="language-javascript">代码内容</code></pre>
 * ```
 * 
 * @param html - 输入的 HTML 内容
 * @returns 转换后的 HTML 内容
 */
function convertCodeBlocks(html: string): string {
  // 匹配各种可能的代码块格式并转换为 <pre><code> 结构
  
  // 1. 处理已经是 <pre><code> 结构但可能有额外包装的情况
  // 例如：<pre class="..."><code class="...">...</code></pre>
  // 保持这种结构不变，只需确保格式正确
  
  // 2. 处理只有 <pre> 没有 <code> 的情况
  // 例如：<pre class="...">代码内容</pre>
  // 转换为：<pre><code class="...">代码内容</code></pre>
  let result = html;
  
  // 匹配 <pre> 标签内没有 <code> 的情况
  // 使用非贪婪匹配和正向否定预查
  result = result.replace(
    /<pre([^>]*)>(?![\s\S]*?<code)([\s\S]*?)<\/pre>/gi,
    (match, preAttrs, content) => {
      // 从 pre 标签属性中提取 class
      const classMatch = preAttrs.match(/class\s*=\s*["']([^"']*)["']/i);
      const className = classMatch ? classMatch[1] : '';
      
      // 提取语言类名（如 language-javascript）
      const langClass = className.match(/language-\w+/)?.[0] || '';
      
      // 构建新的 <pre><code> 结构
      const codeAttrs = langClass ? ` class="${langClass}"` : '';
      return `<pre><code${codeAttrs}>${content}</code></pre>`;
    }
  );
  
  // 3. 处理 <div class="highlight"> 包装的代码块（某些 Markdown 渲染器的输出）
  result = result.replace(
    /<div[^>]*class\s*=\s*["'][^"']*highlight[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
    (match, content) => {
      // 如果内部已经有 <pre><code> 结构，直接返回内部内容
      if (/<pre[\s\S]*?<code[\s\S]*?<\/code>[\s\S]*?<\/pre>/i.test(content)) {
        return content.trim();
      }
      return match;
    }
  );
  
  return result;
}

/**
 * 保留图片的原始 URL
 * 
 * 知乎支持外链图片，不需要转换图片 URL。
 * 此函数确保图片标签格式正确，保留原始 src 属性。
 * 
 * @param html - 输入的 HTML 内容
 * @returns 处理后的 HTML 内容（图片 URL 保持不变）
 */
function preserveImageUrls(html: string): string {
  // 图片 URL 保持不变，只需确保 img 标签格式正确
  // 知乎支持标准的 <img src="..." alt="..."> 格式
  
  // 移除可能存在的 data-* 属性（某些编辑器添加的）
  // 但保留 src、alt、title 等标准属性
  return html.replace(
    /<img([^>]*)>/gi,
    (match, attrs) => {
      // 提取关键属性
      const srcMatch = attrs.match(/src\s*=\s*["']([^"']*)["']/i);
      const altMatch = attrs.match(/alt\s*=\s*["']([^"']*)["']/i);
      const titleMatch = attrs.match(/title\s*=\s*["']([^"']*)["']/i);
      
      if (!srcMatch) {
        return match; // 没有 src 属性，保持原样
      }
      
      const src = srcMatch[1];
      const alt = altMatch ? altMatch[1] : '';
      const title = titleMatch ? titleMatch[1] : '';
      
      // 重建 img 标签，只保留必要属性
      let imgTag = `<img src="${src}"`;
      if (alt) imgTag += ` alt="${alt}"`;
      if (title) imgTag += ` title="${title}"`;
      imgTag += '>';
      
      return imgTag;
    }
  );
}

/**
 * 保留 LaTeX 公式格式
 * 
 * 知乎支持 LaTeX 公式，需要保持原始格式不变。
 * 常见的 LaTeX 格式：
 * - 行内公式：$...$
 * - 块级公式：$$...$$
 * - 使用 <span class="math"> 或 <div class="math"> 包装的公式
 * 
 * @param html - 输入的 HTML 内容
 * @returns 处理后的 HTML 内容（LaTeX 公式保持不变）
 */
function preserveLatex(html: string): string {
  // LaTeX 公式保持原样，不做任何转换
  // 知乎编辑器会自动识别和渲染 LaTeX 公式
  
  // 确保 math 相关的标签和类名被保留
  // 这里不需要做特殊处理，因为我们不会移除这些内容
  
  return html;
}

/**
 * 清理 HTML，移除知乎不需要的属性和样式
 * 
 * @param html - 输入的 HTML 内容
 * @returns 清理后的 HTML 内容
 */
function cleanHtml(html: string): string {
  let result = html;
  
  // 移除 style 属性（知乎有自己的样式系统）
  // 但保留 class 属性，因为某些类名可能对格式有意义
  result = result.replace(/\s+style\s*=\s*["'][^"']*["']/gi, '');
  
  // 移除 data-* 属性
  result = result.replace(/\s+data-[\w-]+\s*=\s*["'][^"']*["']/gi, '');
  
  // 移除空的 class 属性
  result = result.replace(/\s+class\s*=\s*["']\s*["']/gi, '');
  
  // 移除多余的空白
  result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return result.trim();
}

/**
 * 从 HTML 中提取纯文本
 * 
 * @param html - HTML 内容
 * @returns 纯文本内容
 */
function extractPlainText(html: string): string {
  // 移除所有 HTML 标签
  let text = html.replace(/<[^>]+>/g, '');
  
  // 解码 HTML 实体
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // 清理多余空白
  text = text.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
  
  return text;
}

/**
 * 知乎平台导出器
 * 
 * 将内容转换为知乎兼容的 HTML 格式：
 * - 代码块使用 `<pre><code>` 结构
 * - 保留图片原始 URL
 * - 保留 LaTeX 公式格式
 * - 移除行内样式（知乎有自己的样式系统）
 */
export const zhihuExporter: PlatformExporter = {
  /** 平台唯一标识 */
  id: PLATFORMS.ZHIHU,
  
  /** 平台显示名称 */
  name: PLATFORM_META.zhihu.name,
  
  /** 平台图标（Lucide 图标名称） */
  icon: PLATFORM_META.zhihu.icon,
  
  /** 导出格式类型 */
  formatType: PLATFORM_META.zhihu.formatType,
  
  /**
   * 导出内容为知乎兼容的 HTML 格式
   * 
   * @param _markdown - 原始 Markdown 文本（未使用，知乎使用 HTML 格式）
   * @param html - 渲染后的 HTML（带样式）
   * @param _theme - 当前主题配置（未使用，知乎不需要自定义样式）
   * @returns 转换后的知乎兼容 HTML
   */
  export(_markdown: string, html: string, _theme: Theme): ExportResult {
    // 1. 转换代码块为 <pre><code> 结构
    let content = convertCodeBlocks(html);
    
    // 2. 保留图片原始 URL
    content = preserveImageUrls(content);
    
    // 3. 保留 LaTeX 公式格式
    content = preserveLatex(content);
    
    // 4. 清理 HTML（移除行内样式等）
    content = cleanHtml(content);
    
    // 5. 提取纯文本作为备份
    const plainText = extractPlainText(content);
    
    return {
      content,
      mimeType: 'text/html',
      plainText,
    };
  },
};

export default zhihuExporter;
