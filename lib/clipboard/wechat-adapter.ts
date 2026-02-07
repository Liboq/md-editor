/**
 * 微信公众号适配器
 * 
 * 微信公众号编辑器会对粘贴内容进行"清洗"：
 * - 移除 script、style 标签
 * - 移除 position、transform 等 CSS 属性
 * - 移除 id 属性和事件处理器
 * - 只保留"安全"的内联样式
 * 
 * 本适配器处理以下问题：
 * 1. 代码块空格被合并 → 用 \u00A0 (non-breaking space) 替换
 * 2. 换行符失效 → 用 <br> 标签替换
 * 3. 任务列表复选框不支持 → 用 Unicode 字符 ☑/☐ 替代
 * 4. 外部链接警告 → 可选转换为文末脚注
 * 5. 不安全 CSS 属性 → 移除或转换为安全属性
 * 
 * @see https://mp.weixin.qq.com 微信公众号编辑器限制
 */

/**
 * 适配选项
 */
export interface WechatAdapterOptions {
  /** 是否处理代码块空格（默认 true） */
  preserveCodeSpaces?: boolean;
  /** 是否处理代码块换行（默认 true） */
  preserveCodeLineBreaks?: boolean;
  /** 是否转换任务列表（默认 true） */
  convertTaskLists?: boolean;
  /** 是否将外部链接转换为脚注（默认 false） */
  convertLinksToFootnotes?: boolean;
  /** 是否清理不安全的 CSS 属性（默认 true） */
  sanitizeStyles?: boolean;
  /** 是否移除 id 属性（默认 true） */
  removeIds?: boolean;
}

const defaultOptions: WechatAdapterOptions = {
  preserveCodeSpaces: true,
  preserveCodeLineBreaks: true,
  convertTaskLists: true,
  convertLinksToFootnotes: false,
  sanitizeStyles: true,
  removeIds: true,
};

/**
 * 微信不支持的 CSS 属性列表
 * 这些属性会被微信安全过滤器移除
 */
const UNSAFE_CSS_PROPERTIES = [
  // 定位相关
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'z-index',
  // 变换相关
  'transform',
  'transform-origin',
  'transform-style',
  'perspective',
  'perspective-origin',
  // 动画相关
  'animation',
  'animation-name',
  'animation-duration',
  'animation-timing-function',
  'animation-delay',
  'animation-iteration-count',
  'animation-direction',
  'animation-fill-mode',
  'animation-play-state',
  'transition',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
  'transition-delay',
  // 滤镜相关
  'filter',
  'backdrop-filter',
  // 其他不稳定属性
  'clip-path',
  'mask',
  'mask-image',
  'mix-blend-mode',
  'isolation',
  'will-change',
  'contain',
  'content-visibility',
];

/**
 * 将普通空格替换为不可断空格（用于代码块）
 * 微信会把连续空格合并成一个，使用 \u00A0 可以保留缩进
 */
function preserveSpaces(text: string): string {
  // 将行首的连续空格替换为 \u00A0
  return text.replace(/^( +)/gm, (spaces) => '\u00A0'.repeat(spaces.length));
}

/**
 * 处理代码块内容
 * - 保留空格缩进
 * - 将换行符转换为 <br>
 */
function processCodeBlockContent(content: string, options: WechatAdapterOptions): string {
  let result = content;
  
  // 保留空格
  if (options.preserveCodeSpaces) {
    result = preserveSpaces(result);
  }
  
  // 换行符转 <br>（在 pre/code 内部）
  if (options.preserveCodeLineBreaks) {
    result = result.split('\n').join('<br>');
  }
  
  return result;
}

/**
 * 处理 HTML 中的代码块
 * 匹配 <pre><code>...</code></pre> 结构
 */
function processCodeBlocks(html: string, options: WechatAdapterOptions): string {
  // 匹配 <code> 标签内的内容（包括带 class 的）
  // 只处理在 <pre> 内的 code（代码块），不处理行内 code
  return html.replace(
    /(<pre[^>]*>)(<code[^>]*>)([\s\S]*?)(<\/code>)(<\/pre>)/gi,
    (match, preOpen, codeOpen, content, codeClose, preClose) => {
      const processedContent = processCodeBlockContent(content, options);
      return `${preOpen}${codeOpen}${processedContent}${codeClose}${preClose}`;
    }
  );
}

/**
 * 将任务列表的 checkbox 转换为 Unicode 字符
 * - <input type="checkbox" checked> → ☑
 * - <input type="checkbox"> → ☐
 */
function convertTaskListCheckboxes(html: string): string {
  // 匹配 checked 的 checkbox
  let result = html.replace(
    /<input\s+type=["']checkbox["']\s+checked[^>]*\/?>/gi,
    '☑ '
  );
  
  // 匹配 checked 在前面的情况
  result = result.replace(
    /<input\s+checked[^>]*type=["']checkbox["'][^>]*\/?>/gi,
    '☑ '
  );
  
  // 匹配未选中的 checkbox
  result = result.replace(
    /<input\s+type=["']checkbox["'][^>]*\/?>/gi,
    '☐ '
  );
  
  return result;
}

/**
 * 收集的链接信息
 */
interface LinkInfo {
  text: string;
  url: string;
  index: number;
}

/**
 * 将外部链接转换为文末脚注
 * 
 * 原文：详见 <a href="https://example.com">官方文档</a>
 * 转换后：详见 官方文档[1]
 * 
 * 文末添加：
 * ---
 * 参考链接
 * 1. 官方文档: https://example.com
 */
function convertLinksToFootnotes(html: string): string {
  const links: LinkInfo[] = [];
  let index = 0;
  
  // 收集并替换链接
  const contentWithFootnotes = html.replace(
    /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi,
    (match, url: string, text: string) => {
      // 跳过锚点链接（以 # 开头）
      if (url.startsWith('#')) {
        return match;
      }
      
      // 跳过相对链接（不以 http 开头）
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return match;
      }
      
      index++;
      links.push({ text: text.trim(), url, index });
      return `${text}<sup style="color: #1e80ff; font-size: 12px;">[${index}]</sup>`;
    }
  );
  
  // 如果没有外部链接，直接返回
  if (links.length === 0) {
    return html;
  }
  
  // 生成脚注部分
  const footnoteStyle = 'margin-top: 2em; padding-top: 1em; border-top: 1px solid #e5e5e5; font-size: 14px; color: #666;';
  const titleStyle = 'font-weight: 600; margin-bottom: 0.5em;';
  const linkStyle = 'color: #666; word-break: break-all;';
  
  const footnotes = links.map(link => 
    `<div style="${linkStyle}">${link.index}. ${link.text}: ${link.url}</div>`
  ).join('');
  
  const footnoteSection = `
    <div style="${footnoteStyle}">
      <div style="${titleStyle}">参考链接</div>
      ${footnotes}
    </div>
  `;
  
  return contentWithFootnotes + footnoteSection;
}

/**
 * 清理不安全的 CSS 属性
 * 移除微信会过滤掉的 CSS 属性，避免样式丢失
 */
function sanitizeInlineStyles(html: string): string {
  return html.replace(
    /style="([^"]*)"/gi,
    (match, styleContent: string) => {
      // 解析样式声明
      const declarations = styleContent.split(';').filter(d => d.trim());
      
      // 过滤掉不安全的属性
      const safeDeclarations = declarations.filter(decl => {
        const [property] = decl.split(':').map(s => s.trim().toLowerCase());
        return !UNSAFE_CSS_PROPERTIES.includes(property);
      });
      
      if (safeDeclarations.length === 0) {
        return '';
      }
      
      return `style="${safeDeclarations.join('; ')}"`;
    }
  );
}

/**
 * 移除 id 属性
 * 微信会过滤掉 id 属性
 */
function removeIdAttributes(html: string): string {
  return html.replace(/\s+id="[^"]*"/gi, '');
}

/**
 * 移除事件处理器属性
 * 如 onclick, onmouseover 等
 */
function removeEventHandlers(html: string): string {
  return html.replace(/\s+on\w+="[^"]*"/gi, '');
}

/**
 * 移除 script 和 style 标签
 * 虽然正常情况下不应该有这些标签，但作为安全措施
 */
function removeUnsafeTags(html: string): string {
  // 移除 script 标签及其内容
  let result = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // 移除 style 标签及其内容
  result = result.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  return result;
}

/**
 * 清理空元素和多余的空行
 * 微信公众号编辑器会添加一些空的 p 标签和 br 标签
 * juice 内联样式后，空标签会带有 style 属性，也需要清理
 */
function cleanupEmptyElements(html: string): string {
  let result = html;
  
  // 移除空的 p 标签（包含空 span、br 等）
  // 匹配: <p><span leaf=""><br class="ProseMirror-trailingBreak"></span></p>
  // 也匹配带 style 属性的空 p 标签: <p style="..."></p>
  result = result.replace(/<p[^>]*>\s*(<span[^>]*>\s*)?(<br[^>]*\/?>)?\s*(<\/span>)?\s*<\/p>/gi, '');
  
  // 移除只包含空白的 p 标签（包括带 style 属性的）
  result = result.replace(/<p[^>]*>\s*<\/p>/gi, '');
  
  // 移除只包含 br 的 p 标签
  result = result.replace(/<p[^>]*>\s*<br\s*\/?>\s*<\/p>/gi, '');
  
  // 移除只包含 &nbsp; 的 p 标签
  result = result.replace(/<p[^>]*>\s*(&nbsp;|\u00A0)+\s*<\/p>/gi, '');
  
  // 移除连续的多个 br 标签（保留最多 2 个）
  result = result.replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>');
  
  // 移除 ProseMirror 相关的类和属性（但保留我们添加的 leaf="" 属性）
  result = result.replace(/\s+class="[^"]*ProseMirror[^"]*"/gi, '');
  
  // 移除行内的 section 标签（保留内容），微信会把 section 当作块级元素导致换行
  // 匹配 <section>内容</section> 或 <section ...>内容</section>
  result = result.replace(/<section[^>]*>([\s\S]*?)<\/section>/gi, '$1');
  
  // 移除 pseudo-before/pseudo-after 元素（微信不支持 position: absolute）
  result = result.replace(/<span[^>]*class="pseudo-(before|after)"[^>]*>[^<]*<\/span>/gi, '');
  
  // 移除元素上的 position: relative 样式（伪元素移除后不再需要）
  result = result.replace(/position:\s*relative;?\s*/gi, '');
  
  // 清理多余的空行（连续的换行符）
  result = result.replace(/\n{3,}/g, '\n\n');
  
  return result;
}

/**
 * 包裹裸文本，防止微信把 strong/em 后面的文本解析为 section
 * 例如：<strong>标题</strong>：后面的文本 -> <strong>标题</strong><span style="...">：后面的文本</span>
 * 
 * 处理范围：li、p、td、th、blockquote 等块级元素内的裸文本
 */
function wrapBareText(html: string): string {
  // 需要处理的块级元素
  const blockElements = ['li', 'p', 'td', 'th', 'blockquote', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  
  // 用于包裹文本的 span 样式
  const spanStyle = 'box-sizing: border-box; margin: 0;';
  
  let result = html;
  
  for (const tag of blockElements) {
    // 匹配块级元素内的内容
    const regex = new RegExp(`(<${tag}[^>]*>)([\\s\\S]*?)(<\\/${tag}>)`, 'gi');
    
    result = result.replace(regex, (_, tagOpen, content, tagClose) => {
      // 在内容中，将 </strong>、</em>、</b>、</i>、</code> 后面的裸文本用 span 包裹
      let processed = content;
      
      // 匹配 </strong>、</em>、</b>、</i>、</code> 后面紧跟的文本（不以 < 开头的内容）
      processed = processed.replace(
        /(<\/(?:strong|em|b|i|code)[^>]*>)([^<]+)/gi,
        (_m: string, closeTag: string, text: string) => {
          // 如果文本只有空白，不处理
          if (!text.trim()) return `${closeTag}${text}`;
          return `${closeTag}<span style="${spanStyle}">${text}</span>`;
        }
      );
      
      // 处理开头的裸文本（在第一个标签之前的文本）
      // 例如：<p>文本<strong>粗体</strong></p> -> <p><span>文本</span><strong>粗体</strong></p>
      processed = processed.replace(
        /^([^<]+)(<(?:strong|em|b|i|code|a|span)[^>]*>)/i,
        (m: string, text: string, openTag: string) => {
          // 如果文本只有空白，不处理
          if (!text.trim()) return m;
          return `<span style="${spanStyle}">${text}</span>${openTag}`;
        }
      );
      
      return `${tagOpen}${processed}${tagClose}`;
    });
  }
  
  return result;
}

/**
 * 适配 HTML 内容以兼容微信公众号
 * 
 * @param html - 原始 HTML 内容
 * @param options - 适配选项
 * @returns 适配后的 HTML
 * 
 * @example
 * ```typescript
 * const adapted = adaptForWechat(html, {
 *   preserveCodeSpaces: true,
 *   convertTaskLists: true,
 *   convertLinksToFootnotes: false,
 *   sanitizeStyles: true,
 * });
 * ```
 */
export function adaptForWechat(
  html: string,
  options: WechatAdapterOptions = {}
): string {
  const opts = { ...defaultOptions, ...options };
  let result = html;
  
  // 0. 移除不安全的标签（script, style）
  result = removeUnsafeTags(result);
  
  // 1. 移除事件处理器
  result = removeEventHandlers(result);
  
  // 2. 移除 id 属性
  if (opts.removeIds) {
    result = removeIdAttributes(result);
  }
  
  // 3. 清理不安全的 CSS 属性
  if (opts.sanitizeStyles) {
    result = sanitizeInlineStyles(result);
  }
  
  // 4. 处理代码块（空格和换行）
  if (opts.preserveCodeSpaces || opts.preserveCodeLineBreaks) {
    result = processCodeBlocks(result, opts);
  }
  
  // 5. 转换任务列表
  if (opts.convertTaskLists) {
    result = convertTaskListCheckboxes(result);
  }
  
  // 6. 转换外部链接为脚注（可选）
  if (opts.convertLinksToFootnotes) {
    result = convertLinksToFootnotes(result);
  }
  
  // 7. 清理空元素和多余空行
  result = cleanupEmptyElements(result);
  
  // 8. 包裹块级元素中的裸文本，防止微信解析为 section
  result = wrapBareText(result);
  
  return result;
}

/**
 * 检查 HTML 是否包含需要适配的内容
 */
export function needsWechatAdaptation(html: string): {
  hasCodeBlocks: boolean;
  hasTaskLists: boolean;
  hasExternalLinks: boolean;
  hasUnsafeStyles: boolean;
  hasUnsafeTags: boolean;
} {
  // 检查是否有不安全的 CSS 属性
  const hasUnsafeStyles = UNSAFE_CSS_PROPERTIES.some(prop => {
    const regex = new RegExp(`${prop}\\s*:`, 'i');
    return regex.test(html);
  });
  
  return {
    hasCodeBlocks: /<pre[^>]*>[\s\S]*?<\/pre>/i.test(html),
    hasTaskLists: /<input\s+[^>]*type=["']checkbox["'][^>]*>/i.test(html),
    hasExternalLinks: /<a\s+[^>]*href=["']https?:\/\/[^"']+["'][^>]*>/i.test(html),
    hasUnsafeStyles,
    hasUnsafeTags: /<script|<style/i.test(html),
  };
}

/**
 * 获取不安全的 CSS 属性列表（供外部参考）
 */
export function getUnsafeCssProperties(): readonly string[] {
  return UNSAFE_CSS_PROPERTIES;
}
