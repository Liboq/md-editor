/**
 * 伪元素转换器
 * 
 * 微信公众号不支持 ::before/::after 伪元素，
 * 此模块将 CSS 中的伪元素转换为实际的 DOM 元素，
 * 使用 position: absolute 定位来模拟伪元素效果。
 */

export interface PseudoElementStyle {
  selector: string;        // 原始选择器（不含 ::before/::after）
  type: 'before' | 'after';
  content: string;
  styles: Record<string, string>;
}

/**
 * 从 CSS 中提取伪元素样式
 */
export function extractPseudoElements(css: string): PseudoElementStyle[] {
  const pseudoElements: PseudoElementStyle[] = [];
  
  // 匹配 ::before 和 ::after 伪元素
  // 例如: .preview-content h2::before { content: ""; ... }
  const regex = /([^{}]+)::?(before|after)\s*\{([^}]+)\}/gi;
  
  let match;
  while ((match = regex.exec(css)) !== null) {
    const selector = match[1].trim();
    const type = match[2].toLowerCase() as 'before' | 'after';
    const styleBlock = match[3];
    
    // 解析样式块
    const styles: Record<string, string> = {};
    let content = '""';
    
    const declarations = styleBlock.split(';');
    for (const decl of declarations) {
      const colonIndex = decl.indexOf(':');
      if (colonIndex === -1) continue;
      
      const property = decl.slice(0, colonIndex).trim();
      const value = decl.slice(colonIndex + 1).trim();
      
      if (!property || !value) continue;
      
      if (property === 'content') {
        content = value;
      } else {
        // 将 kebab-case 转换为 camelCase
        const camelProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        styles[camelProperty] = value.replace(/!important/gi, '').trim();
      }
    }
    
    pseudoElements.push({
      selector,
      type,
      content,
      styles,
    });
  }
  
  return pseudoElements;
}

/**
 * 将样式对象转换为行内样式字符串
 */
function styleObjectToInline(styles: Record<string, string>): string {
  return Object.entries(styles)
    .map(([key, value]) => {
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${kebabKey}: ${value}`;
    })
    .join('; ');
}

/**
 * 处理 content 属性值，提取实际内容
 * 支持：字符串、counter()、attr() 等
 */
function parseContent(content: string, element?: Element): string {
  const trimmed = content.trim();
  
  // 移除引号
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  
  // 处理空内容
  if (trimmed === 'none' || trimmed === '""' || trimmed === "''") {
    return '';
  }
  
  // 处理 counter() - 有序列表序号
  // 例如: counter(list-item) 或 counter(list-item, decimal)
  const counterMatch = trimmed.match(/counter\s*\(\s*([^,)]+)(?:\s*,\s*([^)]+))?\s*\)/i);
  if (counterMatch) {
    // 返回占位符，实际序号需要在注入时计算
    return '{{counter}}';
  }
  
  // 处理 attr() - 获取元素属性
  const attrMatch = trimmed.match(/attr\s*\(\s*([^)]+)\s*\)/i);
  if (attrMatch && element) {
    const attrName = attrMatch[1].trim();
    return element.getAttribute(attrName) || '';
  }
  
  return trimmed;
}

/**
 * 根据选择器获取目标元素的标签名和完整选择器
 */
function parseSelector(selector: string): { tag: string | null; fullSelector: string } {
  // 清理选择器，移除 .preview-content 前缀
  let cleanSelector = selector
    .replace(/\.preview-content\s*/g, '')
    .replace(/article\.preview-content\s*/g, '')
    .replace(/div\.preview-content\s*/g, '')
    .trim();
  
  // 处理复合选择器，如 "ol li" -> 需要匹配 "ol li"
  // 获取最后一个元素标签
  const parts = cleanSelector.split(/\s+/);
  const lastPart = parts[parts.length - 1];
  
  // 移除类选择器和 ID 选择器，只保留标签名
  const tagMatch = lastPart.match(/^([a-z][a-z0-9]*)/i);
  const tag = tagMatch ? tagMatch[1].toLowerCase() : null;
  
  return { tag, fullSelector: cleanSelector };
}

/**
 * 在 HTML 中注入伪元素
 * 将 ::before/::after 转换为实际的 span 元素
 */
export function injectPseudoElements(html: string, pseudoElements: PseudoElementStyle[]): string {
  if (pseudoElements.length === 0) return html;
  
  // 创建临时 DOM
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  for (const pseudo of pseudoElements) {
    const { tag, fullSelector } = parseSelector(pseudo.selector);
    if (!tag) continue;
    
    // 构建 CSS 选择器用于 querySelectorAll
    // 例如: "ol li" -> 查找所有 ol 下的 li
    let cssSelector = fullSelector;
    
    // 查找所有匹配的元素
    let elements: NodeListOf<Element>;
    try {
      elements = doc.querySelectorAll(cssSelector);
    } catch {
      // 如果选择器无效，尝试只用标签名
      elements = doc.querySelectorAll(tag);
    }
    
    // 用于计算 counter
    let counterValue = 0;
    
    elements.forEach((element, index) => {
      // 确保父元素有相对定位（用于 absolute 定位的伪元素）
      const currentPosition = (element as HTMLElement).style.position;
      if (!currentPosition || currentPosition === 'static') {
        (element as HTMLElement).style.position = 'relative';
      }
      
      // 创建伪元素的替代 span
      const span = doc.createElement('span');
      span.className = `pseudo-${pseudo.type}`;
      span.setAttribute('aria-hidden', 'true');
      
      // 设置内容
      let content = parseContent(pseudo.content, element);
      
      // 处理 counter 占位符
      if (content === '{{counter}}') {
        // 检查是否是新的列表（父元素不同）
        const parent = element.parentElement;
        if (index === 0 || elements[index - 1]?.parentElement !== parent) {
          counterValue = 1;
        } else {
          counterValue++;
        }
        content = String(counterValue);
      }
      
      span.textContent = content;
      
      // 构建样式，确保使用 absolute 定位
      const styles: Record<string, string> = {
        ...pseudo.styles,
        position: 'absolute',
        pointerEvents: 'none',
      };
      
      // 如果没有指定位置，设置默认位置
      if (pseudo.type === 'before') {
        if (!styles.left && !styles.right) {
          styles.left = '0';
        }
        if (!styles.top && !styles.bottom) {
          styles.top = '0';
        }
      } else {
        if (!styles.left && !styles.right) {
          styles.right = '0';
        }
        if (!styles.top && !styles.bottom) {
          styles.top = '0';
        }
      }
      
      span.setAttribute('style', styleObjectToInline(styles));
      
      // 插入到正确位置
      if (pseudo.type === 'before') {
        element.insertBefore(span, element.firstChild);
      } else {
        element.appendChild(span);
      }
    });
  }
  
  return doc.body.innerHTML;
}

/**
 * 从 CSS 中移除伪元素规则（用于生成微信兼容的 CSS）
 */
export function removePseudoElementRules(css: string): string {
  // 移除 ::before 和 ::after 规则
  return css.replace(/[^{}]+::?(before|after)\s*\{[^}]+\}/gi, '');
}

/**
 * 处理主题的伪元素
 * 返回处理后的 HTML 和清理后的 CSS
 */
export function processPseudoElements(
  html: string,
  customCSS?: string
): { html: string; css: string } {
  if (!customCSS) {
    return { html, css: '' };
  }
  
  // 提取伪元素
  const pseudoElements = extractPseudoElements(customCSS);
  
  // 注入伪元素到 HTML
  const processedHtml = injectPseudoElements(html, pseudoElements);
  
  // 移除 CSS 中的伪元素规则
  const cleanedCSS = removePseudoElementRules(customCSS);
  
  return {
    html: processedHtml,
    css: cleanedCSS,
  };
}
