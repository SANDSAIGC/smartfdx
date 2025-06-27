/**
 * 项目页面加载性能全面优化系统
 * 
 * 功能：
 * 1. 组件懒加载管理
 * 2. Bundle分析和优化
 * 3. 内存泄漏检测
 * 4. 网络请求优化
 * 5. 缓存策略优化
 * 6. 渲染性能监控
 */

import { lazy, ComponentType, Suspense } from 'react';
import { dataCache } from './data-cache';

// 性能指标接口
interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  bundleSize: number;
  memoryUsage: number;
  cacheHitRate: number;
  networkRequests: number;
}

// 性能优化配置
interface OptimizationConfig {
  enableLazyLoading: boolean;
  enableImageOptimization: boolean;
  enableCodeSplitting: boolean;
  enableMemoryMonitoring: boolean;
  enableNetworkOptimization: boolean;
  cacheStrategy: 'aggressive' | 'moderate' | 'conservative';
  preloadStrategy: 'critical' | 'important' | 'all';
}

class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private config: OptimizationConfig;
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: Map<string, PerformanceObserver> = new Map();
  private lazyComponents: Map<string, ComponentType<any>> = new Map();

  private constructor() {
    this.config = {
      enableLazyLoading: true,
      enableImageOptimization: true,
      enableCodeSplitting: true,
      enableMemoryMonitoring: true,
      enableNetworkOptimization: true,
      cacheStrategy: 'moderate',
      preloadStrategy: 'important'
    };
    
    this.initializePerformanceMonitoring();
  }

  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * 初始化性能监控
   */
  private initializePerformanceMonitoring(): void {
    if (typeof window === 'undefined') return;

    // 监控页面加载性能
    this.observePageLoad();
    
    // 监控内存使用
    if (this.config.enableMemoryMonitoring) {
      this.observeMemoryUsage();
    }

    // 监控网络请求
    if (this.config.enableNetworkOptimization) {
      this.observeNetworkRequests();
    }
  }

  /**
   * 页面加载性能监控
   */
  private observePageLoad(): void {
    // Web Vitals 监控
    if ('PerformanceObserver' in window) {
      // LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);

      // FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', fidObserver);

      // CLS (Cumulative Layout Shift)
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cumulativeLayoutShift = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', clsObserver);
    }

    // 页面加载时间
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      this.metrics.firstContentfulPaint = navigation.domContentLoadedEventEnd - navigation.fetchStart;
      this.metrics.timeToInteractive = navigation.domInteractive - navigation.fetchStart;
    });
  }

  /**
   * 内存使用监控
   */
  private observeMemoryUsage(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
        
        // 内存泄漏警告
        if (this.metrics.memoryUsage > 100) {
          console.warn(`⚠️ 内存使用过高: ${this.metrics.memoryUsage.toFixed(2)}MB`);
        }
      }, 10000); // 每10秒检查一次
    }
  }

  /**
   * 网络请求监控
   */
  private observeNetworkRequests(): void {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.metrics.networkRequests = (this.metrics.networkRequests || 0) + entries.length;
        
        // 分析慢请求
        entries.forEach((entry: any) => {
          if (entry.duration > 1000) {
            console.warn(`🐌 慢请求检测: ${entry.name} - ${entry.duration.toFixed(2)}ms`);
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    }
  }

  /**
   * 创建懒加载组件
   */
  public createLazyComponent<T = {}>(
    importFn: () => Promise<{ default: ComponentType<T> }>,
    fallback?: React.ReactNode,
    componentName?: string
  ): ComponentType<T> {
    if (!this.config.enableLazyLoading) {
      // 如果禁用懒加载，直接返回动态导入
      return lazy(importFn);
    }

    const LazyComponent = lazy(importFn);
    
    const WrappedComponent = (props: T) => (
      <Suspense fallback={fallback || <div>加载中...</div>}>
        <LazyComponent {...props} />
      </Suspense>
    );

    if (componentName) {
      this.lazyComponents.set(componentName, WrappedComponent);
    }

    return WrappedComponent;
  }

  /**
   * 预加载关键组件
   */
  public preloadCriticalComponents(): void {
    const criticalComponents = [
      () => import('@/components/lab-page'),
      () => import('@/components/auth-guard'),
      () => import('@/components/login-page-content'),
    ];

    if (this.config.preloadStrategy === 'critical' || this.config.preloadStrategy === 'all') {
      criticalComponents.forEach(importFn => {
        // 在空闲时间预加载
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => importFn());
        } else {
          setTimeout(() => importFn(), 100);
        }
      });
    }
  }

  /**
   * 优化图片加载
   */
  public optimizeImageLoading(): void {
    if (!this.config.enableImageOptimization) return;

    // 实现图片懒加载
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  /**
   * 网络请求优化
   */
  public optimizeNetworkRequests(): void {
    // 实现请求去重
    const pendingRequests = new Map<string, Promise<any>>();

    const originalFetch = window.fetch;
    window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
      const url = typeof input === 'string' ? input : input.toString();
      const method = init?.method || 'GET';
      const key = `${method}:${url}`;

      // 如果相同请求正在进行中，返回相同的Promise
      if (pendingRequests.has(key)) {
        return pendingRequests.get(key)!;
      }

      const promise = originalFetch(input, init).finally(() => {
        pendingRequests.delete(key);
      });

      pendingRequests.set(key, promise);
      return promise;
    };
  }

  /**
   * 缓存策略优化
   */
  public optimizeCacheStrategy(): void {
    const strategy = this.config.cacheStrategy;
    
    let ttl: number;
    let maxSize: number;
    
    switch (strategy) {
      case 'aggressive':
        ttl = 30 * 60 * 1000; // 30分钟
        maxSize = 200;
        break;
      case 'moderate':
        ttl = 10 * 60 * 1000; // 10分钟
        maxSize = 100;
        break;
      case 'conservative':
        ttl = 5 * 60 * 1000; // 5分钟
        maxSize = 50;
        break;
    }

    // 更新缓存配置
    dataCache.updateConfig({ defaultTTL: ttl, maxSize });
  }

  /**
   * 获取性能报告
   */
  public getPerformanceReport(): PerformanceMetrics & { recommendations: string[] } {
    const recommendations: string[] = [];

    // 分析性能指标并提供建议
    if (this.metrics.pageLoadTime && this.metrics.pageLoadTime > 2000) {
      recommendations.push('页面加载时间过长，建议启用代码分割和懒加载');
    }

    if (this.metrics.largestContentfulPaint && this.metrics.largestContentfulPaint > 2500) {
      recommendations.push('LCP过高，建议优化关键资源加载');
    }

    if (this.metrics.memoryUsage && this.metrics.memoryUsage > 50) {
      recommendations.push('内存使用较高，建议检查内存泄漏');
    }

    if (this.metrics.networkRequests && this.metrics.networkRequests > 50) {
      recommendations.push('网络请求过多，建议合并请求或使用缓存');
    }

    return {
      ...this.metrics as PerformanceMetrics,
      recommendations
    };
  }

  /**
   * 清理资源
   */
  public cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// 导出单例实例
export const performanceOptimizer = PerformanceOptimizer.getInstance();

// 导出便捷函数
export const createLazyComponent = performanceOptimizer.createLazyComponent.bind(performanceOptimizer);
export const getPerformanceReport = performanceOptimizer.getPerformanceReport.bind(performanceOptimizer);
export const preloadCriticalComponents = performanceOptimizer.preloadCriticalComponents.bind(performanceOptimizer);
