/**
 * 代码块主题定义
 * 基于 highlight.js 的颜色方案
 */

export interface CodeTheme {
  id: string;
  name: string;
  // 基础样式
  background: string;
  color: string;
  // 语法高亮颜色
  comment: string;
  keyword: string;
  string: string;
  number: string;
  function: string;
  variable: string;
  type: string;
  operator: string;
  punctuation: string;
  attr: string;
  meta: string;
}

// 预设代码主题
export const codeThemes: CodeTheme[] = [
  {
    id: "github",
    name: "GitHub",
    background: "#f6f8fa",
    color: "#24292e",
    comment: "#6a737d",
    keyword: "#d73a49",
    string: "#032f62",
    number: "#005cc5",
    function: "#6f42c1",
    variable: "#e36209",
    type: "#005cc5",
    operator: "#d73a49",
    punctuation: "#24292e",
    attr: "#6f42c1",
    meta: "#22863a",
  },
  {
    id: "github-dark",
    name: "GitHub Dark",
    background: "#0d1117",
    color: "#c9d1d9",
    comment: "#8b949e",
    keyword: "#ff7b72",
    string: "#a5d6ff",
    number: "#79c0ff",
    function: "#d2a8ff",
    variable: "#ffa657",
    type: "#79c0ff",
    operator: "#ff7b72",
    punctuation: "#c9d1d9",
    attr: "#d2a8ff",
    meta: "#7ee787",
  },
  {
    id: "monokai",
    name: "Monokai",
    background: "#272822",
    color: "#f8f8f2",
    comment: "#75715e",
    keyword: "#f92672",
    string: "#e6db74",
    number: "#ae81ff",
    function: "#a6e22e",
    variable: "#f8f8f2",
    type: "#66d9ef",
    operator: "#f92672",
    punctuation: "#f8f8f2",
    attr: "#a6e22e",
    meta: "#75715e",
  },
  {
    id: "dracula",
    name: "Dracula",
    background: "#282a36",
    color: "#f8f8f2",
    comment: "#6272a4",
    keyword: "#ff79c6",
    string: "#f1fa8c",
    number: "#bd93f9",
    function: "#50fa7b",
    variable: "#f8f8f2",
    type: "#8be9fd",
    operator: "#ff79c6",
    punctuation: "#f8f8f2",
    attr: "#50fa7b",
    meta: "#6272a4",
  },
  {
    id: "one-dark",
    name: "One Dark",
    background: "#282c34",
    color: "#abb2bf",
    comment: "#5c6370",
    keyword: "#c678dd",
    string: "#98c379",
    number: "#d19a66",
    function: "#61afef",
    variable: "#e06c75",
    type: "#e5c07b",
    operator: "#56b6c2",
    punctuation: "#abb2bf",
    attr: "#d19a66",
    meta: "#5c6370",
  },
  {
    id: "vs-light",
    name: "VS Light",
    background: "#ffffff",
    color: "#000000",
    comment: "#008000",
    keyword: "#0000ff",
    string: "#a31515",
    number: "#098658",
    function: "#795e26",
    variable: "#001080",
    type: "#267f99",
    operator: "#000000",
    punctuation: "#000000",
    attr: "#e50000",
    meta: "#008000",
  },
  {
    id: "vs-dark",
    name: "VS Dark",
    background: "#1e1e1e",
    color: "#d4d4d4",
    comment: "#6a9955",
    keyword: "#569cd6",
    string: "#ce9178",
    number: "#b5cea8",
    function: "#dcdcaa",
    variable: "#9cdcfe",
    type: "#4ec9b0",
    operator: "#d4d4d4",
    punctuation: "#d4d4d4",
    attr: "#9cdcfe",
    meta: "#6a9955",
  },
  {
    id: "nord",
    name: "Nord",
    background: "#2e3440",
    color: "#d8dee9",
    comment: "#616e88",
    keyword: "#81a1c1",
    string: "#a3be8c",
    number: "#b48ead",
    function: "#88c0d0",
    variable: "#d8dee9",
    type: "#8fbcbb",
    operator: "#81a1c1",
    punctuation: "#eceff4",
    attr: "#8fbcbb",
    meta: "#616e88",
  },
];

/**
 * 根据代码主题生成 CSS
 */
export function generateCodeThemeCSS(theme: CodeTheme): string {
  return `
    .preview-content pre code.hljs {
      background: ${theme.background} !important;
      color: ${theme.color} !important;
    }
    .preview-content .hljs-comment,
    .preview-content .hljs-quote {
      color: ${theme.comment} !important;
      font-style: italic !important;
    }
    .preview-content .hljs-keyword,
    .preview-content .hljs-selector-tag,
    .preview-content .hljs-literal {
      color: ${theme.keyword} !important;
    }
    .preview-content .hljs-string,
    .preview-content .hljs-title,
    .preview-content .hljs-name {
      color: ${theme.string} !important;
    }
    .preview-content .hljs-number {
      color: ${theme.number} !important;
    }
    .preview-content .hljs-function,
    .preview-content .hljs-title.function_ {
      color: ${theme.function} !important;
    }
    .preview-content .hljs-variable,
    .preview-content .hljs-template-variable {
      color: ${theme.variable} !important;
    }
    .preview-content .hljs-type,
    .preview-content .hljs-built_in {
      color: ${theme.type} !important;
    }
    .preview-content .hljs-attr {
      color: ${theme.attr} !important;
    }
    .preview-content .hljs-meta {
      color: ${theme.meta} !important;
    }
    .preview-content .hljs-symbol,
    .preview-content .hljs-bullet {
      color: ${theme.punctuation} !important;
    }
  `;
}
