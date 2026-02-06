# 实现计划：多平台导出功能

## 概述

基于设计文档，将多平台导出功能分解为可增量实现的编码任务。采用自底向上的实现顺序：先实现核心类型和接口，再实现各平台导出器，最后实现 UI 组件和集成。

## 任务

- [x] 1. 创建类型定义和导出器注册表
  - [x] 1.1 创建 `lib/export/types.ts`，定义 PlatformExporter、ExportResult、PlatformMeta 等类型
    - 定义平台标识常量 PLATFORMS
    - 定义导出器接口 PlatformExporter
    - 定义导出结果接口 ExportResult
    - 定义平台元数据接口 PlatformMeta
    - _Requirements: 1.1_
  
  - [x] 1.2 创建 `lib/export/registry.ts`，实现导出器注册表
    - 实现 register() 方法注册导出器
    - 实现 get() 方法获取导出器
    - 实现 getAll() 方法获取所有导出器
    - _Requirements: 1.3, 1.4_
  
  - [ ]* 1.3 编写注册表属性测试
    - **Property 2: 注册表往返一致性**
    - **Validates: Requirements 1.3, 1.4**

- [x] 2. 实现微信公众号导出器
  - [x] 2.1 创建 `lib/export/exporters/wechat.ts`
    - 微信公众号保持使用现有的 ClipboardJS + data-clipboard-target 方案
    - 仅创建导出器元数据（id、name、icon 等）
    - export 方法标记为不使用（微信使用 DOM 复制）
    - _Requirements: 2.1_

- [x] 3. 实现知乎导出器
  - [x] 3.1 创建 `lib/export/exporters/zhihu.ts`
    - 实现 HTML 格式转换
    - 处理代码块为 pre>code 结构
    - 保留图片 URL 和 LaTeX 公式
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 3.2 编写知乎导出器属性测试
    - **Property 4: 知乎格式转换**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [x] 4. 实现 Markdown 类平台导出器
  - [x] 4.1 创建 `lib/export/exporters/juejin.ts`（掘金导出器）
    - 输出标准 Markdown 格式
    - 保留代码块语言标识
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 4.2 创建 `lib/export/exporters/csdn.ts`（CSDN 导出器）
    - 输出 Markdown 格式
    - 标注外链图片
    - 移除不支持的 HTML 标签
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [x] 4.3 创建 `lib/export/exporters/jianshu.ts`（简书导出器）
    - 输出简化 Markdown 格式
    - 转换复杂格式为基础格式
    - 移除不支持的 HTML 标签
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 4.4 创建 `lib/export/exporters/markdown.ts`（纯 Markdown 导出器）
    - 直接返回原始 Markdown 文本
    - _Requirements: 7.1, 7.2_
  
  - [ ]* 4.5 编写 Markdown 导出器属性测试
    - **Property 5: Markdown 格式导出**
    - **Property 6: 不支持标签移除**
    - **Property 7: 纯 Markdown 恒等变换**
    - **Validates: Requirements 4.1-4.3, 5.1-5.4, 6.1-6.4, 7.1-7.2**

- [x] 5. 检查点 - 确保所有导出器测试通过
  - 确保所有测试通过，如有问题请询问用户。

- [x] 6. 创建导出器模块入口
  - [x] 6.1 创建 `lib/export/exporters/index.ts`
    - 导出所有导出器
    - 创建预注册的默认注册表实例
    - _Requirements: 1.3_
  
  - [x] 6.2 创建 `lib/export/index.ts`
    - 导出类型定义
    - 导出注册表和默认实例
    - 导出便捷函数
    - _Requirements: 1.1, 1.3, 1.4_
  
  - [ ]* 6.3 编写导出器接口一致性属性测试
    - **Property 1: 导出器接口一致性**
    - **Validates: Requirements 1.1**

- [x] 7. 实现平台选择器 UI 组件
  - [x] 7.1 创建 `app/_components/editor/PlatformSelector.tsx`
    - 使用 shadcn/ui Select 组件
    - 显示平台图标和名称
    - 支持深色模式
    - _Requirements: 8.1, 8.2, 8.3, 10.1, 10.2, 10.3_
  
  - [x] 7.2 实现用户偏好持久化
    - 使用 localStorage 保存上次选择
    - 组件加载时读取偏好
    - _Requirements: 8.4, 8.5_
  
  - [ ]* 7.3 编写平台选择器属性测试
    - **Property 8: 平台选择器渲染完整性**
    - **Property 9: 用户偏好持久化往返**
    - **Validates: Requirements 8.3, 8.5**

- [x] 8. 集成到工具栏
  - [x] 8.1 修改 `app/_components/editor/Toolbar.tsx`
    - 添加 PlatformSelector 组件
    - 微信公众号保持现有的 ClipboardJS + data-clipboard-target 方案不变
    - 其他平台使用导出器转换后复制到剪贴板
    - 添加复制成功/失败提示（使用 sonner toast）
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [x] 8.2 实现复制降级处理
    - 检测 Clipboard API 支持
    - 不支持时降级到 execCommand
    - _Requirements: 9.4, 2.4, 7.3_

- [x] 9. 最终检查点 - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户。

## 备注

- 标记 `*` 的任务为可选任务，可跳过以加快 MVP 开发
- 每个任务都引用了具体的需求编号以便追溯
- 检查点用于确保增量验证
- 属性测试验证通用正确性属性
- 单元测试验证具体示例和边界情况
