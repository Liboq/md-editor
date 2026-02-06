/**
 * 简书导出器单元测试
 * 
 * 验证简书导出器的核心功能：
 * - 输出简化 Markdown 格式
 * - 转换复杂格式为基础格式
 * - 转换 LaTeX 公式为文本格式
 * - 移除不支持的 HTML 标签
 * 
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
 * **Property 5: Markdown 格式导出**
 * **Property 6: 不支持标签移除**
 */

import { describe, it, expect } from 'vitest';
import { jianshuExporter } from './jianshu';
import type { Theme } from '../../themes/types';

// 模拟主题对象
const mockTheme = {} as Theme;

describe('简书导出器', () => {
  describe('基本属性', () => {
    it('应该有正确的平台标识', () => {
      expect(jianshuExporter.id).toBe('jianshu');
    });

    it('应该有正确的平台名称', () => {
      expect(jianshuExporter.name).toBe('简书');
    });

    it('应该有正确的导出格式类型', () => {
      expect(jianshuExporter.formatType).toBe('markdown');
    });

    it('应该有正确的图标', () => {
      expect(jianshuExporter.icon).toBe('Feather');
    });
  });

  describe('简化 Markdown 格式输出 (Requirement 6.1)', () => {
    it('应该返回 Markdown 格式内容', () => {
      const markdown = '# 标题\n\n这是一段文本。';
      const result = jianshuExporter.export(markdown, '<h1>标题</h1><p>这是一段文本。</p>', mockTheme);
      
      expect(result.content).toContain('# 标题');
      expect(result.content).toContain('这是一段文本。');
    });

    it('应该返回 text/plain 的 mimeType', () => {
      const markdown = '# 测试';
      const result = jianshuExporter.export(markdown, '', mockTheme);
      
      expect(result.mimeType).toBe('text/plain');
    });
  });

  describe('复杂格式转换为基础格式 (Requirement 6.2)', () => {
    describe('任务列表转换', () => {
      it('应该将未完成任务列表转换为普通列表', () => {
        const markdown = '- [ ] 待办事项1\n- [ ] 待办事项2';
        const result = jianshuExporter.export(markdown, '', mockTheme);
        
        expect(result.content).toContain('- ☐ 待办事项1');
        expect(result.content).toContain('- ☐ 待办事项2');
        expect(result.content).not.toContain('[ ]');
      });

      it('应该将已完成任务列表转换为普通列表', () => {
        const markdown = '- [x] 已完成事项1\n- [X] 已完成事项2';
        const result = jianshuExporter.export(markdown, '', mockTheme);
        
        expect(result.content).toContain('- ☑ 已完成事项1');
        expect(result.content).toContain('- ☑ 已完成事项2');
        expect(result.content).not.toContain('[x]');
        expect(result.content).not.toContain('[X]');
      });

      it('应该处理带缩进的任务列表', () => {
        const markdown = '- 父任务\n  - [ ] 子任务\n    - [x] 子子任务';
        const result = jianshuExporter.export(markdown, '', mockTheme);
        
        expect(result.content).toContain('- 父任务');
        expect(result.content).toContain('  - ☐ 子任务');
        expect(result.content).toContain('    - ☑ 子子任务');
      });
    });

    describe('高亮文本转换', () => {
      it('应该将高亮文本转换为加粗', () => {
        const markdown = '这是 ==高亮文本== 示例';
        const result = jianshuExporter.export(markdown, '', mockTheme);
        
        expect(result.content).toContain('**高亮文本**');
        expect(result.content).not.toContain('==');
      });

      it('应该处理多个高亮文本', () => {
        const markdown = '==第一个== 和 ==第二个==';
        const result = jianshuExporter.export(markdown, '', mockTheme);
        
        expect(result.content).toContain('**第一个**');
        expect(result.content).toContain('**第二个**');
      });
    });

    describe('脚注转换', () => {
      it('应该将脚注引用转换为括号形式', () => {
        const markdown = '这是一段文本[^1]，还有另一个引用[^2]。';
        const result = jianshuExporter.export(markdown, '', mockTheme);
        
        expect(result.content).toContain('(注1)');
        expect(result.content).toContain('(注2)');
        expect(result.content).not.toContain('[^1]');
        expect(result.content).not.toContain('[^2]');
      });

      it('应该将脚注定义转换为注释形式', () => {
        const markdown = '[^1]: 这是脚注内容\n[^2]: 另一个脚注';
        const result = jianshuExporter.export(markdown, '', mockTheme);
        
        expect(result.content).toContain('注1: 这是脚注内容');
        expect(result.content).toContain('注2: 另一个脚注');
      });
    });
  });

  describe('表格语法保留 (Requirement 6.3)', () => {
    it('应该保留标准 Markdown 表格语法', () => {
      const markdown = `| 列1 | 列2 |
| --- | --- |
| 值1 | 值2 |`;
      const result = jianshuExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('| 列1 | 列2 |');
      expect(result.content).toContain('| --- | --- |');
      expect(result.content).toContain('| 值1 | 值2 |');
    });

    it('应该保留带对齐的表格', () => {
      const markdown = `| 左对齐 | 居中 | 右对齐 |
| :--- | :---: | ---: |
| 内容 | 内容 | 内容 |`;
      const result = jianshuExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('| :--- | :---: | ---: |');
    });
  });

  describe('不支持的 HTML 标签移除 (Requirement 6.4)', () => {
    it('应该移除 script 标签', () => {
      const markdown = '# 标题\n<script>alert("xss")</script>\n正文';
      const result = jianshuExporter.export(markdown, '', mockTheme);
      
      expect(result.content).not.toContain('<script>');
      expect(result.content).not.toContain('</script>');
      expect(result.content).not.toContain('alert');
      expect(result.content).toContain('# 标题');
      expect(result.content).toContain('正文');
    });

    it('应该移除 style 标签', () => {
      const markdown = '<style>.red { color: red; }</style>\n# 标题';
      const result = jianshuExporter.export(markdown, '', mockTheme);
      
      expect(result.content).not.toContain('<style>');
      expect(result.content).not.toContain('</style>');
      expect(result.content).not.toContain('.red');
    });

    it('应该移除 iframe 标签', () => {
      const markdown = '<iframe src="https://example.com"></iframe>';
      const result = jianshuExporter.export(markdown, '', mockTheme);
      
      expect(result.content).not.toContain('<iframe');
      expect(result.content).not.toContain('</iframe>');
    });

    it('应该移除 form 相关标签', () => {
      const markdown = '<form><input type="text"><button>提交</button></form>';
      const result = jianshuExporter.export(markdown, '', mockTheme);
      
      expect(result.content).not.toContain('<form');
      expect(result.content).not.toContain('<input');
      expect(result.content).not.toContain('<button');
    });

    it('应该移除多媒体标签', () => {
      const markdown = '<video src="video.mp4"></video>\n<audio src="audio.mp3"></audio>';
      const result = jianshuExporter.export(markdown, '', mockTheme);
      
      expect(result.content).not.toContain('<video');
      expect(result.content).not.toContain('<audio');
    });

    it('应该移除 canvas 标签', () => {
      const markdown = '<canvas id="myCanvas"></canvas>';
      const result = jianshuExporter.export(markdown, '', mockTheme);
      
      expect(result.content).not.toContain('<canvas');
    });

    it('应该移除自闭合的不支持标签', () => {
      const markdown = '<input type="hidden" /><link rel="stylesheet" />';
      const result = jianshuExporter.export(markdown, '', mockTheme);
      
      expect(result.content).not.toContain('<input');
      expect(result.content).not.toContain('<link');
    });

    it('应该保留支持的 HTML 标签', () => {
      const markdown = '<div>内容</div>\n<span>文本</span>\n<a href="#">链接</a>';
      const result = jianshuExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('<div>');
      expect(result.content).toContain('<span>');
      expect(result.content).toContain('<a href="#">');
    });
  });

  describe('LaTeX 公式转换（简书不支持 LaTeX）', () => {
    it('应该将行内公式转换为行内代码', () => {
      const markdown = '这是一个公式 $E = mc^2$ 在文本中';
      const result = jianshuExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('`[公式: E = mc^2]`');
      expect(result.content).not.toContain('$E = mc^2$');
    });

    it('应该将块级公式转换为代码块', () => {
      const markdown = '$$\n\\sum_{i=1}^{n} x_i\n$$';
      const result = jianshuExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('[数学公式]');
      expect(result.content).toContain('\\sum_{i=1}^{n} x_i');
      expect(result.content).not.toContain('$$');
    });

    it('不应该转换货币金额', () => {
      const markdown = '价格是 $100 美元';
      const result = jianshuExporter.export(markdown, '', mockTheme);
      
      // 货币金额应该保持原样
      expect(result.content).toContain('$100');
    });

    it('应该处理多个公式', () => {
      const markdown = '公式1: $a + b$ 和公式2: $c + d$';
      const result = jianshuExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('`[公式: a + b]`');
      expect(result.content).toContain('`[公式: c + d]`');
    });
  });

  describe('代码块语言标识保留', () => {
    it('应该保留 JavaScript 代码块语言标识', () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      const result = jianshuExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('```javascript');
      expect(result.content).toContain('const x = 1;');
    });

    it('应该保留 TypeScript 代码块语言标识', () => {
      const markdown = '```typescript\nconst x: number = 1;\n```';
      const result = jianshuExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('```typescript');
    });

    it('应该保留 Python 代码块语言标识', () => {
      const markdown = '```python\nprint("hello")\n```';
      const result = jianshuExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('```python');
    });

    it('应该保留无语言标识的代码块', () => {
      const markdown = '```\nplain code\n```';
      const result = jianshuExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('```');
      expect(result.content).toContain('plain code');
    });
  });

  describe('图片语法保留', () => {
    it('应该保留标准 Markdown 图片语法', () => {
      const markdown = '![示例图片](https://example.com/image.png)';
      const result = jianshuExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('![示例图片](https://example.com/image.png)');
    });

    it('应该保留带标题的图片', () => {
      const markdown = '![图片](https://example.com/img.jpg "图片标题")';
      const result = jianshuExporter.export(markdown, '', mockTheme);
      
      expect(result.content).toContain('![图片](https://example.com/img.jpg "图片标题")');
    });
  });

  describe('空内容处理', () => {
    it('应该正确处理空字符串', () => {
      const result = jianshuExporter.export('', '', mockTheme);
      
      expect(result.content).toBe('');
      expect(result.mimeType).toBe('text/plain');
    });

    it('应该清理多余的空行', () => {
      const markdown = '# 标题\n\n\n\n正文';
      const result = jianshuExporter.export(markdown, '', mockTheme);
      
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

- [ ] 待办事项
- [x] 已完成

这是 ==高亮文本== 示例。

参考文献[^1]

[^1]: 这是脚注内容
`;
      const result = jianshuExporter.export(markdown, '', mockTheme);
      
      // 验证各项功能
      expect(result.content).toContain('# 技术文章');
      expect(result.content).toContain('![示例图片]');
      expect(result.content).toContain('```javascript');
      expect(result.content).not.toContain('<script>');
      expect(result.content).toContain('| 特性 | 支持 |');
      expect(result.content).toContain('`[公式: E = mc^2]`');
      expect(result.content).toContain('- ☐ 待办事项');
      expect(result.content).toContain('- ☑ 已完成');
      expect(result.content).toContain('**高亮文本**');
      expect(result.content).toContain('(注1)');
      expect(result.content).toContain('注1: 这是脚注内容');
      expect(result.mimeType).toBe('text/plain');
    });
  });
});
