/**
 * 知乎导出器单元测试
 * 
 * 验证知乎导出器的核心功能：
 * - 代码块转换为 <pre><code> 结构
 * - 图片 URL 保持不变
 * - LaTeX 公式保持原始格式
 * 
 * @see Requirements 3.1, 3.2, 3.3, 3.4
 */

import { describe, it, expect } from 'vitest';
import { zhihuExporter } from './zhihu';
import type { Theme } from '../../themes/types';

// 模拟主题对象
const mockTheme = {} as Theme;

describe('知乎导出器', () => {
  describe('基本属性', () => {
    it('应该有正确的平台标识', () => {
      expect(zhihuExporter.id).toBe('zhihu');
    });

    it('应该有正确的平台名称', () => {
      expect(zhihuExporter.name).toBe('知乎');
    });

    it('应该有正确的导出格式类型', () => {
      expect(zhihuExporter.formatType).toBe('html');
    });
  });

  describe('代码块转换 (Requirement 3.2)', () => {
    it('应该将只有 <pre> 的代码块转换为 <pre><code> 结构', () => {
      const html = '<pre class="language-javascript">const x = 1;</pre>';
      const result = zhihuExporter.export('', html, mockTheme);
      
      expect(result.content).toContain('<pre>');
      expect(result.content).toContain('<code');
      expect(result.content).toContain('</code>');
      expect(result.content).toContain('</pre>');
      expect(result.content).toContain('const x = 1;');
    });

    it('应该保留已有的 <pre><code> 结构', () => {
      const html = '<pre><code class="language-python">print("hello")</code></pre>';
      const result = zhihuExporter.export('', html, mockTheme);
      
      expect(result.content).toContain('<pre>');
      expect(result.content).toContain('<code');
      expect(result.content).toContain('print("hello")');
      expect(result.content).toContain('</code>');
      expect(result.content).toContain('</pre>');
    });

    it('应该保留代码块的语言标识', () => {
      const html = '<pre class="language-typescript">const x: number = 1;</pre>';
      const result = zhihuExporter.export('', html, mockTheme);
      
      expect(result.content).toContain('language-typescript');
    });
  });

  describe('图片 URL 保留 (Requirement 3.3)', () => {
    it('应该保留图片的原始 URL', () => {
      const imageUrl = 'https://example.com/image.png';
      const html = `<img src="${imageUrl}" alt="测试图片">`;
      const result = zhihuExporter.export('', html, mockTheme);
      
      expect(result.content).toContain(`src="${imageUrl}"`);
    });

    it('应该保留图片的 alt 属性', () => {
      const html = '<img src="https://example.com/img.jpg" alt="示例图片">';
      const result = zhihuExporter.export('', html, mockTheme);
      
      expect(result.content).toContain('alt="示例图片"');
    });

    it('应该保留图片的 title 属性', () => {
      const html = '<img src="https://example.com/img.jpg" alt="图片" title="图片标题">';
      const result = zhihuExporter.export('', html, mockTheme);
      
      expect(result.content).toContain('title="图片标题"');
    });

    it('应该移除图片的 data-* 属性', () => {
      const html = '<img src="https://example.com/img.jpg" alt="图片" data-custom="value">';
      const result = zhihuExporter.export('', html, mockTheme);
      
      expect(result.content).not.toContain('data-custom');
    });
  });

  describe('LaTeX 公式保留 (Requirement 3.4)', () => {
    it('应该保留行内 LaTeX 公式', () => {
      const html = '<p>这是一个公式 $E = mc^2$ 在文本中</p>';
      const result = zhihuExporter.export('', html, mockTheme);
      
      expect(result.content).toContain('$E = mc^2$');
    });

    it('应该保留块级 LaTeX 公式', () => {
      const html = '<p>$$\\sum_{i=1}^{n} x_i$$</p>';
      const result = zhihuExporter.export('', html, mockTheme);
      
      expect(result.content).toContain('$$\\sum_{i=1}^{n} x_i$$');
    });

    it('应该保留 math 类名的元素', () => {
      const html = '<span class="math">\\frac{a}{b}</span>';
      const result = zhihuExporter.export('', html, mockTheme);
      
      expect(result.content).toContain('class="math"');
      expect(result.content).toContain('\\frac{a}{b}');
    });
  });

  describe('HTML 清理', () => {
    it('应该移除 style 属性', () => {
      const html = '<p style="color: red; font-size: 16px;">文本内容</p>';
      const result = zhihuExporter.export('', html, mockTheme);
      
      expect(result.content).not.toContain('style=');
      expect(result.content).toContain('文本内容');
    });

    it('应该移除 data-* 属性', () => {
      const html = '<div data-id="123" data-type="test">内容</div>';
      const result = zhihuExporter.export('', html, mockTheme);
      
      expect(result.content).not.toContain('data-id');
      expect(result.content).not.toContain('data-type');
    });
  });

  describe('导出结果格式', () => {
    it('应该返回正确的 mimeType', () => {
      const result = zhihuExporter.export('', '<p>测试</p>', mockTheme);
      
      expect(result.mimeType).toBe('text/html');
    });

    it('应该包含纯文本备份', () => {
      const result = zhihuExporter.export('', '<p>测试文本</p>', mockTheme);
      
      expect(result.plainText).toBeDefined();
      expect(result.plainText).toContain('测试文本');
    });

    it('纯文本备份不应包含 HTML 标签', () => {
      const result = zhihuExporter.export('', '<p><strong>加粗</strong>文本</p>', mockTheme);
      
      expect(result.plainText).not.toContain('<');
      expect(result.plainText).not.toContain('>');
    });
  });
});
