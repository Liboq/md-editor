/**
 * 导出器模块入口
 * 
 * 导出所有平台导出器，并创建预注册的默认注册表实例。
 * 
 * 使用方式：
 * ```typescript
 * import { defaultExporterRegistry, wechatExporter, zhihuExporter } from '@/lib/export/exporters';
 * 
 * // 使用默认注册表（已预注册所有导出器）
 * const exporter = defaultExporterRegistry.get('zhihu');
 * const result = exporter?.export(markdown, html, theme);
 * 
 * // 获取所有可用导出器
 * const allExporters = defaultExporterRegistry.getAll();
 * ```
 * 
 * @see Requirements 1.3
 */

import { createExporterRegistry } from '../registry';
import type { ExporterRegistry } from '../registry';

// 导入所有平台导出器
import { wechatExporter } from './wechat';
import { zhihuExporter } from './zhihu';
import { juejinExporter } from './juejin';
import { csdnExporter } from './csdn';
import { jianshuExporter } from './jianshu';
import { markdownExporter } from './markdown';

// 导出所有平台导出器
export { wechatExporter } from './wechat';
export { zhihuExporter } from './zhihu';
export { juejinExporter } from './juejin';
export { csdnExporter } from './csdn';
export { jianshuExporter } from './jianshu';
export { markdownExporter } from './markdown';

/**
 * 所有平台导出器列表
 * 按照推荐的显示顺序排列
 */
export const allExporters = [
  wechatExporter,
  zhihuExporter,
  juejinExporter,
  csdnExporter,
  jianshuExporter,
  markdownExporter,
];

/**
 * 创建并初始化默认导出器注册表
 * 
 * 预注册所有平台导出器，可直接使用。
 * 
 * @returns 已注册所有导出器的注册表实例
 */
function createDefaultExporterRegistry(): ExporterRegistry {
  const registry = createExporterRegistry();
  
  // 注册所有平台导出器
  for (const exporter of allExporters) {
    registry.register(exporter);
  }
  
  return registry;
}

/**
 * 默认导出器注册表实例
 * 
 * 已预注册所有平台导出器：
 * - wechat: 微信公众号
 * - zhihu: 知乎
 * - juejin: 掘金
 * - csdn: CSDN
 * - jianshu: 简书
 * - markdown: 纯 Markdown
 * 
 * @see Requirements 1.3
 */
export const defaultExporterRegistry = createDefaultExporterRegistry();
