/**
 * 性能监控工具
 * 用于监测页面加载性能和用户交互响应时间
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isEnabled: boolean = true;

  constructor() {
    // 在开发环境启用性能监控
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  /**
   * 开始性能测量
   */
  start(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata
    };

    this.metrics.set(name, metric);
    console.log(`🚀 [Performance] Started: ${name}`, metadata);
  }

  /**
   * 结束性能测量
   */
  end(name: string, metadata?: Record<string, any>): number | null {
    if (!this.isEnabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`⚠️ [Performance] Metric not found: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;
    metric.metadata = { ...metric.metadata, ...metadata };

    // 性能警告阈值
    const warningThreshold = this.getWarningThreshold(name);
    const emoji = duration > warningThreshold ? '🐌' : '⚡';
    
    console.log(
      `${emoji} [Performance] Completed: ${name} - ${duration.toFixed(2)}ms`,
      metric.metadata
    );

    return duration;
  }

  /**
   * 测量异步函数执行时间
   */
  async measure<T>(
    name: string, 
    fn: () => Promise<T>, 
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(name, metadata);
    try {
      const result = await fn();
      this.end(name, { success: true });
      return result;
    } catch (error) {
      this.end(name, { success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  /**
   * 测量同步函数执行时间
   */
  measureSync<T>(
    name: string, 
    fn: () => T, 
    metadata?: Record<string, any>
  ): T {
    this.start(name, metadata);
    try {
      const result = fn();
      this.end(name, { success: true });
      return result;
    } catch (error) {
      this.end(name, { success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  /**
   * 获取所有性能指标
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * 获取性能报告
   */
  getReport(): string {
    const metrics = this.getMetrics().filter(m => m.duration !== undefined);
    
    if (metrics.length === 0) {
      return '📊 [Performance Report] No metrics available';
    }

    const report = [
      '📊 [Performance Report]',
      '========================',
      ...metrics.map(m => 
        `${m.name}: ${m.duration!.toFixed(2)}ms ${m.duration! > this.getWarningThreshold(m.name) ? '🐌' : '⚡'}`
      ),
      '========================',
      `Total metrics: ${metrics.length}`,
      `Average duration: ${(metrics.reduce((sum, m) => sum + m.duration!, 0) / metrics.length).toFixed(2)}ms`
    ];

    return report.join('\n');
  }

  /**
   * 清除所有指标
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * 获取警告阈值
   */
  private getWarningThreshold(name: string): number {
    const thresholds: Record<string, number> = {
      'page-load': 2000,           // 页面加载 2秒
      'data-fetch': 500,           // 数据获取 500ms
      'component-render': 100,     // 组件渲染 100ms
      'data-switch': 500,          // 数据切换 500ms
      'dialog-open': 200,          // 弹窗打开 200ms
      'table-render': 300,         // 表格渲染 300ms
    };

    return thresholds[name] || 1000; // 默认 1秒
  }
}

// 创建全局实例
export const performanceMonitor = new PerformanceMonitor();

// 页面性能监控 Hook
export function usePerformanceMonitor() {
  return {
    start: performanceMonitor.start.bind(performanceMonitor),
    end: performanceMonitor.end.bind(performanceMonitor),
    measure: performanceMonitor.measure.bind(performanceMonitor),
    measureSync: performanceMonitor.measureSync.bind(performanceMonitor),
    getReport: performanceMonitor.getReport.bind(performanceMonitor),
    clear: performanceMonitor.clear.bind(performanceMonitor)
  };
}
