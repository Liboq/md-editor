"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/lib/themes/theme-context";
import { Plus, Info, Copy, Check, Eye, Pencil } from "lucide-react";
import { toast } from "sonner";
import type { Theme } from "@/lib/themes/types";

// 预览示例 Markdown HTML
const PREVIEW_SAMPLE_HTML = `
<h1>一级标题</h1>
<h2>二级标题</h2>
<h3>三级标题</h3>
<p>这是一段普通的<strong>段落文字</strong>，包含<em>斜体</em>和<a href="#">链接</a>样式。</p>
<blockquote>
<p>这是一段引用文字，通常用于引用他人的话或重要内容。</p>
</blockquote>
<p>行内代码示例：<code>const hello = "world";</code></p>
<pre><code>// 代码块示例
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet("World"));</code></pre>
<h3>列表示例</h3>
<ul>
<li>无序列表项 1</li>
<li>无序列表项 2</li>
<li>无序列表项 3</li>
</ul>
<ol>
<li>有序列表项 1</li>
<li>有序列表项 2</li>
<li>有序列表项 3</li>
</ol>
<h3>表格示例</h3>
<table>
<thead>
<tr><th>功能</th><th>状态</th><th>说明</th></tr>
</thead>
<tbody>
<tr><td>Markdown 解析</td><td>✅ 完成</td><td>支持 GFM</td></tr>
<tr><td>主题切换</td><td>✅ 完成</td><td>6 种内置主题</td></tr>
<tr><td>自定义主题</td><td>✅ 完成</td><td>CSS 编辑器</td></tr>
</tbody>
</table>
<hr>
<p>分割线上方和下方的内容。</p>
`;

// 所有可用的 CSS 类及其说明
const CSS_CLASSES = [
  { selector: ".preview-content", desc: "预览容器", example: "background-color: #fff; color: #333; padding: 1rem;" },
  { selector: ".preview-content h1", desc: "一级标题", example: "color: #1a1a1a; font-size: 2em; font-weight: 600; border-bottom: 1px solid #eee;" },
  { selector: ".preview-content h2", desc: "二级标题", example: "color: #1a1a1a; font-size: 1.5em; font-weight: 600;" },
  { selector: ".preview-content h3", desc: "三级标题", example: "color: #1a1a1a; font-size: 1.25em; font-weight: 600;" },
  { selector: ".preview-content h4", desc: "四级标题", example: "color: #1a1a1a; font-size: 1.1em; font-weight: 600;" },
  { selector: ".preview-content h5", desc: "五级标题", example: "color: #1a1a1a; font-size: 1em; font-weight: 600;" },
  { selector: ".preview-content h6", desc: "六级标题", example: "color: #666; font-size: 0.9em; font-weight: 600;" },
  { selector: ".preview-content p", desc: "段落", example: "color: #333; font-size: 16px; line-height: 1.8; margin-bottom: 1em;" },
  { selector: ".preview-content a", desc: "链接", example: "color: #0066cc; text-decoration: none;" },
  { selector: ".preview-content a:hover", desc: "链接悬停", example: "text-decoration: underline;" },
  { selector: ".preview-content strong", desc: "粗体", example: "font-weight: 700;" },
  { selector: ".preview-content em", desc: "斜体", example: "font-style: italic;" },
  { selector: ".preview-content blockquote", desc: "引用块", example: "background: #f9f9f9; border-left: 4px solid #ddd; padding: 1em; margin: 1em 0;" },
  { selector: ".preview-content code", desc: "行内代码", example: "background: #f4f4f4; color: #c7254e; padding: 2px 6px; border-radius: 3px;" },
  { selector: ".preview-content pre", desc: "代码块", example: "background: #2d2d2d; color: #ccc; padding: 1em; border-radius: 6px; overflow: auto;" },
  { selector: ".preview-content pre code", desc: "代码块内代码", example: "background: transparent; color: inherit; padding: 0;" },
  { selector: ".preview-content ul", desc: "无序列表", example: "margin-left: 1.5em; margin-bottom: 1em; line-height: 1.8;" },
  { selector: ".preview-content ol", desc: "有序列表", example: "margin-left: 1.5em; margin-bottom: 1em; line-height: 1.8;" },
  { selector: ".preview-content li", desc: "列表项", example: "margin-bottom: 0.25em;" },
  { selector: ".preview-content table", desc: "表格", example: "border-collapse: collapse; width: 100%; margin: 1em 0;" },
  { selector: ".preview-content th", desc: "表头单元格", example: "background: #f4f4f4; border: 1px solid #ddd; padding: 8px 12px; font-weight: 600;" },
  { selector: ".preview-content td", desc: "表格单元格", example: "border: 1px solid #ddd; padding: 8px 12px;" },
  { selector: ".preview-content tr:nth-child(even)", desc: "偶数行", example: "background: #fafafa;" },
  { selector: ".preview-content img", desc: "图片", example: "max-width: 100%; border-radius: 4px; margin: 1em 0;" },
  { selector: ".preview-content hr", desc: "分割线", example: "border: none; border-top: 1px solid #eee; margin: 2em 0;" },
];

// 默认 CSS 模板
const DEFAULT_CSS = `/* 预览容器 */
.preview-content {
  background-color: #ffffff;
  color: #1a1a1a;
  padding: 1rem;
}

/* 一级标题 */
.preview-content h1 {
  color: #1a1a1a;
  font-size: 2em;
  font-weight: 600;
  line-height: 1.3;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  border-bottom: 1px solid #e5e5e5;
  padding-bottom: 0.3em;
}

/* 二级标题 */
.preview-content h2 {
  color: #1a1a1a;
  font-size: 1.5em;
  font-weight: 600;
  line-height: 1.3;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  border-bottom: 1px solid #e5e5e5;
  padding-bottom: 0.3em;
}

/* 三级标题 */
.preview-content h3 {
  color: #1a1a1a;
  font-size: 1.25em;
  font-weight: 600;
  line-height: 1.3;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

/* 四级标题 */
.preview-content h4 {
  color: #1a1a1a;
  font-size: 1.1em;
  font-weight: 600;
  line-height: 1.3;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

/* 五级标题 */
.preview-content h5 {
  color: #1a1a1a;
  font-size: 1em;
  font-weight: 600;
  line-height: 1.3;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

/* 六级标题 */
.preview-content h6 {
  color: #666666;
  font-size: 0.9em;
  font-weight: 600;
  line-height: 1.3;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

/* 段落 */
.preview-content p {
  color: #1a1a1a;
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 1em;
}

/* 链接 */
.preview-content a {
  color: #0066cc;
  text-decoration: none;
}

.preview-content a:hover {
  text-decoration: underline;
}

/* 引用块 */
.preview-content blockquote {
  background: #f9f9f9;
  border-left: 4px solid #ddd;
  color: #666666;
  padding: 1em;
  margin: 1em 0;
  font-style: italic;
}

/* 行内代码 */
.preview-content code {
  background: #f4f4f4;
  color: #c7254e;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: Consolas, Monaco, monospace;
  font-size: 0.9em;
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

/* 代码块 */
.preview-content pre {
  background: #f4f4f4;
  color: #333333;
  padding: 1em;
  border-radius: 6px;
  font-family: Consolas, Monaco, monospace;
  font-size: 0.9em;
  line-height: 1.5;
  overflow: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.preview-content pre code {
  background: transparent;
  color: inherit;
  padding: 0;
  border-radius: 0;
}

/* 列表 */
.preview-content ul,
.preview-content ol {
  color: #1a1a1a;
  margin-left: 1.5em;
  margin-bottom: 1em;
  line-height: 1.8;
}

/* 表格 */
.preview-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.preview-content th,
.preview-content td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.preview-content th {
  background: #f4f4f4;
  color: #1a1a1a;
  font-weight: 600;
}

.preview-content tr:nth-child(even) {
  background: #fafafa;
}

/* 图片 */
.preview-content img {
  max-width: 100%;
  border-radius: 4px;
  margin: 1em 0;
}

/* 分割线 */
.preview-content hr {
  border: none;
  border-top: 1px solid #e5e5e5;
  margin: 2em 0;
}
`;

export function ThemeEditorDialog() {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [themeName, setThemeName] = useState("");
  const [customCSS, setCustomCSS] = useState(DEFAULT_CSS);
  const [copiedSelector, setCopiedSelector] = useState<string | null>(null);
  const { saveCustomTheme, customThemes } = useTheme();

  // 打开新建主题对话框
  const handleOpenCreate = () => {
    setEditMode(false);
    setEditingThemeId(null);
    setThemeName("");
    setCustomCSS(DEFAULT_CSS);
    setOpen(true);
  };

  // 打开编辑主题对话框
  const handleOpenEdit = (theme: Theme) => {
    setEditMode(true);
    setEditingThemeId(theme.id);
    setThemeName(theme.name);
    setCustomCSS(theme.customCSS || DEFAULT_CSS);
    setOpen(true);
  };

  const handleCopySelector = (selector: string) => {
    navigator.clipboard.writeText(selector);
    setCopiedSelector(selector);
    setTimeout(() => setCopiedSelector(null), 2000);
  };

  const handleInsertExample = (selector: string, example: string) => {
    const cssRule = `\n${selector} {\n  ${example.split("; ").join(";\n  ")}\n}\n`;
    setCustomCSS((prev) => prev + cssRule);
    toast.success(`已添加 ${selector} 样式`);
  };

  const handleSave = () => {
    if (!themeName.trim()) {
      toast.error("请输入主题名称");
      return;
    }

    // 解析 CSS 生成主题对象
    const theme = parseCSSToTheme(
      themeName,
      customCSS,
      editMode && editingThemeId ? editingThemeId : undefined
    );
    if (theme) {
      saveCustomTheme(theme);
      toast.success(editMode ? `主题 "${themeName}" 已更新` : `主题 "${themeName}" 已保存`);
      setOpen(false);
      setThemeName("");
      setCustomCSS(DEFAULT_CSS);
      setEditMode(false);
      setEditingThemeId(null);
    } else {
      toast.error("CSS 解析失败，请检查格式");
    }
  };

  const handleReset = () => {
    setCustomCSS(DEFAULT_CSS);
    toast.success("已重置为默认样式");
  };

  // 获取可编辑的自定义主题列表
  const editableThemes = customThemes.filter((t) => !t.isBuiltIn);

  return (
    <>
      {/* 新建主题按钮 */}
      <Button
        variant="outline"
        size="sm"
        className="gap-1 cursor-pointer"
        onClick={handleOpenCreate}
      >
        <Plus className="h-4 w-4" />
        新建主题
      </Button>

      {/* 编辑主题按钮（仅当有自定义主题时显示） */}
      {editableThemes.length > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 cursor-pointer">
              <Pencil className="h-4 w-4" />
              编辑主题
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>选择要编辑的主题</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-[300px] overflow-auto">
              {editableThemes.map((theme) => (
                <div
                  key={theme.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleOpenEdit(theme)}
                >
                  <span className="font-medium">{theme.name}</span>
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 主题编辑器对话框 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editMode ? "编辑主题" : "创建自定义主题"}</DialogTitle>
          </DialogHeader>

        <Tabs defaultValue="editor" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="editor">CSS 编辑器</TabsTrigger>
            <TabsTrigger value="preview" className="gap-1">
              <Eye className="h-3 w-3" />
              实时预览
            </TabsTrigger>
            <TabsTrigger value="reference">样式参考</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="flex-1 flex flex-col min-h-0 mt-4">
            <div className="space-y-3 flex-1 flex flex-col min-h-0">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="themeName">主题名称</Label>
                  <Input
                    id="themeName"
                    value={themeName}
                    onChange={(e) => setThemeName(e.target.value)}
                    placeholder="输入主题名称"
                    className="mt-1"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  重置默认
                </Button>
              </div>

              <div className="flex-1 min-h-0">
                <Label>自定义 CSS</Label>
                <Textarea
                  value={customCSS}
                  onChange={(e) => setCustomCSS(e.target.value)}
                  className="mt-1 h-[400px] font-mono text-sm resize-none"
                  placeholder="输入自定义 CSS..."
                />
              </div>

              <p className="text-xs text-muted-foreground">
                💡 提示：所有样式都需要以 <code className="bg-muted px-1 rounded">.preview-content</code> 开头。
                切换到「实时预览」标签查看效果，或到「样式参考」标签查看所有可用的选择器。
              </p>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 flex flex-col min-h-0 mt-4">
            <div className="flex-1 border rounded-lg overflow-auto">
              {/* 注入自定义 CSS */}
              <style dangerouslySetInnerHTML={{ __html: customCSS }} />
              {/* 预览内容 */}
              <div
                className="preview-content p-6"
                dangerouslySetInnerHTML={{ __html: PREVIEW_SAMPLE_HTML }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              💡 提示：修改 CSS 后切换到此标签页查看实时效果
            </p>
          </TabsContent>

          <TabsContent value="reference" className="flex-1 overflow-auto mt-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-4">
                以下是所有可用的 CSS 选择器，点击可复制或插入示例样式：
              </p>
              <TooltipProvider>
                <div className="grid gap-2">
                  {CSS_CLASSES.map((item) => (
                    <div
                      key={item.selector}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {item.selector}
                        </code>
                        <span className="text-sm text-muted-foreground ml-3">
                          {item.desc}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 cursor-pointer"
                              onClick={() => handleCopySelector(item.selector)}
                            >
                              {copiedSelector === item.selector ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>复制选择器</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 cursor-pointer"
                              onClick={() => handleInsertExample(item.selector, item.example)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>插入示例样式</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-mono text-xs">{item.example}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              </TooltipProvider>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>{editMode ? "更新主题" : "保存主题"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

/**
 * 解析 CSS 字符串生成主题对象
 */
function parseCSSToTheme(name: string, css: string, existingId?: string): Theme | null {
  try {
    // 如果是编辑模式，使用现有 ID；否则生成新 ID
    const id = existingId || `custom-${Date.now()}`;

    // 提取基础颜色
    const bgMatch = css.match(/\.preview-content\s*\{[^}]*background(?:-color)?:\s*([^;]+)/);
    const textMatch = css.match(/\.preview-content\s*\{[^}]*(?<!background-)color:\s*([^;]+)/);

    const background = bgMatch ? bgMatch[1].trim() : "#ffffff";
    const text = textMatch ? textMatch[1].trim() : "#1a1a1a";

    // 创建基础主题
    const theme: Theme = {
      id,
      name,
      description: "自定义 CSS 主题",
      isBuiltIn: false,
      customCSS: css,
      styles: {
        background,
        text,
        textSecondary: "#666666",
        h1: createDefaultHeadingStyle(text, "2em"),
        h2: createDefaultHeadingStyle(text, "1.5em"),
        h3: createDefaultHeadingStyle(text, "1.25em"),
        h4: createDefaultHeadingStyle(text, "1.1em"),
        h5: createDefaultHeadingStyle(text, "1em"),
        h6: createDefaultHeadingStyle("#666666", "0.9em"),
        paragraph: { color: text, fontSize: "16px", lineHeight: "1.8", marginBottom: "1em" },
        link: { color: "#0066cc", textDecoration: "none" },
        blockquote: { background: "#f9f9f9", borderLeft: "4px solid #ddd", color: "#666666", padding: "1em", margin: "1em 0", fontStyle: "italic" },
        code: { background: "#f4f4f4", color: "#c7254e", padding: "2px 6px", borderRadius: "3px", fontFamily: "Consolas, Monaco, monospace", fontSize: "0.9em" },
        codeBlock: { background: "#f4f4f4", color: "#333333", padding: "1em", borderRadius: "6px", fontFamily: "Consolas, Monaco, monospace", fontSize: "0.9em", lineHeight: "1.5", overflow: "auto" },
        list: { color: text, marginLeft: "1.5em", marginBottom: "1em", lineHeight: "1.8" },
        table: { borderColor: "#ddd", headerBackground: "#f4f4f4", headerColor: text, cellPadding: "8px 12px", evenRowBackground: "#fafafa" },
        image: { maxWidth: "100%", borderRadius: "4px", margin: "1em 0" },
        hr: { border: "1px solid #e5e5e5", margin: "2em 0" },
      },
    };

    return theme;
  } catch (error) {
    console.error("CSS 解析错误:", error);
    return null;
  }
}

function createDefaultHeadingStyle(color: string, fontSize: string) {
  return {
    color,
    fontSize,
    fontWeight: "600",
    lineHeight: "1.3",
    marginTop: "1.5em",
    marginBottom: "0.5em",
  };
}
