"use client";

import * as React from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type FormatAction =
  | "bold"
  | "italic"
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
  | "table";

interface ToolbarProps {
  onFormat: (action: FormatAction) => void;
  onCopyToWeChat?: () => void;
  className?: string;
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
  { action: "h1", icon: Heading1, label: "一级标题" },
  { action: "h2", icon: Heading2, label: "二级标题" },
  { action: "h3", icon: Heading3, label: "三级标题" },
  { action: "link", icon: Link, label: "链接", shortcut: "Ctrl+K" },
  { action: "image", icon: Image, label: "图片" },
  { action: "code", icon: Code, label: "行内代码" },
  { action: "ul", icon: List, label: "无序列表" },
  { action: "ol", icon: ListOrdered, label: "有序列表" },
  { action: "quote", icon: Quote, label: "引用" },
  { action: "table", icon: Table, label: "表格" },
];

export function Toolbar({ onFormat, onCopyToWeChat, className }: ToolbarProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "flex items-center gap-1 flex-wrap",
          className
        )}
      >
        {toolbarButtons.map((button) => (
          <Tooltip key={button.action}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer"
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
        ))}

        {onCopyToWeChat && (
          <>
            <div className="w-px h-6 bg-border mx-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 cursor-pointer"
                  onClick={onCopyToWeChat}
                >
                  <Copy className="h-4 w-4" />
                  <span className="hidden sm:inline">复制到公众号</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>复制带样式的内容到微信公众号</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
