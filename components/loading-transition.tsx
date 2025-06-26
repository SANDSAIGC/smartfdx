"use client";

import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Loader2, Zap, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// 加载过渡动画组件的属性接口
interface LoadingTransitionProps {
  /** 是否显示加载状态 */
  isLoading?: boolean;
  /** 加载文本 */
  loadingText?: string;
  /** 进度值 (0-100) */
  progress?: number;
  /** 是否显示进度条 */
  showProgress?: boolean;
  /** 是否显示旋转图标 */
  showSpinner?: boolean;
  /** 加载完成文本 */
  completedText?: string;
  /** 自定义样式类名 */
  className?: string;
  /** 加载状态类型 */
  variant?: 'default' | 'minimal' | 'detailed' | 'fullscreen';
  /** 自定义图标 */
  icon?: React.ComponentType<{ className?: string }>;
  /** 是否自动进度模拟 */
  autoProgress?: boolean;
  /** 自动进度持续时间(毫秒) */
  autoProgressDuration?: number;
}

/**
 * 统一加载过渡动画组件
 * 
 * 提供项目中所有加载场景的统一视觉体验
 * 支持多种显示模式和自定义配置
 */
export function LoadingTransition({
  isLoading = true,
  loadingText = "加载中...",
  progress = 0,
  showProgress = true,
  showSpinner = true,
  completedText = "加载完成",
  className,
  variant = 'default',
  icon: CustomIcon,
  autoProgress = false,
  autoProgressDuration = 2000
}: LoadingTransitionProps) {
  const [currentProgress, setCurrentProgress] = useState(progress);
  const [isCompleted, setIsCompleted] = useState(false);

  // 自动进度模拟
  useEffect(() => {
    if (!autoProgress || !isLoading) return;

    const interval = setInterval(() => {
      setCurrentProgress(prev => {
        const increment = 100 / (autoProgressDuration / 100);
        const newProgress = Math.min(prev + increment, 95);
        
        if (newProgress >= 95) {
          clearInterval(interval);
        }
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [autoProgress, isLoading, autoProgressDuration]);

  // 监听外部进度变化
  useEffect(() => {
    if (!autoProgress) {
      setCurrentProgress(progress);
    }
  }, [progress, autoProgress]);

  // 监听加载完成状态
  useEffect(() => {
    if (!isLoading && currentProgress >= 100) {
      setIsCompleted(true);
      setTimeout(() => setIsCompleted(false), 1000);
    }
  }, [isLoading, currentProgress]);

  // 如果不在加载状态且没有完成动画，不渲染
  if (!isLoading && !isCompleted) {
    return null;
  }

  // 选择图标
  const IconComponent = CustomIcon || (isCompleted ? CheckCircle : (showSpinner ? Loader2 : Zap));

  // 根据变体选择样式
  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return {
          container: "flex items-center justify-center p-4",
          content: "flex items-center space-x-2",
          text: "text-sm text-muted-foreground"
        };
      
      case 'detailed':
        return {
          container: "flex flex-col items-center justify-center p-8 space-y-4",
          content: "flex flex-col items-center space-y-4 max-w-sm w-full",
          text: "text-base font-medium"
        };
      
      case 'fullscreen':
        return {
          container: "fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50",
          content: "flex flex-col items-center space-y-6 bg-card border rounded-lg p-8 shadow-lg max-w-sm w-full mx-4",
          text: "text-lg font-semibold"
        };
      
      default:
        return {
          container: "flex items-center justify-center p-6",
          content: "flex flex-col items-center space-y-3 max-w-xs w-full",
          text: "text-sm font-medium"
        };
    }
  };

  const styles = getVariantStyles();
  const displayText = isCompleted ? completedText : loadingText;
  const displayProgress = isCompleted ? 100 : currentProgress;

  return (
    <div className={cn(styles.container, className)}>
      <div className={styles.content}>
        {/* 图标区域 */}
        <div className="flex items-center justify-center">
          <IconComponent 
            className={cn(
              "h-6 w-6",
              variant === 'detailed' && "h-8 w-8",
              variant === 'fullscreen' && "h-10 w-10",
              showSpinner && !isCompleted && "animate-spin",
              isCompleted ? "text-green-500" : "text-primary"
            )} 
          />
        </div>

        {/* 文本区域 */}
        <div className="text-center">
          <p className={cn(styles.text, isCompleted && "text-green-600")}>
            {displayText}
          </p>
          
          {/* 进度百分比 */}
          {showProgress && variant !== 'minimal' && (
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(displayProgress)}%
            </p>
          )}
        </div>

        {/* 进度条区域 */}
        {showProgress && (
          <div className="w-full">
            <Progress 
              value={displayProgress} 
              className={cn(
                "w-full",
                variant === 'minimal' && "h-1",
                variant === 'detailed' && "h-2",
                variant === 'fullscreen' && "h-3"
              )}
            />
          </div>
        )}

        {/* 详细模式的额外信息 */}
        {variant === 'detailed' && (
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">
              请稍候，正在处理您的请求...
            </p>
            {autoProgress && (
              <p className="text-xs text-muted-foreground">
                预计还需 {Math.ceil((100 - displayProgress) / 10)} 秒
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 预设的加载组件变体
export const MinimalLoading = (props: Omit<LoadingTransitionProps, 'variant'>) => (
  <LoadingTransition {...props} variant="minimal" />
);

export const DetailedLoading = (props: Omit<LoadingTransitionProps, 'variant'>) => (
  <LoadingTransition {...props} variant="detailed" />
);

export const FullscreenLoading = (props: Omit<LoadingTransitionProps, 'variant'>) => (
  <LoadingTransition {...props} variant="fullscreen" />
);

// 快速使用的Hook
export function useLoadingTransition(initialLoading = false) {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [progress, setProgress] = useState(0);

  const startLoading = (text?: string) => {
    setIsLoading(true);
    setProgress(0);
  };

  const updateProgress = (value: number) => {
    setProgress(Math.min(Math.max(value, 0), 100));
  };

  const finishLoading = () => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 500);
  };

  return {
    isLoading,
    progress,
    startLoading,
    updateProgress,
    finishLoading,
    setIsLoading
  };
}

// 常用的加载场景组件
export const AuthLoading = () => (
  <MinimalLoading
    loadingText="验证身份..."
    showProgress={false}
    autoProgress={true}
    autoProgressDuration={1500}
  />
);

export const RouteLoading = () => (
  <MinimalLoading
    loadingText="页面跳转中..."
    showProgress={true}
    autoProgress={true}
    autoProgressDuration={800}
  />
);

export const DataLoading = () => (
  <LoadingTransition
    loadingText="加载数据..."
    showProgress={true}
    autoProgress={true}
    autoProgressDuration={2000}
  />
);

export const SubmitLoading = () => (
  <MinimalLoading
    loadingText="提交中..."
    showProgress={true}
    autoProgress={true}
    autoProgressDuration={1200}
  />
);
