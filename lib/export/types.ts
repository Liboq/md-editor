/**
 * 多平台导出类型定义
 * 
 * 定义平台导出器架构的核心类型，包括：
 * - 平台标识常量
 * - 导出器接口
 * - 导出结果接口
 * - 平台元数据接口
 */

import type { Theme } from '../themes/types';

/**
 * 平台配置常量
 */
export const PLATFORMS = {
  WECHAT: 'wechat',
  ZHIHU: 'zhihu',
  JUEJIN: 'juejin',
  CSDN: 'csdn',
  JIANSHU: 'jianshu',
  MARKDOWN: 'markdown',
} as const;

/**
 * 平台标识类型
 */
export type PlatformId = typeof PLATFORMS[keyof typeof PLATFORMS];

/**
 * 导出格式类型
 */
export type ExportFormatType = 'html' | 'markdown' | 'text';

/**
 * 导出内容 MIME 类型
 */
export type ExportMimeType = 'text/html' | 'text/plain';

/**
 * 导出结果
 */
export interface ExportResult {
  /** 导出的内容 */
  content: string;
  
  /** 内容类型（用于剪贴板） */
  mimeType: ExportMimeType;
  
  /** 纯文本备份（用于不支持 HTML 的场景） */
  plainText?: string;
}

/**
 * 平台导出器接口
 * 所有平台导出器必须实现此接口
 */
export interface PlatformExporter {
  /** 平台唯一标识 */
  id: string;
  
  /** 平台显示名称 */
  name: string;
  
  /** 平台图标（Lucide 图标名称或自定义 SVG） */
  icon: string;
  
  /** 导出格式类型 */
  formatType: ExportFormatType;
  
  /**
   * 导出内容
   * @param markdown - 原始 Markdown 文本
   * @param html - 渲染后的 HTML（带样式）
   * @param theme - 当前主题配置
   * @returns 转换后的内容
   */
  export(markdown: string, html: string, theme: Theme): ExportResult;
}

/**
 * 平台特性支持
 */
export interface PlatformFeatures {
  /** 是否支持行内样式 */
  supportsInlineStyles: boolean;
  /** 是否支持代码高亮 */
  supportsCodeHighlight: boolean;
  /** 是否支持图片 */
  supportsImages: boolean;
  /** 是否支持表格 */
  supportsTables: boolean;
  /** 是否支持 LaTeX 公式 */
  supportsLatex: boolean;
}

/**
 * 平台元数据
 */
export interface PlatformMeta {
  /** 平台唯一标识 */
  id: PlatformId;
  /** 平台显示名称 */
  name: string;
  /** 平台图标 */
  icon: string;
  /** 平台描述 */
  description: string;
  /** 导出格式类型 */
  formatType: ExportFormatType;
  /** 平台特性支持 */
  features: PlatformFeatures;
}

/**
 * 预定义平台元数据
 */
export const PLATFORM_META: Record<PlatformId, PlatformMeta> = {
  wechat: {
    id: 'wechat',
    name: '微信公众号',
    icon: 'MessageCircle',
    description: '带行内样式的 HTML，适合微信公众号编辑器',
    formatType: 'html',
    features: {
      supportsInlineStyles: true,
      supportsCodeHighlight: true,
      supportsImages: true,
      supportsTables: true,
      supportsLatex: false,
    },
  },
  zhihu: {
    id: 'zhihu',
    name: '知乎',
    icon: 'BookOpen',
    description: '知乎兼容的 HTML 格式',
    formatType: 'html',
    features: {
      supportsInlineStyles: false,
      supportsCodeHighlight: true,
      supportsImages: true,
      supportsTables: true,
      supportsLatex: true,
    },
  },
  juejin: {
    id: 'juejin',
    name: '掘金',
    icon: 'Code2',
    description: '标准 Markdown 格式',
    formatType: 'markdown',
    features: {
      supportsInlineStyles: false,
      supportsCodeHighlight: true,
      supportsImages: true,
      supportsTables: true,
      supportsLatex: true,
    },
  },
  csdn: {
    id: 'csdn',
    name: 'CSDN',
    icon: 'FileText',
    description: 'CSDN 兼容的 Markdown 格式',
    formatType: 'markdown',
    features: {
      supportsInlineStyles: false,
      supportsCodeHighlight: true,
      supportsImages: true,
      supportsTables: true,
      supportsLatex: true,
    },
  },
  jianshu: {
    id: 'jianshu',
    name: '简书',
    icon: 'Feather',
    description: '简化的 Markdown 格式',
    formatType: 'markdown',
    features: {
      supportsInlineStyles: false,
      supportsCodeHighlight: true,
      supportsImages: true,
      supportsTables: true,
      supportsLatex: false,
    },
  },
  markdown: {
    id: 'markdown',
    name: '纯 Markdown',
    icon: 'FileCode',
    description: '原始 Markdown 格式',
    formatType: 'text',
    features: {
      supportsInlineStyles: false,
      supportsCodeHighlight: true,
      supportsImages: true,
      supportsTables: true,
      supportsLatex: true,
    },
  },
};

/**
 * 用户偏好存储键
 */
export const STORAGE_KEY = 'qingyu-export-platform';

/**
 * 用户偏好
 */
export interface UserPreference {
  /** 上次选择的平台 */
  lastPlatform: PlatformId;
}

/**
 * 复制错误类型
 */
export enum CopyErrorType {
  /** 剪贴板 API 不可用 */
  CLIPBOARD_NOT_SUPPORTED = 'CLIPBOARD_NOT_SUPPORTED',
  /** 权限被拒绝 */
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  /** 内容为空 */
  EMPTY_CONTENT = 'EMPTY_CONTENT',
  /** 导出器未找到 */
  EXPORTER_NOT_FOUND = 'EXPORTER_NOT_FOUND',
  /** 未知错误 */
  UNKNOWN = 'UNKNOWN',
}

/**
 * 复制错误
 */
export interface CopyError {
  type: CopyErrorType;
  message: string;
}

/**
 * 错误消息映射
 */
export const ERROR_MESSAGES: Record<CopyErrorType, string> = {
  [CopyErrorType.CLIPBOARD_NOT_SUPPORTED]: '您的浏览器不支持剪贴板功能',
  [CopyErrorType.PERMISSION_DENIED]: '剪贴板访问权限被拒绝',
  [CopyErrorType.EMPTY_CONTENT]: '没有可复制的内容',
  [CopyErrorType.EXPORTER_NOT_FOUND]: '未找到对应的导出器',
  [CopyErrorType.UNKNOWN]: '复制失败，请重试',
};
