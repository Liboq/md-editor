/**
 * 微信公众号适配器测试
 */

import { describe, it, expect } from 'vitest';
import { adaptForWechat, needsWechatAdaptation, getUnsafeCssProperties } from './wechat-adapter';

describe('adaptForWechat', () => {
  describe('代码块空格保留', () => {
    it('应该将行首空格替换为不可断空格', () => {
      const html = '<pre><code>def hello():\n    print("world")</code></pre>';
      const result = adaptForWechat(html, { 
        preserveCodeSpaces: true,
        preserveCodeLineBreaks: false 
      });
      
      // 4个空格应该变成4个 \u00A0
      expect(result).toContain('\u00A0\u00A0\u00A0\u00A0print');
    });

    it('应该保留多级缩进', () => {
      const html = '<pre><code>if (true) {\n  if (nested) {\n    deep();\n  }\n}</code></pre>';
      const result = adaptForWechat(html, { 
        preserveCodeSpaces: true,
        preserveCodeLineBreaks: false 
      });
      
      expect(result).toContain('\u00A0\u00A0if (nested)');
      expect(result).toContain('\u00A0\u00A0\u00A0\u00A0deep()');
    });
  });

  describe('代码块换行处理', () => {
    it('应该将换行符替换为 <br>', () => {
      const html = '<pre><code>line1\nline2\nline3</code></pre>';
      const result = adaptForWechat(html, { 
        preserveCodeSpaces: false,
        preserveCodeLineBreaks: true 
      });
      
      expect(result).toContain('line1<br>line2<br>line3');
      expect(result).not.toContain('\n');
    });
  });

  describe('任务列表转换', () => {
    it('应该将选中的 checkbox 转换为 ☑', () => {
      const html = '<li><input type="checkbox" checked> 已完成任务</li>';
      const result = adaptForWechat(html, { convertTaskLists: true });
      
      expect(result).toContain('☑');
      expect(result).not.toContain('<input');
    });

    it('应该将未选中的 checkbox 转换为 ☐', () => {
      const html = '<li><input type="checkbox"> 待办任务</li>';
      const result = adaptForWechat(html, { convertTaskLists: true });
      
      expect(result).toContain('☐');
      expect(result).not.toContain('<input');
    });

    it('应该处理 checked 属性在不同位置的情况', () => {
      const html1 = '<input checked type="checkbox">';
      const html2 = '<input type="checkbox" checked>';
      
      expect(adaptForWechat(html1)).toContain('☑');
      expect(adaptForWechat(html2)).toContain('☑');
    });
  });

  describe('外部链接转脚注', () => {
    it('应该将外部链接转换为脚注格式', () => {
      const html = '<p>详见 <a href="https://example.com">官方文档</a></p>';
      const result = adaptForWechat(html, { convertLinksToFootnotes: true });
      
      // 链接文本应该保留，添加上标引用
      expect(result).toContain('官方文档');
      expect(result).toContain('[1]');
      // 应该有脚注部分
      expect(result).toContain('参考链接');
      expect(result).toContain('https://example.com');
    });

    it('应该跳过锚点链接', () => {
      const html = '<a href="#section">跳转到章节</a>';
      const result = adaptForWechat(html, { convertLinksToFootnotes: true });
      
      // 锚点链接应该保持不变
      expect(result).toContain('href="#section"');
      expect(result).not.toContain('参考链接');
    });

    it('应该跳过相对链接', () => {
      const html = '<a href="/page">内部页面</a>';
      const result = adaptForWechat(html, { convertLinksToFootnotes: true });
      
      expect(result).toContain('href="/page"');
      expect(result).not.toContain('参考链接');
    });

    it('应该正确编号多个链接', () => {
      const html = `
        <p><a href="https://a.com">链接A</a></p>
        <p><a href="https://b.com">链接B</a></p>
      `;
      const result = adaptForWechat(html, { convertLinksToFootnotes: true });
      
      expect(result).toContain('[1]');
      expect(result).toContain('[2]');
      expect(result).toContain('1. 链接A: https://a.com');
      expect(result).toContain('2. 链接B: https://b.com');
    });

    it('默认不转换链接', () => {
      const html = '<a href="https://example.com">链接</a>';
      const result = adaptForWechat(html);
      
      // 默认不转换
      expect(result).toContain('href="https://example.com"');
      expect(result).not.toContain('参考链接');
    });
  });

  describe('组合处理', () => {
    it('应该同时处理多种情况', () => {
      const html = `
        <pre><code>def task():
    print("done")</code></pre>
        <ul>
          <li><input type="checkbox" checked> 任务1</li>
          <li><input type="checkbox"> 任务2</li>
        </ul>
      `;
      
      const result = adaptForWechat(html, {
        preserveCodeSpaces: true,
        preserveCodeLineBreaks: true,
        convertTaskLists: true,
      });
      
      // 代码块空格
      expect(result).toContain('\u00A0\u00A0\u00A0\u00A0print');
      // 代码块换行
      expect(result).toContain('<br>');
      // 任务列表
      expect(result).toContain('☑');
      expect(result).toContain('☐');
    });
  });

  describe('CSS 安全过滤', () => {
    it('应该移除 position 相关属性', () => {
      const html = '<div style="position: absolute; top: 10px; left: 20px; color: red;">内容</div>';
      const result = adaptForWechat(html, { sanitizeStyles: true });
      
      expect(result).not.toContain('position');
      expect(result).not.toContain('top');
      expect(result).not.toContain('left');
      expect(result).toContain('color: red');
    });

    it('应该移除 transform 相关属性', () => {
      const html = '<div style="transform: rotate(45deg); transform-origin: center; color: blue;">内容</div>';
      const result = adaptForWechat(html, { sanitizeStyles: true });
      
      expect(result).not.toContain('transform');
      expect(result).toContain('color: blue');
    });

    it('应该移除 animation 相关属性', () => {
      const html = '<div style="animation: fade 1s; animation-delay: 0.5s; font-size: 16px;">内容</div>';
      const result = adaptForWechat(html, { sanitizeStyles: true });
      
      expect(result).not.toContain('animation');
      expect(result).toContain('font-size: 16px');
    });

    it('应该移除 transition 属性', () => {
      const html = '<div style="transition: all 0.3s; background: #fff;">内容</div>';
      const result = adaptForWechat(html, { sanitizeStyles: true });
      
      expect(result).not.toContain('transition');
      expect(result).toContain('background: #fff');
    });

    it('应该移除 filter 属性', () => {
      const html = '<div style="filter: blur(5px); backdrop-filter: blur(10px); padding: 10px;">内容</div>';
      const result = adaptForWechat(html, { sanitizeStyles: true });
      
      expect(result).not.toContain('filter');
      expect(result).toContain('padding: 10px');
    });

    it('应该保留安全的 CSS 属性', () => {
      const html = '<div style="color: red; background-color: #fff; font-size: 16px; margin: 10px; padding: 5px; border: 1px solid #ccc; text-align: center; line-height: 1.5;">内容</div>';
      const result = adaptForWechat(html, { sanitizeStyles: true });
      
      expect(result).toContain('color: red');
      expect(result).toContain('background-color: #fff');
      expect(result).toContain('font-size: 16px');
      expect(result).toContain('margin: 10px');
      expect(result).toContain('padding: 5px');
      expect(result).toContain('border: 1px solid #ccc');
      expect(result).toContain('text-align: center');
      expect(result).toContain('line-height: 1.5');
    });
  });

  describe('id 属性移除', () => {
    it('应该移除 id 属性', () => {
      const html = '<div id="my-section"><h1 id="title">标题</h1></div>';
      const result = adaptForWechat(html, { removeIds: true });
      
      expect(result).not.toContain('id=');
    });

    it('可以选择保留 id 属性', () => {
      const html = '<div id="my-section">内容</div>';
      const result = adaptForWechat(html, { removeIds: false });
      
      expect(result).toContain('id="my-section"');
    });
  });

  describe('事件处理器移除', () => {
    it('应该移除 onclick 等事件处理器', () => {
      const html = '<button onclick="alert(1)" onmouseover="highlight()">点击</button>';
      const result = adaptForWechat(html);
      
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('onmouseover');
      expect(result).toContain('点击');
    });
  });

  describe('不安全标签移除', () => {
    it('应该移除 script 标签', () => {
      const html = '<div>内容</div><script>alert("xss")</script><p>段落</p>';
      const result = adaptForWechat(html);
      
      expect(result).not.toContain('<script');
      expect(result).not.toContain('alert');
      expect(result).toContain('内容');
      expect(result).toContain('段落');
    });

    it('应该移除 style 标签', () => {
      const html = '<style>.red { color: red; }</style><div class="red">内容</div>';
      const result = adaptForWechat(html);
      
      expect(result).not.toContain('<style');
      expect(result).toContain('内容');
    });
  });
});

describe('needsWechatAdaptation', () => {
  it('应该检测代码块', () => {
    const html = '<pre><code>code</code></pre>';
    const result = needsWechatAdaptation(html);
    
    expect(result.hasCodeBlocks).toBe(true);
  });

  it('应该检测任务列表', () => {
    const html = '<input type="checkbox">';
    const result = needsWechatAdaptation(html);
    
    expect(result.hasTaskLists).toBe(true);
  });

  it('应该检测外部链接', () => {
    const html = '<a href="https://example.com">link</a>';
    const result = needsWechatAdaptation(html);
    
    expect(result.hasExternalLinks).toBe(true);
  });

  it('应该检测不安全的 CSS 属性', () => {
    const html = '<div style="position: absolute;">内容</div>';
    const result = needsWechatAdaptation(html);
    
    expect(result.hasUnsafeStyles).toBe(true);
  });

  it('应该检测不安全的标签', () => {
    const html = '<script>alert(1)</script>';
    const result = needsWechatAdaptation(html);
    
    expect(result.hasUnsafeTags).toBe(true);
  });

  it('应该正确识别无需适配的内容', () => {
    const html = '<p style="color: red;">普通文本</p>';
    const result = needsWechatAdaptation(html);
    
    expect(result.hasCodeBlocks).toBe(false);
    expect(result.hasTaskLists).toBe(false);
    expect(result.hasExternalLinks).toBe(false);
    expect(result.hasUnsafeStyles).toBe(false);
    expect(result.hasUnsafeTags).toBe(false);
  });
});

describe('getUnsafeCssProperties', () => {
  it('应该返回不安全 CSS 属性列表', () => {
    const props = getUnsafeCssProperties();
    
    expect(props).toContain('position');
    expect(props).toContain('transform');
    expect(props).toContain('animation');
    expect(props).toContain('transition');
    expect(props).toContain('filter');
  });
});

describe('空元素清理', () => {
  it('应该移除空的 p 标签', () => {
    const html = '<p>内容</p><p></p><p>更多内容</p>';
    const result = adaptForWechat(html);
    
    expect(result).not.toMatch(/<p[^>]*>\s*<\/p>/);
    expect(result).toContain('内容');
    expect(result).toContain('更多内容');
  });

  it('应该移除带 style 属性的空 p 标签', () => {
    const html = '<p style="margin: 1em;">内容</p><p style="margin: 1em;"></p><p>更多</p>';
    const result = adaptForWechat(html);
    
    expect(result).not.toMatch(/<p[^>]*>\s*<\/p>/);
    expect(result).toContain('内容');
    expect(result).toContain('更多');
  });

  it('应该移除只包含 br 的 p 标签', () => {
    const html = '<p>内容</p><p><br></p><p>更多</p>';
    const result = adaptForWechat(html);
    
    expect(result).not.toMatch(/<p[^>]*>\s*<br\s*\/?>\s*<\/p>/);
  });

  it('应该移除 ProseMirror 相关的空元素', () => {
    const html = '<p><span leaf=""><br class="ProseMirror-trailingBreak"></span></p>';
    const result = adaptForWechat(html);
    
    expect(result).not.toContain('ProseMirror');
    expect(result).not.toContain('leaf=');
  });

  it('应该移除只包含 &nbsp; 的 p 标签', () => {
    const html = '<p>内容</p><p>&nbsp;</p><p>更多</p>';
    const result = adaptForWechat(html);
    
    expect(result).not.toMatch(/<p[^>]*>\s*&nbsp;\s*<\/p>/);
  });

  it('应该限制连续 br 标签数量', () => {
    const html = '<p>内容</p><br><br><br><br><br><p>更多</p>';
    const result = adaptForWechat(html);
    
    // 最多保留 2 个连续的 br
    expect(result).not.toMatch(/(<br\s*\/?>\s*){3,}/);
  });
});
