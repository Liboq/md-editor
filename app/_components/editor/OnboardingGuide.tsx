"use client";

import { useState, useEffect } from "react";
import { X, FileText, Palette, Copy, Share2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ONBOARDING_KEY = "md-editor-onboarding-completed";

interface OnboardingStep {
  icon: React.ElementType;
  title: string;
  description: string;
}

const steps: OnboardingStep[] = [
  {
    icon: FileText,
    title: "创建或选择文章",
    description: "点击左上角「我的文章」按钮，创建新文章或选择已有文章进行编辑。",
  },
  {
    icon: Palette,
    title: "选择主题样式",
    description: "使用顶部的主题选择器切换不同风格，或自定义你喜欢的排版样式。",
  },
  {
    icon: Copy,
    title: "一键复制到公众号",
    description: "编辑完成后，点击工具栏的「复制」按钮，直接粘贴到微信公众号编辑器。",
  },
  {
    icon: Share2,
    title: "分享给他人预览",
    description: "点击「分享」按钮生成链接，让他人无需登录即可预览你的文章。",
  },
];

interface OnboardingGuideProps {
  onComplete?: () => void;
}

export function OnboardingGuide({ onComplete }: OnboardingGuideProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // 检查是否需要显示引导
  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      // 延迟显示，让页面先加载完成
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsVisible(false);
    onComplete?.();
  };

  if (!isVisible) return null;

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* 关闭按钮 */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 进度指示器 */}
        <div className="flex gap-1.5 px-6 pt-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index <= currentStep
                  ? "bg-teal-500"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>

        {/* 内容区域 */}
        <div className="p-6 pt-8">
          {/* 图标 */}
          <div className="w-16 h-16 mx-auto mb-6 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center">
            <CurrentIcon className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>

          {/* 标题和描述 */}
          <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-3">
            {steps[currentStep].title}
          </h3>
          <p className="text-center text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
            {steps[currentStep].description}
          </p>

          {/* 按钮区域 */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={handleSkip}
            >
              跳过引导
            </Button>
            <Button
              className="flex-1 bg-teal-600 hover:bg-teal-700 cursor-pointer"
              onClick={handleNext}
            >
              {currentStep < steps.length - 1 ? (
                <>
                  下一步
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                "开始使用"
              )}
            </Button>
          </div>
        </div>

        {/* 步骤计数 */}
        <div className="px-6 pb-6 text-center text-sm text-gray-400">
          {currentStep + 1} / {steps.length}
        </div>
      </div>
    </div>
  );
}

/**
 * 重置引导状态（用于测试）
 */
export function resetOnboarding() {
  localStorage.removeItem(ONBOARDING_KEY);
}
