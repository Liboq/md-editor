"use client";

import Link from "next/link";
import { 
  FileText, 
  Palette, 
  Share2, 
  Cloud, 
  Smartphone, 
  Copy,
  ArrowRight,
  Check,
  Zap
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

/**
 * 首页 - 落地页
 * 
 * 使用 UI UX Pro Max 设计系统：
 * - Pattern: Hero + Features + CTA
 * - Style: Micro-interactions
 * - Colors: Teal focus + action orange
 * - Typography: Plus Jakarta Sans
 */
export default function HomePage() {
  const { isAuthenticated } = useAuth();
  
  // 根据登录状态决定 CTA 跳转
  const ctaHref = isAuthenticated ? "/articles" : "/login";
  const ctaText = isAuthenticated ? "进入编辑器" : "免费开始使用";

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-teal-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <FileText className="w-6 h-6 text-teal-600" />
            <span className="font-semibold text-teal-900">MD 编辑器</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              href={ctaHref}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium 
                         hover:bg-orange-600 transition-colors duration-200 cursor-pointer
                         flex items-center gap-2"
            >
              {ctaText}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-teal-900 mb-6 leading-tight">
            专为<span className="text-orange-500">微信公众号</span>打造的
            <br />Markdown 编辑器
          </h1>
          
          <p className="text-lg md:text-xl text-teal-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            一键复制到公众号，完美保留样式。支持多种主题切换，自定义排版，
            让你的文章在公众号中脱颖而出。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href={ctaHref}
              className="px-8 py-4 bg-orange-500 text-white rounded-xl font-semibold text-lg
                         hover:bg-orange-600 transition-all duration-200 cursor-pointer
                         shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30
                         flex items-center justify-center gap-2"
            >
              {ctaText}
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <a 
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white text-teal-700 rounded-xl font-semibold text-lg
                         border-2 border-teal-200 hover:border-teal-300 transition-all duration-200 
                         cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              查看源码
            </a>
          </div>

          {/* 特性标签 */}
          <div className="flex flex-wrap justify-center gap-3">
            {["免费使用", "无需安装", "云端同步", "开源项目"].map((tag) => (
              <span 
                key={tag}
                className="px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 功能特性 */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-teal-900 mb-4">
              强大功能，简单易用
            </h2>
            <p className="text-teal-600 text-lg max-w-2xl mx-auto">
              专注于内容创作，让排版变得轻松愉快
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 bg-gradient-to-br from-teal-50 to-white rounded-2xl border border-teal-100
                           hover:shadow-lg hover:shadow-teal-100/50 transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-teal-900 mb-2">{feature.title}</h3>
                <p className="text-teal-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 工作流程 */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-teal-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-teal-900 mb-4">
              三步完成排版
            </h2>
            <p className="text-teal-600 text-lg">
              简单高效的工作流程
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="flex items-start gap-6 p-6 bg-white rounded-2xl shadow-sm
                           hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-orange-500 text-white rounded-full 
                                flex items-center justify-center font-bold text-xl">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-teal-900 mb-2">{step.title}</h3>
                  <p className="text-teal-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 优势对比 */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-teal-900 mb-4">
              为什么选择我们？
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {advantages.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-teal-900 mb-1">{item.title}</h4>
                  <p className="text-teal-600 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="py-20 px-4 bg-gradient-to-r from-teal-600 to-teal-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            准备好提升你的公众号排版了吗？
          </h2>
          <p className="text-teal-100 text-lg mb-8 max-w-2xl mx-auto">
            免费注册，立即开始使用。无需信用卡，无使用限制。
          </p>
          
          <Link 
            href={ctaHref}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-700 rounded-xl 
                       font-semibold text-lg hover:bg-teal-50 transition-colors duration-200 
                       cursor-pointer shadow-lg"
          >
            {ctaText}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="py-12 px-4 bg-teal-900 text-teal-300">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6" />
              <span className="font-semibold text-white">MD 编辑器</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" 
                 className="hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                GitHub
              </a>
              <Link href="/login" className="hover:text-white transition-colors cursor-pointer">
                登录
              </Link>
            </div>
            
            <p className="text-sm">
              © 2024 MD 编辑器. 开源项目.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// 功能特性数据
const features = [
  {
    icon: Copy,
    title: "一键复制到公众号",
    description: "智能转换为微信兼容格式，粘贴即用，完美保留所有样式。"
  },
  {
    icon: Palette,
    title: "丰富主题模板",
    description: "内置多种精美主题，支持自定义编辑，打造独特的文章风格。"
  },
  {
    icon: Smartphone,
    title: "实时预览",
    description: "桌面端和移动端双模式预览，所见即所得，排版更精准。"
  },
  {
    icon: Cloud,
    title: "云端同步",
    description: "GitHub 登录后自动同步，多设备无缝切换，数据永不丢失。"
  },
  {
    icon: Share2,
    title: "分享预览",
    description: "生成分享链接，让他人无需登录即可预览你的文章。"
  },
  {
    icon: Zap,
    title: "自动保存",
    description: "智能自动保存，再也不用担心意外丢失辛苦写的内容。"
  }
];

// 工作流程数据
const steps = [
  {
    title: "编写 Markdown",
    description: "使用熟悉的 Markdown 语法编写文章，专注于内容创作。"
  },
  {
    title: "选择主题样式",
    description: "从多种精美主题中选择，或自定义你喜欢的排版风格。"
  },
  {
    title: "一键复制发布",
    description: "点击复制按钮，粘贴到公众号编辑器，完美发布。"
  }
];

// 优势数据
const advantages = [
  {
    title: "完全免费",
    description: "所有功能免费使用，无隐藏收费，无使用限制。"
  },
  {
    title: "开源透明",
    description: "代码完全开源，欢迎贡献和自部署。"
  },
  {
    title: "隐私安全",
    description: "仅存储必要数据，不收集任何敏感信息。"
  },
  {
    title: "持续更新",
    description: "积极维护，持续添加新功能和主题。"
  },
  {
    title: "无需安装",
    description: "纯网页应用，打开浏览器即可使用。"
  },
  {
    title: "响应式设计",
    description: "完美适配各种设备，随时随地编辑。"
  }
];
