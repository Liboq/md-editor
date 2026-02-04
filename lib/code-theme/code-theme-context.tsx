"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { CodeTheme, codeThemes } from "./code-themes";

const CODE_THEME_KEY = "md-editor-code-theme";

interface CodeThemeContextValue {
  activeCodeTheme: CodeTheme;
  setCodeTheme: (themeId: string) => void;
  codeThemes: CodeTheme[];
}

const CodeThemeContext = createContext<CodeThemeContextValue | undefined>(undefined);

export function CodeThemeProvider({ children }: { children: ReactNode }) {
  const [activeThemeId, setActiveThemeId] = useState("github");

  // 从 localStorage 恢复
  useEffect(() => {
    const saved = localStorage.getItem(CODE_THEME_KEY);
    if (saved && codeThemes.find(t => t.id === saved)) {
      setActiveThemeId(saved);
    }
  }, []);

  const setCodeTheme = (themeId: string) => {
    setActiveThemeId(themeId);
    localStorage.setItem(CODE_THEME_KEY, themeId);
  };

  const activeCodeTheme = useMemo(() => {
    return codeThemes.find(t => t.id === activeThemeId) || codeThemes[0];
  }, [activeThemeId]);

  const value = useMemo(() => ({
    activeCodeTheme,
    setCodeTheme,
    codeThemes,
  }), [activeCodeTheme]);

  return (
    <CodeThemeContext.Provider value={value}>
      {children}
    </CodeThemeContext.Provider>
  );
}

export function useCodeTheme() {
  const context = useContext(CodeThemeContext);
  if (!context) {
    throw new Error("useCodeTheme must be used within CodeThemeProvider");
  }
  return context;
}
