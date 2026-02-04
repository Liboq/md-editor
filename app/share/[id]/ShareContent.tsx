"use client";

import { useState, useEffect } from "react";
import { Monitor, Smartphone, FileText } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";

interface ShareContentProps {
  htmlContent: string;
  themeStyles: string;
  codeThemeStyles?: string;
}

type PreviewMode = "desktop" | "mobile";

/**
 * 分享内容客户端组件
 * 
 * 支持桌面端/移动端预览切换，根据窗口大小自动选择默认模式。
 * 移动端预览使用固定高度的手机模型，内容可在模型内滚动。
 */
export default function ShareContent({
  htmlContent,
  themeStyles,
  codeThemeStyles,
}: ShareContentProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [isInitialized, setIsInitialized] = useState(false);
  const { isAuthenticated } = useAuth();

  // 根据窗口大小自动设置默认预览模式
  useEffect(() => {
    const updateDefaultMode = () => {
      // 768px 是常见的移动端断点
      const isMobile = window.innerWidth < 768;
      setPreviewMode(isMobile ? "mobile" : "desktop");
      setIsInitialized(true);
    };

    // 初始化时设置
    updateDefaultMode();
  }, []);

  // 根据登录状态决定跳转目标
  const logoHref = isAuthenticated ? "/articles" : "/login";

  // 防止闪烁，等待初始化完成
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 直接渲染样式，与编辑器保持一致 */}
      <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      {/* 代码主题样式 */}
      {codeThemeStyles && <style dangerouslySetInnerHTML={{ __html: codeThemeStyles }} />}
      
      {/* 顶部工具栏 */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo 和标题 */}
          <Link 
            href={logoHref}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
            title={isAuthenticated ? "返回文章列表" : "登录"}
          >
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-sm">MD 编辑器</span>
          </Link>
          
          {/* 预览模式切换 */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPreviewMode("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                previewMode === "desktop"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="桌面端预览"
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">桌面端</span>
            </button>
            <button
              onClick={() => setPreviewMode("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                previewMode === "mobile"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="移动端预览"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">移动端</span>
            </button>
          </div>
        </div>
      </div>

      {/* 预览内容区域 */}
      {previewMode === "desktop" ? (
        // 桌面端预览 - 正常滚动
        <div className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <article
              className="preview-content rounded-lg "
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
          <footer className="mt-8 text-center text-sm text-gray-500">
            <p>由 Markdown 编辑器生成</p>
          </footer>
        </div>
      ) : (
        // 移动端预览 - 手机模型，固定高度，内部滚动
        <div className="py-8 px-4 bg-gray-200 flex flex-col items-center min-h-[calc(100vh-57px)]">
          {/* 手机模型外框 */}
          <div 
            className="relative bg-gray-800 rounded-[40px] p-3 shadow-2xl"
            style={{
              width: "390px",
              height: "844px", // iPhone 14 Pro 高度
            }}
          >
            {/* 刘海 */}
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 bg-gray-800 rounded-b-3xl z-10"
              style={{
                width: "126px",
                height: "34px",
              }}
            />
            
            {/* 手机屏幕 */}
            <div 
              className="bg-white rounded-[32px] overflow-hidden h-full"
              style={{
                width: "100%",
              }}
            >
              {/* 状态栏 */}
              <div className="h-12 bg-white flex items-center justify-between px-6 text-xs font-medium">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3C7.46 3 3.34 4.78.29 7.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l11 11c.18.18.43.29.71.29.28 0 .53-.11.71-.29l11-11c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71C20.66 4.78 16.54 3 12 3z"/>
                  </svg>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2 22h20V2z"/>
                  </svg>
                  <svg className="w-6 h-3" fill="currentColor" viewBox="0 0 24 12">
                    <rect x="0" y="0" width="22" height="12" rx="2" stroke="currentColor" strokeWidth="1" fill="none"/>
                    <rect x="2" y="2" width="18" height="8" rx="1" fill="currentColor"/>
                    <rect x="22" y="4" width="2" height="4" rx="1" fill="currentColor"/>
                  </svg>
                </div>
              </div>
              
              {/* 可滚动内容区域 */}
              <div 
                className="overflow-y-auto"
                style={{
                  padding:"10px",
                  height: "calc(100% - 48px)", // 减去状态栏高度
                }}
              >
                <article
                  className="preview-content"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              </div>
            </div>
          </div>
          
          <footer className="mt-8 text-center text-sm text-gray-500">
            <p>由 Markdown 编辑器生成</p>
          </footer>
        </div>
      )}
    </div>
  );
}
