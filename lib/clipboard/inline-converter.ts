import type { Theme, ThemeStyles } from "@/lib/themes/types";

/**
 * 安全获取嵌套属性
 */
function safeGet<T>(obj: T | undefined, defaultValue: T): T {
  return obj !== undefined ? obj : defaultValue;
}

/**
 * 微信公众号兼容性处理：移除或转换不支持的 CSS 属性
 * 
 * 微信公众号不支持：
 * - 伪元素 (::before, ::after)
 * - 渐变 (linear-gradient, radial-gradient)
 * - position: absolute/fixed
 * - 某些 CSS3 属性
 */

/**
 * 处理背景色，确保微信兼容
 * 渐变会被转换为纯色（提取第一个颜色）
 */
function sanitizeBackground(value: string | undefined): string {
  if (!value) return '#ffffff';
  
  // 渐变转纯色
  if (value.includes('gradient')) {
    const colorMatch = value.match(/#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|rgba\([^)]+\)/);
    return colorMatch ? colorMatch[0] : '#ffffff';
  }
  
  return value;
}

/**
 * 从 CSS 字符串中提取指定选择器的样式
 */
function extractStylesFromCSS(css: string, selector: string): Record<string, string> {
  const styles: Record<string, string> = {};
  
  // 转义选择器中的特殊字符
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // 匹配选择器及其样式块
  const regex = new RegExp(`${escapedSelector}\\s*\\{([^}]+)\\}`, 'gi');
  const match = regex.exec(css);
  
  if (match && match[1]) {
    // 解析样式声明
    const declarations = match[1].split(';');
    for (const decl of declarations) {
      const [property, value] = decl.split(':').map(s => s.trim());
      if (property && value) {
        // 将 kebab-case 转换为 camelCase
        const camelProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        styles[camelProperty] = value;
      }
    }
  }
  
  return styles;
}

/**
 * 从 customCSS 中解析出 ThemeStyles 对象
 */
function parseCustomCSSToStyles(css: string): Partial<ThemeStyles> & { strong?: Record<string, string> } {
  const containerStyles = extractStylesFromCSS(css, '.preview-content');
  const h1Styles = extractStylesFromCSS(css, '.preview-content h1');
  const h2Styles = extractStylesFromCSS(css, '.preview-content h2');
  const h3Styles = extractStylesFromCSS(css, '.preview-content h3');
  const h4Styles = extractStylesFromCSS(css, '.preview-content h4');
  const h5Styles = extractStylesFromCSS(css, '.preview-content h5');
  const h6Styles = extractStylesFromCSS(css, '.preview-content h6');
  const pStyles = extractStylesFromCSS(css, '.preview-content p');
  const aStyles = extractStylesFromCSS(css, '.preview-content a');
  const blockquoteStyles = extractStylesFromCSS(css, '.preview-content blockquote');
  const codeStyles = extractStylesFromCSS(css, '.preview-content code');
  const preStyles = extractStylesFromCSS(css, '.preview-content pre');
  const ulStyles = extractStylesFromCSS(css, '.preview-content ul');
  const thStyles = extractStylesFromCSS(css, '.preview-content th');
  const tdStyles = extractStylesFromCSS(css, '.preview-content td');
  const imgStyles = extractStylesFromCSS(css, '.preview-content img');
  const hrStyles = extractStylesFromCSS(css, '.preview-content hr');
  const strongStyles = extractStylesFromCSS(css, '.preview-content strong');
  const emStyles = extractStylesFromCSS(css, '.preview-content em');
  
  return {
    background: containerStyles.backgroundColor || containerStyles.background,
    text: containerStyles.color,
    h1: {
      color: h1Styles.color || '',
      fontSize: h1Styles.fontSize || '2em',
      fontWeight: h1Styles.fontWeight || '600',
      lineHeight: h1Styles.lineHeight || '1.3',
      marginTop: h1Styles.marginTop || '1.5em',
      marginBottom: h1Styles.marginBottom || '0.5em',
      borderBottom: h1Styles.borderBottom,
      paddingBottom: h1Styles.paddingBottom,
    },
    h2: {
      color: h2Styles.color || '',
      fontSize: h2Styles.fontSize || '1.5em',
      fontWeight: h2Styles.fontWeight || '600',
      lineHeight: h2Styles.lineHeight || '1.3',
      marginTop: h2Styles.marginTop || '1.5em',
      marginBottom: h2Styles.marginBottom || '0.5em',
      borderBottom: h2Styles.borderBottom,
      paddingBottom: h2Styles.paddingBottom,
    },
    h3: {
      color: h3Styles.color || '',
      fontSize: h3Styles.fontSize || '1.25em',
      fontWeight: h3Styles.fontWeight || '600',
      lineHeight: h3Styles.lineHeight || '1.3',
      marginTop: h3Styles.marginTop || '1.5em',
      marginBottom: h3Styles.marginBottom || '0.5em',
    },
    h4: {
      color: h4Styles.color || '',
      fontSize: h4Styles.fontSize || '1.1em',
      fontWeight: h4Styles.fontWeight || '600',
      lineHeight: h4Styles.lineHeight || '1.3',
      marginTop: h4Styles.marginTop || '1.5em',
      marginBottom: h4Styles.marginBottom || '0.5em',
    },
    h5: {
      color: h5Styles.color || '',
      fontSize: h5Styles.fontSize || '1em',
      fontWeight: h5Styles.fontWeight || '600',
      lineHeight: h5Styles.lineHeight || '1.3',
      marginTop: h5Styles.marginTop || '1.5em',
      marginBottom: h5Styles.marginBottom || '0.5em',
    },
    h6: {
      color: h6Styles.color || '#666666',
      fontSize: h6Styles.fontSize || '0.9em',
      fontWeight: h6Styles.fontWeight || '600',
      lineHeight: h6Styles.lineHeight || '1.3',
      marginTop: h6Styles.marginTop || '1.5em',
      marginBottom: h6Styles.marginBottom || '0.5em',
    },
    paragraph: {
      color: pStyles.color || '',
      fontSize: pStyles.fontSize || '16px',
      lineHeight: pStyles.lineHeight || '1.8',
      marginBottom: pStyles.marginBottom || '1em',
    },
    link: {
      color: aStyles.color || '#0066cc',
      textDecoration: aStyles.textDecoration || 'none',
    },
    blockquote: {
      background: blockquoteStyles.background || '#f9f9f9',
      borderLeft: blockquoteStyles.borderLeft || '4px solid #ddd',
      color: blockquoteStyles.color || '#666666',
      padding: blockquoteStyles.padding || '1em',
      margin: blockquoteStyles.margin || '1em 0',
      fontStyle: blockquoteStyles.fontStyle || 'italic',
    },
    code: {
      background: codeStyles.background || '#f4f4f4',
      color: codeStyles.color || '#c7254e',
      padding: codeStyles.padding || '2px 6px',
      borderRadius: codeStyles.borderRadius || '3px',
      fontFamily: codeStyles.fontFamily || 'Consolas, Monaco, monospace',
      fontSize: codeStyles.fontSize || '0.9em',
    },
    codeBlock: {
      background: preStyles.background || '#f4f4f4',
      color: preStyles.color || '#333333',
      padding: preStyles.padding || '1em',
      borderRadius: preStyles.borderRadius || '6px',
      fontFamily: preStyles.fontFamily || 'Consolas, Monaco, monospace',
      fontSize: preStyles.fontSize || '0.9em',
      lineHeight: preStyles.lineHeight || '1.5',
      overflow: preStyles.overflow || 'auto',
    },
    list: {
      color: ulStyles.color || '',
      marginLeft: ulStyles.marginLeft || '1.5em',
      marginBottom: ulStyles.marginBottom || '1em',
      lineHeight: ulStyles.lineHeight || '1.8',
    },
    table: {
      borderColor: '#ddd',
      headerBackground: thStyles.background || '#f4f4f4',
      headerColor: thStyles.color || '',
      cellPadding: thStyles.padding || tdStyles.padding || '8px 12px',
      evenRowBackground: '#fafafa',
    },
    image: {
      maxWidth: imgStyles.maxWidth || '100%',
      borderRadius: imgStyles.borderRadius || '4px',
      margin: imgStyles.margin || '1em 0',
    },
    hr: {
      border: hrStyles.borderTop || hrStyles.border || '1px solid #e5e5e5',
      margin: hrStyles.margin || '2em 0',
    },
    // 额外样式（不在 ThemeStyles 类型中）
    strong: strongStyles,
    em: emStyles,
  } as Partial<ThemeStyles> & { strong?: Record<string, string>; em?: Record<string, string> };
}

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
  isEvenRow?: boolean,
  extraStyles?: { strong?: Record<string, string>; em?: Record<string, string> }
): string {
  // 默认样式值
  const defaults = {
    heading: {
      color: "#333333",
      fontSize: "1em",
      fontWeight: "600",
      lineHeight: "1.3",
      marginTop: "1em",
      marginBottom: "0.5em",
    },
    paragraph: {
      color: "#333333",
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
      color: "#333333",
      marginLeft: "1.5em",
      marginBottom: "1em",
      lineHeight: "1.8",
    },
    table: {
      borderColor: "#ddd",
      headerBackground: "#f4f4f4",
      headerColor: "#333333",
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
  };

  switch (tagName.toLowerCase()) {
    case "h1":
      return styleObjectToString({
        color: safeGet(styles.h1?.color, defaults.heading.color),
        fontSize: safeGet(styles.h1?.fontSize, "2em"),
        fontWeight: safeGet(styles.h1?.fontWeight, defaults.heading.fontWeight),
        lineHeight: safeGet(styles.h1?.lineHeight, defaults.heading.lineHeight),
        marginTop: safeGet(styles.h1?.marginTop, defaults.heading.marginTop),
        marginBottom: safeGet(styles.h1?.marginBottom, defaults.heading.marginBottom),
        borderBottom: styles.h1?.borderBottom,
        paddingBottom: styles.h1?.paddingBottom,
      });
    case "h2":
      return styleObjectToString({
        color: safeGet(styles.h2?.color, defaults.heading.color),
        fontSize: safeGet(styles.h2?.fontSize, "1.5em"),
        fontWeight: safeGet(styles.h2?.fontWeight, defaults.heading.fontWeight),
        lineHeight: safeGet(styles.h2?.lineHeight, defaults.heading.lineHeight),
        marginTop: safeGet(styles.h2?.marginTop, defaults.heading.marginTop),
        marginBottom: safeGet(styles.h2?.marginBottom, defaults.heading.marginBottom),
        borderBottom: styles.h2?.borderBottom,
        paddingBottom: styles.h2?.paddingBottom,
      });
    case "h3":
      return styleObjectToString({
        color: safeGet(styles.h3?.color, defaults.heading.color),
        fontSize: safeGet(styles.h3?.fontSize, "1.25em"),
        fontWeight: safeGet(styles.h3?.fontWeight, defaults.heading.fontWeight),
        lineHeight: safeGet(styles.h3?.lineHeight, defaults.heading.lineHeight),
        marginTop: safeGet(styles.h3?.marginTop, defaults.heading.marginTop),
        marginBottom: safeGet(styles.h3?.marginBottom, defaults.heading.marginBottom),
      });
    case "h4":
      return styleObjectToString({
        color: safeGet(styles.h4?.color, defaults.heading.color),
        fontSize: safeGet(styles.h4?.fontSize, "1.1em"),
        fontWeight: safeGet(styles.h4?.fontWeight, defaults.heading.fontWeight),
        lineHeight: safeGet(styles.h4?.lineHeight, defaults.heading.lineHeight),
        marginTop: safeGet(styles.h4?.marginTop, defaults.heading.marginTop),
        marginBottom: safeGet(styles.h4?.marginBottom, defaults.heading.marginBottom),
      });
    case "h5":
      return styleObjectToString({
        color: safeGet(styles.h5?.color, defaults.heading.color),
        fontSize: safeGet(styles.h5?.fontSize, "1em"),
        fontWeight: safeGet(styles.h5?.fontWeight, defaults.heading.fontWeight),
        lineHeight: safeGet(styles.h5?.lineHeight, defaults.heading.lineHeight),
        marginTop: safeGet(styles.h5?.marginTop, defaults.heading.marginTop),
        marginBottom: safeGet(styles.h5?.marginBottom, defaults.heading.marginBottom),
      });
    case "h6":
      return styleObjectToString({
        color: safeGet(styles.h6?.color, "#666666"),
        fontSize: safeGet(styles.h6?.fontSize, "0.9em"),
        fontWeight: safeGet(styles.h6?.fontWeight, defaults.heading.fontWeight),
        lineHeight: safeGet(styles.h6?.lineHeight, defaults.heading.lineHeight),
        marginTop: safeGet(styles.h6?.marginTop, defaults.heading.marginTop),
        marginBottom: safeGet(styles.h6?.marginBottom, defaults.heading.marginBottom),
      });
    case "p":
      return styleObjectToString({
        color: safeGet(styles.paragraph?.color, defaults.paragraph.color),
        fontSize: safeGet(styles.paragraph?.fontSize, defaults.paragraph.fontSize),
        lineHeight: safeGet(styles.paragraph?.lineHeight, defaults.paragraph.lineHeight),
        marginBottom: safeGet(styles.paragraph?.marginBottom, defaults.paragraph.marginBottom),
      });
    case "a":
      return styleObjectToString({
        color: safeGet(styles.link?.color, defaults.link.color),
        textDecoration: safeGet(styles.link?.textDecoration, defaults.link.textDecoration),
      });
    case "blockquote":
      return styleObjectToString({
        background: sanitizeBackground(safeGet(styles.blockquote?.background, defaults.blockquote.background)),
        borderLeft: safeGet(styles.blockquote?.borderLeft, defaults.blockquote.borderLeft),
        color: safeGet(styles.blockquote?.color, defaults.blockquote.color),
        padding: safeGet(styles.blockquote?.padding, defaults.blockquote.padding),
        margin: safeGet(styles.blockquote?.margin, defaults.blockquote.margin),
        fontStyle: safeGet(styles.blockquote?.fontStyle, defaults.blockquote.fontStyle),
      });
    case "code":
      return styleObjectToString({
        background: sanitizeBackground(safeGet(styles.code?.background, defaults.code.background)),
        color: safeGet(styles.code?.color, defaults.code.color),
        padding: safeGet(styles.code?.padding, defaults.code.padding),
        borderRadius: safeGet(styles.code?.borderRadius, defaults.code.borderRadius),
        fontFamily: safeGet(styles.code?.fontFamily, defaults.code.fontFamily),
        fontSize: safeGet(styles.code?.fontSize, defaults.code.fontSize),
      });
    case "pre":
      return styleObjectToString({
        background: sanitizeBackground(safeGet(styles.codeBlock?.background, defaults.codeBlock.background)),
        color: safeGet(styles.codeBlock?.color, defaults.codeBlock.color),
        padding: safeGet(styles.codeBlock?.padding, defaults.codeBlock.padding),
        borderRadius: safeGet(styles.codeBlock?.borderRadius, defaults.codeBlock.borderRadius),
        fontFamily: safeGet(styles.codeBlock?.fontFamily, defaults.codeBlock.fontFamily),
        fontSize: safeGet(styles.codeBlock?.fontSize, defaults.codeBlock.fontSize),
        lineHeight: safeGet(styles.codeBlock?.lineHeight, defaults.codeBlock.lineHeight),
        overflow: safeGet(styles.codeBlock?.overflow, defaults.codeBlock.overflow),
      });
    case "ul":
    case "ol":
      return styleObjectToString({
        color: safeGet(styles.list?.color, defaults.list.color),
        marginLeft: safeGet(styles.list?.marginLeft, defaults.list.marginLeft),
        marginBottom: safeGet(styles.list?.marginBottom, defaults.list.marginBottom),
        lineHeight: safeGet(styles.list?.lineHeight, defaults.list.lineHeight),
      });
    case "li":
      return styleObjectToString({
        color: safeGet(styles.list?.color, defaults.list.color),
        lineHeight: safeGet(styles.list?.lineHeight, defaults.list.lineHeight),
      });
    case "table":
      return styleObjectToString({
        borderCollapse: "collapse",
        width: "100%",
        margin: "1em 0",
      });
    case "th":
      return styleObjectToString({
        border: `1px solid ${safeGet(styles.table?.borderColor, defaults.table.borderColor)}`,
        padding: safeGet(styles.table?.cellPadding, defaults.table.cellPadding),
        textAlign: "left",
        background: sanitizeBackground(safeGet(styles.table?.headerBackground, defaults.table.headerBackground)),
        color: safeGet(styles.table?.headerColor, defaults.table.headerColor),
        fontWeight: "600",
      });
    case "td":
      return styleObjectToString({
        border: `1px solid ${safeGet(styles.table?.borderColor, defaults.table.borderColor)}`,
        padding: safeGet(styles.table?.cellPadding, defaults.table.cellPadding),
        textAlign: "left",
        background: isEvenRow ? sanitizeBackground(safeGet(styles.table?.evenRowBackground, defaults.table.evenRowBackground)) : undefined,
      });
    case "img":
      return styleObjectToString({
        maxWidth: safeGet(styles.image?.maxWidth, defaults.image.maxWidth),
        borderRadius: safeGet(styles.image?.borderRadius, defaults.image.borderRadius),
        margin: safeGet(styles.image?.margin, defaults.image.margin),
      });
    case "hr":
      return styleObjectToString({
        border: "none",
        borderTop: safeGet(styles.hr?.border, defaults.hr.border),
        margin: safeGet(styles.hr?.margin, defaults.hr.margin),
      });
    case "strong":
    case "b":
      // 如果有自定义 strong 样式，使用它
      if (extraStyles?.strong && Object.keys(extraStyles.strong).length > 0) {
        return styleObjectToString({
          fontWeight: extraStyles.strong.fontWeight || 'bold',
          color: extraStyles.strong.color,
          background: extraStyles.strong.background ? sanitizeBackground(extraStyles.strong.background) : undefined,
          padding: extraStyles.strong.padding,
          borderRadius: extraStyles.strong.borderRadius,
        });
      }
      return "font-weight: bold";
    case "em":
    case "i":
      // 如果有自定义 em 样式，使用它
      if (extraStyles?.em && Object.keys(extraStyles.em).length > 0) {
        return styleObjectToString({
          fontStyle: extraStyles.em.fontStyle || 'italic',
          color: extraStyles.em.color,
          background: extraStyles.em.background ? sanitizeBackground(extraStyles.em.background) : undefined,
        });
      }
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
 * Highlight.js 类名到行内样式的映射（GitHub 风格）
 */
const hljsStyleMap: Record<string, string> = {
  'hljs-comment': 'color: #6a737d; font-style: italic',
  'hljs-quote': 'color: #6a737d; font-style: italic',
  'hljs-keyword': 'color: #d73a49',
  'hljs-selector-tag': 'color: #d73a49',
  'hljs-literal': 'color: #d73a49',
  'hljs-section': 'color: #d73a49',
  'hljs-link': 'color: #d73a49',
  'hljs-string': 'color: #032f62',
  'hljs-title': 'color: #032f62',
  'hljs-name': 'color: #032f62',
  'hljs-type': 'color: #032f62',
  'hljs-attribute': 'color: #032f62',
  'hljs-symbol': 'color: #032f62',
  'hljs-bullet': 'color: #032f62',
  'hljs-addition': 'color: #22863a; background-color: #f0fff4',
  'hljs-variable': 'color: #032f62',
  'hljs-template-tag': 'color: #032f62',
  'hljs-template-variable': 'color: #032f62',
  'hljs-function': 'color: #6f42c1',
  'hljs-built_in': 'color: #005cc5',
  'hljs-number': 'color: #005cc5',
  'hljs-attr': 'color: #6f42c1',
  'hljs-meta': 'color: #22863a',
  'hljs-deletion': 'color: #b31d28; background-color: #ffeef0',
  'hljs-emphasis': 'font-style: italic',
  'hljs-strong': 'font-weight: bold',
  'hljs-params': 'color: #24292e',
  'hljs-class': 'color: #005cc5',
  'hljs-tag': 'color: #22863a',
  'hljs-regexp': 'color: #032f62',
  'hljs-selector-id': 'color: #6f42c1',
  'hljs-selector-class': 'color: #6f42c1',
  'hljs-selector-attr': 'color: #032f62',
  'hljs-selector-pseudo': 'color: #6f42c1',
  'hljs-doctag': 'color: #d73a49',
  'hljs-subst': 'color: #24292e',
};

/**
 * 将 hljs 类名转换为行内样式
 */
function getHljsInlineStyle(className: string): string {
  const classes = className.split(/\s+/);
  const styles: string[] = [];
  
  for (const cls of classes) {
    if (hljsStyleMap[cls]) {
      styles.push(hljsStyleMap[cls]);
    }
  }
  
  return styles.join('; ');
}

/**
 * 递归处理 DOM 节点，添加行内样式
 */
function processNode(
  node: Node,
  styles: ThemeStyles,
  rowIndex?: number,
  parentTagName?: string,
  extraStyles?: { strong?: Record<string, string>; em?: Record<string, string> }
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
  
  // 特殊处理：hljs 高亮的 span 元素
  if (tagName === "span" && element.className) {
    const hljsStyle = getHljsInlineStyle(element.className);
    if (hljsStyle) {
      const childContent = Array.from(element.childNodes)
        .map((child) => processNode(child, styles, undefined, tagName, extraStyles))
        .join("");
      return `<span style="${hljsStyle}">${childContent}</span>`;
    }
  }
  
  // 特殊处理：pre 内的 code 使用不同样式
  let inlineStyle: string;
  if (tagName === "code" && parentTagName === "pre") {
    // pre 内的 code：透明背景，继承颜色
    inlineStyle = "background: transparent; color: inherit; padding: 0; border-radius: 0";
  } else {
    inlineStyle = getElementStyles(tagName, styles, isEvenRow, extraStyles);
  }

  // 特殊处理行内 code 元素（不在 pre 内的 code）
  if (tagName === "code" && parentTagName !== "pre") {
    const textContent = element.textContent || "";
    const splitContent = splitCodeContent(textContent);
    const styleAttr = inlineStyle ? ` style="${inlineStyle}"` : "";
    return `<code class="prettyprint code-in-text prettyprinted"${styleAttr}>${splitContent}</code>`;
  }

  // 处理子节点，传递当前标签名作为父标签
  let childRowIndex = 0;
  const childContent = Array.from(element.childNodes)
    .map((child) => {
      if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName.toLowerCase() === "tr") {
        return processNode(child, styles, childRowIndex++, tagName, extraStyles);
      }
      return processNode(child, styles, undefined, tagName, extraStyles);
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
  // 如果主题有 customCSS，从中解析样式
  let styles: ThemeStyles;
  let extraStyles: { strong?: Record<string, string>; em?: Record<string, string> } | undefined;
  
  if (theme.customCSS) {
    const parsedStyles = parseCustomCSSToStyles(theme.customCSS);
    // 提取额外样式（strong, em）
    extraStyles = {
      strong: (parsedStyles as { strong?: Record<string, string> }).strong,
      em: (parsedStyles as { em?: Record<string, string> }).em,
    };
    // 合并解析的样式和原有样式，解析的优先
    styles = {
      ...theme.styles,
      ...parsedStyles,
      h1: { ...theme.styles?.h1, ...parsedStyles.h1 },
      h2: { ...theme.styles?.h2, ...parsedStyles.h2 },
      h3: { ...theme.styles?.h3, ...parsedStyles.h3 },
      h4: { ...theme.styles?.h4, ...parsedStyles.h4 },
      h5: { ...theme.styles?.h5, ...parsedStyles.h5 },
      h6: { ...theme.styles?.h6, ...parsedStyles.h6 },
      paragraph: { ...theme.styles?.paragraph, ...parsedStyles.paragraph },
      link: { ...theme.styles?.link, ...parsedStyles.link },
      blockquote: { ...theme.styles?.blockquote, ...parsedStyles.blockquote },
      code: { ...theme.styles?.code, ...parsedStyles.code },
      codeBlock: { ...theme.styles?.codeBlock, ...parsedStyles.codeBlock },
      list: { ...theme.styles?.list, ...parsedStyles.list },
      table: { ...theme.styles?.table, ...parsedStyles.table },
      image: { ...theme.styles?.image, ...parsedStyles.image },
      hr: { ...theme.styles?.hr, ...parsedStyles.hr },
    } as ThemeStyles;
  } else {
    styles = theme.styles;
  }

  // 确保 styles 存在
  if (!styles) {
    console.warn("主题缺少 styles 属性，使用默认样式");
    return html;
  }

  // 创建临时 DOM 解析 HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // 添加容器样式 - 使用微信兼容的背景色
  const containerStyle = styleObjectToString({
    backgroundColor: sanitizeBackground(styles.background),
    color: safeGet(styles.text, "#333333"),
    padding: "1rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
  });

  // 处理所有子节点
  const content = Array.from(doc.body.childNodes)
    .map((node) => processNode(node, styles, undefined, undefined, extraStyles))
    .join("");

  return `<div style="${containerStyle}">${content}</div>`;
}

/**
 * 检查 HTML 是否包含行内样式
 */
export function hasInlineStyles(html: string): boolean {
  return /style="[^"]+"/i.test(html);
}
