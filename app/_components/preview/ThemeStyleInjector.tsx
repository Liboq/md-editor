"use client";

import { useTheme } from "@/lib/themes/theme-context";
import { generateThemeCSS } from "@/lib/themes/theme-styles";

/**
 * 主题样式注入组件
 * 将当前主题的 CSS 注入到页面中
 */
export function ThemeStyleInjector() {
  const { activeTheme } = useTheme();
  const css = generateThemeCSS(activeTheme);

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
