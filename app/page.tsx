"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Editor } from "@/app/_components/editor/Editor";
import { Toolbar } from "@/app/_components/editor/Toolbar";
import { useEditor } from "@/app/_components/editor/hooks";
import { Preview } from "@/app/_components/preview/Preview";
import { ThemeStyleInjector } from "@/app/_components/preview/ThemeStyleInjector";
import { ThemeSelector } from "@/app/_components/theme-selector/ThemeSelector";
import { ThemeEditorDialog } from "@/app/_components/theme-selector/ThemeEditorDialog";
import { ThemeImportExport } from "@/app/_components/theme-selector/ThemeImportExport";
import { LoginButton } from "@/app/_components/auth/LoginButton";
import { UserMenu } from "@/app/_components/auth/UserMenu";
import { ShareDialog } from "@/app/_components/share/ShareDialog";
import { parseMarkdown } from "@/lib/markdown/parser";
import { useDebounce } from "@/hooks/useDebounce";
import { useScrollSync } from "@/hooks/useScrollSync";
import { useTheme } from "@/lib/themes/theme-context";
import { useAuth } from "@/lib/supabase/auth-context";
import { convertToInlineStyles } from "@/lib/clipboard/inline-converter";
import { copyHTML } from "@/lib/clipboard/copy";
import { toast } from "sonner";
import { Monitor, Smartphone, Link, Unlink, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// 预览模式类型
type PreviewMode = "desktop" | "mobile";

// localStorage key
const SCROLL_SYNC_KEY = "markdown-editor-scroll-sync";

export default function Home() {
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState("editor");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [scrollSyncEnabled, setScrollSyncEnabled] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // 认证状态
  const { isAuthenticated, loading: authLoading } = useAuth();

  // 从 localStorage 恢复滚动同步设置
  useEffect(() => {
    const saved = localStorage.getItem(SCROLL_SYNC_KEY);
    if (saved !== null) {
      setScrollSyncEnabled(saved === "true");
    }
  }, []);

  // 保存滚动同步设置到 localStorage
  const toggleScrollSync = () => {
    const newValue = !scrollSyncEnabled;
    setScrollSyncEnabled(newValue);
    localStorage.setItem(SCROLL_SYNC_KEY, String(newValue));
    toast.success(newValue ? "滚动同步已开启" : "滚动同步已关闭");
  };

  // 滚动同步 hook
  const {
    editorRef: scrollEditorRef,
    previewContainerRef: scrollPreviewRef,
    handleEditorScroll,
    handlePreviewScroll,
  } = useScrollSync({ enabled: scrollSyncEnabled });

  // 防抖处理 Markdown 内容
  const debouncedContent = useDebounce(content, 100);

  // 获取当前主题
  const { activeTheme } = useTheme();

  // 解析 Markdown 为 HTML
  const html = useMemo(() => {
    return parseMarkdown(debouncedContent);
  }, [debouncedContent]);

  // 编辑器 hook
  const { textareaRef, handleFormat, handleKeyDown } = useEditor({
    value: content,
    onChange: setContent,
  });

  // 复制到微信公众号
  const handleCopyToWeChat = async () => {
    if (!html) {
      toast.error("没有内容可复制");
      return;
    }

    try {
      // 转换为带行内样式的 HTML
      const inlineHtml = convertToInlineStyles(html, activeTheme);

      // 复制到剪贴板
      const success = await copyHTML(inlineHtml);

      if (success) {
        toast.success("已复制到剪贴板，可直接粘贴到微信公众号");
      } else {
        toast.error("复制失败，请手动选择内容复制");
      }
    } catch (error) {
      console.error("复制失败:", error);
      toast.error("复制失败，请手动选择内容复制");
    }
  };

  return (
    <main className="h-screen flex flex-col">
      <ThemeStyleInjector />
      {/* 头部工具栏区域 */}
      <header className="border-b px-2 sm:px-4 py-2 flex items-center justify-between shrink-0 gap-2">
        <h1 className="text-base sm:text-lg font-semibold whitespace-nowrap">Markdown 编辑器</h1>
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
          <ThemeSelector />
          <div className="hidden sm:flex items-center gap-1">
            <ThemeEditorDialog />
            <ThemeImportExport />
          </div>
          {/* 分享按钮 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 cursor-pointer"
                onClick={() => setShareDialogOpen(true)}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>分享文章</TooltipContent>
          </Tooltip>
          {/* 登录/用户菜单 */}
          {!authLoading && (
            isAuthenticated ? <UserMenu /> : <LoginButton />
          )}
        </div>
      </header>

      {/* 分享对话框 */}
      <ShareDialog
        markdown={content}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />

      {/* 工具栏 */}
      <div className="border-b px-2 sm:px-4 py-2 shrink-0 overflow-x-auto">
        <Toolbar onFormat={handleFormat} onCopyToWeChat={handleCopyToWeChat} />
      </div>

      {/* 移动端标签切换 (< 768px) */}
      <div className="md:hidden flex-1 flex flex-col min-h-0">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="mx-4 mt-2 grid w-auto grid-cols-2">
            <TabsTrigger value="editor">编辑</TabsTrigger>
            <TabsTrigger value="preview">预览</TabsTrigger>
          </TabsList>
          <TabsContent value="editor" className="flex-1 p-4 mt-0 min-h-0">
            <Editor
              ref={textareaRef}
              value={content}
              onChange={setContent}
              className="h-full"
            />
          </TabsContent>
          <TabsContent value="preview" className="flex-1 p-4 mt-0 overflow-auto">
            <Preview ref={previewRef} html={html} />
          </TabsContent>
        </Tabs>
      </div>

      {/* 桌面端双栏布局 (≥ 768px) */}
      <div className="hidden md:flex flex-1 min-h-0">
        {/* 编辑器面板 - 50% */}
        <div className="w-1/2 flex flex-col border-r min-h-0">
          <div className="border-b px-4 py-2 flex items-center justify-between shrink-0">
            <span className="text-sm font-medium text-muted-foreground">编辑器</span>
            {/* 滚动同步开关 */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={scrollSyncEnabled ? "secondary" : "ghost"}
                  size="icon"
                  className="h-7 w-7 cursor-pointer"
                  onClick={toggleScrollSync}
                >
                  {scrollSyncEnabled ? (
                    <Link className="h-4 w-4" />
                  ) : (
                    <Unlink className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {scrollSyncEnabled ? "关闭滚动同步" : "开启滚动同步"}
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex-1 p-4 min-h-0">
            <Editor
              ref={(el) => {
                // 同时设置两个 ref
                if (textareaRef) {
                  (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
                }
                scrollEditorRef.current = el;
              }}
              value={content}
              onChange={setContent}
              className="h-full"
              onKeyDown={handleKeyDown}
              onScroll={handleEditorScroll}
            />
          </div>
        </div>

        {/* 预览面板 - 50% */}
        <div className="w-1/2 flex flex-col min-h-0">
          <div className="border-b px-4 py-2 flex items-center justify-between shrink-0">
            <span className="text-sm font-medium text-muted-foreground">预览</span>
            {/* PC/移动端预览切换 */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={previewMode === "desktop" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-7 w-7 cursor-pointer"
                    onClick={() => setPreviewMode("desktop")}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>桌面端预览</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={previewMode === "mobile" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-7 w-7 cursor-pointer"
                    onClick={() => setPreviewMode("mobile")}
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>移动端预览</TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div
            ref={(el) => {
              scrollPreviewRef.current = el;
            }}
            className="flex-1 p-4 overflow-auto flex justify-center"
            onScroll={handlePreviewScroll}
          >
            <div
              className={
                previewMode === "mobile"
                  ? "w-[375px] border rounded-lg shadow-sm bg-background overflow-auto"
                  : "w-full"
              }
            >
              <Preview ref={previewRef} html={html} className={previewMode === "mobile" ? "p-4" : ""} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
