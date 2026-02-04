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
 * 使用非受控模式避免滚动位置重置
 * 只在 value 从外部变化时（如加载文章）才同步
 */
const Editor = React.forwardRef<HTMLTextAreaElement, EditorProps>(
  ({ value, onChange, className, placeholder = "在此输入 Markdown 内容...", onKeyDown, onScroll }, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;
    const lastExternalValue = React.useRef(value);
    const isUserInput = React.useRef(false);
    
    // 只在外部 value 变化时同步（如加载文章、工具栏操作）
    // 用户输入时不同步，避免滚动位置重置
    React.useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      // 如果是用户输入导致的变化，跳过同步
      if (isUserInput.current) {
        isUserInput.current = false;
        lastExternalValue.current = value;
        return;
      }
      
      // 外部值变化（加载文章、工具栏操作等），需要同步
      if (value !== lastExternalValue.current && value !== textarea.value) {
        // 保存当前滚动位置和光标位置
        const scrollTop = textarea.scrollTop;
        const selectionStart = textarea.selectionStart;
        const selectionEnd = textarea.selectionEnd;
        
        textarea.value = value;
        
        // 恢复滚动位置和光标位置
        textarea.scrollTop = scrollTop;
        // 只有在光标位置有效时才恢复
        if (selectionStart <= value.length) {
          textarea.setSelectionRange(
            Math.min(selectionStart, value.length),
            Math.min(selectionEnd, value.length)
          );
        }
      }
      
      lastExternalValue.current = value;
    }, [value, textareaRef]);
    
    // 初始化时设置值
    React.useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea && value && !textarea.value) {
        textarea.value = value;
      }
    }, [textareaRef, value]);
    
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      isUserInput.current = true;
      onChange(e.target.value);
    }, [onChange]);
    
    return (
      <textarea
        ref={textareaRef}
        defaultValue={value}
        onChange={handleChange}
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
