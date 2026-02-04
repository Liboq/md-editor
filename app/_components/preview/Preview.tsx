"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// 预览区域的选择器 ID，用于 ClipboardJS 复制
export const PREVIEW_SELECTOR = "#preview-output";

export interface PreviewProps {
  html: string;
  className?: string;
}

const Preview = React.memo(
  React.forwardRef<HTMLDivElement, PreviewProps>(
    ({ html, className }, ref) => {
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
          dangerouslySetInnerHTML={{ __html: html }}
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
