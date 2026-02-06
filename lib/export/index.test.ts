/**
 * lib/export/index.ts 模块入口测试
 * 
 * 验证模块导出是否正确
 */

import { describe, it, expect } from 'vitest';
import type { Theme } from '../themes/types';
import {
  // 类型常量
  PLATFORMS,
  PLATFORM_META,
  STORAGE_KEY,
  CopyErrorType,
  ERROR_MESSAGES,
  // 注册表
  createExporterRegistry,
  defaultRegistry,
  defaultExporterRegistry,
  // 导出器
  allExporters,
  wechatExporter,
  zhihuExporter,
  juejinExporter,
  csdnExporter,
  jianshuExporter,
  markdownExporter,
  // 便捷函数
  getExporter,
  getAllExporters,
  exportContent,
  isPlatformSupported,
} from './index';

describe('lib/export/index.ts 模块导出', () => {
  describe('类型定义导出', () => {
    it('应导出 PLATFORMS 常量', () => {
      expect(PLATFORMS).toBeDefined();
      expect(PLATFORMS.WECHAT).toBe('wechat');
      expect(PLATFORMS.ZHIHU).toBe('zhihu');
      expect(PLATFORMS.JUEJIN).toBe('juejin');
      expect(PLATFORMS.CSDN).toBe('csdn');
      expect(PLATFORMS.JIANSHU).toBe('jianshu');
      expect(PLATFORMS.MARKDOWN).toBe('markdown');
    });

    it('应导出 PLATFORM_META 常量', () => {
      expect(PLATFORM_META).toBeDefined();
      expect(PLATFORM_META.wechat.name).toBe('微信公众号');
      expect(PLATFORM_META.zhihu.name).toBe('知乎');
    });

    it('应导出 STORAGE_KEY 常量', () => {
      expect(STORAGE_KEY).toBe('qingyu-export-platform');
    });

    it('应导出 CopyErrorType 枚举', () => {
      expect(CopyErrorType.CLIPBOARD_NOT_SUPPORTED).toBe('CLIPBOARD_NOT_SUPPORTED');
      expect(CopyErrorType.PERMISSION_DENIED).toBe('PERMISSION_DENIED');
    });

    it('应导出 ERROR_MESSAGES 常量', () => {
      expect(ERROR_MESSAGES).toBeDefined();
      expect(ERROR_MESSAGES[CopyErrorType.CLIPBOARD_NOT_SUPPORTED]).toBe('您的浏览器不支持剪贴板功能');
    });
  });

  describe('注册表导出', () => {
    it('应导出 createExporterRegistry 函数', () => {
      expect(typeof createExporterRegistry).toBe('function');
      const registry = createExporterRegistry();
      expect(registry.register).toBeDefined();
      expect(registry.get).toBeDefined();
      expect(registry.getAll).toBeDefined();
    });

    it('应导出 defaultRegistry 实例', () => {
      expect(defaultRegistry).toBeDefined();
      expect(defaultRegistry.register).toBeDefined();
      expect(defaultRegistry.get).toBeDefined();
      expect(defaultRegistry.getAll).toBeDefined();
    });

    it('应导出 defaultExporterRegistry 实例（已预注册所有导出器）', () => {
      expect(defaultExporterRegistry).toBeDefined();
      expect(defaultExporterRegistry.getAll().length).toBe(6);
    });
  });

  describe('导出器导出', () => {
    it('应导出 allExporters 列表', () => {
      expect(allExporters).toBeDefined();
      expect(allExporters.length).toBe(6);
    });

    it('应导出所有平台导出器', () => {
      expect(wechatExporter).toBeDefined();
      expect(wechatExporter.id).toBe('wechat');

      expect(zhihuExporter).toBeDefined();
      expect(zhihuExporter.id).toBe('zhihu');

      expect(juejinExporter).toBeDefined();
      expect(juejinExporter.id).toBe('juejin');

      expect(csdnExporter).toBeDefined();
      expect(csdnExporter.id).toBe('csdn');

      expect(jianshuExporter).toBeDefined();
      expect(jianshuExporter.id).toBe('jianshu');

      expect(markdownExporter).toBeDefined();
      expect(markdownExporter.id).toBe('markdown');
    });
  });

  describe('便捷函数', () => {
    describe('getExporter', () => {
      it('应返回指定平台的导出器', () => {
        const exporter = getExporter('zhihu');
        expect(exporter).toBeDefined();
        expect(exporter?.id).toBe('zhihu');
        expect(exporter?.name).toBe('知乎');
      });

      it('对于不存在的平台应返回 undefined', () => {
        const exporter = getExporter('unknown');
        expect(exporter).toBeUndefined();
      });
    });

    describe('getAllExporters', () => {
      it('应返回所有已注册的导出器', () => {
        const exporters = getAllExporters();
        expect(exporters.length).toBe(6);
        expect(exporters.map(e => e.id)).toContain('wechat');
        expect(exporters.map(e => e.id)).toContain('zhihu');
        expect(exporters.map(e => e.id)).toContain('juejin');
        expect(exporters.map(e => e.id)).toContain('csdn');
        expect(exporters.map(e => e.id)).toContain('jianshu');
        expect(exporters.map(e => e.id)).toContain('markdown');
      });
    });

    describe('exportContent', () => {
      it('应使用指定平台导出内容', () => {
        const result = exportContent('markdown', '# Hello World', '', {} as Theme);
        expect(result).not.toBeNull();
        expect(result?.content).toBe('# Hello World');
        expect(result?.mimeType).toBe('text/plain');
      });

      it('对于不存在的平台应返回 null', () => {
        const result = exportContent('unknown', '# Hello', '', {} as Theme);
        expect(result).toBeNull();
      });
    });

    describe('isPlatformSupported', () => {
      it('对于已注册的平台应返回 true', () => {
        expect(isPlatformSupported('wechat')).toBe(true);
        expect(isPlatformSupported('zhihu')).toBe(true);
        expect(isPlatformSupported('juejin')).toBe(true);
        expect(isPlatformSupported('csdn')).toBe(true);
        expect(isPlatformSupported('jianshu')).toBe(true);
        expect(isPlatformSupported('markdown')).toBe(true);
      });

      it('对于未注册的平台应返回 false', () => {
        expect(isPlatformSupported('unknown')).toBe(false);
        expect(isPlatformSupported('')).toBe(false);
      });
    });
  });
});
