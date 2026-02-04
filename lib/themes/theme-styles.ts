import type { Theme, ThemeStyles } from "./types";

/**
 * 安全获取样式值，如果不存在则返回默认值
 */
function safeGet<T>(value: T | undefined, defaultValue: T): T {
  return value !== undefined ? value : defaultValue;
}

/**
 * 将主题样式转换为 CSS 字符串
 * 如果主题有自定义 CSS，优先使用自定义 CSS
 */
export function generateThemeCSS(theme: Theme): string {
  // 如果有自定义 CSS，直接返回
  if (theme.customCSS) {
    return theme.customCSS;
  }

  const { styles } = theme;
  
  // 防止 styles 为空
  if (!styles) {
    return '';
  }

  // 使用更高优先级的选择器，确保样式能覆盖 Tailwind 默认样式
  // 注意：使用 background 而不是 background-color，以支持渐变色
  return `
    article.preview-content,
    div.preview-content,
    .preview-content {
      background: ${safeGet(styles.background, '#ffffff')} !important;
      color: ${safeGet(styles.text, '#333333')} !important;
      padding: 2rem !important;
      border-radius: 0.5rem !important;
    }

    article.preview-content h1,
    div.preview-content h1,
    .preview-content h1 {
      color: ${safeGet(styles.h1?.color, '#333333')} !important;
      font-size: ${safeGet(styles.h1?.fontSize, '2em')} !important;
      font-weight: ${safeGet(styles.h1?.fontWeight, '700')} !important;
      line-height: ${safeGet(styles.h1?.lineHeight, '1.3')} !important;
      margin-top: ${safeGet(styles.h1?.marginTop, '0')} !important;
      margin-bottom: ${safeGet(styles.h1?.marginBottom, '0.5em')} !important;
      ${styles.h1?.borderBottom ? `border-bottom: ${styles.h1.borderBottom} !important;` : ""}
      ${styles.h1?.paddingBottom ? `padding-bottom: ${styles.h1.paddingBottom} !important;` : ""}
    }

    article.preview-content h2,
    div.preview-content h2,
    .preview-content h2 {
      color: ${safeGet(styles.h2?.color, '#333333')} !important;
      font-size: ${safeGet(styles.h2?.fontSize, '1.5em')} !important;
      font-weight: ${safeGet(styles.h2?.fontWeight, '700')} !important;
      line-height: ${safeGet(styles.h2?.lineHeight, '1.3')} !important;
      margin-top: ${safeGet(styles.h2?.marginTop, '1em')} !important;
      margin-bottom: ${safeGet(styles.h2?.marginBottom, '0.5em')} !important;
      ${styles.h2?.borderBottom ? `border-bottom: ${styles.h2.borderBottom} !important;` : ""}
      ${styles.h2?.paddingBottom ? `padding-bottom: ${styles.h2.paddingBottom} !important;` : ""}
    }

    article.preview-content h3,
    div.preview-content h3,
    .preview-content h3 {
      color: ${safeGet(styles.h3?.color, '#333333')} !important;
      font-size: ${safeGet(styles.h3?.fontSize, '1.25em')} !important;
      font-weight: ${safeGet(styles.h3?.fontWeight, '600')} !important;
      line-height: ${safeGet(styles.h3?.lineHeight, '1.3')} !important;
      margin-top: ${safeGet(styles.h3?.marginTop, '1em')} !important;
      margin-bottom: ${safeGet(styles.h3?.marginBottom, '0.5em')} !important;
    }

    article.preview-content h4,
    div.preview-content h4,
    .preview-content h4 {
      color: ${safeGet(styles.h4?.color, '#333333')} !important;
      font-size: ${safeGet(styles.h4?.fontSize, '1.1em')} !important;
      font-weight: ${safeGet(styles.h4?.fontWeight, '600')} !important;
      line-height: ${safeGet(styles.h4?.lineHeight, '1.3')} !important;
      margin-top: ${safeGet(styles.h4?.marginTop, '1em')} !important;
      margin-bottom: ${safeGet(styles.h4?.marginBottom, '0.5em')} !important;
    }

    article.preview-content h5,
    div.preview-content h5,
    .preview-content h5 {
      color: ${safeGet(styles.h5?.color, '#333333')} !important;
      font-size: ${safeGet(styles.h5?.fontSize, '1em')} !important;
      font-weight: ${safeGet(styles.h5?.fontWeight, '600')} !important;
      line-height: ${safeGet(styles.h5?.lineHeight, '1.3')} !important;
      margin-top: ${safeGet(styles.h5?.marginTop, '1em')} !important;
      margin-bottom: ${safeGet(styles.h5?.marginBottom, '0.5em')} !important;
    }

    article.preview-content h6,
    div.preview-content h6,
    .preview-content h6 {
      color: ${safeGet(styles.h6?.color, '#666666')} !important;
      font-size: ${safeGet(styles.h6?.fontSize, '0.9em')} !important;
      font-weight: ${safeGet(styles.h6?.fontWeight, '600')} !important;
      line-height: ${safeGet(styles.h6?.lineHeight, '1.3')} !important;
      margin-top: ${safeGet(styles.h6?.marginTop, '1em')} !important;
      margin-bottom: ${safeGet(styles.h6?.marginBottom, '0.5em')} !important;
    }

    article.preview-content p,
    div.preview-content p,
    .preview-content p {
      color: ${safeGet(styles.paragraph?.color, '#333333')} !important;
      font-size: ${safeGet(styles.paragraph?.fontSize, '1em')} !important;
      line-height: ${safeGet(styles.paragraph?.lineHeight, '1.8')} !important;
      margin-bottom: ${safeGet(styles.paragraph?.marginBottom, '1em')} !important;
    }

    article.preview-content a,
    div.preview-content a,
    .preview-content a {
      color: ${safeGet(styles.link?.color, '#0066cc')} !important;
      text-decoration: ${safeGet(styles.link?.textDecoration, 'none')} !important;
    }

    article.preview-content a:hover,
    div.preview-content a:hover,
    .preview-content a:hover {
      text-decoration: underline !important;
    }

    article.preview-content blockquote,
    div.preview-content blockquote,
    .preview-content blockquote {
      background: ${safeGet(styles.blockquote?.background, '#f9f9f9')} !important;
      border-left: ${safeGet(styles.blockquote?.borderLeft, '4px solid #ddd')} !important;
      color: ${safeGet(styles.blockquote?.color, '#666666')} !important;
      padding: ${safeGet(styles.blockquote?.padding, '1em')} !important;
      margin: ${safeGet(styles.blockquote?.margin, '1em 0')} !important;
      font-style: ${safeGet(styles.blockquote?.fontStyle, 'italic')} !important;
    }

    article.preview-content code,
    div.preview-content code,
    .preview-content code {
      background: ${safeGet(styles.code?.background, '#f5f5f5')} !important;
      color: ${safeGet(styles.code?.color, '#c7254e')} !important;
      padding: ${safeGet(styles.code?.padding, '0.2em 0.4em')} !important;
      border-radius: ${safeGet(styles.code?.borderRadius, '3px')} !important;
      font-family: ${safeGet(styles.code?.fontFamily, 'Consolas, Monaco, monospace')} !important;
      font-size: ${safeGet(styles.code?.fontSize, '0.9em')} !important;
      white-space: pre-wrap !important;
      word-wrap: break-word !important;
      word-break: break-all !important;
    }

    article.preview-content code.code-inline,
    div.preview-content code.code-inline,
    .preview-content code.code-inline {
      display: inline !important;
    }

    article.preview-content pre,
    div.preview-content pre,
    .preview-content pre {
      margin: 1em 0 !important;
      padding: 0 !important;
      background: transparent !important;
      border-radius: 0 !important;
      overflow: visible !important;
    }

    /* 微信公众号兼容：伪元素已转换为实际 DOM 元素 */

    article.preview-content pre code,
    div.preview-content pre code,
    .preview-content pre code {
      display: block !important;
      background: ${safeGet(styles.codeBlock?.background, '#f6f8fa')} !important;
      color: ${safeGet(styles.codeBlock?.color, '#24292e')} !important;
      padding: ${safeGet(styles.codeBlock?.padding, '1em')} !important;
      border-radius: ${safeGet(styles.codeBlock?.borderRadius, '6px')} !important;
      font-family: ${safeGet(styles.codeBlock?.fontFamily, 'Consolas, Monaco, monospace')} !important;
      font-size: ${safeGet(styles.codeBlock?.fontSize, '0.9em')} !important;
      line-height: ${safeGet(styles.codeBlock?.lineHeight, '1.5')} !important;
      overflow-x: auto !important;
      white-space: pre !important;
      word-wrap: normal !important;
    }

    article.preview-content pre code.hljs,
    div.preview-content pre code.hljs,
    .preview-content pre code.hljs {
      background: #f6f8fa !important;
      color: #24292e !important;
    }

    article.preview-content ul,
    article.preview-content ol,
    div.preview-content ul,
    div.preview-content ol,
    .preview-content ul,
    .preview-content ol {
      color: ${safeGet(styles.list?.color, '#333333')} !important;
      margin-left: ${safeGet(styles.list?.marginLeft, '2em')} !important;
      margin-bottom: ${safeGet(styles.list?.marginBottom, '1em')} !important;
      line-height: ${safeGet(styles.list?.lineHeight, '1.8')} !important;
    }

    article.preview-content table,
    div.preview-content table,
    .preview-content table {
      border-collapse: collapse !important;
      width: 100% !important;
      margin: 1em 0 !important;
    }

    article.preview-content th,
    article.preview-content td,
    div.preview-content th,
    div.preview-content td,
    .preview-content th,
    .preview-content td {
      border: 1px solid ${safeGet(styles.table?.borderColor, '#ddd')} !important;
      padding: ${safeGet(styles.table?.cellPadding, '0.5em 1em')} !important;
      text-align: left !important;
    }

    article.preview-content th,
    div.preview-content th,
    .preview-content th {
      background: ${safeGet(styles.table?.headerBackground, '#f5f5f5')} !important;
      color: ${safeGet(styles.table?.headerColor, '#333333')} !important;
      font-weight: 600 !important;
    }

    article.preview-content tr:nth-child(even),
    div.preview-content tr:nth-child(even),
    .preview-content tr:nth-child(even) {
      background: ${safeGet(styles.table?.evenRowBackground, 'transparent')} !important;
    }

    article.preview-content img,
    div.preview-content img,
    .preview-content img {
      max-width: ${safeGet(styles.image?.maxWidth, '100%')} !important;
      border-radius: ${safeGet(styles.image?.borderRadius, '4px')} !important;
      margin: ${safeGet(styles.image?.margin, '1em 0')} !important;
    }

    article.preview-content hr,
    div.preview-content hr,
    .preview-content hr {
      border: none !important;
      border-top: ${safeGet(styles.hr?.border, '1px solid #ddd')} !important;
      margin: ${safeGet(styles.hr?.margin, '2em 0')} !important;
    }
  `;
}

/**
 * 获取元素的行内样式对象
 */
export function getInlineStyles(
  element: string,
  styles: ThemeStyles
): Record<string, string> {
  switch (element) {
    case "h1":
      return {
        color: styles.h1.color,
        fontSize: styles.h1.fontSize,
        fontWeight: styles.h1.fontWeight,
        lineHeight: styles.h1.lineHeight,
        marginTop: styles.h1.marginTop,
        marginBottom: styles.h1.marginBottom,
        ...(styles.h1.borderBottom && { borderBottom: styles.h1.borderBottom }),
        ...(styles.h1.paddingBottom && { paddingBottom: styles.h1.paddingBottom }),
      };
    case "h2":
      return {
        color: styles.h2.color,
        fontSize: styles.h2.fontSize,
        fontWeight: styles.h2.fontWeight,
        lineHeight: styles.h2.lineHeight,
        marginTop: styles.h2.marginTop,
        marginBottom: styles.h2.marginBottom,
        ...(styles.h2.borderBottom && { borderBottom: styles.h2.borderBottom }),
        ...(styles.h2.paddingBottom && { paddingBottom: styles.h2.paddingBottom }),
      };
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      const headingStyles = styles[element as keyof ThemeStyles] as typeof styles.h3;
      return {
        color: headingStyles.color,
        fontSize: headingStyles.fontSize,
        fontWeight: headingStyles.fontWeight,
        lineHeight: headingStyles.lineHeight,
        marginTop: headingStyles.marginTop,
        marginBottom: headingStyles.marginBottom,
      };
    case "p":
      return {
        color: styles.paragraph.color,
        fontSize: styles.paragraph.fontSize,
        lineHeight: styles.paragraph.lineHeight,
        marginBottom: styles.paragraph.marginBottom,
      };
    case "a":
      return {
        color: styles.link.color,
        textDecoration: styles.link.textDecoration,
      };
    case "blockquote":
      return {
        background: styles.blockquote.background,
        borderLeft: styles.blockquote.borderLeft,
        color: styles.blockquote.color,
        padding: styles.blockquote.padding,
        margin: styles.blockquote.margin,
        fontStyle: styles.blockquote.fontStyle,
      };
    case "code":
      return {
        background: styles.code.background,
        color: styles.code.color,
        padding: styles.code.padding,
        borderRadius: styles.code.borderRadius,
        fontFamily: styles.code.fontFamily,
        fontSize: styles.code.fontSize,
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
        wordBreak: "break-all",
      };
    case "pre":
      return {
        background: styles.codeBlock.background,
        color: styles.codeBlock.color,
        padding: styles.codeBlock.padding,
        borderRadius: styles.codeBlock.borderRadius,
        fontFamily: styles.codeBlock.fontFamily,
        fontSize: styles.codeBlock.fontSize,
        lineHeight: styles.codeBlock.lineHeight,
        overflow: styles.codeBlock.overflow,
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
      };
    case "ul":
    case "ol":
      return {
        color: styles.list.color,
        marginLeft: styles.list.marginLeft,
        marginBottom: styles.list.marginBottom,
        lineHeight: styles.list.lineHeight,
      };
    case "table":
      return {
        borderCollapse: "collapse",
        width: "100%",
        margin: "1em 0",
      };
    case "th":
      return {
        border: `1px solid ${styles.table.borderColor}`,
        padding: styles.table.cellPadding,
        textAlign: "left",
        background: styles.table.headerBackground,
        color: styles.table.headerColor,
        fontWeight: "600",
      };
    case "td":
      return {
        border: `1px solid ${styles.table.borderColor}`,
        padding: styles.table.cellPadding,
        textAlign: "left",
      };
    case "img":
      return {
        maxWidth: styles.image.maxWidth,
        borderRadius: styles.image.borderRadius,
        margin: styles.image.margin,
      };
    case "hr":
      return {
        border: "none",
        borderTop: styles.hr.border,
        margin: styles.hr.margin,
      };
    default:
      return {};
  }
}
