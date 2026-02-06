/**
 * CSDN 导出器单元测试
 * 
 * 验证 CSDN 导出器的核心功能：
 * - 输出 Markdown 格式
 * - 标注外链图片
 * - 保留代码块语言标识
 * - 移除不支持的 HTML 标签
 * 
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
 */

import { describe, it, expect } from 'vitest';
import { csdnExporter } from './csdn';
import type { Theme } from '../../themes/types';

// 模拟主题对象
const mockTheme = {} as Theme;

describe('CSDN 导出器', () => {
  describe('基本属性', () => {
    it('应该有正确的平台标识', () => {
      expect(csdnExporter.id).toBe('csdn');
    });

    it('应该有正确的平台名称', () => {
      expect(csdnExporter.name).toBe('CSDN');
    });

    it('应该有正确的导出格式类型', () => {
      expect(csdnExporter.formatType).toBe('markdown');
    });

    it('应该有正确的图标', () => {
      expect(csdnExporter.icon).toBe('FileText');
    });
  });

  describe('Markdown 格式输出 (Requirement 5.1)', () => {
    it('应该返回 Markdown 格式内容', () => {
      const markdown = '# 标题\n\n这是一段文本。';
      const result = csdnExporter.export(markdown, '<h1>标题</h1><p>这是一段文本。</p>', mockTheme);
      
      expect(result.content).toContain('# 标题');
      expect(result.content).toContain('这是一段文本。');
    });

    it('应该返回 text/plain 的 mimeType', () => {
      const markdown = '# 测试';
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      expect(result.mimeType).toBe('text/plain');
    });
  });

  describe('外链图片标注 (Requirement 5.2)', () => {
    it('应该标注外链图片', () => {
      const markdown = '![示例图片](https://example.com/image.png)';
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('[外链图片]');
      expect(result.content).toContain('https://example.com/image.png');
    });

    it('应该标注多个外链图片', () => {
      const markdown = '![图片1](https://a.com/1.png)\n![图片2](https://b.com/2.png)';
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      // 两个图片都应该被标注
      const matches = result.content.match(/\[外链图片\]/g);
      expect(matches).toHaveLength(2);
    });

    it('不应该标注 CSDN 域名的图片', () => {
      const markdown = '![CSDN图片](https://img-blog.csdnimg.cn/image.png)';
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      expect(result.content).not.toContain('[外链图片]');
      expect(result.content).toContain('![CSDN图片]');
    });

    it('不应该标注 csdn.net 域名的图片', () => {
      const markdown = '![CSDN图片](https://img.csdn.net/image.png)';
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      expect(result.content).not.toContain('[外链图片]');
    });

    it('不应该标注 data: URI 图片', () => {
      const markdown = '![Base64图片](data:image/png;base64,iVBORw0KGgo=)';
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      expect(result.content).not.toContain('[外链图片]');
    });

    it('应该保留带标题的外链图片并添加标注', () => {
      const markdown = '![图片](https://example.com/img.jpg "图片标题")';
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('[外链图片]');
      expect(result.content).toContain('"图片标题"');
    });

    it('不应该重复标注已标注的图片', () => {
      const markdown = '![示例[外链图片]](https://example.com/image.png)';
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      // 应该只有一个 [外链图片] 标注
      const matches = result.content.match(/\[外链图片\]/g);
      expect(matches).toHaveLength(1);
    });
  });

  describe('代码块语言标识保留 (Requirement 5.3)', () => {
    it('应该保留 JavaScript 代码块语言标识', () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('```javascript');
      expect(result.content).toContain('const x = 1;');
    });

    it('应该保留 TypeScript 代码块语言标识', () => {
      const markdown = '```typescript\nconst x: number = 1;\n```';
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('```typescript');
    });

    it('应该保留 Python 代码块语言标识', () => {
      const markdown = '```python\nprint("hello")\n```';
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('```python');
    });

    it('应该保留无语言标识的代码块', () => {
      const markdown = '```\nplain code\n```';
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('```');
      expect(result.content).toContain('plain code');
    });
  });

  describe('不支持的 HTML 标签移除 (Requirement 5.4)', () => {
    it('应该移除 script 标签', () => {
      const markdown = '# 标题\n<script>alert("xss")</script>\n正文';
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      expect(result.content).not.toContain('<script>');
      expect(result.content).not.toContain('</script>');
      expect(result.content).not.toContain('alert');
      expect(result.content).toContain('# 标题');
      expect(result.content).toContain('正文');
    });

    it('应该移除 style 标签', () => {
      const markdown = '<style>.red { color: red; }</style>\n# 标题';
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      expect(result.content).not.toContain('<style>');
      expect(result.content).not.toContain('</style>');
      expect(result.content).not.toContain('.red');
    });

    it('应该移除 iframe 标签', () => {
      const markdown = '<iframe src="https://example.com"></iframe>';
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      expect(result.content).not.toContain('<iframe');
      expect(result.content).not.toContain('</iframe>');
    });

    it('应该移除 form 相关标签', () => {
      const markdown = '<form><input type="text"><button>提交</button></form>';
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      expect(result.content).not.toContain('<form');
      expect(result.content).not.toContain('<input');
      expect(result.content).not.toContain('<button');
    });

    it('应该移除 embed 和 object 标签', () => {
      const markdown = '<embed src="video.swf"><object data="app.swf"></object>';
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      expect(result.content).not.toContain('<embed');
      expect(result.content).not.toContain('<object');
    });

    it('应该移除自闭合的不支持标签', () => {
      const markdown = '<input type="hidden" /><link rel="stylesheet" />';
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      expect(result.content).not.toContain('<input');
      expect(result.content).not.toContain('<link');
    });

    it('应该保留支持的 HTML 标签', () => {
      const markdown = '<div>内容</div>\n<span>文本</span>\n<a href="#">链接</a>';
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('<div>');
      expect(result.content).toContain('<span>');
      expect(result.content).toContain('<a href="#">');
    });
  });

  describe('表格语法保留', () => {
    it('应该保留标准 Markdown 表格语法', () => {
      const markdown = `| 列1 | 列2 |
| --- | --- |
| 值1 | 值2 |`;
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('| 列1 | 列2 |');
      expect(result.content).toContain('| --- | --- |');
      expect(result.content).toContain('| 值1 | 值2 |');
    });
  });

  describe('LaTeX 公式保留', () => {
    it('应该保留行内公式', () => {
      const markdown = '这是一个公式 $E = mc^2$ 在文本中';
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('$E = mc^2$');
    });

    it('应该保留块级公式', () => {
      const markdown = '$$\n\\sum_{i=1}^{n} x_i\n$$';
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('$$');
      expect(result.content).toContain('\\sum_{i=1}^{n} x_i');
    });
  });

  describe('空内容处理', () => {
    it('应该正确处理空字符串', () => {
      const result = csdnExporter.export('', '', mockTheme);
      
      expect(result.content).toBe('');
      expect(result.mimeType).toBe('text/plain');
    });

    it('应该清理多余的空行', () => {
      const markdown = '# 标题\n\n\n\n正文';
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      // 应该最多保留两个换行
      expect(result.content).not.toContain('\n\n\n');
    });
  });

  describe('综合场景', () => {
    it('应该正确处理包含多种元素的复杂文档', () => {
      const markdown = `# 技术文章

这是一篇关于 JavaScript 的文章。

![示例图片](https://example.com/image.png)

\`\`\`javascript
const hello = "world";
console.log(hello);
\`\`\`

<script>alert("xss")</script>

| 特性 | 支持 |
| --- | --- |
| ES6 | ✓ |

公式：$E = mc^2$
`;
      const result = csdnExporter.export(markdown, '', mockTheme);
      
      // 验证各项功能
      expect(result.content).toContain('# 技术文章');
      expect(result.content).toContain('[外链图片]');
      expect(result.content).toContain('```javascript');
      expect(result.content).not.toContain('<script>');
      expect(result.content).toContain('| 特性 | 支持 |');
      expect(result.content).toContain('$E = mc^2$');
      expect(result.mimeType).toBe('text/plain');
    });
  });
});
