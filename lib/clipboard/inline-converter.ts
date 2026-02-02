import type { Theme, ThemeStyles } from "@/lib/themes/types";

/**
 * 将样式对象转换为行内样式字符串
 */
function styleObjectToString(styles: Record<string, string | undefined>): string {
  return Object.entries(styles)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      // 将 camelCase 转换为 kebab-case
      const kebabKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${kebabKey}: ${value}`;
    })
    .join("; ");
}

/**
 * 获取元素的行内样式
 */
function getElementStyles(
  tagName: string,
  styles: ThemeStyles,
  isEvenRow?: boolean
): string {
  switch (tagName.toLowerCase()) {
    case "h1":
      return styleObjectToString({
        color: styles.h1.color,
        fontSize: styles.h1.fontSize,
        fontWeight: styles.h1.fontWeight,
        lineHeight: styles.h1.lineHeight,
        marginTop: styles.h1.marginTop,
        marginBottom: styles.h1.marginBottom,
        borderBottom: styles.h1.borderBottom,
        paddingBottom: styles.h1.paddingBottom,
      });
    case "h2":
      return styleObjectToString({
        color: styles.h2.color,
        fontSize: styles.h2.fontSize,
        fontWeight: styles.h2.fontWeight,
        lineHeight: styles.h2.lineHeight,
        marginTop: styles.h2.marginTop,
        marginBottom: styles.h2.marginBottom,
        borderBottom: styles.h2.borderBottom,
        paddingBottom: styles.h2.paddingBottom,
      });
    case "h3":
      return styleObjectToString({
        color: styles.h3.color,
        fontSize: styles.h3.fontSize,
        fontWeight: styles.h3.fontWeight,
        lineHeight: styles.h3.lineHeight,
        marginTop: styles.h3.marginTop,
        marginBottom: styles.h3.marginBottom,
      });
    case "h4":
      return styleObjectToString({
        color: styles.h4.color,
        fontSize: styles.h4.fontSize,
        fontWeight: styles.h4.fontWeight,
        lineHeight: styles.h4.lineHeight,
        marginTop: styles.h4.marginTop,
        marginBottom: styles.h4.marginBottom,
      });
    case "h5":
      return styleObjectToString({
        color: styles.h5.color,
        fontSize: styles.h5.fontSize,
        fontWeight: styles.h5.fontWeight,
        lineHeight: styles.h5.lineHeight,
        marginTop: styles.h5.marginTop,
        marginBottom: styles.h5.marginBottom,
      });
    case "h6":
      return styleObjectToString({
        color: styles.h6.color,
        fontSize: styles.h6.fontSize,
        fontWeight: styles.h6.fontWeight,
        lineHeight: styles.h6.lineHeight,
        marginTop: styles.h6.marginTop,
        marginBottom: styles.h6.marginBottom,
      });
    case "p":
      return styleObjectToString({
        color: styles.paragraph.color,
        fontSize: styles.paragraph.fontSize,
        lineHeight: styles.paragraph.lineHeight,
        marginBottom: styles.paragraph.marginBottom,
      });
    case "a":
      return styleObjectToString({
        color: styles.link.color,
        textDecoration: styles.link.textDecoration,
      });
    case "blockquote":
      return styleObjectToString({
        background: styles.blockquote.background,
        borderLeft: styles.blockquote.borderLeft,
        color: styles.blockquote.color,
        padding: styles.blockquote.padding,
        margin: styles.blockquote.margin,
        fontStyle: styles.blockquote.fontStyle,
      });
    case "code":
      return styleObjectToString({
        background: styles.code.background,
        color: styles.code.color,
        padding: styles.code.padding,
        borderRadius: styles.code.borderRadius,
        fontFamily: styles.code.fontFamily,
        fontSize: styles.code.fontSize,
      });
    case "pre":
      return styleObjectToString({
        background: styles.codeBlock.background,
        color: styles.codeBlock.color,
        padding: styles.codeBlock.padding,
        borderRadius: styles.codeBlock.borderRadius,
        fontFamily: styles.codeBlock.fontFamily,
        fontSize: styles.codeBlock.fontSize,
        lineHeight: styles.codeBlock.lineHeight,
        overflow: styles.codeBlock.overflow,
      });
    case "ul":
    case "ol":
      return styleObjectToString({
        color: styles.list.color,
        marginLeft: styles.list.marginLeft,
        marginBottom: styles.list.marginBottom,
        lineHeight: styles.list.lineHeight,
      });
    case "li":
      return styleObjectToString({
        color: styles.list.color,
        lineHeight: styles.list.lineHeight,
      });
    case "table":
      return styleObjectToString({
        borderCollapse: "collapse",
        width: "100%",
        margin: "1em 0",
      });
    case "th":
      return styleObjectToString({
        border: `1px solid ${styles.table.borderColor}`,
        padding: styles.table.cellPadding,
        textAlign: "left",
        background: styles.table.headerBackground,
        color: styles.table.headerColor,
        fontWeight: "600",
      });
    case "td":
      return styleObjectToString({
        border: `1px solid ${styles.table.borderColor}`,
        padding: styles.table.cellPadding,
        textAlign: "left",
        background: isEvenRow ? styles.table.evenRowBackground : undefined,
      });
    case "img":
      return styleObjectToString({
        maxWidth: styles.image.maxWidth,
        borderRadius: styles.image.borderRadius,
        margin: styles.image.margin,
      });
    case "hr":
      return styleObjectToString({
        border: "none",
        borderTop: styles.hr.border,
        margin: styles.hr.margin,
      });
    case "strong":
    case "b":
      return "font-weight: bold";
    case "em":
    case "i":
      return "font-style: italic";
    default:
      return "";
  }
}

/**
 * 将行内代码内容分割为带 span 的 HTML，支持在标点处换行
 * 例如: "java,cpp,css" -> "<span>java</span><span>,</span><span>cpp</span><span>,</span><span>css</span>"
 */
function splitCodeContent(text: string): string {
  // 匹配标点符号（逗号、分号、冒号、点、斜杠等）
  const parts = text.split(/([,;:.\/\\|])/g);
  
  return parts
    .filter(part => part !== "")
    .map(part => {
      // 标点符号使用 pun 类，其他使用 pln 类
      const isPunctuation = /^[,;:.\/\\|]$/.test(part);
      const className = isPunctuation ? "pun" : "pln";
      return `<span class="${className}">${part}</span>`;
    })
    .join("");
}

/**
 * 递归处理 DOM 节点，添加行内样式
 */
function processNode(
  node: Node,
  styles: ThemeStyles,
  rowIndex?: number
): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const element = node as Element;
  const tagName = element.tagName.toLowerCase();

  // 跳过 script 和 style 标签
  if (tagName === "script" || tagName === "style") {
    return "";
  }

  // 获取行内样式
  const isEvenRow = tagName === "tr" && rowIndex !== undefined && rowIndex % 2 === 1;
  const inlineStyle = getElementStyles(tagName, styles, isEvenRow);

  // 特殊处理行内 code 元素（不在 pre 内的 code）
  if (tagName === "code" && element.parentElement?.tagName.toLowerCase() !== "pre") {
    const textContent = element.textContent || "";
    const splitContent = splitCodeContent(textContent);
    const styleAttr = inlineStyle ? ` style="${inlineStyle}"` : "";
    return `<code class="prettyprint code-in-text prettyprinted"${styleAttr}>${splitContent}</code>`;
  }

  // 处理子节点
  let childRowIndex = 0;
  const childContent = Array.from(element.childNodes)
    .map((child) => {
      if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName.toLowerCase() === "tr") {
        return processNode(child, styles, childRowIndex++);
      }
      return processNode(child, styles);
    })
    .join("");

  // 构建带行内样式的 HTML
  const attributes = Array.from(element.attributes)
    .filter((attr) => attr.name !== "class" && attr.name !== "style")
    .map((attr) => `${attr.name}="${attr.value}"`)
    .join(" ");

  const styleAttr = inlineStyle ? ` style="${inlineStyle}"` : "";
  const attrsStr = attributes ? ` ${attributes}` : "";

  // 自闭合标签
  if (["img", "br", "hr", "input"].includes(tagName)) {
    return `<${tagName}${attrsStr}${styleAttr} />`;
  }

  return `<${tagName}${attrsStr}${styleAttr}>${childContent}</${tagName}>`;
}

/**
 * 将 HTML 转换为带行内样式的 HTML
 * @param html - 原始 HTML
 * @param theme - 主题对象
 * @returns 带行内样式的 HTML
 */
export function convertToInlineStyles(html: string, theme: Theme): string {
  // 创建临时 DOM 解析 HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // 添加容器样式
  const containerStyle = styleObjectToString({
    backgroundColor: theme.styles.background,
    color: theme.styles.text,
    padding: "1rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
  });

  // 处理所有子节点
  const content = Array.from(doc.body.childNodes)
    .map((node) => processNode(node, theme.styles))
    .join("");

  return `<div style="${containerStyle}">${content}</div>`;
}

/**
 * 检查 HTML 是否包含行内样式
 */
export function hasInlineStyles(html: string): boolean {
  return /style="[^"]+"/i.test(html);
}
