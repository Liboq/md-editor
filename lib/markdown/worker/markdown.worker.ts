/**
 * Markdown 渲染 Web Worker
 * 
 * 将 Markdown 处理放在后台线程执行，避免阻塞主线程。
 */

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

import { renderMarkdown, extractText, lintMarkdown } from "./procedures";

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

// 配置 marked
marked.setOptions({ gfm: true, breaks: true, async: false });

// 语言显示名称映射
const langNames: Record<string, string> = {
  javascript: "JavaScript", js: "JavaScript", typescript: "TypeScript", ts: "TypeScript",
  python: "Python", py: "Python", java: "Java", cpp: "C++", c: "C", csharp: "C#", cs: "C#",
  go: "Go", rust: "Rust", rs: "Rust", php: "PHP", ruby: "Ruby", rb: "Ruby", swift: "Swift",
  kotlin: "Kotlin", kt: "Kotlin", objectivec: "Objective-C", objc: "Objective-C",
  css: "CSS", scss: "SCSS", less: "Less", xml: "XML", html: "HTML", json: "JSON",
  yaml: "YAML", yml: "YAML", markdown: "Markdown", md: "Markdown", sql: "SQL",
  bash: "Bash", sh: "Shell", shell: "Shell", powershell: "PowerShell", ps1: "PowerShell",
  lua: "Lua", perl: "Perl", r: "R", scala: "Scala", dart: "Dart", groovy: "Groovy",
  diff: "Diff", ini: "INI", nginx: "Nginx", dockerfile: "Dockerfile", docker: "Dockerfile",
  plaintext: "Text", text: "Text",
};

// 自定义代码块渲染器
const renderer = new marked.Renderer();
renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
  const displayLang = lang ? langNames[lang.toLowerCase()] || lang.toUpperCase() : null;
  const labelStyle = "display:block;text-align:right;font-size:12px;font-weight:600;color:#1a73e8;background:rgba(26,115,232,0.08);padding:6px 12px;margin:-1em -1em 0.8em -1em;border-radius:6px 6px 0 0;font-family:system-ui,-apple-system,sans-serif;";
  const label = displayLang ? `<span class="code-lang-label" style="${labelStyle}">${displayLang}</span>` : "";
  
  if (lang && hljs.getLanguage(lang)) {
    try {
      const highlighted = hljs.highlight(text, { language: lang }).value;
      return `<pre class="code-block-wrapper"><code class="hljs language-${lang}">${label}${highlighted}</code></pre>`;
    } catch { /* 高亮失败 */ }
  }
  return `<pre class="code-block-wrapper"><code class="hljs">${label}${escapeHtml(text)}</code></pre>`;
};
marked.use({ renderer });

function escapeHtml(text: string): string {
  const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return text.replace(/[&<>"']/g, (c) => entities[c] || c);
}

function preprocessMarkdown(md: string): string {
  return md.replace(/^(#{1,6})([^\s#])/gm, "$1 $2");
}

function splitCodeContent(text: string): string {
  const placeholder = "\x00E\x00";
  const entities: string[] = [];
  const protected_ = text.replace(/&[a-zA-Z0-9#]+;/g, (m) => { entities.push(m); return placeholder; });
  let i = 0;
  return protected_.split(/([,;:.\/\\|])/g).filter(p => p !== "").map(p => {
    const restored = p.replace(new RegExp(placeholder.replace(/\x00/g, "\\x00"), "g"), () => entities[i++] || "");
    return `<span class="${/^[,;:.\/\\|]$/.test(restored) ? "pun" : "pln"}">${restored}</span>`;
  }).join("");
}

function postprocessInlineCode(html: string): string {
  return html.replace(/<code>([^<]+)<\/code>/g, (_, c) => `<code class="code-inline">${splitCodeContent(c)}</code>`);
}

function parseMarkdown(md: string): string {
  if (!md?.trim()) return "";
  try {
    const html = marked.parse(preprocessMarkdown(md), { async: false }) as string;
    return postprocessInlineCode(html);
  } catch (e) {
    console.error("Markdown 解析错误:", e);
    return escapeHtml(md);
  }
}

// 消息处理
self.onmessage = async (e: MessageEvent) => {
  const { id, method, params } = e.data;
  try {
    let result: unknown;
    switch (method) {
      case "render": result = renderMarkdown(params.markdown, parseMarkdown); break;
      case "extract": result = extractText(params.markdown); break;
      case "lint": result = lintMarkdown(params.markdown); break;
      case "ping": result = { pong: true, timestamp: Date.now() }; break;
      default: throw new Error(`未知方法: ${method}`);
    }
    self.postMessage({ id, result });
  } catch (err) {
    self.postMessage({ id, error: err instanceof Error ? err.message : "未知错误" });
  }
};

self.postMessage({ type: "ready" });
