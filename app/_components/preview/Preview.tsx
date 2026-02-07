"use client";

import * as React from "react";
import morphdom from "morphdom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/themes/theme-context";
import { useCodeTheme } from "@/lib/code-theme/code-theme-context";
import { processPseudoElements } from "@/lib/themes/pseudo-element-converter";
import { useMarkdownWorker } from "@/lib/markdown/worker";

// 预览区域的选择器 ID，用于 ClipboardJS 复制
export const PREVIEW_SELECTOR = "#preview-output";

// 防抖延迟（毫秒）
const DEBOUNCE_DELAY = 100;

export interface PreviewProps {
  /** Markdown 源文本（优先使用，会通过 Worker 渲染） */
  markdown?: string;
  /** 已渲染的 HTML（降级方案，直接显示） */
  html?: string;
  className?: string;
}

/**
 * 生成 iframe 内部的完整 HTML 文档（使用内联样式）
 */
function generateIframeDocument(content: string): string {
  return `
<!DOCTYPE html>
<html style="height: 100%;">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* 仅保留基础重置样式 */
    *, *::before, *::after {
      box-sizing: border-box;
    }
    
    html, body {
      margin: 0;
      padding: 0;
      min-height: 100%;
      background: transparent;
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>
  `.trim();
}

/**
 * 预览组件
 * 
 * 特性：
 * - Web Worker 渲染：Markdown 处理和样式内联在后台线程执行，不阻塞 UI
 * - iframe 沙箱隔离：预览样式不影响编辑器
 * - morphdom 增量更新：仅更新变化部分，提升性能
 * - 防抖渲染：100ms 防抖，避免频繁渲染
 * - 内联样式：使用 juice 将 CSS 内联到 HTML 元素，不使用 <style> 标签
 */
const Preview = React.memo(
  React.forwardRef<HTMLDivElement, PreviewProps>(
    ({ markdown, html, className }, ref) => {
      const { activeTheme } = useTheme();
      const { activeCodeTheme } = useCodeTheme();
      const { renderWithStyles } = useMarkdownWorker();
      const iframeRef = React.useRef<HTMLIFrameElement>(null);
      const containerRef = React.useRef<HTMLDivElement>(null);
      const pendingUpdateRef = React.useRef<NodeJS.Timeout | null>(null);
      const lastHtmlRef = React.useRef<string>("");
      
      // 渲染后的内联样式 HTML 状态
      const [inlinedHtml, setInlinedHtml] = React.useState<string>("");
      
      // 使用 Worker 渲染 Markdown 并内联样式
      React.useEffect(() => {
        if (markdown !== undefined) {
          // 使用 Worker 渲染 Markdown 并内联样式
          renderWithStyles(markdown, activeTheme, activeCodeTheme).then((result) => {
            // 处理伪元素：将 ::before/::after 转换为实际 DOM 元素
            if (activeTheme.customCSS) {
              const { html: processed } = processPseudoElements(result, activeTheme.customCSS);
              setInlinedHtml(processed);
            } else {
              setInlinedHtml(result);
            }
          });
        } else if (html !== undefined) {
          // 直接使用传入的 HTML（已经是内联样式）
          setInlinedHtml(html);
        }
      }, [markdown, html, renderWithStyles, activeTheme, activeCodeTheme]);
      
      // 最终显示的 HTML
      const displayHtml = React.useMemo(() => {
        if (!inlinedHtml) {
          return '<div id="preview-output" class="preview-content"><span style="color: #999;">预览将在此显示...</span></div>';
        }
        return inlinedHtml;
      }, [inlinedHtml]);
      
      // 使用 morphdom 增量更新 iframe 内容
      const updateIframeContent = React.useCallback(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        
        const iframeDoc = iframe.contentDocument;
        if (!iframeDoc) return;
        
        const contentDiv = iframeDoc.getElementById("preview-output");
        
        // 如果没有内容容器，需要重新写入整个文档
        if (!contentDiv) {
          const docContent = generateIframeDocument(displayHtml);
          iframeDoc.open();
          iframeDoc.write(docContent);
          iframeDoc.close();
          lastHtmlRef.current = displayHtml;
          return;
        }
        
        // 如果内容变化，使用 morphdom 增量更新
        if (displayHtml !== lastHtmlRef.current) {
          // 创建临时元素用于 morphdom 比较
          const tempDiv = iframeDoc.createElement("div");
          tempDiv.innerHTML = displayHtml;
          const newContentDiv = tempDiv.firstElementChild as HTMLElement;
          
          if (newContentDiv) {
            // 使用 morphdom 进行 DOM diff，仅更新变化部分
            morphdom(contentDiv, newContentDiv, {
              // 保留滚动位置
              onBeforeElUpdated: (fromEl, toEl) => {
                // 跳过相同的元素
                if (fromEl.isEqualNode(toEl)) {
                  return false;
                }
                return true;
              },
            });
          }
          
          lastHtmlRef.current = displayHtml;
        }
      }, [displayHtml]);
      
      // 防抖更新
      React.useEffect(() => {
        // 清除之前的定时器
        if (pendingUpdateRef.current) {
          clearTimeout(pendingUpdateRef.current);
        }
        
        // 设置新的防抖定时器
        pendingUpdateRef.current = setTimeout(() => {
          updateIframeContent();
          pendingUpdateRef.current = null;
        }, DEBOUNCE_DELAY);
        
        return () => {
          if (pendingUpdateRef.current) {
            clearTimeout(pendingUpdateRef.current);
          }
        };
      }, [updateIframeContent]);
      
      // 初始化 iframe
      React.useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        
        // iframe 加载完成后初始化内容
        const handleLoad = () => {
          updateIframeContent();
        };
        
        iframe.addEventListener("load", handleLoad);
        
        // 立即初始化（如果 iframe 已经加载）
        if (iframe.contentDocument?.readyState === "complete") {
          updateIframeContent();
        }
        
        return () => {
          iframe.removeEventListener("load", handleLoad);
        };
      }, [updateIframeContent]);
      
      // 合并 ref - 返回 iframe 内部的 preview-output 元素
      React.useImperativeHandle(ref, () => {
        const iframe = iframeRef.current;
        if (iframe?.contentDocument) {
          const previewOutput = iframe.contentDocument.getElementById("preview-output");
          if (previewOutput) {
            return previewOutput as HTMLDivElement;
          }
        }
        return containerRef.current as HTMLDivElement;
      });

      return (
        <div 
          ref={containerRef} 
          className={cn("preview-container w-full h-full", className)}
          style={{ minHeight: "100%" }}
        >
          <iframe
            ref={iframeRef}
            title="预览"
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts"
            style={{ 
              minHeight: "100%",
              height: "100%",
              background: "transparent",
              display: "block",
            }}
          />
        </div>
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
