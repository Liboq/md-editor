# 需求文档

## 简介

为轻语 Markdown 编辑器添加多平台导出功能，支持将 Markdown 内容导出为适配不同内容平台的格式。该功能将扩展现有的微信公众号复制功能，新增对知乎、掘金、CSDN、简书等主流内容平台的支持，同时提供纯 Markdown 格式导出选项。

## 术语表

- **Platform_Exporter**: 平台导出器，负责将 Markdown/HTML 内容转换为特定平台兼容格式的模块
- **Export_Format**: 导出格式，指针对特定平台优化的内容格式（HTML 或 Markdown）
- **Inline_Style_Converter**: 行内样式转换器，将 CSS 类样式转换为行内样式的工具
- **Platform_Selector**: 平台选择器，用户界面中用于选择目标导出平台的下拉组件
- **Copy_Handler**: 复制处理器，负责将转换后的内容复制到系统剪贴板的模块

## 需求

### 需求 1：平台导出器架构

**用户故事：** 作为开发者，我希望有一个可扩展的平台导出器架构，以便能够轻松添加新平台支持。

#### 验收标准

1. THE Platform_Exporter SHALL 提供统一的导出接口，包含平台标识、平台名称、导出方法
2. WHEN 添加新平台支持时，THE Platform_Exporter SHALL 只需实现导出接口即可完成集成
3. THE Platform_Exporter SHALL 支持注册和获取所有可用平台的列表
4. WHEN 导出内容时，THE Platform_Exporter SHALL 根据平台标识调用对应的转换方法

### 需求 2：微信公众号导出

**用户故事：** 作为内容创作者，我希望保持现有的微信公众号复制功能，以便继续使用熟悉的工作流程。

#### 验收标准

1. THE Platform_Exporter SHALL 保持现有微信公众号导出功能方法不变

### 需求 3：知乎平台导出

**用户故事：** 作为内容创作者，我希望能够导出适配知乎的格式，以便在知乎平台发布文章。

#### 验收标准

1. WHEN 导出到知乎时，THE Platform_Exporter SHALL 生成知乎兼容的 HTML 格式
2. WHEN 处理代码块时，THE Platform_Exporter SHALL 使用知乎支持的代码块格式（`<pre><code>` 标签）
3. WHEN 处理图片时，THE Platform_Exporter SHALL 保留图片的原始 URL
4. WHEN 处理数学公式时，THE Platform_Exporter SHALL 保留 LaTeX 格式

### 需求 4：掘金平台导出

**用户故事：** 作为技术博主，我希望能够导出适配掘金的格式，以便在掘金平台发布技术文章。

#### 验收标准

1. WHEN 导出到掘金时，THE Platform_Exporter SHALL 生成纯 Markdown 格式
2. WHEN 处理代码块时，THE Platform_Exporter SHALL 保留语言标识（如 ```javascript）
3. WHEN 处理图片时，THE Platform_Exporter SHALL 使用标准 Markdown 图片语法
4. THE Platform_Exporter SHALL 保留掘金支持的所有 Markdown 扩展语法

### 需求 5：CSDN 平台导出

**用户故事：** 作为技术博主，我希望能够导出适配 CSDN 的格式，以便在 CSDN 平台发布文章。

#### 验收标准

1. WHEN 导出到 CSDN 时，THE Platform_Exporter SHALL 生成 Markdown 格式
2. WHEN 处理图片时，THE Platform_Exporter SHALL 检查并标注外链图片（CSDN 可能需要转存）
3. WHEN 处理代码块时，THE Platform_Exporter SHALL 保留语言标识
4. THE Platform_Exporter SHALL 移除 CSDN 不支持的 HTML 标签

### 需求 6：简书平台导出

**用户故事：** 作为内容创作者，我希望能够导出适配简书的格式，以便在简书平台发布文章。

#### 验收标准

1. WHEN 导出到简书时，THE Platform_Exporter SHALL 生成简化的 Markdown 格式
2. WHEN 处理复杂格式时，THE Platform_Exporter SHALL 将其转换为简书支持的基础格式
3. WHEN 处理表格时，THE Platform_Exporter SHALL 保留标准 Markdown 表格语法
4. THE Platform_Exporter SHALL 移除简书不支持的 HTML 内嵌标签

### 需求 7：纯 Markdown 导出

**用户故事：** 作为用户，我希望能够导出原始 Markdown 格式，以便在其他 Markdown 编辑器中使用。

#### 验收标准

1. WHEN 导出纯 Markdown 时，THE Platform_Exporter SHALL 输出原始 Markdown 文本
2. THE Platform_Exporter SHALL 保留所有 Markdown 语法不做任何转换
3. WHEN 复制成功时，THE Copy_Handler SHALL 仅设置 text/plain 格式到剪贴板

### 需求 8：平台选择器 UI

**用户故事：** 作为用户，我希望能够通过直观的界面选择导出平台，以便快速完成内容导出。

#### 验收标准

1. THE Platform_Selector SHALL 在工具栏显示为下拉菜单组件
2. WHEN 用户点击下拉菜单时，THE Platform_Selector SHALL 显示所有可用平台列表
3. THE Platform_Selector SHALL 显示每个平台的图标和名称
4. WHEN 用户选择平台后，THE Platform_Selector SHALL 更新显示当前选中的平台
5. THE Platform_Selector SHALL 记住用户上次选择的平台（使用 localStorage）

### 需求 9：复制功能

**用户故事：** 作为用户，我希望能够一键复制转换后的内容，以便快速粘贴到目标平台。

#### 验收标准

1. WHEN 用户点击复制按钮时，THE Copy_Handler SHALL 根据当前选中平台执行对应的导出和复制操作
2. WHEN 复制成功时，THE Copy_Handler SHALL 显示成功提示（toast 通知）
3. WHEN 复制失败时，THE Copy_Handler SHALL 显示失败提示并说明原因
4. IF 浏览器不支持 Clipboard API，THEN THE Copy_Handler SHALL 降级使用 execCommand 方法
