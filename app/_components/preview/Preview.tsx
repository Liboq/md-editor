"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/themes/theme-context";
import { processPseudoElements } from "@/lib/themes/pseudo-element-converter";

// 预览区域的选择器 ID，用于 ClipboardJS 复制
export const PREVIEW_SELECTOR = "#preview-output";

export interface PreviewProps {
  html: string;
  className?: string;
}

const Preview = React.memo(
  React.forwardRef<HTMLDivElement, PreviewProps>(
    ({ html, className }, ref) => {
      const { activeTheme } = useTheme();
      
      // 处理伪元素：将 ::before/::after 转换为实际 DOM 元素
      const processedHtml = React.useMemo(() => {
        if (!html) return "";
        
        // 如果主题有 customCSS，处理其中的伪元素
        if (activeTheme.customCSS) {
          const { html: processed } = processPseudoElements(html, activeTheme.customCSS);
          return processed;
        }
        
        return html;
      }, [html, activeTheme.customCSS]);
      
      if (!html) {
        return (
          <div
            ref={ref}
            id="preview-output"
            className={cn("preview-content text-muted-foreground", className)}
          >
            预览将在此显示...
          </div>
        );
      }

      return (
        <div
          ref={ref}
          id="preview-output"
          className={cn("preview-content", className)}
          dangerouslySetInnerHTML={{ __html: processedHtml }}
        />
      );
    }
  )
);

Preview.displayName = "Preview";

/**
 * 获取预览容器中的 HTML 内容
 * 用于复制到剪贴板
 */
export function getPreviewHTML(element: HTMLElement | null): string {
  if (!element) return "";
  return element.innerHTML;
}

export { Preview };
