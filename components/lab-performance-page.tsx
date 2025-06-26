"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Activity, 
  Clock, 
  Zap, 
  TrendingUp, 
  RefreshCw,
  BarChart3,
  Timer,
  Database
} from "lucide-react";
import { usePerformanceMonitor } from "@/lib/performance-monitor";
import { dataCache } from "@/lib/data-cache";
import { mockDataGenerator } from "@/lib/mock-data-generator";
import { ThemeToggle } from "@/components/theme-toggle";
import { DataLoading } from "@/components/loading-transition";

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'error';
  threshold: number;
}

export function LabPerformancePage() {
  const { start, end, getReport, clear } = usePerformanceMonitor();
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState<string>('');
  const [cacheStats, setCacheStats] = useState<any>(null);

  // 获取缓存统计信息
  const updateCacheStats = () => {
    const stats = dataCache.getStats();
    setCacheStats(stats);
  };

  // 运行性能测试
  const runPerformanceTest = async () => {
    setIsRunningTest(true);
    clear(); // 清除之前的指标
    
    try {
      // 测试1: 页面加载时间
      start('page-load-test');
      await new Promise(resolve => setTimeout(resolve, 100)); // 模拟页面加载
      const pageLoadTime = end('page-load-test') || 0;

      // 测试2: 数据获取时间
      start('data-fetch-test');
      const dateRange = {
        from: new Date(new Date().setDate(new Date().getDate() - 7)),
        to: new Date()
      };
      await mockDataGenerator.getData('shift_samples', dateRange, 50);
      const dataFetchTime = end('data-fetch-test') || 0;

      // 测试3: 组件渲染时间
      start('component-render-test');
      await new Promise(resolve => setTimeout(resolve, 50)); // 模拟组件渲染
      const componentRenderTime = end('component-render-test') || 0;

      // 测试4: 数据切换时间
      start('data-switch-test');
      await mockDataGenerator.getData('filter_samples', dateRange, 30);
      const dataSwitchTime = end('data-switch-test') || 0;

      // 测试5: 缓存性能测试
      start('cache-test');
      // 第一次获取（缓存未命中）
      await mockDataGenerator.getData('incoming_samples', dateRange, 20);
      // 第二次获取（缓存命中）
      await mockDataGenerator.getData('incoming_samples', dateRange, 20);
      const cacheTestTime = end('cache-test') || 0;

      // 更新性能指标
      const newMetrics: PerformanceMetric[] = [
        {
          name: '页面加载时间',
          value: pageLoadTime,
          unit: 'ms',
          status: pageLoadTime < 2000 ? 'good' : pageLoadTime < 3000 ? 'warning' : 'error',
          threshold: 2000
        },
        {
          name: '数据获取时间',
          value: dataFetchTime,
          unit: 'ms',
          status: dataFetchTime < 500 ? 'good' : dataFetchTime < 1000 ? 'warning' : 'error',
          threshold: 500
        },
        {
          name: '组件渲染时间',
          value: componentRenderTime,
          unit: 'ms',
          status: componentRenderTime < 100 ? 'good' : componentRenderTime < 200 ? 'warning' : 'error',
          threshold: 100
        },
        {
          name: '数据切换时间',
          value: dataSwitchTime,
          unit: 'ms',
          status: dataSwitchTime < 500 ? 'good' : dataSwitchTime < 1000 ? 'warning' : 'error',
          threshold: 500
        },
        {
          name: '缓存性能',
          value: cacheTestTime,
          unit: 'ms',
          status: cacheTestTime < 300 ? 'good' : cacheTestTime < 600 ? 'warning' : 'error',
          threshold: 300
        }
      ];

      setMetrics(newMetrics);
      setTestResults(getReport());
      updateCacheStats();
    } catch (error) {
      console.error('性能测试失败:', error);
    } finally {
      setIsRunningTest(false);
    }
  };

  // 清除缓存
  const clearCache = () => {
    dataCache.clear(true); // 清除内存和本地存储缓存
    mockDataGenerator.clearCache();
    updateCacheStats();
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'good': return '优秀';
      case 'warning': return '一般';
      case 'error': return '需优化';
      default: return '未知';
    }
  };

  useEffect(() => {
    updateCacheStats();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* 页面头部 */}
      <div className="relative">
        <div className="absolute top-0 right-0">
          <ThemeToggle />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Activity className="h-8 w-8" />
            实验室页面性能监控
          </h1>
          <p className="text-muted-foreground">
            性能指标监测与优化分析
          </p>
        </div>
      </div>

      {/* 控制面板 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            性能测试控制台
          </CardTitle>
          <CardDescription>
            运行性能测试并查看详细报告
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              onClick={runPerformanceTest}
              disabled={isRunningTest}
              className="flex items-center gap-2"
            >
              {isRunningTest ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              {isRunningTest ? '测试中...' : '开始性能测试'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={clearCache}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              清除缓存
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 性能指标 */}
      {metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              性能指标
            </CardTitle>
            <CardDescription>
              各项性能指标的测试结果
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>指标名称</TableHead>
                  <TableHead>测试值</TableHead>
                  <TableHead>阈值</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>评级</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((metric, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{metric.name}</TableCell>
                    <TableCell>
                      <span className={metric.value <= metric.threshold ? 'text-green-600' : 'text-red-600'}>
                        {metric.value.toFixed(2)} {metric.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      ≤ {metric.threshold} {metric.unit}
                    </TableCell>
                    <TableCell>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(metric.status)}`} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={metric.status === 'good' ? 'default' : metric.status === 'warning' ? 'secondary' : 'destructive'}>
                        {getStatusText(metric.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* 缓存统计 */}
      {cacheStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              缓存统计
            </CardTitle>
            <CardDescription>
              数据缓存使用情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{cacheStats.memorySize}</div>
                <div className="text-sm text-muted-foreground">内存缓存条目</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{cacheStats.localStorageSize}</div>
                <div className="text-sm text-muted-foreground">本地存储条目</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{cacheStats.totalKeys.length}</div>
                <div className="text-sm text-muted-foreground">总缓存键数</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 详细报告 */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              详细性能报告
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
              {testResults}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
