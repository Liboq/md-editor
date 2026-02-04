"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onScroll?: () => void;
}

/**
 * 编辑器组件
 * 使用受控模式确保外部状态变化能同步到 textarea
 */
const Editor = React.forwardRef<HTMLTextAreaElement, EditorProps>(
  ({ value, onChange, className, placeholder = "在此输入 Markdown 内容...", onKeyDown, onScroll }, ref) => {
    return (
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onScroll={onScroll}
        placeholder={placeholder}
        className={cn(
          "w-full h-full resize-none border rounded-md p-3 font-mono text-sm",
          "bg-background text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring",
          "placeholder:text-muted-foreground",
          className
        )}
        spellCheck={false}
      />
    );
  }
);

Editor.displayName = "Editor";

export { Editor };
