"use client";

import * as React from "react";
import morphdom from "morphdom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/themes/theme-context";
import { useCodeTheme } from "@/lib/code-theme/code-theme-context";
import { generateThemeCSS } from "@/lib/themes/theme-styles";
import { generateCodeThemeCSS } from "@/lib/code-theme/code-themes";
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
 * 生成 iframe 内部的完整 HTML 文档
 */
function generateIframeDocument(content: string, styles: string): string {
  return `
<!DOCTYPE html>
<html style="height: 100%;">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* 重置样式 */
    *, *::before, *::after {
      box-sizing: border-box;
    }
    
    html, body {
      margin: 0;
      padding: 0;
      min-height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #333;
      background: transparent;
    }
    
    /* 确保行内元素正确显示 */
    strong, b { font-weight: bold; }
    em, i { font-style: italic; }
    
    /* 主题和代码样式 */
    ${styles}
  </style>
</head>
<body>
  <div id="preview-output" class="preview-content">${content}</div>
</body>
</html>
  `.trim();
}

/**
 * 预览组件
 * 
 * 特性：
 * - Web Worker 渲染：Markdown 处理在后台线程执行，不阻塞 UI
 * - iframe 沙箱隔离：预览样式不影响编辑器
 * - morphdom 增量更新：仅更新变化部分，提升性能
 * - 防抖渲染：100ms 防抖，避免频繁渲染
 */
const Preview = React.memo(
  React.forwardRef<HTMLDivElement, PreviewProps>(
    ({ markdown, html, className }, ref) => {
      const { activeTheme } = useTheme();
      const { activeCodeTheme } = useCodeTheme();
      const { render: workerRender } = useMarkdownWorker();
      const iframeRef = React.useRef<HTMLIFrameElement>(null);
      const containerRef = React.useRef<HTMLDivElement>(null);
      const pendingUpdateRef = React.useRef<NodeJS.Timeout | null>(null);
      const lastHtmlRef = React.useRef<string>("");
      const lastStylesRef = React.useRef<string>("");
      
      // 渲染后的 HTML 状态
      const [renderedHtml, setRenderedHtml] = React.useState<string>(html || "");
      
      // 使用 Worker 渲染 Markdown
      React.useEffect(() => {
        if (markdown !== undefined) {
          // 使用 Worker 渲染 Markdown
          workerRender(markdown).then(setRenderedHtml);
        } else if (html !== undefined) {
          // 直接使用传入的 HTML
          setRenderedHtml(html);
        }
      }, [markdown, html, workerRender]);
      
      // 处理伪元素：将 ::before/::after 转换为实际 DOM 元素
      const processedHtml = React.useMemo(() => {
        if (!renderedHtml) return "";
        
        if (activeTheme.customCSS) {
          const { html: processed } = processPseudoElements(renderedHtml, activeTheme.customCSS);
          return processed;
        }
        
        return renderedHtml;
      }, [renderedHtml, activeTheme.customCSS]);
      
      // 生成完整的样式
      const fullStyles = React.useMemo(() => {
        const themeStyles = generateThemeCSS(activeTheme);
        const codeStyles = generateCodeThemeCSS(activeCodeTheme);
        return `${themeStyles}\n${codeStyles}`;
      }, [activeTheme, activeCodeTheme]);
      
      // 使用 morphdom 增量更新 iframe 内容
      const updateIframeContent = React.useCallback(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        
        const iframeDoc = iframe.contentDocument;
        if (!iframeDoc) return;
        
        const contentDiv = iframeDoc.getElementById("preview-output");
        
        // 如果样式变化，需要重新写入整个文档
        if (fullStyles !== lastStylesRef.current || !contentDiv) {
          const docContent = generateIframeDocument(
            processedHtml || '<span style="color: #999;">预览将在此显示...</span>',
            fullStyles
          );
          iframeDoc.open();
          iframeDoc.write(docContent);
          iframeDoc.close();
          lastStylesRef.current = fullStyles;
          lastHtmlRef.current = processedHtml;
          return;
        }
        
        // 如果只有内容变化，使用 morphdom 增量更新
        if (processedHtml !== lastHtmlRef.current) {
          const newContent = processedHtml || '<span style="color: #999;">预览将在此显示...</span>';
          
          // 创建临时元素用于 morphdom 比较
          const tempDiv = iframeDoc.createElement("div");
          tempDiv.id = "preview-output";
          tempDiv.className = "preview-content";
          tempDiv.innerHTML = newContent;
          
          // 使用 morphdom 进行 DOM diff，仅更新变化部分
          morphdom(contentDiv, tempDiv, {
            // 保留滚动位置
            onBeforeElUpdated: (fromEl, toEl) => {
              // 跳过相同的元素
              if (fromEl.isEqualNode(toEl)) {
                return false;
              }
              return true;
            },
          });
          
          lastHtmlRef.current = processedHtml;
        }
      }, [processedHtml, fullStyles]);
      
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
