import type { Theme } from "./types";

/**
 * 创建基础标题样式
 */
function createHeadingStyle(
  color: string,
  fontSize: string,
  borderBottom?: string
) {
  return {
    color,
    fontSize,
    fontWeight: "600",
    lineHeight: "1.3",
    marginTop: "1.5em",
    marginBottom: "0.5em",
    borderBottom,
    paddingBottom: borderBottom ? "0.3em" : undefined,
  };
}

/**
 * 默认白色主题 - 简洁清爽
 */
const defaultWhite: Theme = {
  id: "default-white",
  name: "默认白色",
  description: "简洁清爽的白色主题",
  isBuiltIn: true,
  styles: {
    background: "#ffffff",
    text: "#1a1a1a",
    textSecondary: "#666666",
    h1: createHeadingStyle("#1a1a1a", "2em", "1px solid #e5e5e5"),
    h2: createHeadingStyle("#1a1a1a", "1.5em", "1px solid #e5e5e5"),
    h3: createHeadingStyle("#1a1a1a", "1.25em"),
    h4: createHeadingStyle("#1a1a1a", "1.1em"),
    h5: createHeadingStyle("#1a1a1a", "1em"),
    h6: createHeadingStyle("#666666", "0.9em"),
    paragraph: {
      color: "#1a1a1a",
      fontSize: "16px",
      lineHeight: "1.8",
      marginBottom: "1em",
    },
    link: {
      color: "#0066cc",
      textDecoration: "none",
    },
    blockquote: {
      background: "#f9f9f9",
      borderLeft: "4px solid #ddd",
      color: "#666666",
      padding: "1em",
      margin: "1em 0",
      fontStyle: "italic",
    },
    code: {
      background: "#f4f4f4",
      color: "#c7254e",
      padding: "2px 6px",
      borderRadius: "3px",
      fontFamily: "Consolas, Monaco, monospace",
      fontSize: "0.9em",
    },
    codeBlock: {
      background: "#f4f4f4",
      color: "#333333",
      padding: "1em",
      borderRadius: "6px",
      fontFamily: "Consolas, Monaco, monospace",
      fontSize: "0.9em",
      lineHeight: "1.5",
      overflow: "auto",
    },
    list: {
      color: "#1a1a1a",
      marginLeft: "1.5em",
      marginBottom: "1em",
      lineHeight: "1.8",
    },
    table: {
      borderColor: "#ddd",
      headerBackground: "#f4f4f4",
      headerColor: "#1a1a1a",
      cellPadding: "8px 12px",
      evenRowBackground: "#fafafa",
    },
    image: {
      maxWidth: "100%",
      borderRadius: "4px",
      margin: "1em 0",
    },
    hr: {
      border: "1px solid #e5e5e5",
      margin: "2em 0",
    },
  },
};

/**
 * OLED 暗黑主题 - 深黑护眼
 */
const oledDark: Theme = {
  id: "oled-dark",
  name: "暗黑主题",
  description: "OLED 深黑护眼主题",
  isBuiltIn: true,
  styles: {
    background: "#000000",
    text: "#e0e0e0",
    textSecondary: "#a0a0a0",
    h1: createHeadingStyle("#ffffff", "2em", "1px solid #333333"),
    h2: createHeadingStyle("#ffffff", "1.5em", "1px solid #333333"),
    h3: createHeadingStyle("#ffffff", "1.25em"),
    h4: createHeadingStyle("#e0e0e0", "1.1em"),
    h5: createHeadingStyle("#e0e0e0", "1em"),
    h6: createHeadingStyle("#a0a0a0", "0.9em"),
    paragraph: {
      color: "#e0e0e0",
      fontSize: "16px",
      lineHeight: "1.8",
      marginBottom: "1em",
    },
    link: {
      color: "#58a6ff",
      textDecoration: "none",
    },
    blockquote: {
      background: "#1a1a1a",
      borderLeft: "4px solid #444444",
      color: "#a0a0a0",
      padding: "1em",
      margin: "1em 0",
      fontStyle: "italic",
    },
    code: {
      background: "#1a1a1a",
      color: "#f97583",
      padding: "2px 6px",
      borderRadius: "3px",
      fontFamily: "Consolas, Monaco, monospace",
      fontSize: "0.9em",
    },
    codeBlock: {
      background: "#1a1a1a",
      color: "#e0e0e0",
      padding: "1em",
      borderRadius: "6px",
      fontFamily: "Consolas, Monaco, monospace",
      fontSize: "0.9em",
      lineHeight: "1.5",
      overflow: "auto",
    },
    list: {
      color: "#e0e0e0",
      marginLeft: "1.5em",
      marginBottom: "1em",
      lineHeight: "1.8",
    },
    table: {
      borderColor: "#333333",
      headerBackground: "#1a1a1a",
      headerColor: "#ffffff",
      cellPadding: "8px 12px",
      evenRowBackground: "#0d0d0d",
    },
    image: {
      maxWidth: "100%",
      borderRadius: "4px",
      margin: "1em 0",
    },
    hr: {
      border: "1px solid #333333",
      margin: "2em 0",
    },
  },
};

/**
 * 墨绿主题 - 墨滴风格
 */
const inkGreen: Theme = {
  id: "ink-green",
  name: "墨绿主题",
  description: "类似墨滴风格的墨绿主题",
  isBuiltIn: true,
  styles: {
    background: "#f5f5f5",
    text: "#2d3436",
    textSecondary: "#636e72",
    h1: createHeadingStyle("#1e8449", "2em", "2px solid #1e8449"),
    h2: createHeadingStyle("#1e8449", "1.5em"),
    h3: createHeadingStyle("#27ae60", "1.25em"),
    h4: createHeadingStyle("#2d3436", "1.1em"),
    h5: createHeadingStyle("#2d3436", "1em"),
    h6: createHeadingStyle("#636e72", "0.9em"),
    paragraph: {
      color: "#2d3436",
      fontSize: "16px",
      lineHeight: "1.8",
      marginBottom: "1em",
    },
    link: {
      color: "#1e8449",
      textDecoration: "none",
    },
    blockquote: {
      background: "#e8f6f3",
      borderLeft: "4px solid #1e8449",
      color: "#2d3436",
      padding: "1em",
      margin: "1em 0",
      fontStyle: "italic",
    },
    code: {
      background: "#e8f6f3",
      color: "#1e8449",
      padding: "2px 6px",
      borderRadius: "3px",
      fontFamily: "Consolas, Monaco, monospace",
      fontSize: "0.9em",
    },
    codeBlock: {
      background: "#2d3436",
      color: "#a3e4d7",
      padding: "1em",
      borderRadius: "6px",
      fontFamily: "Consolas, Monaco, monospace",
      fontSize: "0.9em",
      lineHeight: "1.5",
      overflow: "auto",
    },
    list: {
      color: "#2d3436",
      marginLeft: "1.5em",
      marginBottom: "1em",
      lineHeight: "1.8",
    },
    table: {
      borderColor: "#b2bec3",
      headerBackground: "#1e8449",
      headerColor: "#ffffff",
      cellPadding: "8px 12px",
      evenRowBackground: "#e8f6f3",
    },
    image: {
      maxWidth: "100%",
      borderRadius: "4px",
      margin: "1em 0",
    },
    hr: {
      border: "1px solid #1e8449",
      margin: "2em 0",
    },
  },
};

/**
 * 橙色暖色主题 - 温暖舒适
 */
const orangeWarm: Theme = {
  id: "orange-warm",
  name: "橙色暖色",
  description: "温暖舒适的橙色主题",
  isBuiltIn: true,
  styles: {
    background: "#fffaf5",
    text: "#3d3d3d",
    textSecondary: "#666666",
    h1: createHeadingStyle("#e67e22", "2em", "2px solid #e67e22"),
    h2: createHeadingStyle("#e67e22", "1.5em"),
    h3: createHeadingStyle("#f39c12", "1.25em"),
    h4: createHeadingStyle("#3d3d3d", "1.1em"),
    h5: createHeadingStyle("#3d3d3d", "1em"),
    h6: createHeadingStyle("#666666", "0.9em"),
    paragraph: {
      color: "#3d3d3d",
      fontSize: "16px",
      lineHeight: "1.8",
      marginBottom: "1em",
    },
    link: {
      color: "#e67e22",
      textDecoration: "none",
    },
    blockquote: {
      background: "#fef5e7",
      borderLeft: "4px solid #e67e22",
      color: "#3d3d3d",
      padding: "1em",
      margin: "1em 0",
      fontStyle: "italic",
    },
    code: {
      background: "#fef5e7",
      color: "#d35400",
      padding: "2px 6px",
      borderRadius: "3px",
      fontFamily: "Consolas, Monaco, monospace",
      fontSize: "0.9em",
    },
    codeBlock: {
      background: "#3d3d3d",
      color: "#fad7a0",
      padding: "1em",
      borderRadius: "6px",
      fontFamily: "Consolas, Monaco, monospace",
      fontSize: "0.9em",
      lineHeight: "1.5",
      overflow: "auto",
    },
    list: {
      color: "#3d3d3d",
      marginLeft: "1.5em",
      marginBottom: "1em",
      lineHeight: "1.8",
    },
    table: {
      borderColor: "#f5cba7",
      headerBackground: "#e67e22",
      headerColor: "#ffffff",
      cellPadding: "8px 12px",
      evenRowBackground: "#fef5e7",
    },
    image: {
      maxWidth: "100%",
      borderRadius: "4px",
      margin: "1em 0",
    },
    hr: {
      border: "1px solid #e67e22",
      margin: "2em 0",
    },
  },
};

/**
 * 紫色优雅主题 - 现代优雅
 */
const purpleElegant: Theme = {
  id: "purple-elegant",
  name: "紫色优雅",
  description: "优雅现代的紫色主题",
  isBuiltIn: true,
  styles: {
    background: "#faf8ff",
    text: "#2d2d2d",
    textSecondary: "#666666",
    h1: createHeadingStyle("#8e44ad", "2em", "2px solid #8e44ad"),
    h2: createHeadingStyle("#8e44ad", "1.5em"),
    h3: createHeadingStyle("#9b59b6", "1.25em"),
    h4: createHeadingStyle("#2d2d2d", "1.1em"),
    h5: createHeadingStyle("#2d2d2d", "1em"),
    h6: createHeadingStyle("#666666", "0.9em"),
    paragraph: {
      color: "#2d2d2d",
      fontSize: "16px",
      lineHeight: "1.8",
      marginBottom: "1em",
    },
    link: {
      color: "#8e44ad",
      textDecoration: "none",
    },
    blockquote: {
      background: "#f5eef8",
      borderLeft: "4px solid #8e44ad",
      color: "#2d2d2d",
      padding: "1em",
      margin: "1em 0",
      fontStyle: "italic",
    },
    code: {
      background: "#f5eef8",
      color: "#8e44ad",
      padding: "2px 6px",
      borderRadius: "3px",
      fontFamily: "Consolas, Monaco, monospace",
      fontSize: "0.9em",
    },
    codeBlock: {
      background: "#2d2d2d",
      color: "#d7bde2",
      padding: "1em",
      borderRadius: "6px",
      fontFamily: "Consolas, Monaco, monospace",
      fontSize: "0.9em",
      lineHeight: "1.5",
      overflow: "auto",
    },
    list: {
      color: "#2d2d2d",
      marginLeft: "1.5em",
      marginBottom: "1em",
      lineHeight: "1.8",
    },
    table: {
      borderColor: "#d7bde2",
      headerBackground: "#8e44ad",
      headerColor: "#ffffff",
      cellPadding: "8px 12px",
      evenRowBackground: "#f5eef8",
    },
    image: {
      maxWidth: "100%",
      borderRadius: "4px",
      margin: "1em 0",
    },
    hr: {
      border: "1px solid #8e44ad",
      margin: "2em 0",
    },
  },
};

/**
 * 蓝色科技主题 - 专业技术感
 */
const blueTech: Theme = {
  id: "blue-tech",
  name: "蓝色科技",
  description: "专业技术感的蓝色主题",
  isBuiltIn: true,
  styles: {
    background: "#f8fafc",
    text: "#1e293b",
    textSecondary: "#64748b",
    h1: createHeadingStyle("#2563eb", "2em", "2px solid #2563eb"),
    h2: createHeadingStyle("#2563eb", "1.5em"),
    h3: createHeadingStyle("#3b82f6", "1.25em"),
    h4: createHeadingStyle("#1e293b", "1.1em"),
    h5: createHeadingStyle("#1e293b", "1em"),
    h6: createHeadingStyle("#64748b", "0.9em"),
    paragraph: {
      color: "#1e293b",
      fontSize: "16px",
      lineHeight: "1.8",
      marginBottom: "1em",
    },
    link: {
      color: "#2563eb",
      textDecoration: "none",
    },
    blockquote: {
      background: "#eff6ff",
      borderLeft: "4px solid #2563eb",
      color: "#1e293b",
      padding: "1em",
      margin: "1em 0",
      fontStyle: "italic",
    },
    code: {
      background: "#eff6ff",
      color: "#1d4ed8",
      padding: "2px 6px",
      borderRadius: "3px",
      fontFamily: "Consolas, Monaco, monospace",
      fontSize: "0.9em",
    },
    codeBlock: {
      background: "#1e293b",
      color: "#93c5fd",
      padding: "1em",
      borderRadius: "6px",
      fontFamily: "Consolas, Monaco, monospace",
      fontSize: "0.9em",
      lineHeight: "1.5",
      overflow: "auto",
    },
    list: {
      color: "#1e293b",
      marginLeft: "1.5em",
      marginBottom: "1em",
      lineHeight: "1.8",
    },
    table: {
      borderColor: "#bfdbfe",
      headerBackground: "#2563eb",
      headerColor: "#ffffff",
      cellPadding: "8px 12px",
      evenRowBackground: "#eff6ff",
    },
    image: {
      maxWidth: "100%",
      borderRadius: "4px",
      margin: "1em 0",
    },
    hr: {
      border: "1px solid #2563eb",
      margin: "2em 0",
    },
  },
};

/**
 * 所有内置主题
 */
export const BUILT_IN_THEMES: Theme[] = [
  defaultWhite,
  oledDark,
  inkGreen,
  orangeWarm,
  purpleElegant,
  blueTech,
];

/**
 * 默认主题 ID
 */
export const DEFAULT_THEME_ID = "default-white";

/**
 * 根据 ID 获取内置主题
 */
export function getBuiltInTheme(id: string): Theme | undefined {
  return BUILT_IN_THEMES.find((theme) => theme.id === id);
}
