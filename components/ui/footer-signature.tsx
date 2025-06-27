/**
 * 统一底部签名组件
 * 
 * 功能：
 * - 在所有页面底部显示统一的版权信息
 * - 使用 muted-foreground 样式保持低调
 * - 响应式设计，适配移动端和桌面端
 * - 与页面内容保持适当间距
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface FooterSignatureProps {
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
}

export function FooterSignature({ 
  className,
  variant = 'default'
}: FooterSignatureProps) {
  const baseClasses = "text-center text-muted-foreground";
  
  const variantClasses = {
    default: "text-sm mt-8 mb-4 py-4 border-t border-border/50",
    compact: "text-xs mt-6 mb-3 py-2",
    minimal: "text-xs mt-4 mb-2"
  };

  return (
    <footer 
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      role="contentinfo"
      aria-label="页面底部版权信息"
    >
      <div className="container mx-auto px-4">
        <p className="font-medium">
          FDX@2025 滇ICP备2025058380号
        </p>
        
        {variant === 'default' && (
          <p className="text-xs mt-1 opacity-75">
            富鼎翔工业智能车间系统
          </p>
        )}
      </div>
    </footer>
  );
}

// 导出默认变体的快捷组件
export const DefaultFooter = () => <FooterSignature variant="default" />;
export const CompactFooter = () => <FooterSignature variant="compact" />;
export const MinimalFooter = () => <FooterSignature variant="minimal" />;
