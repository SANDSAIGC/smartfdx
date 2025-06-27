/**
 * 性能优化包装器组件
 * 
 * 为任何组件提供性能优化功能：
 * 1. 懒加载
 * 2. 错误边界
 * 3. 性能监控
 * 4. 内存管理
 * 5. 渲染优化
 */

import React, { Component, ErrorInfo, ReactNode, Suspense, memo, forwardRef } from 'react';
import { LoadingTransition } from './loading-transition';
import { useRenderPerformance, useMemoryLeak } from '@/hooks/use-performance-optimization';

// 错误边界组件
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // 记录错误到控制台
    console.error('🚨 组件错误:', error);
    console.error('📍 错误信息:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 text-lg font-semibold mb-2">
            ⚠️ 组件加载失败
          </div>
          <div className="text-red-500 text-sm mb-4">
            {this.state.error?.message || '未知错误'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 性能监控包装器
interface PerformanceWrapperProps {
  children: ReactNode;
  componentName: string;
  enableMonitoring?: boolean;
  enableMemoryTracking?: boolean;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

const PerformanceMonitorWrapper = memo(({ 
  children, 
  componentName, 
  enableMonitoring = true,
  enableMemoryTracking = true 
}: Omit<PerformanceWrapperProps, 'fallback' | 'onError'>) => {
  // 渲染性能监控
  const { renderCount } = enableMonitoring 
    ? useRenderPerformance(componentName)
    : { renderCount: 0 };
  
  // 内存泄漏检测
  const { addTimer, addListener } = enableMemoryTracking 
    ? useMemoryLeak(componentName)
    : { addTimer: () => {}, addListener: () => {} };

  return <>{children}</>;
});

PerformanceMonitorWrapper.displayName = 'PerformanceMonitorWrapper';

// 主要的性能包装器组件
export const PerformanceWrapper = memo(forwardRef<HTMLDivElement, PerformanceWrapperProps>(({
  children,
  componentName,
  enableMonitoring = true,
  enableMemoryTracking = true,
  fallback,
  onError
}, ref) => {
  const defaultFallback = (
    <LoadingTransition
      variant="minimal"
      loadingText={`加载 ${componentName}...`}
      autoProgress={true}
      autoProgressDuration={1500}
    />
  );

  return (
    <div ref={ref} data-component={componentName}>
      <ErrorBoundary fallback={fallback} onError={onError}>
        <PerformanceMonitorWrapper
          componentName={componentName}
          enableMonitoring={enableMonitoring}
          enableMemoryTracking={enableMemoryTracking}
        >
          <Suspense fallback={fallback || defaultFallback}>
            {children}
          </Suspense>
        </PerformanceMonitorWrapper>
      </ErrorBoundary>
    </div>
  );
}));

PerformanceWrapper.displayName = 'PerformanceWrapper';

// 懒加载包装器
interface LazyWrapperProps {
  children: ReactNode;
  threshold?: number;
  fallback?: ReactNode;
  className?: string;
}

export const LazyWrapper = memo(({ 
  children, 
  threshold = 0.1, 
  fallback,
  className 
}: LazyWrapperProps) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  const defaultFallback = (
    <div className="flex items-center justify-center p-4">
      <LoadingTransition variant="minimal" loadingText="加载中..." />
    </div>
  );

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : (fallback || defaultFallback)}
    </div>
  );
});

LazyWrapper.displayName = 'LazyWrapper';

// 虚拟滚动包装器
interface VirtualScrollWrapperProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
}

export function VirtualScrollWrapper<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className
}: VirtualScrollWrapperProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleItems = React.useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      className={`overflow-auto ${className || ''}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: visibleItems.totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${visibleItems.offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.items.map((item, index) =>
            renderItem(item, visibleItems.startIndex + index)
          )}
        </div>
      </div>
    </div>
  );
}

// 批量渲染包装器
interface BatchRenderWrapperProps {
  children: ReactNode[];
  batchSize?: number;
  delay?: number;
  fallback?: ReactNode;
}

export const BatchRenderWrapper = memo(({
  children,
  batchSize = 10,
  delay = 16,
  fallback
}: BatchRenderWrapperProps) => {
  const [renderedCount, setRenderedCount] = React.useState(batchSize);

  React.useEffect(() => {
    if (renderedCount < children.length) {
      const timer = setTimeout(() => {
        setRenderedCount(prev => Math.min(prev + batchSize, children.length));
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [renderedCount, children.length, batchSize, delay]);

  const defaultFallback = (
    <div className="flex items-center justify-center p-2">
      <LoadingTransition variant="minimal" loadingText="渲染中..." />
    </div>
  );

  return (
    <>
      {children.slice(0, renderedCount)}
      {renderedCount < children.length && (fallback || defaultFallback)}
    </>
  );
});

BatchRenderWrapper.displayName = 'BatchRenderWrapper';

// 高阶组件：为任何组件添加性能优化
export function withPerformanceOptimization<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    componentName?: string;
    enableMonitoring?: boolean;
    enableMemoryTracking?: boolean;
    enableLazyLoading?: boolean;
    lazyThreshold?: number;
  } = {}
) {
  const {
    componentName = WrappedComponent.displayName || WrappedComponent.name || 'Component',
    enableMonitoring = true,
    enableMemoryTracking = true,
    enableLazyLoading = false,
    lazyThreshold = 0.1
  } = options;

  const OptimizedComponent = memo(forwardRef<any, P>((props, ref) => {
    const component = <WrappedComponent {...props} ref={ref} />;

    if (enableLazyLoading) {
      return (
        <LazyWrapper threshold={lazyThreshold}>
          <PerformanceWrapper
            componentName={componentName}
            enableMonitoring={enableMonitoring}
            enableMemoryTracking={enableMemoryTracking}
          >
            {component}
          </PerformanceWrapper>
        </LazyWrapper>
      );
    }

    return (
      <PerformanceWrapper
        componentName={componentName}
        enableMonitoring={enableMonitoring}
        enableMemoryTracking={enableMemoryTracking}
      >
        {component}
      </PerformanceWrapper>
    );
  }));

  OptimizedComponent.displayName = `withPerformanceOptimization(${componentName})`;

  return OptimizedComponent;
}
