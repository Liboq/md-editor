/**
 * 导出器注册表
 * 
 * 管理所有平台导出器的注册和获取
 * 实现 Requirements 1.3, 1.4
 */

import type { PlatformExporter } from './types';

/**
 * 导出器注册表接口
 */
export interface ExporterRegistry {
  /**
   * 注册导出器
   * @param exporter - 平台导出器实例
   */
  register(exporter: PlatformExporter): void;
  
  /**
   * 获取导出器
   * @param id - 平台标识
   * @returns 对应的导出器，不存在则返回 undefined
   */
  get(id: string): PlatformExporter | undefined;
  
  /**
   * 获取所有已注册的导出器
   * @returns 导出器列表
   */
  getAll(): PlatformExporter[];
}

/**
 * 创建导出器注册表
 * 
 * 使用 Map 存储导出器，保证 O(1) 的查找性能
 * 
 * @returns 导出器注册表实例
 */
export function createExporterRegistry(): ExporterRegistry {
  // 使用 Map 存储导出器，key 为平台 id
  const exporters = new Map<string, PlatformExporter>();
  
  return {
    /**
     * 注册导出器
     * 如果已存在相同 id 的导出器，将被覆盖
     * @param exporter - 平台导出器实例
     */
    register(exporter: PlatformExporter): void {
      if (!exporter || !exporter.id) {
        throw new Error('导出器必须包含有效的 id');
      }
      exporters.set(exporter.id, exporter);
    },
    
    /**
     * 获取导出器
     * @param id - 平台标识
     * @returns 对应的导出器，不存在则返回 undefined
     */
    get(id: string): PlatformExporter | undefined {
      return exporters.get(id);
    },
    
    /**
     * 获取所有已注册的导出器
     * @returns 导出器列表（按注册顺序）
     */
    getAll(): PlatformExporter[] {
      return Array.from(exporters.values());
    },
  };
}

/**
 * 默认导出器注册表实例
 * 用于全局共享的单例模式
 */
export const defaultRegistry = createExporterRegistry();
