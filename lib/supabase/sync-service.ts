/**
 * Sync Service - 主题数据同步服务
 * 
 * 负责本地和云端主题数据的同步策略。
 * 实现合并策略：云端优先，时间戳比较。
 * 
 * @验证需求: 7.1, 7.2, 7.3, 7.4
 */

import { supabase } from './client';
import { DB_TABLES, UserTheme } from './types';
import { Theme } from '@/lib/themes/types';
import * as themeService from './theme-service';

/**
 * 同步状态类型
 */
export type SyncStatus = 'idle' | 'syncing' | 'error';

/**
 * 同步结果接口
 */
export interface SyncResult {
  /** 上传到云端的主题 ID */
  uploaded: string[];
  /** 从云端下载的主题 ID */
  downloaded: string[];
  /** 冲突解决的主题 ID */
  conflicts: string[];
}

/**
 * 带时间戳的本地主题接口
 */
export interface LocalThemeWithTimestamp extends Theme {
  updatedAt?: string;
}

/**
 * Sync Service 接口定义
 */
export interface SyncServiceInterface {
  syncThemes(userId: string, localThemes: LocalThemeWithTimestamp[]): Promise<SyncResult>;
  getSyncStatus(): SyncStatus;
}

// 当前同步状态
let currentSyncStatus: SyncStatus = 'idle';

export function getSyncStatus(): SyncStatus {
  return currentSyncStatus;
}

function setSyncStatus(status: SyncStatus): void {
  currentSyncStatus = status;
}


async function getCloudThemesWithTimestamp(userId: string): Promise<UserTheme[]> {
  const { data, error } = await supabase
    .from(DB_TABLES.USER_THEMES)
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('获取云端主题失败:', error);
    throw new Error(`获取云端主题失败: ${error.message}`);
  }

  return data || [];
}

async function uploadThemeToCloud(userId: string, theme: LocalThemeWithTimestamp): Promise<void> {
  await themeService.saveTheme(userId, theme);
}

function cloudThemeToLocal(cloudTheme: UserTheme): LocalThemeWithTimestamp {
  return {
    id: cloudTheme.theme_id,
    name: cloudTheme.name,
    description: cloudTheme.description || '',
    isBuiltIn: false,
    styles: cloudTheme.styles,
    customCSS: cloudTheme.custom_css || undefined,
    updatedAt: cloudTheme.updated_at,
  };
}

function areThemesEqual(local: LocalThemeWithTimestamp, cloud: UserTheme): boolean {
  if (local.name !== cloud.name) return false;
  if ((local.description || '') !== (cloud.description || '')) return false;
  if ((local.customCSS || '') !== (cloud.custom_css || '')) return false;
  
  try {
    return JSON.stringify(local.styles) === JSON.stringify(cloud.styles);
  } catch {
    return false;
  }
}

/**
 * 解决主题冲突 - 使用更新时间较新的版本
 * @验证需求: 7.4
 */
function resolveConflict(local: LocalThemeWithTimestamp, cloud: UserTheme): 'local' | 'cloud' {
  const localTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
  const cloudTime = cloud.updated_at ? new Date(cloud.updated_at).getTime() : 0;
  return localTime > cloudTime ? 'local' : 'cloud';
}


/**
 * 执行主题同步
 * 
 * @验证需求: 7.1, 7.2, 7.3, 7.4
 */
export async function syncThemes(
  userId: string,
  localThemes: LocalThemeWithTimestamp[]
): Promise<SyncResult> {
  const result: SyncResult = { uploaded: [], downloaded: [], conflicts: [] };

  try {
    setSyncStatus('syncing');

    const cloudThemes = await getCloudThemesWithTimestamp(userId);
    const cloudThemeMap = new Map<string, UserTheme>();
    for (const theme of cloudThemes) {
      cloudThemeMap.set(theme.theme_id, theme);
    }

    const localThemeMap = new Map<string, LocalThemeWithTimestamp>();
    for (const theme of localThemes) {
      if (!theme.isBuiltIn) {
        localThemeMap.set(theme.id, theme);
      }
    }

    const themesToUpload: LocalThemeWithTimestamp[] = [];

    // 处理本地主题
    for (const [themeId, localTheme] of localThemeMap) {
      const cloudTheme = cloudThemeMap.get(themeId);

      if (!cloudTheme) {
        // 需求 7.2: 仅存在于本地的主题应上传到云端
        themesToUpload.push(localTheme);
        result.uploaded.push(themeId);
      } else if (!areThemesEqual(localTheme, cloudTheme)) {
        // 需求 7.4: 内容不同，使用更新时间较新的版本
        const winner = resolveConflict(localTheme, cloudTheme);
        result.conflicts.push(themeId);
        if (winner === 'local') {
          themesToUpload.push(localTheme);
        }
      }
    }

    // 需求 7.3: 仅存在于云端的主题应下载到本地
    for (const [themeId] of cloudThemeMap) {
      if (!localThemeMap.has(themeId)) {
        result.downloaded.push(themeId);
      }
    }

    // 执行上传
    for (const theme of themesToUpload) {
      await uploadThemeToCloud(userId, theme);
    }

    setSyncStatus('idle');
    return result;
  } catch (error) {
    setSyncStatus('error');
    throw error;
  }
}


/**
 * 执行完整同步并返回需要更新到本地的主题
 */
export async function syncThemesWithDownloads(
  userId: string,
  localThemes: LocalThemeWithTimestamp[]
): Promise<{
  result: SyncResult;
  themesToAddLocally: LocalThemeWithTimestamp[];
  themesToUpdateLocally: LocalThemeWithTimestamp[];
}> {
  const result: SyncResult = { uploaded: [], downloaded: [], conflicts: [] };
  const themesToAddLocally: LocalThemeWithTimestamp[] = [];
  const themesToUpdateLocally: LocalThemeWithTimestamp[] = [];

  try {
    setSyncStatus('syncing');

    const cloudThemes = await getCloudThemesWithTimestamp(userId);
    const cloudThemeMap = new Map<string, UserTheme>();
    for (const theme of cloudThemes) {
      cloudThemeMap.set(theme.theme_id, theme);
    }

    const localThemeMap = new Map<string, LocalThemeWithTimestamp>();
    for (const theme of localThemes) {
      if (!theme.isBuiltIn) {
        localThemeMap.set(theme.id, theme);
      }
    }

    const themesToUpload: LocalThemeWithTimestamp[] = [];

    for (const [themeId, localTheme] of localThemeMap) {
      const cloudTheme = cloudThemeMap.get(themeId);

      if (!cloudTheme) {
        themesToUpload.push(localTheme);
        result.uploaded.push(themeId);
      } else if (!areThemesEqual(localTheme, cloudTheme)) {
        const winner = resolveConflict(localTheme, cloudTheme);
        result.conflicts.push(themeId);
        if (winner === 'local') {
          themesToUpload.push(localTheme);
        } else {
          themesToUpdateLocally.push(cloudThemeToLocal(cloudTheme));
        }
      }
    }

    for (const [themeId, cloudTheme] of cloudThemeMap) {
      if (!localThemeMap.has(themeId)) {
        themesToAddLocally.push(cloudThemeToLocal(cloudTheme));
        result.downloaded.push(themeId);
      }
    }

    for (const theme of themesToUpload) {
      await uploadThemeToCloud(userId, theme);
    }

    setSyncStatus('idle');
    return { result, themesToAddLocally, themesToUpdateLocally };
  } catch (error) {
    setSyncStatus('error');
    throw error;
  }
}

export const syncService: SyncServiceInterface = {
  syncThemes,
  getSyncStatus,
};

export default syncService;
