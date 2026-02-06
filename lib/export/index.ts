/**
 * 多平台导出模块入口
 * 
 * 提供统一的导出接口，支持将 Markdown 内容导出为不同平台兼容的格式。
 * 
 * 使用方式：
 * ```typescript
 * import { 
 *   defaultExporterRegistry, 
 *   PLATFORMS, 
 *   getExporter, 
 *   exportContent 
 * } from '@/lib/export';
 * 
 * // 方式 1：使用便捷函数
 * const result = exportContent('zhihu', markdown, html, theme);
 * 
 * // 方式 2：使用注册表
 * const exporter = getExporter('zhihu');
 * const result = exporter?.export(markdown, html, theme);
 * 
 * // 方式 3：获取所有可用平台
 * const platforms = defaultExporterRegistry.getAll();
 * ```
 * 
 * @see Requirements 1.1, 1.3, 1.4
 */

import type { Theme } from '../themes/types';

// ============================================================================
// 类型定义导出
// ============================================================================

export type {
  PlatformExporter,
  ExportResult,
  ExportFormatType,
  ExportMimeType,
  PlatformFeatures,
  PlatformMeta,
  UserPreference,
  CopyError,
} from './types';

export {
  PLATFORMS,
  PLATFORM_META,
  STORAGE_KEY,
  CopyErrorType,
  ERROR_MESSAGES,
} from './types';

export type { PlatformId } from './types';

// ============================================================================
// 注册表导出
// ============================================================================

export type { ExporterRegistry } from './registry';
export { createExporterRegistry, defaultRegistry } from './registry';

// ============================================================================
// 导出器导出
// ============================================================================

export {
  // 默认注册表实例（已预注册所有导出器）
  defaultExporterRegistry,
  // 所有导出器列表
  allExporters,
  // 各平台导出器
  wechatExporter,
  zhihuExporter,
  juejinExporter,
  csdnExporter,
  jianshuExporter,
  markdownExporter,
} from './exporters';

// ============================================================================
// 便捷函数
// ============================================================================

import { defaultExporterRegistry } from './exporters';
import type { PlatformExporter, ExportResult } from './types';

/**
 * 获取指定平台的导出器
 * 
 * @param platformId - 平台标识
 * @returns 对应的导出器，不存在则返回 undefined
 * 
 * @example
 * ```typescript
 * const exporter = getExporter('zhihu');
 * if (exporter) {
 *   const result = exporter.export(markdown, html, theme);
 * }
 * ```
 * 
 * @see Requirements 1.4
 */
export function getExporter(platformId: string): PlatformExporter | undefined {
  return defaultExporterRegistry.get(platformId);
}

/**
 * 获取所有可用的导出器
 * 
 * @returns 所有已注册的导出器列表
 * 
 * @example
 * ```typescript
 * const exporters = getAllExporters();
 * exporters.forEach(e => console.log(e.name));
 * ```
 * 
 * @see Requirements 1.3
 */
export function getAllExporters(): PlatformExporter[] {
  return defaultExporterRegistry.getAll();
}

/**
 * 导出内容到指定平台
 * 
 * @param platformId - 目标平台标识
 * @param markdown - 原始 Markdown 文本
 * @param html - 渲染后的 HTML（带样式）
 * @param theme - 当前主题配置
 * @returns 导出结果，如果平台不存在则返回 null
 * 
 * @example
 * ```typescript
 * const result = exportContent('zhihu', markdown, html, theme);
 * if (result) {
 *   await navigator.clipboard.write([
 *     new ClipboardItem({
 *       [result.mimeType]: new Blob([result.content], { type: result.mimeType })
 *     })
 *   ]);
 * }
 * ```
 * 
 * @see Requirements 1.4
 */
export function exportContent(
  platformId: string,
  markdown: string,
  html: string,
  theme: Theme
): ExportResult | null {
  const exporter = getExporter(platformId);
  if (!exporter) {
    return null;
  }
  return exporter.export(markdown, html, theme);
}

/**
 * 检查平台是否支持
 * 
 * @param platformId - 平台标识
 * @returns 是否支持该平台
 * 
 * @example
 * ```typescript
 * if (isPlatformSupported('zhihu')) {
 *   // 执行导出
 * }
 * ```
 */
export function isPlatformSupported(platformId: string): boolean {
  return defaultExporterRegistry.get(platformId) !== undefined;
}
