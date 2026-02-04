"use client";

import { useMemo } from "react";
import { useTheme } from "@/lib/themes/theme-context";
import { generateThemeCSS } from "@/lib/themes/theme-styles";

/**
 * 主题样式注入组件
 * 将当前主题的 CSS 注入到页面中
 */
export function ThemeStyleInjector() {
  const { activeTheme } = useTheme();
  
  // 使用 useMemo 缓存 CSS，只在主题变化时重新生成
  const css = useMemo(() => generateThemeCSS(activeTheme), [activeTheme]);

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
