"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Palette, PaintBucket } from "lucide-react";

// 预设文字颜色
const TEXT_COLORS = [
  { value: "#000000", label: "黑色" },
  { value: "#333333", label: "深灰" },
  { value: "#e53935", label: "红色" },
  { value: "#d81b60", label: "粉红" },
  { value: "#8e24aa", label: "紫色" },
  { value: "#5e35b1", label: "深紫" },
  { value: "#3949ab", label: "靛蓝" },
  { value: "#1e88e5", label: "蓝色" },
  { value: "#00acc1", label: "青色" },
  { value: "#00897b", label: "蓝绿" },
  { value: "#43a047", label: "绿色" },
  { value: "#7cb342", label: "浅绿" },
  { value: "#f9a825", label: "黄色" },
  { value: "#ff8f00", label: "橙色" },
  { value: "#6d4c41", label: "棕色" },
  { value: "#546e7a", label: "蓝灰" },
];

// 预设背景颜色
const BACKGROUND_COLORS = [
  { value: "transparent", label: "无背景" },
  { value: "#ffeb3b", label: "黄色高亮" },
  { value: "#a5d6a7", label: "绿色高亮" },
  { value: "#90caf9", label: "蓝色高亮" },
  { value: "#f48fb1", label: "粉色高亮" },
  { value: "#ce93d8", label: "紫色高亮" },
  { value: "#ffcc80", label: "橙色高亮" },
  { value: "#e0e0e0", label: "灰色高亮" },
  { value: "#fff59d", label: "浅黄" },
  { value: "#c8e6c9", label: "浅绿" },
  { value: "#bbdefb", label: "浅蓝" },
  { value: "#f8bbd9", label: "浅粉" },
  { value: "#e1bee7", label: "浅紫" },
  { value: "#ffe0b2", label: "浅橙" },
  { value: "#d7ccc8", label: "浅棕" },
  { value: "#cfd8dc", label: "浅灰蓝" },
];

interface StyleSettingsProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onChange: (value: string) => void;
  className?: string;
  currentColor?: string | null;
}

/**
 * 文字颜色选择器
 */
export function TextColorPicker({ textareaRef, onChange, className, currentColor }: StyleSettingsProps) {
  const [open, setOpen] = React.useState(false);
  const [customColor, setCustomColor] = React.useState("#e53935");
  
  // 当 popover 打开时，如果有当前颜色，设置到自定义颜色
  React.useEffect(() => {
    if (open && currentColor) {
      setCustomColor(currentColor);
    }
  }, [open, currentColor]);

  const applyColor = React.useCallback((color: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const currentValue = textarea.value; // 直接从 textarea 获取当前值
    const selectedText = currentValue.slice(selectionStart, selectionEnd);
    
    let newText: string;
    let newPos: number;
    
    if (!selectedText) {
      // 没有选中文本，插入示例
      const insertText = `<span style="color: ${color}">彩色文字</span>`;
      newText = currentValue.slice(0, selectionStart) + insertText + currentValue.slice(selectionEnd);
      newPos = selectionStart + insertText.length;
    } else {
      // 包裹选中文本
      const wrappedText = `<span style="color: ${color}">${selectedText}</span>`;
      newText = currentValue.slice(0, selectionStart) + wrappedText + currentValue.slice(selectionEnd);
      newPos = selectionStart + wrappedText.length;
    }
    
    // 先更新 textarea 的值
    textarea.value = newText;
    // 然后通知 React 状态更新
    onChange(newText);
    
    // 恢复焦点和光标位置
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newPos, newPos);
    });
    
    setOpen(false);
  }, [textareaRef, onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 cursor-pointer ${className}`}
              onMouseDown={(e) => e.preventDefault()} // 防止失去焦点
            >
              <Palette className="h-4 w-4" />
              <span className="sr-only">文字颜色</span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>文字颜色</TooltipContent>
      </Tooltip>
      
      <PopoverContent 
        className="w-64 p-3" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()} // 防止自动聚焦
      >
        <div className="space-y-3">
          <h4 className="font-medium text-sm">文字颜色</h4>
          
          <div className="grid grid-cols-8 gap-1">
            {TEXT_COLORS.map((color) => {
              const isCurrentColor = currentColor?.toLowerCase() === color.value.toLowerCase();
              return (
                <Tooltip key={color.value}>
                  <TooltipTrigger asChild>
                    <button
                      className={`w-6 h-6 rounded border cursor-pointer transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary ${
                        isCurrentColor ? "ring-2 ring-primary ring-offset-1" : "border-border"
                      }`}
                      style={{ backgroundColor: color.value }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyColor(color.value)}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {color.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
          
          {/* 自定义颜色 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">自定义:</span>
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-6 h-6 rounded border border-border cursor-pointer"
            />
            <Button 
              size="sm" 
              variant="outline" 
              className="h-6 text-xs cursor-pointer"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyColor(customColor)}
            >
              应用
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * 背景颜色选择器
 */
export function BackgroundColorPicker({ textareaRef, onChange, className, currentColor }: StyleSettingsProps) {
  const [open, setOpen] = React.useState(false);
  const [customColor, setCustomColor] = React.useState("#ffeb3b");
  
  // 当 popover 打开时，如果有当前颜色，设置到自定义颜色
  React.useEffect(() => {
    if (open && currentColor) {
      setCustomColor(currentColor);
    }
  }, [open, currentColor]);

  const applyBackground = React.useCallback((color: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const currentValue = textarea.value; // 直接从 textarea 获取当前值
    const selectedText = currentValue.slice(selectionStart, selectionEnd);
    
    let newText: string;
    let newPos: number;
    
    if (!selectedText) {
      // 没有选中文本，插入示例
      const insertText = color === "transparent" 
        ? "高亮文字" 
        : `<span style="background: ${color}">\u00A0高亮文字\u00A0</span>`;
      newText = currentValue.slice(0, selectionStart) + insertText + currentValue.slice(selectionEnd);
      newPos = selectionStart + insertText.length;
    } else {
      // 包裹选中文本
      const wrappedText = color === "transparent"
        ? selectedText
        : `<span style="background: ${color}">\u00A0${selectedText}\u00A0</span>`;
      newText = currentValue.slice(0, selectionStart) + wrappedText + currentValue.slice(selectionEnd);
      newPos = selectionStart + wrappedText.length;
    }
    
    // 先更新 textarea 的值
    textarea.value = newText;
    // 然后通知 React 状态更新
    onChange(newText);
    
    // 恢复焦点和光标位置
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newPos, newPos);
    });
    
    setOpen(false);
  }, [textareaRef, onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 cursor-pointer ${className}`}
              onMouseDown={(e) => e.preventDefault()}
            >
              <PaintBucket className="h-4 w-4" />
              <span className="sr-only">背景颜色</span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>背景高亮</TooltipContent>
      </Tooltip>
      
      <PopoverContent 
        className="w-64 p-3" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-3">
          <h4 className="font-medium text-sm">背景高亮</h4>
          
          <div className="grid grid-cols-8 gap-1">
            {BACKGROUND_COLORS.map((color) => {
              const isCurrentColor = currentColor?.toLowerCase() === color.value.toLowerCase();
              return (
                <Tooltip key={color.value}>
                  <TooltipTrigger asChild>
                    <button
                      className={`w-6 h-6 rounded border cursor-pointer transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary ${
                        color.value === "transparent" ? "border-dashed border-gray-400" : ""
                      } ${isCurrentColor ? "ring-2 ring-primary ring-offset-1" : "border-border"}`}
                      style={{ backgroundColor: color.value === "transparent" ? "white" : color.value }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyBackground(color.value)}
                    >
                      {color.value === "transparent" && (
                        <span className="text-xs text-gray-400">×</span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {color.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
          
          {/* 自定义颜色 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">自定义:</span>
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-6 h-6 rounded border border-border cursor-pointer"
            />
            <Button 
              size="sm" 
              variant="outline" 
              className="h-6 text-xs cursor-pointer"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyBackground(customColor)}
            >
              应用
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
