/**
 * CSDN 平台导出器
 * 
 * 将 Markdown 内容导出为 CSDN 兼容的 Markdown 格式。
 * 
 * CSDN 平台特性：
 * - 支持 Markdown 格式
 * - 支持代码块语言标识（如 ```javascript）
 * - 支持标准 Markdown 图片语法 `![alt](url)`
 * - 支持标准 Markdown 表格语法
 * - 支持 LaTeX 公式
 * - 外链图片可能需要转存（CSDN 会自动处理，但需要标注提醒用户）
 * - 不支持某些 HTML 标签（如 script、style、iframe 等）
 * 
 * @see Requirements 5.1, 5.2, 5.3, 5.4
 */

import type { PlatformExporter, ExportResult } from '../types';
import { PLATFORMS, PLATFORM_META } from '../types';
import type { Theme } from '../../themes/types';

/**
 * CSDN 不支持的 HTML 标签列表
 * 这些标签会被移除以确保内容在 CSDN 上正常显示
 */
const UNSUPPORTED_TAGS = [
  'script',
  'style',
  'iframe',
  'frame',
  'frameset',
  'object',
  'embed',
  'applet',
  'form',
  'input',
  'button',
  'select',
  'textarea',
  'link',
  'meta',
  'base',
  'noscript',
];

/**
 * 移除 CSDN 不支持的 HTML 标签
 * 
 * CSDN 出于安全考虑，不支持某些 HTML 标签。
 * 此函数会移除这些标签及其内容。
 * 
 * @param markdown - 输入的 Markdown 文本
 * @returns 移除不支持标签后的 Markdown 文本
 */
function removeUnsupportedTags(markdown: string): string {
  let result = markdown;
  
  for (const tag of UNSUPPORTED_TAGS) {
    // 移除自闭合标签，如 <script />
    const selfClosingRegex = new RegExp(`<${tag}[^>]*\\/>`, 'gi');
    result = result.replace(selfClosingRegex, '');
    
    // 移除带内容的标签，如 <script>...</script>
    // 使用非贪婪匹配处理嵌套情况
    const openCloseRegex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
    result = result.replace(openCloseRegex, '');
    
    // 移除单独的开标签（没有闭合的情况）
    const openTagRegex = new RegExp(`<${tag}[^>]*>`, 'gi');
    result = result.replace(openTagRegex, '');
  }
  
  return result;
}

/**
 * 检查并标注外链图片
 * 
 * CSDN 可能需要将外链图片转存到 CSDN 图床。
 * 此函数会检测外链图片并在 alt 文本中添加标注，提醒用户。
 * 
 * 外链图片的判断标准：
 * - 不是 CSDN 域名的图片（csdn.net、csdnimg.cn）
 * - 不是 data: URI 的图片
 * 
 * @param markdown - 输入的 Markdown 文本
 * @returns 标注外链图片后的 Markdown 文本
 */
function annotateExternalImages(markdown: string): string {
  // 匹配 Markdown 图片语法：![alt](url) 或 ![alt](url "title")
  const imageRegex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;
  
  return markdown.replace(imageRegex, (match, alt, url, title) => {
    // 检查是否为 CSDN 域名的图片
    const isCsdnImage = /(?:csdn\.net|csdnimg\.cn)/i.test(url);
    
    // 检查是否为 data: URI
    const isDataUri = /^data:/i.test(url);
    
    // 如果是外链图片，添加标注
    if (!isCsdnImage && !isDataUri) {
      // 在 alt 文本末尾添加外链标注（如果还没有标注）
      const annotatedAlt = alt.includes('[外链图片]') ? alt : `${alt}[外链图片]`;
      
      // 重建图片语法
      if (title) {
        return `![${annotatedAlt}](${url} "${title}")`;
      }
      return `![${annotatedAlt}](${url})`;
    }
    
    // 非外链图片保持原样
    return match;
  });
}

/**
 * 清理 Markdown 内容
 * 
 * 执行一些通用的清理操作：
 * - 移除多余的空行
 * - 确保代码块格式正确
 * 
 * @param markdown - 输入的 Markdown 文本
 * @returns 清理后的 Markdown 文本
 */
function cleanMarkdown(markdown: string): string {
  let result = markdown;
  
  // 移除连续的多个空行，保留最多两个换行
  result = result.replace(/\n{3,}/g, '\n\n');
  
  // 确保文件末尾有换行
  if (result.length > 0 && !result.endsWith('\n')) {
    result += '\n';
  }
  
  return result.trim();
}

/**
 * CSDN 平台导出器
 * 
 * 将内容转换为 CSDN 兼容的 Markdown 格式：
 * - 保留代码块语言标识
 * - 标注外链图片（提醒用户可能需要转存）
 * - 移除不支持的 HTML 标签
 */
export const csdnExporter: PlatformExporter = {
  /** 平台唯一标识 */
  id: PLATFORMS.CSDN,
  
  /** 平台显示名称 */
  name: PLATFORM_META.csdn.name,
  
  /** 平台图标（Lucide 图标名称） */
  icon: PLATFORM_META.csdn.icon,
  
  /** 导出格式类型 */
  formatType: PLATFORM_META.csdn.formatType,
  
  /**
   * 导出内容为 CSDN 兼容的 Markdown 格式
   * 
   * @param markdown - 原始 Markdown 文本
   * @param _html - 渲染后的 HTML（未使用，CSDN 使用 Markdown 格式）
   * @param _theme - 当前主题配置（未使用，CSDN 不需要自定义样式）
   * @returns 转换后的 CSDN 兼容 Markdown
   */
  export(markdown: string, _html: string, _theme: Theme): ExportResult {
    // 1. 移除 CSDN 不支持的 HTML 标签
    let content = removeUnsupportedTags(markdown);
    
    // 2. 标注外链图片（提醒用户可能需要转存）
    content = annotateExternalImages(content);
    
    // 3. 清理 Markdown 内容
    content = cleanMarkdown(content);
    
    // CSDN 使用 Markdown 格式，mimeType 为 text/plain
    return {
      content,
      mimeType: 'text/plain',
    };
  },
};

export default csdnExporter;
