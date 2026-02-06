

>在开发 Markdown 编辑器时，**复制到公众号**是一个看似简单却暗藏玄机的功能。本文记录了我在 Next.js 项目中实现这一功能的三次迭代，希望能帮助遇到类似问题的开发者少走弯路。 

## 开发背景

在开发markdown编辑器时，一个最重要的功能一直困扰我,如何将预览到的内容转换为公众号的内容。核心诉求很明确：**用户点击按钮后，粘贴到公众号时能保留完整样式**。

在盛行ai开发的环境下，听起来不难，对吧？说下使用的编辑器和模型：`Kiro+Claude Opus4.5`

## 第一版：让ai自己安排如何实现复制功能

根据execCommand 的尝试

最初的方案是使用传统的 `document.execCommand("copy")`，通过监听 copy 事件设置 `text/html` 格式：

```typescript
const copyHandler = (e: ClipboardEvent) => {
  e.preventDefault();1
  e.clipboardData?.setData("text/html", html);
  e.clipboardData?.setData("text/plain", stripHtml(html));
};

document.addEventListener("copy", copyHandler, true);
document.execCommand("copy");
```

这个方案有几个问题：

1. **execCommand**已被标记为 deprecated，浏览器兼容性存在隐患
2. 复制的是生成的 HTML 字符串，而非实际渲染的 DOM 内容
3. 在样式上会存在一定的差异，也有可能是转换代码写的有问题

粘贴到公众号后，样式经常丢失或错乱。

## 第二版：由于微信公众号只支持行内样式，尝试样式转换

使用`ClipboardJS + innerHTML`

我引入了 ClipboardJS 库，并尝试复制预览区域的 innerHTML：

```typescript
const clipboard = initCopyButton(
  copyButtonRef.current,
  () => {
    const previewEl = document.querySelector("#preview-output");
    return previewEl?.innerHTML || "";
  },
  onCopySuccess
);
```

这个方案解决了 API 废弃的问题，但本质上还是在复制 HTML 字符串。粘贴效果依然不理想——公众号编辑器似乎对"字符串形式的 HTML"和"真实 DOM 内容"的处理方式不同，复制过去，直接被当做了`text`处理，over。

## 第三版：data-clipboard-target 的顿悟

转机出现在我以前用过的markdwon编辑器(`md.qikqiak.com`),研究 OnlineMarkdown 源码时。我发现它的实现异常简洁：

```javascript
var clipboard = new Clipboard('.copy-button');
```

没有 `text` 回调，没有手动获取 innerHTML。秘密在于 HTML 结构：

```html
<button class="copy-button" data-clipboard-target="#output">复制</button>
```

ClipboardJS 的 `data-clipboard-target` 属性会**直接选中目标 DOM 元素的内容**，就像用户手动框选一样。这才是正确的打开方式！

最终实现：

```tsx
// Toolbar.tsx
React.useEffect(() => {
  if (!copyButtonRef.current || !previewSelector) return;
  
  const ClipboardJS = require("clipboard");
  const clipboard = new ClipboardJS(copyButtonRef.current);
  
  clipboard.on("success", (e) => {
    e.clearSelection();
    onCopySuccess?.();
  });
  
  return () => clipboard.destroy();
}, [previewSelector, onCopySuccess]);

// JSX
<Button
  ref={copyButtonRef}
  data-clipboard-target={previewSelector}
>
  复制到公众号
</Button>
```

Preview 组件只需添加一个 ID：

```tsx
<div id="preview-output" className="preview-content">
  {/* 渲染内容 */}
</div>
```

## 为什么 data-clipboard-target 有效？

关键在于复制机制的差异：

| 方式 | 复制内容 | 公众号识别 |
|------|---------|-----------|
| innerHTML 字符串 | 纯文本形式的 HTML | ❌ 当作代码处理 |
| data-clipboard-target | 浏览器原生选区 | ✅ 保留富文本格式 |

当使用 `data-clipboard-target` 时，ClipboardJS 内部调用的是 `Selection API`，创建的是真实的浏览器选区。这与用户手动 Ctrl+C 的行为完全一致，公众号编辑器自然能正确识别。

## React/Next.js 中的注意事项

在 React 中使用 ClipboardJS 需要注意生命周期管理：

1. **useEffect 中初始化**：确保 DOM 已挂载
2. **清理函数中销毁**：调用 `clipboard.destroy()` 防止内存泄漏
3. **依赖项管理**：selector 变化时重新绑定

另外，由于 ClipboardJS 依赖 DOM，在 SSR 环境下需要动态导入：

```typescript
const ClipboardJS = require("clipboard"); // 而非顶层 import
```

## 总结
这次markdown编辑器的开发，让我深刻体会到：AI对需求的理解是有限的，如果遇到麻烦的问题，还是需要开发人员多思考和研究的。

从手动拼接 HTML 到利用浏览器原生能力，代码量减少了，效果反而更好。技术选型时，不妨多研究成熟项目的实现——它们往往已经踩过你即将踩的坑。

希望这篇文章能帮助你在实现类似功能时少走弯路。如果你有更好的方案，欢迎交流！

> 这篇文章就是使用我的编辑器`https://md-editor-psi.vercel.app/`实现的，感兴趣的话可以去看看，`github`开源的，欢迎大家指教。


