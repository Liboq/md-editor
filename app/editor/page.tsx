"use client";

import { useState, useMemo, useRef, useEffect, useCallback, useDeferredValue, startTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Editor } from "@/app/_components/editor/Editor";
import { Toolbar } from "@/app/_components/editor/Toolbar";
import { useEditor } from "@/app/_components/editor/hooks";
import { Preview, PREVIEW_SELECTOR } from "@/app/_components/preview/Preview";
import { ThemeStyleInjector } from "@/app/_components/preview/ThemeStyleInjector";
import { ThemeSelector } from "@/app/_components/theme-selector/ThemeSelector";
import { ThemeEditorDialog } from "@/app/_components/theme-selector/ThemeEditorDialog";
import { ThemeImportExport } from "@/app/_components/theme-selector/ThemeImportExport";
import { CodeThemeSelector } from "@/app/_components/code-theme/CodeThemeSelector";
import { UserMenu } from "@/app/_components/auth/UserMenu";
import { ShareDialog } from "@/app/_components/share/ShareDialog";
import { OnboardingGuide } from "@/app/_components/editor/OnboardingGuide";
import { parseMarkdown } from "@/lib/markdown/parser";
import { useScrollSync } from "@/hooks/useScrollSync";
import { useTheme } from "@/lib/themes/theme-context";
import { useCodeTheme } from "@/lib/code-theme/code-theme-context";
import { generateCodeThemeCSS } from "@/lib/code-theme/code-themes";
import { useAuth } from "@/lib/auth/auth-context";
import { articleService, Article } from "@/lib/supabase/article-service";
import { toast } from "sonner";
import { Monitor, Smartphone, Link, Unlink, Share2, Save, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Suspense } from "react";

// 预览模式类型
type PreviewMode = "desktop" | "mobile";

// localStorage key
const SCROLL_SYNC_KEY = "markdown-editor-scroll-sync";
const AUTO_SAVE_INTERVAL = 30000; // 30秒自动保存

function EditorContent() {
  const searchParams = useSearchParams();
  const articleId = searchParams.get('article');
  
  // 使用 ref 存储实时内容，避免每次输入都触发重渲染
  const contentRef = useRef("");
  // 用于预览的内容状态（低优先级更新）
  const [previewContent, setPreviewContent] = useState("");
  const [articleTitle, setArticleTitle] = useState("Markdown 编辑器");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [scrollSyncEnabled, setScrollSyncEnabled] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const lastSavedContent = useRef<string>("");
  const lastSavedTitle = useRef<string>("");
  const router = useRouter();

  // 认证状态
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // 未登录则跳转到登录页
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // 加载文章
  useEffect(() => {
    if (articleId && user) {
      loadArticle(articleId);
    }
  }, [articleId, user]);

  const loadArticle = async (id: string) => {
    try {
      const article = await articleService.getArticle(id);
      if (article) {
        setCurrentArticle(article);
        contentRef.current = article.content;
        setPreviewContent(article.content);
        setArticleTitle(article.title || '未命名文档');
        lastSavedContent.current = article.content;
        lastSavedTitle.current = article.title || '未命名文档';
      }
    } catch (error) {
      console.error('加载文章失败:', error);
      toast.error('加载文章失败');
    }
  };

  // 内容变化处理（高性能）
  const handleContentChange = useCallback((value: string) => {
    contentRef.current = value;
    // 使用 startTransition 标记预览更新为低优先级
    startTransition(() => {
      setPreviewContent(value);
    });
    // 检测未保存更改
    if (currentArticle) {
      setHasUnsavedChanges(value !== lastSavedContent.current || articleTitle !== lastSavedTitle.current);
    }
  }, [currentArticle, articleTitle]);

  // 保存文章（包括标题）
  const saveArticle = useCallback(async () => {
    if (!currentArticle || !user) return;
    
    const content = contentRef.current;
    const contentChanged = content !== lastSavedContent.current;
    const titleChanged = articleTitle !== lastSavedTitle.current;
    
    if (!contentChanged && !titleChanged) return;

    try {
      setIsSaving(true);
      await articleService.updateArticle(currentArticle.id, {
        content,
        title: articleTitle,
      });
      lastSavedContent.current = content;
      lastSavedTitle.current = articleTitle;
      setHasUnsavedChanges(false);
      // 更新当前文章对象
      setCurrentArticle(prev => prev ? { ...prev, title: articleTitle, content } : null);
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败');
    } finally {
      setIsSaving(false);
    }
  }, [currentArticle, articleTitle, user]);

  // 手动保存
  const handleManualSave = async () => {
    if (!currentArticle) {
      toast.info('请先从"我的文章"创建或选择一篇文章');
      return;
    }
    await saveArticle();
    toast.success('保存成功');
  };

  // 自动保存
  useEffect(() => {
    if (!currentArticle) return;

    const timer = setInterval(() => {
      if (contentRef.current !== lastSavedContent.current || articleTitle !== lastSavedTitle.current) {
        saveArticle();
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(timer);
  }, [currentArticle, articleTitle, saveArticle]);

  // 检测标题变化的未保存更改
  useEffect(() => {
    if (currentArticle) {
      setHasUnsavedChanges(contentRef.current !== lastSavedContent.current || articleTitle !== lastSavedTitle.current);
    }
  }, [articleTitle, currentArticle]);

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

  // 使用 useDeferredValue 进一步延迟预览更新
  const deferredContent = useDeferredValue(previewContent);

  // 获取当前主题
  const { activeTheme } = useTheme();
  
  // 获取代码主题
  const { activeCodeTheme } = useCodeTheme();
  const codeThemeCSS = useMemo(() => generateCodeThemeCSS(activeCodeTheme), [activeCodeTheme]);

  // 解析 Markdown 为 HTML（用于复制功能，使用延迟的内容）
  // 返回原始 HTML，复制时由 Toolbar 的 prepareForWechat 处理内联样式
  const html = useMemo(() => {
    return parseMarkdown(deferredContent);
  }, [deferredContent]);

  // 编辑器 hook
  const { textareaRef, handleFormat, handleKeyDown } = useEditor({
    value: contentRef.current,
    onChange: handleContentChange,
  });

  // 复制成功回调（可用于其他用途，如统计）
  const handleCopySuccess = useCallback(() => {
    // Toolbar 内部已处理 toast 提示，这里不再重复显示
  }, []);

  // 处理标题编辑
  const handleTitleClick = () => {
    if (currentArticle) {
      setIsEditingTitle(true);
      setTimeout(() => titleInputRef.current?.focus(), 0);
    }
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (!articleTitle.trim()) {
      setArticleTitle('未命名文档');
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false);
      if (!articleTitle.trim()) {
        setArticleTitle('未命名文档');
      }
    }
    if (e.key === 'Escape') {
      setArticleTitle(lastSavedTitle.current || '未命名文档');
      setIsEditingTitle(false);
    }
  };

  // 加载中或未登录时显示加载状态
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <main className="h-screen flex flex-col">
      <ThemeStyleInjector />
      {/* 代码主题样式 */}
      <style dangerouslySetInnerHTML={{ __html: codeThemeCSS }} />
      {/* 新用户引导 */}
      <OnboardingGuide />
      {/* 头部工具栏区域 */}
      <header className="border-b px-2 sm:px-4 py-2 flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="text-base sm:text-lg font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none px-1 min-w-[100px] max-w-[300px]"
            />
          ) : (
            <h1 
              className={`text-base sm:text-lg font-semibold whitespace-nowrap truncate max-w-[200px] sm:max-w-[300px] ${currentArticle ? 'cursor-pointer hover:text-gray-600 dark:hover:text-gray-300' : ''}`}
              onClick={handleTitleClick}
              title={currentArticle ? '点击编辑标题' : undefined}
            >
              {currentArticle ? articleTitle : '轻语'}
            </h1>
          )}
          {hasUnsavedChanges && (
            <span className="text-xs text-gray-400 shrink-0">未保存</span>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end shrink-0">
          {/* 我的文章按钮 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 cursor-pointer"
                onClick={() => router.push('/articles')}
              >
                <FileText className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>我的文章</TooltipContent>
          </Tooltip>
          
          {/* 保存按钮 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 cursor-pointer"
                onClick={handleManualSave}
                disabled={isSaving}
              >
                <Save className={`h-4 w-4 ${isSaving ? 'animate-pulse' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isSaving ? '保存中...' : '保存'}</TooltipContent>
          </Tooltip>
          
          <ThemeSelector />
          <CodeThemeSelector />
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
          {/* 用户菜单 */}
          <UserMenu />
        </div>
      </header>

      {/* 分享对话框 */}
      <ShareDialog
        markdown={previewContent}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />

      {/* 工具栏 */}
      <div className="border-b px-2 sm:px-4 py-2 shrink-0 overflow-x-auto">
        <Toolbar 
          onFormat={handleFormat} 
          onCopySuccess={handleCopySuccess}
          previewSelector={PREVIEW_SELECTOR}
          textareaRef={textareaRef}
          onEditorChange={handleContentChange}
          getMarkdown={() => contentRef.current}
          getHtml={() => html}
          theme={activeTheme}
          codeTheme={activeCodeTheme}
        />
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
              value={previewContent}
              onChange={handleContentChange}
              className="h-full"
            />
          </TabsContent>
          <TabsContent value="preview" className="flex-1 p-4 mt-0 overflow-auto">
            <Preview ref={previewRef} markdown={deferredContent} />
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
              value={previewContent}
              onChange={handleContentChange}
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
              <Preview ref={previewRef} markdown={deferredContent} className={previewMode === "mobile" ? "p-4" : ""} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
