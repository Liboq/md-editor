import type { Theme, ThemeStyles } from "./types";

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

  return `
    .preview-content {
      background-color: ${styles.background};
      color: ${styles.text};
      padding: 1rem;
    }

    .preview-content h1 {
      color: ${styles.h1.color};
      font-size: ${styles.h1.fontSize};
      font-weight: ${styles.h1.fontWeight};
      line-height: ${styles.h1.lineHeight};
      margin-top: ${styles.h1.marginTop};
      margin-bottom: ${styles.h1.marginBottom};
      ${styles.h1.borderBottom ? `border-bottom: ${styles.h1.borderBottom};` : ""}
      ${styles.h1.paddingBottom ? `padding-bottom: ${styles.h1.paddingBottom};` : ""}
    }

    .preview-content h2 {
      color: ${styles.h2.color};
      font-size: ${styles.h2.fontSize};
      font-weight: ${styles.h2.fontWeight};
      line-height: ${styles.h2.lineHeight};
      margin-top: ${styles.h2.marginTop};
      margin-bottom: ${styles.h2.marginBottom};
      ${styles.h2.borderBottom ? `border-bottom: ${styles.h2.borderBottom};` : ""}
      ${styles.h2.paddingBottom ? `padding-bottom: ${styles.h2.paddingBottom};` : ""}
    }

    .preview-content h3 {
      color: ${styles.h3.color};
      font-size: ${styles.h3.fontSize};
      font-weight: ${styles.h3.fontWeight};
      line-height: ${styles.h3.lineHeight};
      margin-top: ${styles.h3.marginTop};
      margin-bottom: ${styles.h3.marginBottom};
    }

    .preview-content h4 {
      color: ${styles.h4.color};
      font-size: ${styles.h4.fontSize};
      font-weight: ${styles.h4.fontWeight};
      line-height: ${styles.h4.lineHeight};
      margin-top: ${styles.h4.marginTop};
      margin-bottom: ${styles.h4.marginBottom};
    }

    .preview-content h5 {
      color: ${styles.h5.color};
      font-size: ${styles.h5.fontSize};
      font-weight: ${styles.h5.fontWeight};
      line-height: ${styles.h5.lineHeight};
      margin-top: ${styles.h5.marginTop};
      margin-bottom: ${styles.h5.marginBottom};
    }

    .preview-content h6 {
      color: ${styles.h6.color};
      font-size: ${styles.h6.fontSize};
      font-weight: ${styles.h6.fontWeight};
      line-height: ${styles.h6.lineHeight};
      margin-top: ${styles.h6.marginTop};
      margin-bottom: ${styles.h6.marginBottom};
    }

    .preview-content p {
      color: ${styles.paragraph.color};
      font-size: ${styles.paragraph.fontSize};
      line-height: ${styles.paragraph.lineHeight};
      margin-bottom: ${styles.paragraph.marginBottom};
    }

    .preview-content a {
      color: ${styles.link.color};
      text-decoration: ${styles.link.textDecoration};
    }

    .preview-content a:hover {
      text-decoration: underline;
    }

    .preview-content blockquote {
      background: ${styles.blockquote.background};
      border-left: ${styles.blockquote.borderLeft};
      color: ${styles.blockquote.color};
      padding: ${styles.blockquote.padding};
      margin: ${styles.blockquote.margin};
      font-style: ${styles.blockquote.fontStyle};
    }

    .preview-content code {
      background: ${styles.code.background};
      color: ${styles.code.color};
      padding: ${styles.code.padding};
      border-radius: ${styles.code.borderRadius};
      font-family: ${styles.code.fontFamily};
      font-size: ${styles.code.fontSize};
      white-space: pre-wrap;
      word-wrap: break-word;
      word-break: break-all;
    }

    .preview-content code.code-inline {
      display: inline;
    }

    .preview-content code.code-inline .pln,
    .preview-content code.code-inline .pun {
      display: inline;
    }

    .preview-content pre {
      background: ${styles.codeBlock.background};
      color: ${styles.codeBlock.color};
      padding: ${styles.codeBlock.padding};
      border-radius: ${styles.codeBlock.borderRadius};
      font-family: ${styles.codeBlock.fontFamily};
      font-size: ${styles.codeBlock.fontSize};
      line-height: ${styles.codeBlock.lineHeight};
      overflow: ${styles.codeBlock.overflow};
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .preview-content pre code {
      background: transparent;
      color: inherit;
      padding: 0;
      border-radius: 0;
    }

    .preview-content ul,
    .preview-content ol {
      color: ${styles.list.color};
      margin-left: ${styles.list.marginLeft};
      margin-bottom: ${styles.list.marginBottom};
      line-height: ${styles.list.lineHeight};
    }

    .preview-content table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }

    .preview-content th,
    .preview-content td {
      border: 1px solid ${styles.table.borderColor};
      padding: ${styles.table.cellPadding};
      text-align: left;
    }

    .preview-content th {
      background: ${styles.table.headerBackground};
      color: ${styles.table.headerColor};
      font-weight: 600;
    }

    .preview-content tr:nth-child(even) {
      background: ${styles.table.evenRowBackground || "transparent"};
    }

    .preview-content img {
      max-width: ${styles.image.maxWidth};
      border-radius: ${styles.image.borderRadius};
      margin: ${styles.image.margin};
    }

    .preview-content hr {
      border: none;
      border-top: ${styles.hr.border};
      margin: ${styles.hr.margin};
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
