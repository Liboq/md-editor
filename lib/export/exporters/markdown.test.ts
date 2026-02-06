/**
 * 纯 Markdown 导出器测试
 * 
 * 测试 Property 7: 纯 Markdown 恒等变换
 * 对于任意 Markdown 文本，经过纯 Markdown 导出器转换后，
 * 输出应与输入完全一致（字符级相等）。
 * 
 * **Validates: Requirements 7.1, 7.2**
 */

import { describe, it, expect } from 'vitest';
import { markdownExporter } from './markdown';
import { PLATFORMS, PLATFORM_META } from '../types';
import type { Theme } from '../../themes/types';

// 模拟主题对象
const mockTheme = {} as Theme;

describe('markdownExporter', () => {
  describe('导出器元数据', () => {
    it('应该有正确的平台标识', () => {
      expect(markdownExporter.id).toBe(PLATFORMS.MARKDOWN);
    });

    it('应该有正确的平台名称', () => {
      expect(markdownExporter.name).toBe(PLATFORM_META.markdown.name);
    });

    it('应该有正确的图标', () => {
      expect(markdownExporter.icon).toBe(PLATFORM_META.markdown.icon);
    });

    it('应该有正确的格式类型', () => {
      expect(markdownExporter.formatType).toBe('text');
    });
  });

  describe('恒等变换 (Property 7)', () => {
    it('应该返回与输入完全一致的内容 - 简单文本', () => {
      const markdown = '# Hello World\n\nThis is a test.';
      const result = markdownExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toBe(markdown);
      expect(result.mimeType).toBe('text/plain');
    });

    it('应该返回与输入完全一致的内容 - 空字符串', () => {
      const markdown = '';
      const result = markdownExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toBe(markdown);
      expect(result.mimeType).toBe('text/plain');
    });

    it('应该返回与输入完全一致的内容 - 代码块', () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      const result = markdownExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toBe(markdown);
      expect(result.mimeType).toBe('text/plain');
    });

    it('应该返回与输入完全一致的内容 - 表格', () => {
      const markdown = '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |';
      const result = markdownExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toBe(markdown);
      expect(result.mimeType).toBe('text/plain');
    });

    it('应该返回与输入完全一致的内容 - 图片', () => {
      const markdown = '![Alt text](https://example.com/image.png)';
      const result = markdownExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toBe(markdown);
      expect(result.mimeType).toBe('text/plain');
    });

    it('应该返回与输入完全一致的内容 - LaTeX 公式', () => {
      const markdown = '行内公式 $E = mc^2$ 和块级公式：\n\n$$\n\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}\n$$';
      const result = markdownExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toBe(markdown);
      expect(result.mimeType).toBe('text/plain');
    });

    it('应该返回与输入完全一致的内容 - 特殊字符', () => {
      const markdown = '特殊字符：<>&"\' 和 Unicode：中文、日本語、한국어、🎉';
      const result = markdownExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toBe(markdown);
      expect(result.mimeType).toBe('text/plain');
    });

    it('应该返回与输入完全一致的内容 - 复杂 Markdown', () => {
      const markdown = `# 标题

## 二级标题

这是一段**粗体**和*斜体*文本。

- 列表项 1
- 列表项 2
  - 嵌套列表项

1. 有序列表 1
2. 有序列表 2

> 引用文本

\`\`\`typescript
function hello(): void {
  console.log('Hello, World!');
}
\`\`\`

[链接](https://example.com)

![图片](https://example.com/image.png)

| 表头 1 | 表头 2 |
|--------|--------|
| 单元格 | 单元格 |

---

脚注[^1]

[^1]: 这是脚注内容
`;
      const result = markdownExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toBe(markdown);
      expect(result.mimeType).toBe('text/plain');
    });

    it('应该忽略 HTML 参数', () => {
      const markdown = '# Test';
      const html = '<h1>Test</h1>';
      const result = markdownExporter.export(markdown, html, mockTheme);
      
      // 应该返回 markdown，而不是 html
      expect(result.content).toBe(markdown);
      expect(result.content).not.toBe(html);
    });

    it('应该保留空白字符', () => {
      const markdown = '  前导空格\n\n\n多个换行\n\t制表符  ';
      const result = markdownExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toBe(markdown);
    });
  });
});
