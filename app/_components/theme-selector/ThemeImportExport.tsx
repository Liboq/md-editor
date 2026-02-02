"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from "@/lib/themes/theme-context";
import { validateTheme } from "@/lib/themes/validation";
import { Download, Upload, FileJson, FolderOpen } from "lucide-react";
import { toast } from "sonner";

// 预设主题列表
const PRESET_THEMES = [
  { id: "wechat-green", name: "微信绿", desc: "微信公众号风格" },
  { id: "github-style", name: "GitHub 风格", desc: "经典 README 风格" },
  { id: "notion-style", name: "Notion 风格", desc: "简洁优雅" },
  { id: "juejin-style", name: "掘金风格", desc: "技术社区风格" },
  { id: "zhihu-style", name: "知乎风格", desc: "问答社区风格" },
];

export function ThemeImportExport() {
  const { activeTheme, exportTheme, importTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // 导出当前主题
  const handleExport = () => {
    const json = exportTheme(activeTheme.id);
    if (!json) {
      toast.error("导出失败");
      return;
    }

    // 创建下载链接
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `theme-${activeTheme.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("主题已导出");
  };

  // 导入主题
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  // 下载主题模板
  const handleDownloadTemplate = () => {
    window.open("/theme-template.json", "_blank");
    toast.success("模板已打开，右键保存即可");
  };

  // 导入预设主题
  const handleImportPreset = async (themeId: string) => {
    try {
      const response = await fetch(`/themes/${themeId}.json`);
      if (!response.ok) throw new Error("加载失败");
      
      const text = await response.text();
      const theme = importTheme(text);
      
      if (theme) {
        toast.success(`主题 "${theme.name}" 已导入`);
        setDialogOpen(false);
      } else {
        toast.error("导入失败");
      }
    } catch (error) {
      toast.error("无法加载预设主题");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      // 移除说明字段（以下划线开头的字段）
      const cleanTheme = removeDescriptionFields(parsed);

      // 验证主题格式
      const validation = validateTheme(cleanTheme);
      if (!validation.valid) {
        toast.error(`无效的主题格式: ${validation.errors[0]}`);
        return;
      }

      const theme = importTheme(JSON.stringify(cleanTheme));
      if (theme) {
        toast.success(`主题 "${theme.name}" 已导入`);
      } else {
        toast.error("导入失败");
      }
    } catch (error) {
      toast.error("无法解析主题文件");
    }

    // 清空文件输入
    e.target.value = "";
  };

  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 cursor-pointer"
        onClick={handleExport}
        title="导出主题"
      >
        <Download className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 cursor-pointer"
        onClick={handleImport}
        title="导入主题"
      >
        <Upload className="h-4 w-4" />
      </Button>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            title="主题模板库"
          >
            <FolderOpen className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>主题模板库</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 下载空白模板 */}
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">空白模板</h4>
                  <p className="text-sm text-muted-foreground">
                    下载完整的主题 JSON 模板，包含所有可配置项
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={handleDownloadTemplate}
                >
                  <FileJson className="h-4 w-4 mr-1" />
                  下载
                </Button>
              </div>
            </div>
            
            {/* 预设主题列表 */}
            <div>
              <h4 className="font-medium mb-2">预设主题</h4>
              <div className="space-y-2">
                {PRESET_THEMES.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <span className="font-medium">{preset.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {preset.desc}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => handleImportPreset(preset.id)}
                    >
                      导入
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Schema 说明 */}
            <div className="text-xs text-muted-foreground border-t pt-3">
              <p>
                💡 提示：模板包含详细的字段说明，导入时会自动移除说明字段。
                也可以查看 <code className="bg-muted px-1 rounded">/theme-schema.json</code> 了解完整的字段定义。
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

/**
 * 移除以下划线开头的说明字段
 */
function removeDescriptionFields(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // 跳过以下划线开头的字段
    if (key.startsWith("_")) continue;
    
    // 递归处理嵌套对象
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = removeDescriptionFields(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}
