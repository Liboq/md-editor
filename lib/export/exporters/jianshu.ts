/**
 * 简书平台导出器
 * 
 * 将 Markdown 内容导出为简书兼容的简化 Markdown 格式。
 * 
 * 简书平台特性：
 * - 支持简化的 Markdown 格式
 * - 支持代码块语言标识（如 ```javascript）
 * - 支持标准 Markdown 图片语法 `![alt](url)`
 * - 支持标准 Markdown 表格语法
 * - 不支持 LaTeX 公式（需要转换为文本或移除）
 * - 不支持某些 HTML 标签（如 script、style、iframe 等）
 * - 某些扩展语法需要转换为基础格式
 * 
 * @see Requirements 6.1, 6.2, 6.3, 6.4
 */

import type { PlatformExporter, ExportResult } from '../types';
import { PLATFORMS, PLATFORM_META } from '../types';
import type { Theme } from '../../themes/types';

/**
 * 简书不支持的 HTML 标签列表
 * 这些标签会被移除以确保内容在简书上正常显示
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
  'canvas',
  'video',
  'audio',
  'source',
  'track',
  'map',
  'area',
];

/**
 * 移除简书不支持的 HTML 标签
 * 
 * 简书出于安全和兼容性考虑，不支持某些 HTML 标签。
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
 * 转换 LaTeX 公式为文本格式
 * 
 * 简书不支持 LaTeX 公式渲染，需要将公式转换为可读的文本格式。
 * 
 * 处理策略：
 * - 行内公式 $...$ 转换为 `公式: ...`
 * - 块级公式 $$...$$ 转换为代码块形式
 * 
 * @param markdown - 输入的 Markdown 文本
 * @returns 转换公式后的 Markdown 文本
 */
function convertLatexToText(markdown: string): string {
  let result = markdown;
  
  // 处理块级公式 $$...$$（可能跨行）
  // 转换为代码块形式，保留公式内容供参考
  result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_match, formula) => {
    const trimmedFormula = formula.trim();
    return `\n\`\`\`\n[数学公式]\n${trimmedFormula}\n\`\`\`\n`;
  });
  
  // 处理行内公式 $...$（不跨行）
  // 转换为行内代码形式
  // 注意：避免匹配货币符号（如 $100）
  result = result.replace(/\$([^\$\n]+?)\$/g, (_match, formula) => {
    const trimmedFormula = formula.trim();
    // 如果公式内容看起来像货币金额，保持原样
    if (/^\d+(\.\d+)?$/.test(trimmedFormula)) {
      return _match;
    }
    return `\`[公式: ${trimmedFormula}]\``;
  });
  
  return result;
}

/**
 * 转换复杂格式为简书支持的基础格式
 * 
 * 简书对某些 Markdown 扩展语法支持有限，需要转换为基础格式：
 * - 任务列表 [ ] / [x] 转换为普通列表
 * - 脚注转换为括号引用
 * - 删除线保持（简书支持 ~~text~~）
 * - 高亮文本 ==text== 转换为加粗
 * 
 * @param markdown - 输入的 Markdown 文本
 * @returns 转换后的 Markdown 文本
 */
function convertComplexFormats(markdown: string): string {
  let result = markdown;
  
  // 转换任务列表为普通列表
  // - [ ] 未完成 -> - ☐ 未完成
  // - [x] 已完成 -> - ☑ 已完成
  result = result.replace(/^(\s*)-\s*\[\s*\]\s*/gm, '$1- ☐ ');
  result = result.replace(/^(\s*)-\s*\[x\]\s*/gim, '$1- ☑ ');
  
  // 转换高亮文本 ==text== 为加粗 **text**
  result = result.replace(/==([^=]+)==/g, '**$1**');
  
  // 注意：脚注定义必须在脚注引用之前处理，否则 [^1]: 会先被转换成 (注1):
  // 转换脚注定义 [^1]: 为 注1:（行首的脚注定义）
  result = result.replace(/^\[\^(\d+)\]:\s*/gm, '注$1: ');
  
  // 转换脚注引用 [^1] 为括号形式 (注1)（文本中的脚注引用）
  result = result.replace(/\[\^(\d+)\]/g, '(注$1)');
  
  return result;
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
 * 简书平台导出器
 * 
 * 将内容转换为简书兼容的简化 Markdown 格式：
 * - 保留代码块语言标识
 * - 保留标准 Markdown 表格语法
 * - 转换 LaTeX 公式为文本格式
 * - 转换复杂格式为基础格式
 * - 移除不支持的 HTML 标签
 */
export const jianshuExporter: PlatformExporter = {
  /** 平台唯一标识 */
  id: PLATFORMS.JIANSHU,
  
  /** 平台显示名称 */
  name: PLATFORM_META.jianshu.name,
  
  /** 平台图标（Lucide 图标名称） */
  icon: PLATFORM_META.jianshu.icon,
  
  /** 导出格式类型 */
  formatType: PLATFORM_META.jianshu.formatType,
  
  /**
   * 导出内容为简书兼容的简化 Markdown 格式
   * 
   * @param markdown - 原始 Markdown 文本
   * @param _html - 渲染后的 HTML（未使用，简书使用 Markdown 格式）
   * @param _theme - 当前主题配置（未使用，简书不需要自定义样式）
   * @returns 转换后的简书兼容 Markdown
   */
  export(markdown: string, _html: string, _theme: Theme): ExportResult {
    // 1. 移除简书不支持的 HTML 标签
    let content = removeUnsupportedTags(markdown);
    
    // 2. 转换 LaTeX 公式为文本格式（简书不支持 LaTeX）
    content = convertLatexToText(content);
    
    // 3. 转换复杂格式为简书支持的基础格式
    content = convertComplexFormats(content);
    
    // 4. 清理 Markdown 内容
    content = cleanMarkdown(content);
    
    // 简书使用 Markdown 格式，mimeType 为 text/plain
    return {
      content,
      mimeType: 'text/plain',
    };
  },
};

export default jianshuExporter;
