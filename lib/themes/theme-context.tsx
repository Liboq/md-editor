"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { Theme } from "./types";
import { BUILT_IN_THEMES, DEFAULT_THEME_ID, getBuiltInTheme } from "./built-in";
import { syncThemesWithDownloads, type LocalThemeWithTimestamp } from "@/lib/supabase/sync-service";
import * as themeService from "@/lib/supabase/theme-service";

const STORAGE_KEY_ACTIVE_THEME = "md-editor-active-theme";
const STORAGE_KEY_CUSTOM_THEMES = "md-editor-custom-themes";
const STORAGE_KEY_THEME_TIMESTAMPS = "md-editor-theme-timestamps";

export interface ThemeContextValue {
  /** 当前激活的主题 */
  activeTheme: Theme;
  /** 所有可用主题（内置 + 自定义） */
  themes: Theme[];
  /** 自定义主题列表 */
  customThemes: Theme[];
  /** 设置激活主题 */
  setActiveTheme: (id: string) => void;
  /** 保存自定义主题 */
  saveCustomTheme: (theme: Theme) => void;
  /** 删除自定义主题 */
  deleteCustomTheme: (id: string) => boolean;
  /** 导出主题为 JSON */
  exportTheme: (id: string) => string | null;
  /** 从 JSON 导入主题 */
  importTheme: (json: string) => Theme | null;
  /** 根据 ID 获取主题 */
  getTheme: (id: string) => Theme | undefined;
  /** 同步状态 */
  syncStatus: 'idle' | 'syncing' | 'error';
  /** 触发云端同步 */
  triggerSync: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  /** 用户 ID（来自 Auth Context） */
  userId?: string | null;
  /** 是否已登录 */
  isAuthenticated?: boolean;
}

/**
 * 获取主题时间戳映射
 */
function getThemeTimestamps(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY_THEME_TIMESTAMPS);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * 保存主题时间戳
 */
function saveThemeTimestamp(themeId: string): void {
  if (typeof window === "undefined") return;
  try {
    const timestamps = getThemeTimestamps();
    timestamps[themeId] = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_THEME_TIMESTAMPS, JSON.stringify(timestamps));
  } catch (error) {
    console.error("保存主题时间戳失败:", error);
  }
}

export function ThemeProvider({ children, userId, isAuthenticated }: ThemeProviderProps) {
  const [customThemes, setCustomThemes] = useState<Theme[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<string>(DEFAULT_THEME_ID);
  const [isInitialized, setIsInitialized] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const lastSyncedUserId = useRef<string | null>(null);

  // 所有可用主题
  const themes = [...BUILT_IN_THEMES, ...customThemes];

  // 当前激活的主题
  const activeTheme =
    themes.find((t) => t.id === activeThemeId) ||
    getBuiltInTheme(DEFAULT_THEME_ID)!;

  // 初始化：从 localStorage 加载
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      // 加载自定义主题
      const storedCustomThemes = localStorage.getItem(STORAGE_KEY_CUSTOM_THEMES);
      if (storedCustomThemes) {
        const parsed = JSON.parse(storedCustomThemes);
        if (Array.isArray(parsed)) {
          setCustomThemes(parsed);
        }
      }

      // 加载激活主题 ID
      const storedActiveTheme = localStorage.getItem(STORAGE_KEY_ACTIVE_THEME);
      if (storedActiveTheme) {
        setActiveThemeId(storedActiveTheme);
      }
    } catch (error) {
      console.error("加载主题设置失败:", error);
    }

    setIsInitialized(true);
  }, []);

  // 保存激活主题 ID 到 localStorage
  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY_ACTIVE_THEME, activeThemeId);
  }, [activeThemeId, isInitialized]);

  // 保存自定义主题到 localStorage
  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY_CUSTOM_THEMES, JSON.stringify(customThemes));
  }, [customThemes, isInitialized]);

  /**
   * 触发云端同步
   * @验证需求: 7.1, 7.2, 7.3, 7.4
   */
  const triggerSync = useCallback(async () => {
    if (!userId || !isAuthenticated) return;
    
    setSyncStatus('syncing');
    try {
      // 准备本地主题（带时间戳）
      const timestamps = getThemeTimestamps();
      const localThemesWithTimestamp: LocalThemeWithTimestamp[] = customThemes.map(theme => ({
        ...theme,
        updatedAt: timestamps[theme.id],
      }));

      // 执行同步
      const { themesToAddLocally, themesToUpdateLocally } = await syncThemesWithDownloads(
        userId,
        localThemesWithTimestamp
      );

      // 添加云端主题到本地
      if (themesToAddLocally.length > 0 || themesToUpdateLocally.length > 0) {
        setCustomThemes(prev => {
          const updated = [...prev];
          
          // 添加新主题
          for (const theme of themesToAddLocally) {
            if (!updated.find(t => t.id === theme.id)) {
              updated.push({
                id: theme.id,
                name: theme.name,
                description: theme.description,
                isBuiltIn: false,
                styles: theme.styles,
                customCSS: theme.customCSS,
              });
            }
          }
          
          // 更新现有主题
          for (const theme of themesToUpdateLocally) {
            const index = updated.findIndex(t => t.id === theme.id);
            if (index >= 0) {
              updated[index] = {
                id: theme.id,
                name: theme.name,
                description: theme.description,
                isBuiltIn: false,
                styles: theme.styles,
                customCSS: theme.customCSS,
              };
            }
          }
          
          return updated;
        });
      }

      // 同步默认主题设置
      const cloudDefaultTheme = await themeService.getDefaultTheme(userId);
      if (cloudDefaultTheme && cloudDefaultTheme !== activeThemeId) {
        // 云端有默认主题设置，应用到本地
        setActiveThemeId(cloudDefaultTheme);
      } else if (!cloudDefaultTheme && activeThemeId !== DEFAULT_THEME_ID) {
        // 云端没有设置，上传本地设置
        await themeService.saveDefaultTheme(userId, activeThemeId);
      }

      setSyncStatus('idle');
    } catch (error) {
      console.error('同步主题失败:', error);
      setSyncStatus('error');
    }
  }, [userId, isAuthenticated, customThemes, activeThemeId]);

  /**
   * 登录时触发同步
   * @验证需求: 3.6, 7.5
   */
  useEffect(() => {
    if (!isInitialized) return;
    
    if (isAuthenticated && userId && lastSyncedUserId.current !== userId) {
      lastSyncedUserId.current = userId;
      triggerSync();
    } else if (!isAuthenticated) {
      // 登出时停止同步但保留本地数据
      lastSyncedUserId.current = null;
      setSyncStatus('idle');
    }
  }, [isAuthenticated, userId, isInitialized, triggerSync]);

  // 设置激活主题
  const setActiveTheme = useCallback(
    (id: string) => {
      const theme = themes.find((t) => t.id === id);
      if (theme) {
        setActiveThemeId(id);
        // 如果已登录，同步默认主题到云端
        if (isAuthenticated && userId) {
          themeService.saveDefaultTheme(userId, id).catch(err => {
            console.error('同步默认主题失败:', err);
          });
        }
      }
    },
    [themes, isAuthenticated, userId]
  );

  // 根据 ID 获取主题
  const getTheme = useCallback(
    (id: string): Theme | undefined => {
      return themes.find((t) => t.id === id);
    },
    [themes]
  );

  // 保存自定义主题
  const saveCustomTheme = useCallback((theme: Theme) => {
    setCustomThemes((prev) => {
      const existingIndex = prev.findIndex((t) => t.id === theme.id);
      if (existingIndex >= 0) {
        // 更新现有主题
        const updated = [...prev];
        updated[existingIndex] = { ...theme, isBuiltIn: false };
        return updated;
      }
      // 添加新主题
      return [...prev, { ...theme, isBuiltIn: false }];
    });
    
    // 保存时间戳
    saveThemeTimestamp(theme.id);
    
    // 如果已登录，同步到云端
    if (isAuthenticated && userId) {
      themeService.saveTheme(userId, theme).catch(err => {
        console.error('同步主题到云端失败:', err);
      });
    }
  }, [isAuthenticated, userId]);

  // 删除自定义主题
  const deleteCustomTheme = useCallback(
    (id: string): boolean => {
      const theme = themes.find((t) => t.id === id);
      if (!theme || theme.isBuiltIn) {
        return false; // 不能删除内置主题
      }

      setCustomThemes((prev) => prev.filter((t) => t.id !== id));

      // 如果删除的是当前激活主题，切换到默认主题
      if (activeThemeId === id) {
        setActiveThemeId(DEFAULT_THEME_ID);
      }

      // 如果已登录，从云端删除
      if (isAuthenticated && userId) {
        themeService.deleteTheme(userId, id).catch(err => {
          console.error('从云端删除主题失败:', err);
        });
      }

      return true;
    },
    [themes, activeThemeId, isAuthenticated, userId]
  );

  // 导出主题为 JSON
  const exportTheme = useCallback(
    (id: string): string | null => {
      const theme = themes.find((t) => t.id === id);
      if (!theme) return null;

      return JSON.stringify(theme, null, 2);
    },
    [themes]
  );

  // 从 JSON 导入主题
  const importTheme = useCallback((json: string): Theme | null => {
    try {
      const theme = JSON.parse(json) as Theme;

      // 基本验证
      if (!theme.id || !theme.name || !theme.styles) {
        console.error("无效的主题格式");
        return null;
      }

      // 确保不是内置主题
      const importedTheme: Theme = {
        ...theme,
        isBuiltIn: false,
      };

      // 保存导入的主题
      saveCustomTheme(importedTheme);

      return importedTheme;
    } catch (error) {
      console.error("导入主题失败:", error);
      return null;
    }
  }, [saveCustomTheme]);

  const value: ThemeContextValue = {
    activeTheme,
    themes,
    customThemes,
    setActiveTheme,
    saveCustomTheme,
    deleteCustomTheme,
    exportTheme,
    importTheme,
    getTheme,
    syncStatus,
    triggerSync,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * 使用主题的 hook
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme 必须在 ThemeProvider 内部使用");
  }
  return context;
}
