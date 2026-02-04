import { marked } from "marked";
import hljs from "highlight.js/lib/core";

// 注册常用语言
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import cpp from "highlight.js/lib/languages/cpp";
import c from "highlight.js/lib/languages/c";
import csharp from "highlight.js/lib/languages/csharp";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import php from "highlight.js/lib/languages/php";
import ruby from "highlight.js/lib/languages/ruby";
import swift from "highlight.js/lib/languages/swift";
import kotlin from "highlight.js/lib/languages/kotlin";
import objectivec from "highlight.js/lib/languages/objectivec";
import css from "highlight.js/lib/languages/css";
import scss from "highlight.js/lib/languages/scss";
import less from "highlight.js/lib/languages/less";
import xml from "highlight.js/lib/languages/xml";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";
import markdown from "highlight.js/lib/languages/markdown";
import sql from "highlight.js/lib/languages/sql";
import bash from "highlight.js/lib/languages/bash";
import shell from "highlight.js/lib/languages/shell";
import powershell from "highlight.js/lib/languages/powershell";
import lua from "highlight.js/lib/languages/lua";
import perl from "highlight.js/lib/languages/perl";
import r from "highlight.js/lib/languages/r";
import scala from "highlight.js/lib/languages/scala";
import dart from "highlight.js/lib/languages/dart";
import groovy from "highlight.js/lib/languages/groovy";
import diff from "highlight.js/lib/languages/diff";
import ini from "highlight.js/lib/languages/ini";
import nginx from "highlight.js/lib/languages/nginx";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import plaintext from "highlight.js/lib/languages/plaintext";

// 注册语言
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("py", python);
hljs.registerLanguage("java", java);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("c", c);
hljs.registerLanguage("csharp", csharp);
hljs.registerLanguage("cs", csharp);
hljs.registerLanguage("go", go);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("rs", rust);
hljs.registerLanguage("php", php);
hljs.registerLanguage("ruby", ruby);
hljs.registerLanguage("rb", ruby);
hljs.registerLanguage("swift", swift);
hljs.registerLanguage("kotlin", kotlin);
hljs.registerLanguage("kt", kotlin);
hljs.registerLanguage("objectivec", objectivec);
hljs.registerLanguage("objc", objectivec);
hljs.registerLanguage("css", css);
hljs.registerLanguage("scss", scss);
hljs.registerLanguage("less", less);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("json", json);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("yml", yaml);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("md", markdown);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("shell", shell);
hljs.registerLanguage("powershell", powershell);
hljs.registerLanguage("ps1", powershell);
hljs.registerLanguage("lua", lua);
hljs.registerLanguage("perl", perl);
hljs.registerLanguage("r", r);
hljs.registerLanguage("scala", scala);
hljs.registerLanguage("dart", dart);
hljs.registerLanguage("groovy", groovy);
hljs.registerLanguage("diff", diff);
hljs.registerLanguage("ini", ini);
hljs.registerLanguage("nginx", nginx);
hljs.registerLanguage("dockerfile", dockerfile);
hljs.registerLanguage("docker", dockerfile);
hljs.registerLanguage("plaintext", plaintext);
hljs.registerLanguage("text", plaintext);

// 配置 marked 使用 GFM (GitHub Flavored Markdown)
// async: false 确保同步解析
marked.setOptions({
  gfm: true,
  breaks: true,
  async: false,
});

// 自定义代码块渲染器，添加语法高亮
const renderer = new marked.Renderer();

renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
  // 只在指定语言且语言存在时才高亮（避免 highlightAuto 的性能问题）
  if (lang && hljs.getLanguage(lang)) {
    try {
      const highlighted = hljs.highlight(text, { language: lang }).value;
      return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
    } catch {
      // 高亮失败，返回纯文本
    }
  }
  
  // 未指定语言或语言不支持，返回纯文本（不做自动检测）
  return `<pre><code class="hljs">${escapeHtml(text)}</code></pre>`;
};

marked.use({ renderer });

/**
 * 预处理 Markdown 文本
 * 处理没有空格的标题格式，如 ###标题 -> ### 标题
 */
function preprocessMarkdown(markdown: string): string {
  // 匹配行首的 # 号后面直接跟非空格非#字符的情况
  // 例如: ###标题 -> ### 标题
  return markdown.replace(/^(#{1,6})([^\s#])/gm, "$1 $2");
}

/**
 * 将行内代码内容分割为带 span 的 HTML，支持在标点处换行
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
 * 后处理 HTML，将行内 code 元素内容分割为 span
 * 不处理 pre 内的 code（代码块）
 */
function postprocessInlineCode(html: string): string {
  // 匹配不在 pre 标签内的 code 元素
  // 使用正则替换行内 code
  return html.replace(/<code>([^<]+)<\/code>/g, (match, content) => {
    const splitContent = splitCodeContent(content);
    return `<code class="code-inline">${splitContent}</code>`;
  });
}

/**
 * 解析 Markdown 文本为 HTML
 * @param markdown - Markdown 源文本
 * @returns 解析后的 HTML 字符串
 */
export function parseMarkdown(markdown: string): string {
  if (!markdown || markdown.trim() === "") {
    return "";
  }

  try {
    // 预处理：修复没有空格的标题
    const preprocessed = preprocessMarkdown(markdown);
    // 使用 { async: false } 确保同步返回字符串
    let html = marked.parse(preprocessed, { async: false }) as string;
    // 后处理：分割行内代码内容
    html = postprocessInlineCode(html);
    return html;
  } catch (error) {
    console.error("Markdown 解析错误:", error);
    // 解析失败时返回转义后的纯文本
    return escapeHtml(markdown);
  }
}

/**
 * 转义 HTML 特殊字符
 */
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

/**
 * 检查 HTML 是否包含特定元素
 * 用于测试验证
 */
export function htmlContainsElement(html: string, tagName: string): boolean {
  const regex = new RegExp(`<${tagName}[^>]*>`, "i");
  return regex.test(html);
}

/**
 * 获取 HTML 中所有指定标签
 */
export function getHtmlElements(html: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    matches.push(match[0]);
  }
  return matches;
}
