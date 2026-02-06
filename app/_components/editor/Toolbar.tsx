"use client";

import * as React from "react";
import ClipboardJS from "clipboard";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Image,
  Code,
  List,
  ListOrdered,
  Quote,
  Table,
  Copy,
  AlignCenter,
  FileCode,
  Strikethrough,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TextColorPicker, BackgroundColorPicker } from "./StyleSettings";
import { useSelectionStyle, type SelectionStyle } from "./useSelectionStyle";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PlatformSelector, usePlatformPreference } from "./PlatformSelector";
import { getAllExporters, exportContent, PLATFORMS } from "@/lib/export";
import { copyHTML, copyText } from "@/lib/clipboard/copy";
import type { Theme } from "@/lib/themes/types";

export type FormatAction =
  | "bold"
  | "italic"
  | "strikethrough"
  | "h1"
  | "h2"
  | "h3"
  | "link"
  | "image"
  | "code"
  | "codeblock"
  | "ul"
  | "ol"
  | "quote"
  | "table"
  | "center";

interface ToolbarProps {
  onFormat: (action: FormatAction) => void;
  onCopySuccess?: () => void;
  previewSelector?: string;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  onEditorChange?: (value: string) => void;
  className?: string;
  /** 获取当前 Markdown 内容的函数 */
  getMarkdown?: () => string;
  /** 获取当前渲染的 HTML 内容的函数 */
  getHtml?: () => string;
  /** 当前主题配置 */
  theme?: Theme;
}

interface ToolbarButton {
  action: FormatAction;
  icon: React.ElementType;
  label: string;
  shortcut?: string;
}

const toolbarButtons: ToolbarButton[] = [
  { action: "bold", icon: Bold, label: "粗体", shortcut: "Ctrl+B" },
  { action: "italic", icon: Italic, label: "斜体", shortcut: "Ctrl+I" },
  { action: "strikethrough", icon: Strikethrough, label: "删除线" },
  { action: "center", icon: AlignCenter, label: "居中" },
  { action: "h1", icon: Heading1, label: "一级标题" },
  { action: "h2", icon: Heading2, label: "二级标题" },
  { action: "h3", icon: Heading3, label: "三级标题" },
  { action: "link", icon: Link, label: "链接", shortcut: "Ctrl+K" },
  { action: "image", icon: Image, label: "图片" },
  { action: "code", icon: Code, label: "行内代码" },
  { action: "codeblock", icon: FileCode, label: "代码块" },
  { action: "ul", icon: List, label: "无序列表" },
  { action: "ol", icon: ListOrdered, label: "有序列表" },
  { action: "quote", icon: Quote, label: "引用" },
  { action: "table", icon: Table, label: "表格" },
];

/**
 * 检查按钮是否应该高亮
 */
function isButtonActive(action: FormatAction, style: SelectionStyle): boolean {
  switch (action) {
    case "bold":
      return style.isBold;
    case "italic":
      return style.isItalic;
    case "strikethrough":
      return style.isStrikethrough;
    case "code":
      return style.isCode;
    case "link":
      return style.isLink;
    case "quote":
      return style.isQuote;
    case "h1":
      return style.headingLevel === 1;
    case "h2":
      return style.headingLevel === 2;
    case "h3":
      return style.headingLevel === 3;
    default:
      return false;
  }
}

export function Toolbar({ onFormat, onCopySuccess, previewSelector, textareaRef, onEditorChange, className, getMarkdown, getHtml, theme }: ToolbarProps) {
  // 使用空 ref 作为默认值，避免 hook 条件调用
  const emptyRef = React.useRef<HTMLTextAreaElement | null>(null);
  const actualRef = textareaRef || emptyRef;
  const selectionStyle = useSelectionStyle(actualRef);
  
  // 平台选择偏好
  const { platform, setPlatform } = usePlatformPreference();
  
  // 获取所有可用的导出器
  const exporters = React.useMemo(() => getAllExporters(), []);
  
  // 复制按钮 ref
  const copyButtonRef = React.useRef<HTMLButtonElement>(null);
  
  // 初始化 ClipboardJS - 仅用于微信公众号
  // 使用 data-clipboard-target 指向预览区域
  React.useEffect(() => {
    // 只有当选择微信公众号时才初始化 ClipboardJS
    if (!copyButtonRef.current || !previewSelector || platform !== PLATFORMS.WECHAT) return;
    
    // 直接使用 ClipboardJS，通过 data-clipboard-target 复制 DOM 内容
    const clipboard = new ClipboardJS(copyButtonRef.current);
    
    clipboard.on("success", (e: { clearSelection: () => void }) => {
      e.clearSelection();
      toast.success("复制成功", {
        description: "内容已复制到剪贴板，可粘贴到微信公众号",
      });
      onCopySuccess?.();
    });
    
    clipboard.on("error", (e: unknown) => {
      console.error("复制失败:", e);
      toast.error("复制失败", {
        description: "请重试或手动复制内容",
      });
    });
    
    return () => {
      clipboard.destroy();
    };
  }, [previewSelector, onCopySuccess, platform]);
  
  /**
   * 处理其他平台的复制操作
   * 使用导出器转换内容后复制到剪贴板
   */
  const handleOtherPlatformCopy = React.useCallback(async () => {
    // 获取 Markdown 和 HTML 内容
    const markdown = getMarkdown?.() || "";
    const html = getHtml?.() || "";
    
    if (!markdown && !html) {
      toast.error("复制失败", {
        description: "没有可复制的内容",
      });
      return;
    }
    
    // 使用导出器转换内容
    const result = exportContent(platform, markdown, html, theme || {} as Theme);
    
    if (!result) {
      toast.error("复制失败", {
        description: "未找到对应的导出器",
      });
      return;
    }
    
    // 根据 mimeType 选择复制方式
    let success = false;
    if (result.mimeType === "text/html") {
      success = await copyHTML(result.content);
    } else {
      success = await copyText(result.content);
    }
    
    // 获取平台名称用于提示
    const platformName = exporters.find(e => e.id === platform)?.name || platform;
    
    if (success) {
      toast.success("复制成功", {
        description: `内容已转换为 ${platformName} 格式并复制到剪贴板`,
      });
      onCopySuccess?.();
    } else {
      toast.error("复制失败", {
        description: "请重试或手动复制内容",
      });
    }
  }, [platform, getMarkdown, getHtml, theme, exporters, onCopySuccess]);
  
  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "flex items-center gap-1 flex-wrap",
          className
        )}
      >
        {toolbarButtons.map((button) => {
          const isActive = textareaRef ? isButtonActive(button.action, selectionStyle) : false;
          return (
            <Tooltip key={button.action}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="icon"
                  className={cn(
                    "h-8 w-8 cursor-pointer",
                    isActive && "bg-primary/20 text-primary"
                  )}
                  onClick={() => onFormat(button.action)}
                >
                  <button.icon className="h-4 w-4" />
                  <span className="sr-only">{button.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {button.label}
                  {button.shortcut && (
                    <span className="ml-2 text-muted-foreground">
                      {button.shortcut}
                    </span>
                  )}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* 分隔线 */}
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* 文字颜色和背景颜色 */}
        {textareaRef && onEditorChange && (
          <>
            <TextColorPicker 
              textareaRef={textareaRef} 
              onChange={onEditorChange}
              currentColor={selectionStyle.textColor}
            />
            <BackgroundColorPicker 
              textareaRef={textareaRef} 
              onChange={onEditorChange}
              currentColor={selectionStyle.backgroundColor}
            />
          </>
        )}

        {previewSelector && (
          <>
            <div className="w-px h-6 bg-border mx-1" />
            
            {/* 平台选择器 */}
            <PlatformSelector
              value={platform}
              onChange={setPlatform}
              platforms={exporters}
              className="h-8"
            />
            
            {/* 复制按钮 - 根据平台使用不同的复制逻辑 */}
            <Tooltip>
              <TooltipTrigger asChild>
                {platform === PLATFORMS.WECHAT ? (
                  // 微信公众号：使用 ClipboardJS + data-clipboard-target
                  <Button
                    ref={copyButtonRef}
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 cursor-pointer"
                    data-clipboard-target={previewSelector}
                  >
                    <Copy className="h-4 w-4" />
                    <span className="hidden sm:inline">复制</span>
                  </Button>
                ) : (
                  // 其他平台：使用导出器转换后复制
                  <Button
                    ref={copyButtonRef}
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 cursor-pointer"
                    onClick={handleOtherPlatformCopy}
                  >
                    <Copy className="h-4 w-4" />
                    <span className="hidden sm:inline">复制</span>
                  </Button>
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {platform === PLATFORMS.WECHAT
                    ? "复制带样式的内容到微信公众号"
                    : `复制转换后的内容到 ${exporters.find(e => e.id === platform)?.name || "目标平台"}`
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
