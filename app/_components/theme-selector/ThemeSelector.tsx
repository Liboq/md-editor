"use client";

import { useTheme } from "@/lib/themes/theme-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, Cloud, CloudOff, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ThemeSelector() {
  const { activeTheme, themes, setActiveTheme, deleteCustomTheme, syncStatus, triggerSync } = useTheme();

  const handleDelete = (e: React.MouseEvent, themeId: string) => {
    e.stopPropagation();
    if (confirm("确定要删除这个主题吗？")) {
      deleteCustomTheme(themeId);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Select value={activeTheme.id} onValueChange={setActiveTheme}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="选择主题" />
        </SelectTrigger>
        <SelectContent>
          {themes.map((theme) => (
            <SelectItem key={theme.id} value={theme.id} className="cursor-pointer">
              <div className="flex items-center gap-2 w-full">
                {/* 颜色预览 */}
                <div
                  className="w-4 h-4 rounded border shrink-0"
                  style={{
                    backgroundColor: theme.styles.background,
                    borderColor: theme.styles.text,
                  }}
                />
                <span className="flex-1">{theme.name}</span>
                {!theme.isBuiltIn && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 shrink-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={(e) => handleDelete(e, theme.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* 同步状态指示器 */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={() => triggerSync()}
            disabled={syncStatus === 'syncing'}
          >
            {syncStatus === 'syncing' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : syncStatus === 'error' ? (
              <CloudOff className="h-4 w-4 text-red-500" />
            ) : (
              <Cloud className="h-4 w-4 text-green-500" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {syncStatus === 'syncing' ? '同步中...' : 
           syncStatus === 'error' ? '同步失败，点击重试' : 
           '主题已同步，点击手动同步'}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
