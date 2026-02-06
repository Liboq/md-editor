"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle,
  BookOpen,
  Code2,
  FileText,
  Feather,
  FileCode,
  type LucideIcon,
} from "lucide-react";
import type { PlatformExporter, PlatformId } from "@/lib/export/types";
import { STORAGE_KEY, PLATFORMS } from "@/lib/export/types";
import { cn } from "@/lib/utils";

/**
 * 平台图标映射
 * 将平台的 icon 字符串映射到对应的 Lucide 图标组件
 */
const PLATFORM_ICONS: Record<string, LucideIcon> = {
  MessageCircle,
  BookOpen,
  Code2,
  FileText,
  Feather,
  FileCode,
};

/**
 * 平台选择器组件 Props
 */
export interface PlatformSelectorProps {
  /** 当前选中的平台 ID */
  value: string;
  
  /** 平台变更回调 */
  onChange: (platformId: string) => void;
  
  /** 可用平台列表 */
  platforms: PlatformExporter[];
  
  /** 自定义类名 */
  className?: string;
  
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 获取平台图标组件
 * @param iconName - 图标名称
 * @returns Lucide 图标组件
 */
function getPlatformIcon(iconName: string): LucideIcon {
  return PLATFORM_ICONS[iconName] || FileCode;
}

/**
 * 默认平台 ID
 */
const DEFAULT_PLATFORM: PlatformId = PLATFORMS.WECHAT;

/**
 * 验证平台 ID 是否有效
 * @param platformId - 待验证的平台 ID
 * @returns 是否为有效的平台 ID
 */
function isValidPlatformId(platformId: string): platformId is PlatformId {
  return Object.values(PLATFORMS).includes(platformId as PlatformId);
}

/**
 * 从 localStorage 读取平台偏好
 * @returns 保存的平台 ID，如果无效或不存在则返回默认值
 */
function loadPlatformPreference(): PlatformId {
  // 服务端渲染时返回默认值
  if (typeof window === 'undefined') {
    return DEFAULT_PLATFORM;
  }
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isValidPlatformId(saved)) {
      return saved;
    }
  } catch {
    // localStorage 不可用时静默失败
    console.warn('无法读取 localStorage 中的平台偏好');
  }
  
  return DEFAULT_PLATFORM;
}

/**
 * 保存平台偏好到 localStorage
 * @param platformId - 要保存的平台 ID
 */
function savePlatformPreference(platformId: PlatformId): void {
  // 服务端渲染时跳过
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, platformId);
  } catch {
    // localStorage 不可用时静默失败
    console.warn('无法保存平台偏好到 localStorage');
  }
}

/**
 * 用户平台偏好 Hook 返回值
 */
export interface UsePlatformPreferenceReturn {
  /** 当前选中的平台 ID */
  platform: PlatformId;
  /** 设置平台并保存到 localStorage */
  setPlatform: (platformId: string) => void;
  /** 是否已从 localStorage 加载完成 */
  isLoaded: boolean;
}

/**
 * 用户平台偏好 Hook
 * 
 * 管理用户的平台选择偏好，自动从 localStorage 读取和保存。
 * 
 * 功能：
 * - 组件加载时从 localStorage 读取上次选择的平台
 * - 用户选择新平台时自动保存到 localStorage
 * - 如果没有保存的偏好或偏好无效，默认使用 'wechat'
 * - 支持服务端渲染（SSR）
 * 
 * @example
 * ```tsx
 * const { platform, setPlatform, isLoaded } = usePlatformPreference();
 * 
 * return (
 *   <PlatformSelector
 *     value={platform}
 *     onChange={setPlatform}
 *     platforms={getAllExporters()}
 *   />
 * );
 * ```
 * 
 * @see Requirements 8.4, 8.5
 */
export function usePlatformPreference(): UsePlatformPreferenceReturn {
  // 使用默认值初始化，避免 SSR 水合不匹配
  const [platform, setPlatformState] = useState<PlatformId>(DEFAULT_PLATFORM);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // 组件挂载后从 localStorage 读取偏好
  useEffect(() => {
    const savedPlatform = loadPlatformPreference();
    setPlatformState(savedPlatform);
    setIsLoaded(true);
  }, []);
  
  // 设置平台并保存到 localStorage
  const setPlatform = useCallback((platformId: string) => {
    // 验证平台 ID 有效性
    if (!isValidPlatformId(platformId)) {
      console.warn(`无效的平台 ID: ${platformId}`);
      return;
    }
    
    setPlatformState(platformId);
    savePlatformPreference(platformId);
  }, []);
  
  return {
    platform,
    setPlatform,
    isLoaded,
  };
}

/**
 * 平台选择器组件
 * 
 * 用于在工具栏中选择导出目标平台，显示每个平台的图标和名称。
 * 支持深色模式，使用 shadcn/ui 的 Select 组件实现。
 * 
 * @example
 * ```tsx
 * <PlatformSelector
 *   value={selectedPlatform}
 *   onChange={setSelectedPlatform}
 *   platforms={getAllExporters()}
 * />
 * ```
 * 
 * @see Requirements 8.1, 8.2, 8.3
 */
export function PlatformSelector({
  value,
  onChange,
  platforms,
  className,
  disabled = false,
}: PlatformSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          // 基础样式
          "h-8 w-[140px] gap-2",
          // 文字和边框颜色 - 支持深色模式
          "text-foreground border-input",
          // 背景色 - 支持深色模式
          "bg-background dark:bg-background",
          // hover 状态
          "hover:bg-accent hover:text-accent-foreground",
          // 焦点状态
          "focus:ring-1 focus:ring-ring",
          // 过渡动画
          "transition-colors duration-200",
          // 自定义类名
          className
        )}
        aria-label="选择导出平台"
      >
        <SelectValue placeholder="选择平台" />
      </SelectTrigger>
      <SelectContent
        className={cn(
          // 背景和边框 - 支持深色模式
          "bg-popover border-border",
          // 阴影
          "shadow-md"
        )}
      >
        {platforms.map((platform) => {
          const Icon = getPlatformIcon(platform.icon);
          return (
            <SelectItem
              key={platform.id}
              value={platform.id}
              className={cn(
                // 基础样式
                "cursor-pointer",
                // hover 和焦点状态 - 支持深色模式
                "focus:bg-accent focus:text-accent-foreground",
                // 过渡动画
                "transition-colors duration-150"
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{platform.name}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export default PlatformSelector;

// 导出相关工具函数（usePlatformPreference 已在定义处导出）
export { loadPlatformPreference, savePlatformPreference, isValidPlatformId, DEFAULT_PLATFORM };
