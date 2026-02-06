/**
 * 纯 Markdown 导出器
 * 
 * 将 Markdown 内容原样导出，不做任何转换。
 * 
 * 纯 Markdown 导出器特性：
 * - 直接返回原始 Markdown 文本，不做任何转换
 * - 保留所有 Markdown 语法不做任何转换
 * - mimeType 为 'text/plain'
 * 
 * 这是最简单的导出器，实现恒等变换：
 * 对于任意 Markdown 文本，经过纯 Markdown 导出器转换后，
 * 输出应与输入完全一致（字符级相等）。
 * 
 * @see Requirements 7.1, 7.2
 * @see Property 7: 纯 Markdown 恒等变换
 */

import type { PlatformExporter, ExportResult } from '../types';
import { PLATFORMS, PLATFORM_META } from '../types';
import type { Theme } from '../../themes/types';

/**
 * 纯 Markdown 导出器
 * 
 * 直接返回原始 Markdown 文本，不做任何转换。
 * 适用于需要在其他 Markdown 编辑器中使用的场景。
 */
export const markdownExporter: PlatformExporter = {
  /** 平台唯一标识 */
  id: PLATFORMS.MARKDOWN,
  
  /** 平台显示名称 */
  name: PLATFORM_META.markdown.name,
  
  /** 平台图标（Lucide 图标名称） */
  icon: PLATFORM_META.markdown.icon,
  
  /** 导出格式类型 */
  formatType: PLATFORM_META.markdown.formatType,
  
  /**
   * 导出内容为纯 Markdown 格式
   * 
   * 实现恒等变换：直接返回原始 Markdown 文本，不做任何转换。
   * 输出与输入完全一致（字符级相等）。
   * 
   * @param markdown - 原始 Markdown 文本
   * @param _html - 渲染后的 HTML（未使用）
   * @param _theme - 当前主题配置（未使用）
   * @returns 原始 Markdown 文本
   */
  export(markdown: string, _html: string, _theme: Theme): ExportResult {
    // 恒等变换：直接返回原始 Markdown 文本
    // 不做任何转换，保留所有 Markdown 语法
    return {
      content: markdown,
      mimeType: 'text/plain',
    };
  },
};

export default markdownExporter;
