/**
 * 掘金平台导出器
 * 
 * 将 Markdown 内容导出为掘金兼容的标准 Markdown 格式。
 * 
 * 掘金平台特性：
 * - 支持标准 Markdown 格式
 * - 支持代码块语言标识（如 ```javascript）
 * - 支持标准 Markdown 图片语法 `![alt](url)`
 * - 支持标准 Markdown 表格语法
 * - 支持 LaTeX 公式
 * - 支持所有 Markdown 扩展语法
 * 
 * 由于掘金完全支持标准 Markdown，导出器直接返回原始 Markdown 文本，
 * 不做任何转换，以保留所有格式和扩展语法。
 * 
 * @see Requirements 4.1, 4.2, 4.3
 */

import type { PlatformExporter, ExportResult } from '../types';
import { PLATFORMS, PLATFORM_META } from '../types';
import type { Theme } from '../../themes/types';

/**
 * 掘金平台导出器
 * 
 * 掘金支持标准 Markdown 格式，因此导出器直接返回原始 Markdown 文本。
 * 这样可以：
 * - 保留代码块语言标识（如 ```javascript）
 * - 保留标准 Markdown 图片语法
 * - 保留标准 Markdown 表格语法
 * - 保留所有 Markdown 扩展语法（如 LaTeX 公式）
 */
export const juejinExporter: PlatformExporter = {
  /** 平台唯一标识 */
  id: PLATFORMS.JUEJIN,
  
  /** 平台显示名称 */
  name: PLATFORM_META.juejin.name,
  
  /** 平台图标（Lucide 图标名称） */
  icon: PLATFORM_META.juejin.icon,
  
  /** 导出格式类型 */
  formatType: PLATFORM_META.juejin.formatType,
  
  /**
   * 导出内容为掘金兼容的 Markdown 格式
   * 
   * 掘金完全支持标准 Markdown，因此直接返回原始 Markdown 文本，
   * 不做任何转换，以保留所有格式和扩展语法。
   * 
   * @param markdown - 原始 Markdown 文本
   * @param _html - 渲染后的 HTML（未使用，掘金使用 Markdown 格式）
   * @param _theme - 当前主题配置（未使用，掘金不需要自定义样式）
   * @returns 原始 Markdown 文本
   */
  export(markdown: string, _html: string, _theme: Theme): ExportResult {
    // 掘金支持标准 Markdown 格式，直接返回原始 Markdown 文本
    // 这样可以保留：
    // - 代码块语言标识（如 ```javascript）
    // - 标准 Markdown 图片语法 ![alt](url)
    // - 标准 Markdown 表格语法
    // - LaTeX 公式（$...$ 和 $$...$$）
    // - 所有其他 Markdown 扩展语法
    
    return {
      content: markdown,
      mimeType: 'text/plain',
    };
  },
};

export default juejinExporter;
