"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * 选中文本的样式状态
 */
export interface SelectionStyle {
  isBold: boolean;
  isItalic: boolean;
  isStrikethrough: boolean;
  isCode: boolean;
  isLink: boolean;
  isQuote: boolean;
  textColor: string | null;
  backgroundColor: string | null;
  headingLevel: number | null; // 1-6 或 null
}

const defaultStyle: SelectionStyle = {
  isBold: false,
  isItalic: false,
  isStrikethrough: false,
  isCode: false,
  isLink: false,
  isQuote: false,
  textColor: null,
  backgroundColor: null,
  headingLevel: null,
};

/**
 * 从选中的文本中提取样式信息
 */
function parseSelectionStyle(text: string, fullText: string, selectionStart: number): SelectionStyle {
  const style = { ...defaultStyle };
  
  if (!text) return style;
  
  // 检查粗体 **text** 或 __text__
  if (/^\*\*.*\*\*$/.test(text) || /^__.*__$/.test(text)) {
    style.isBold = true;
  }
  // 检查是否在粗体标记内
  const beforeText = fullText.slice(0, selectionStart);
  const afterText = fullText.slice(selectionStart + text.length);
  if ((beforeText.endsWith('**') && afterText.startsWith('**')) ||
      (beforeText.endsWith('__') && afterText.startsWith('__'))) {
    style.isBold = true;
  }
  
  // 检查斜体 *text* 或 _text_（但不是 ** 或 __）
  if (/^\*[^*].*[^*]\*$/.test(text) || /^_[^_].*[^_]_$/.test(text)) {
    style.isItalic = true;
  }
  if ((beforeText.endsWith('*') && !beforeText.endsWith('**') && afterText.startsWith('*') && !afterText.startsWith('**')) ||
      (beforeText.endsWith('_') && !beforeText.endsWith('__') && afterText.startsWith('_') && !afterText.startsWith('__'))) {
    style.isItalic = true;
  }
  
  // 检查删除线 ~~text~~
  if (/^~~.*~~$/.test(text)) {
    style.isStrikethrough = true;
  }
  if (beforeText.endsWith('~~') && afterText.startsWith('~~')) {
    style.isStrikethrough = true;
  }
  
  // 检查行内代码 `text`
  if (/^`[^`].*[^`]`$/.test(text) || /^`[^`]`$/.test(text)) {
    style.isCode = true;
  }
  if (beforeText.endsWith('`') && afterText.startsWith('`')) {
    style.isCode = true;
  }
  
  // 检查链接 [text](url)
  if (/^\[.*\]\(.*\)$/.test(text)) {
    style.isLink = true;
  }
  
  // 检查引用（行首 >）
  const lineStart = fullText.lastIndexOf('\n', selectionStart - 1) + 1;
  const lineText = fullText.slice(lineStart, selectionStart);
  if (/^>\s*/.test(lineText) || /^>\s*/.test(fullText.slice(lineStart))) {
    style.isQuote = true;
  }
  
  // 检查标题级别
  const headingMatch = fullText.slice(lineStart).match(/^(#{1,6})\s/);
  if (headingMatch) {
    style.headingLevel = headingMatch[1].length;
  }
  
  // 检查文字颜色 <span style="color: #xxx">
  const colorMatch = text.match(/<span\s+style="[^"]*color:\s*([^;"]+)/i) ||
                     beforeText.match(/<span\s+style="[^"]*color:\s*([^;"]+)[^>]*>$/i);
  if (colorMatch) {
    style.textColor = colorMatch[1].trim();
  }
  
  // 检查背景颜色 <span style="background: #xxx">
  const bgMatch = text.match(/<span\s+style="[^"]*background:\s*([^;"]+)/i) ||
                  beforeText.match(/<span\s+style="[^"]*background:\s*([^;"]+)[^>]*>$/i);
  if (bgMatch) {
    style.backgroundColor = bgMatch[1].trim();
  }
  
  return style;
}

/**
 * 监听选中文本样式的 Hook
 */
export function useSelectionStyle(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
): SelectionStyle {
  const [style, setStyle] = useState<SelectionStyle>(defaultStyle);
  
  const updateStyle = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.slice(selectionStart, selectionEnd);
    
    const newStyle = parseSelectionStyle(selectedText, value, selectionStart);
    setStyle(newStyle);
  }, [textareaRef]);
  
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // 监听选择变化
    const handleSelectionChange = () => {
      // 检查焦点是否在 textarea 上
      if (document.activeElement === textarea) {
        updateStyle();
      }
    };
    
    // 监听键盘和鼠标事件
    textarea.addEventListener('select', updateStyle);
    textarea.addEventListener('click', updateStyle);
    textarea.addEventListener('keyup', updateStyle);
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      textarea.removeEventListener('select', updateStyle);
      textarea.removeEventListener('click', updateStyle);
      textarea.removeEventListener('keyup', updateStyle);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [textareaRef, updateStyle]);
  
  return style;
}
