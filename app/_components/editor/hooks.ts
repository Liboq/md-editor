"use client";

import { useCallback, useRef } from "react";
import type { FormatAction } from "./Toolbar";

export interface UseEditorReturn {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  wrapSelection: (prefix: string, suffix: string) => void;
  insertAtCursor: (text: string) => void;
  handleFormat: (action: FormatAction) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export interface UseEditorOptions {
  value: string;
  onChange: (value: string) => void;
}

/**
 * 用前缀和后缀包裹选中文本
 */
export function wrapSelectionText(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string,
  suffix: string
): { newText: string; newCursorPos: number } {
  const before = text.slice(0, selectionStart);
  const selected = text.slice(selectionStart, selectionEnd);
  const after = text.slice(selectionEnd);

  const newText = before + prefix + selected + suffix + after;
  const newCursorPos = selectionEnd + prefix.length + suffix.length;

  return { newText, newCursorPos };
}

/**
 * 在光标位置插入文本
 */
export function insertTextAtCursor(
  text: string,
  cursorPos: number,
  insertText: string
): { newText: string; newCursorPos: number } {
  const before = text.slice(0, cursorPos);
  const after = text.slice(cursorPos);

  const newText = before + insertText + after;
  const newCursorPos = cursorPos + insertText.length;

  return { newText, newCursorPos };
}

/**
 * 在行首插入文本
 */
export function insertAtLineStart(
  text: string,
  cursorPos: number,
  prefix: string
): { newText: string; newCursorPos: number } {
  // 找到当前行的开始位置
  let lineStart = cursorPos;
  while (lineStart > 0 && text[lineStart - 1] !== "\n") {
    lineStart--;
  }

  const before = text.slice(0, lineStart);
  const after = text.slice(lineStart);

  const newText = before + prefix + after;
  const newCursorPos = cursorPos + prefix.length;

  return { newText, newCursorPos };
}

export function useEditor({ value, onChange }: UseEditorOptions): UseEditorReturn {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const wrapSelection = useCallback(
    (prefix: string, suffix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionStart, selectionEnd } = textarea;
      const { newText, newCursorPos } = wrapSelectionText(
        value,
        selectionStart,
        selectionEnd,
        prefix,
        suffix
      );

      onChange(newText);

      // 恢复焦点和光标位置
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      });
    },
    [value, onChange]
  );

  const insertAtCursor = useCallback(
    (text: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionStart } = textarea;
      const { newText, newCursorPos } = insertTextAtCursor(
        value,
        selectionStart,
        text
      );

      onChange(newText);

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      });
    },
    [value, onChange]
  );

  const handleFormat = useCallback(
    (action: FormatAction) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionStart, selectionEnd } = textarea;
      const hasSelection = selectionStart !== selectionEnd;

      switch (action) {
        case "bold":
          wrapSelection("**", "**");
          break;
        case "italic":
          wrapSelection("*", "*");
          break;
        case "h1":
          if (hasSelection) {
            wrapSelection("# ", "\n");
          } else {
            const { newText, newCursorPos } = insertAtLineStart(
              value,
              selectionStart,
              "# "
            );
            onChange(newText);
            requestAnimationFrame(() => {
              textarea.focus();
              textarea.setSelectionRange(newCursorPos, newCursorPos);
            });
          }
          break;
        case "h2":
          if (hasSelection) {
            wrapSelection("## ", "\n");
          } else {
            const { newText, newCursorPos } = insertAtLineStart(
              value,
              selectionStart,
              "## "
            );
            onChange(newText);
            requestAnimationFrame(() => {
              textarea.focus();
              textarea.setSelectionRange(newCursorPos, newCursorPos);
            });
          }
          break;
        case "h3":
          if (hasSelection) {
            wrapSelection("### ", "\n");
          } else {
            const { newText, newCursorPos } = insertAtLineStart(
              value,
              selectionStart,
              "### "
            );
            onChange(newText);
            requestAnimationFrame(() => {
              textarea.focus();
              textarea.setSelectionRange(newCursorPos, newCursorPos);
            });
          }
          break;
        case "link":
          if (hasSelection) {
            wrapSelection("[", "](url)");
          } else {
            insertAtCursor("[链接文字](url)");
          }
          break;
        case "image":
          insertAtCursor("![图片描述](image-url)");
          break;
        case "code":
          wrapSelection("`", "`");
          break;
        case "codeblock":
          wrapSelection("```\n", "\n```");
          break;
        case "ul":
          if (hasSelection) {
            wrapSelection("- ", "\n");
          } else {
            const { newText, newCursorPos } = insertAtLineStart(
              value,
              selectionStart,
              "- "
            );
            onChange(newText);
            requestAnimationFrame(() => {
              textarea.focus();
              textarea.setSelectionRange(newCursorPos, newCursorPos);
            });
          }
          break;
        case "ol":
          if (hasSelection) {
            wrapSelection("1. ", "\n");
          } else {
            const { newText, newCursorPos } = insertAtLineStart(
              value,
              selectionStart,
              "1. "
            );
            onChange(newText);
            requestAnimationFrame(() => {
              textarea.focus();
              textarea.setSelectionRange(newCursorPos, newCursorPos);
            });
          }
          break;
        case "quote":
          if (hasSelection) {
            wrapSelection("> ", "\n");
          } else {
            const { newText, newCursorPos } = insertAtLineStart(
              value,
              selectionStart,
              "> "
            );
            onChange(newText);
            requestAnimationFrame(() => {
              textarea.focus();
              textarea.setSelectionRange(newCursorPos, newCursorPos);
            });
          }
          break;
        case "table":
          insertAtCursor(
            "\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |\n"
          );
          break;
      }
    },
    [value, onChange, wrapSelection, insertAtCursor]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + B: 粗体
      if (modKey && e.key === "b") {
        e.preventDefault();
        handleFormat("bold");
        return;
      }

      // Ctrl/Cmd + I: 斜体
      if (modKey && e.key === "i") {
        e.preventDefault();
        handleFormat("italic");
        return;
      }

      // Ctrl/Cmd + K: 链接
      if (modKey && e.key === "k") {
        e.preventDefault();
        handleFormat("link");
        return;
      }

      // Ctrl/Cmd + Shift + C: 代码
      if (modKey && e.shiftKey && e.key === "C") {
        e.preventDefault();
        handleFormat("code");
        return;
      }

      // Tab: 缩进
      if (e.key === "Tab") {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (!textarea) return;

        const { selectionStart, selectionEnd } = textarea;
        const { newText, newCursorPos } = insertTextAtCursor(
          value,
          selectionStart,
          "  "
        );

        onChange(newText);
        requestAnimationFrame(() => {
          textarea.focus();
          textarea.setSelectionRange(
            selectionStart + 2,
            selectionEnd + 2
          );
        });
      }
    },
    [handleFormat, value, onChange]
  );

  return {
    textareaRef,
    wrapSelection,
    insertAtCursor,
    handleFormat,
    handleKeyDown,
  };
}
