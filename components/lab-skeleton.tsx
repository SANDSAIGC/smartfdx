"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 实验室页面骨架屏组件
 * 提供优雅的加载状态展示
 */

interface LabSkeletonProps {
  showWelcomePanel?: boolean;
  showWorkAreas?: boolean;
  showDataQuery?: boolean;
  showTable?: boolean;
  tableRows?: number;
}

export function LabSkeleton({
  showWelcomePanel = true,
  showWorkAreas = true,
  showDataQuery = true,
  showTable = true,
  tableRows = 5
}: LabSkeletonProps) {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* 页面头部骨架 */}
      <div className="relative">
        <div className="absolute top-0 right-0">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="text-center mb-8">
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>

      {/* 欢迎面板骨架 */}
      {showWelcomePanel && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex flex-col items-end space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 专项作业区骨架 */}
      {showWorkAreas && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 数据查询区骨架 */}
      {showDataQuery && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48 mt-2" />
            </div>
            <Skeleton className="h-8 w-20" />
          </CardHeader>
          <CardContent>
            {/* 日期范围选择器骨架 */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 数据源切换按钮骨架 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-16" />
              ))}
            </div>

            {/* 表格骨架 */}
            {showTable && <TableSkeleton rows={tableRows} />}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * 表格骨架屏组件
 */
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        {/* 表头骨架 */}
        <div className="border-b border-border/20 pb-2 mb-4">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-20 flex-1" />
            ))}
          </div>
        </div>

        {/* 表格行骨架 */}
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-4 py-2">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton 
                  key={colIndex} 
                  className={`h-4 flex-1 ${
                    colIndex === 0 ? 'w-24' : 
                    colIndex === columns - 1 ? 'w-16' : 'w-20'
                  }`} 
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 工作区域卡片骨架
 */
export function WorkAreaSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center space-y-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * 数据详情对话框骨架
 */
export function DialogSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-border/20">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
}

/**
 * 渐进式加载组件
 */
interface ProgressiveLoadProps {
  isLoading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}

export function ProgressiveLoad({ 
  isLoading, 
  skeleton, 
  children, 
  delay = 0 
}: ProgressiveLoadProps) {
  const [showSkeleton, setShowSkeleton] = React.useState(isLoading);

  React.useEffect(() => {
    if (!isLoading && delay > 0) {
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(isLoading);
    }
  }, [isLoading, delay]);

  return showSkeleton ? <>{skeleton}</> : <>{children}</>;
}
