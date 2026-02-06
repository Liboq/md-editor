/**
 * 微信公众号导出器
 * 
 * 微信公众号复制使用现有的 ClipboardJS + `data-clipboard-target` 方案，
 * 直接复制预览区域的 DOM 内容。这种方式能够完美保留所有行内样式，
 * 确保粘贴到微信公众号时格式正确。
 * 
 * 此导出器仅提供元数据，export 方法不会被实际调用。
 * 
 * @see Requirements 2.1
 */

import type { PlatformExporter, ExportResult } from '../types';
import { PLATFORMS, PLATFORM_META } from '../types';
import type { Theme } from '../../themes/types';

/**
 * 微信公众号导出器
 * 
 * 注意：微信公众号复制不使用此导出器的 export 方法，
 * 而是使用 ClipboardJS 直接复制 DOM 内容以保留完整的行内样式。
 */
export const wechatExporter: PlatformExporter = {
  /** 平台唯一标识 */
  id: PLATFORMS.WECHAT,
  
  /** 平台显示名称 */
  name: PLATFORM_META.wechat.name,
  
  /** 平台图标（Lucide 图标名称） */
  icon: PLATFORM_META.wechat.icon,
  
  /** 导出格式类型 */
  formatType: PLATFORM_META.wechat.formatType,
  
  /**
   * 导出内容
   * 
   * 注意：此方法不会被实际调用。
   * 微信公众号复制使用 ClipboardJS + data-clipboard-target 方案，
   * 直接复制预览区域的 DOM 内容，以保留完整的行内样式。
   * 
   * @param _markdown - 原始 Markdown 文本（未使用）
   * @param _html - 渲染后的 HTML（未使用）
   * @param _theme - 当前主题配置（未使用）
   * @throws Error 始终抛出错误，因为微信公众号应使用 DOM 复制方式
   */
  export(_markdown: string, _html: string, _theme: Theme): ExportResult {
    throw new Error(
      '微信公众号复制应使用 ClipboardJS + data-clipboard-target 方案，' +
      '直接复制 DOM 内容以保留行内样式。请勿调用此方法。'
    );
  },
};

export default wechatExporter;
