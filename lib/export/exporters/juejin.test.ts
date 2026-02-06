/**
 * 掘金导出器单元测试
 * 
 * 验证掘金导出器的核心功能：
 * - 输出标准 Markdown 格式
 * - 保留代码块语言标识
 * - 保留标准 Markdown 图片语法
 * - 保留标准 Markdown 表格语法
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3**
 */

import { describe, it, expect } from 'vitest';
import { juejinExporter } from './juejin';
import type { Theme } from '../../themes/types';

// 模拟主题对象
const mockTheme = {} as Theme;

describe('掘金导出器', () => {
  describe('基本属性', () => {
    it('应该有正确的平台标识', () => {
      expect(juejinExporter.id).toBe('juejin');
    });

    it('应该有正确的平台名称', () => {
      expect(juejinExporter.name).toBe('掘金');
    });

    it('应该有正确的导出格式类型', () => {
      expect(juejinExporter.formatType).toBe('markdown');
    });

    it('应该有正确的图标', () => {
      expect(juejinExporter.icon).toBe('Code2');
    });
  });

  describe('Markdown 格式输出 (Requirement 4.1)', () => {
    it('应该直接返回原始 Markdown 文本', () => {
      const markdown = '# 标题\n\n这是一段文本。';
      const result = juejinExporter.export(markdown, '<h1>标题</h1><p>这是一段文本。</p>', mockTheme);
      
      expect(result.content).toBe(markdown);
    });

    it('应该返回 text/plain 的 mimeType', () => {
      const markdown = '# 测试';
      const result = juejinExporter.export(markdown, '', mockTheme);
      
      expect(result.mimeType).toBe('text/plain');
    });
  });

  describe('代码块语言标识保留 (Requirement 4.2)', () => {
    it('应该保留 JavaScript 代码块语言标识', () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      const result = juejinExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('```javascript');
      expect(result.content).toContain('const x = 1;');
      expect(result.content).toContain('```');
    });

    it('应该保留 TypeScript 代码块语言标识', () => {
      const markdown = '```typescript\nconst x: number = 1;\n```';
      const result = juejinExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('```typescript');
    });

    it('应该保留 Python 代码块语言标识', () => {
      const markdown = '```python\nprint("hello")\n```';
      const result = juejinExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('```python');
    });

    it('应该保留无语言标识的代码块', () => {
      const markdown = '```\nplain code\n```';
      const result = juejinExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('```\nplain code\n```');
    });
  });

  describe('图片语法保留 (Requirement 4.3)', () => {
    it('应该保留标准 Markdown 图片语法', () => {
      const markdown = '![示例图片](https://example.com/image.png)';
      const result = juejinExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toBe(markdown);
      expect(result.content).toContain('![示例图片]');
      expect(result.content).toContain('(https://example.com/image.png)');
    });

    it('应该保留带标题的图片语法', () => {
      const markdown = '![图片](https://example.com/img.jpg "图片标题")';
      const result = juejinExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toBe(markdown);
    });
  });

  describe('表格语法保留', () => {
    it('应该保留标准 Markdown 表格语法', () => {
      const markdown = `| 列1 | 列2 |
| --- | --- |
| 值1 | 值2 |`;
      const result = juejinExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toBe(markdown);
      expect(result.content).toContain('| 列1 | 列2 |');
      expect(result.content).toContain('| --- | --- |');
    });
  });

  describe('扩展语法保留', () => {
    it('应该保留 LaTeX 行内公式', () => {
      const markdown = '这是一个公式 $E = mc^2$ 在文本中';
      const result = juejinExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('$E = mc^2$');
    });

    it('应该保留 LaTeX 块级公式', () => {
      const markdown = '$$\n\\sum_{i=1}^{n} x_i\n$$';
      const result = juejinExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('$$');
      expect(result.content).toContain('\\sum_{i=1}^{n} x_i');
    });

    it('应该保留任务列表语法', () => {
      const markdown = '- [x] 已完成\n- [ ] 未完成';
      const result = juejinExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('- [x] 已完成');
      expect(result.content).toContain('- [ ] 未完成');
    });

    it('应该保留脚注语法', () => {
      const markdown = '这是一个脚注[^1]\n\n[^1]: 脚注内容';
      const result = juejinExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('[^1]');
      expect(result.content).toContain('[^1]: 脚注内容');
    });
  });

  describe('空内容处理', () => {
    it('应该正确处理空字符串', () => {
      const result = juejinExporter.export('', '', mockTheme);
      
      expect(result.content).toBe('');
      expect(result.mimeType).toBe('text/plain');
    });

    it('应该正确处理只有空白的内容', () => {
      const markdown = '   \n\n   ';
      const result = juejinExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toBe(markdown);
    });
  });
});
