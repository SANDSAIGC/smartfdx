/**
 * 性能优化 React Hook
 * 
 * 提供组件级别的性能优化功能：
 * 1. 防抖和节流
 * 2. 虚拟滚动
 * 3. 组件缓存
 * 4. 渲染优化
 * 5. 内存管理
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { performanceOptimizer } from '@/lib/performance-optimizer';

// 防抖Hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 节流Hook
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}

// 虚拟滚动Hook
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
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

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    handleScroll,
    totalHeight: visibleItems.totalHeight,
    offsetY: visibleItems.offsetY
  };
}

// 组件缓存Hook
export function useComponentCache<T>(
  key: string,
  factory: () => T,
  deps: React.DependencyList
): T {
  const cache = useRef<Map<string, T>>(new Map());
  
  return useMemo(() => {
    const cacheKey = `${key}_${JSON.stringify(deps)}`;
    
    if (cache.current.has(cacheKey)) {
      return cache.current.get(cacheKey)!;
    }
    
    const result = factory();
    cache.current.set(cacheKey, result);
    
    // 限制缓存大小
    if (cache.current.size > 10) {
      const firstKey = cache.current.keys().next().value;
      cache.current.delete(firstKey);
    }
    
    return result;
  }, deps);
}

// 渲染性能监控Hook
export function useRenderPerformance(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  
  useEffect(() => {
    renderCount.current++;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 [${componentName}] 渲染次数: ${renderCount.current}, 间隔: ${timeSinceLastRender}ms`);
      
      // 警告频繁渲染
      if (timeSinceLastRender < 16 && renderCount.current > 1) {
        console.warn(`⚠️ [${componentName}] 渲染过于频繁，可能影响性能`);
      }
    }
    
    lastRenderTime.current = now;
  });

  return {
    renderCount: renderCount.current,
    resetRenderCount: () => { renderCount.current = 0; }
  };
}

// 内存泄漏检测Hook
export function useMemoryLeak(componentName: string) {
  const timers = useRef<Set<NodeJS.Timeout>>(new Set());
  const listeners = useRef<Set<() => void>>(new Set());
  
  const addTimer = useCallback((timer: NodeJS.Timeout) => {
    timers.current.add(timer);
  }, []);
  
  const addListener = useCallback((cleanup: () => void) => {
    listeners.current.add(cleanup);
  }, []);
  
  useEffect(() => {
    return () => {
      // 清理定时器
      timers.current.forEach(timer => clearTimeout(timer));
      timers.current.clear();
      
      // 清理事件监听器
      listeners.current.forEach(cleanup => cleanup());
      listeners.current.clear();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🧹 [${componentName}] 已清理所有资源`);
      }
    };
  }, [componentName]);
  
  return { addTimer, addListener };
}

// 懒加载Hook
export function useLazyLoad(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
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
  
  return { ref, isVisible };
}

// 性能优化配置Hook
export function usePerformanceOptimization() {
  const [metrics, setMetrics] = useState<any>({});
  
  useEffect(() => {
    // 初始化性能优化
    performanceOptimizer.preloadCriticalComponents();
    performanceOptimizer.optimizeImageLoading();
    performanceOptimizer.optimizeNetworkRequests();
    performanceOptimizer.optimizeCacheStrategy();
    
    // 定期更新性能指标
    const interval = setInterval(() => {
      const report = performanceOptimizer.getPerformanceReport();
      setMetrics(report);
    }, 5000);
    
    return () => {
      clearInterval(interval);
      performanceOptimizer.cleanup();
    };
  }, []);
  
  return {
    metrics,
    getReport: () => performanceOptimizer.getPerformanceReport(),
    createLazyComponent: performanceOptimizer.createLazyComponent.bind(performanceOptimizer)
  };
}

// 数据预加载Hook
export function useDataPreload<T>(
  dataLoader: () => Promise<T>,
  deps: React.DependencyList = [],
  options: { enabled?: boolean; cacheKey?: string } = {}
) {
  const { enabled = true, cacheKey } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const loadData = useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await dataLoader();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [dataLoader, enabled]);
  
  useEffect(() => {
    loadData();
  }, deps);
  
  return { data, loading, error, reload: loadData };
}

// 批量操作Hook
export function useBatchUpdate<T>(
  updateFn: (items: T[]) => void,
  delay: number = 100
) {
  const batchRef = useRef<T[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const addToBatch = useCallback((item: T) => {
    batchRef.current.push(item);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (batchRef.current.length > 0) {
        updateFn([...batchRef.current]);
        batchRef.current = [];
      }
    }, delay);
  }, [updateFn, delay]);
  
  const flushBatch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (batchRef.current.length > 0) {
      updateFn([...batchRef.current]);
      batchRef.current = [];
    }
  }, [updateFn]);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return { addToBatch, flushBatch };
}
