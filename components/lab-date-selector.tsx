"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/ui/unified-date-picker";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  CalendarDays, 
  Clock, 
  RefreshCw,
  TrendingUp,
  BarChart3,
  Filter,
  ChevronDown,
  ChevronUp
} from "lucide-react";

// 日期范围接口
export interface LabDateRange {
  from: Date;
  to: Date;
}

// 预设日期范围配置
const DATE_PRESETS = [
  { label: "最近7天", days: 7, icon: Calendar },
  { label: "最近15天", days: 15, icon: CalendarDays },
  { label: "最近30天", days: 30, icon: Clock },
  { label: "最近60天", days: 60, icon: TrendingUp },
  { label: "最近90天", days: 90, icon: BarChart3 }
] as const;

// 组件属性接口
export interface LabDateSelectorProps {
  dateRange: LabDateRange;
  onDateRangeChange: (range: LabDateRange) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
  showPresets?: boolean;
  showRefreshButton?: boolean;
  showStatistics?: boolean;
  compact?: boolean;
}

export function LabDateSelector({
  dateRange,
  onDateRangeChange,
  onRefresh,
  isLoading = false,
  className,
  showPresets = true,
  showRefreshButton = true,
  showStatistics = true,
  compact = false
}: LabDateSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);

  // 计算日期范围统计信息
  const dateRangeStats = React.useMemo(() => {
    const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 包含结束日期
    
    return {
      days: diffDays,
      startDate: dateRange.from.toLocaleDateString('zh-CN'),
      endDate: dateRange.to.toLocaleDateString('zh-CN'),
      isRecent: diffDays <= 7,
      isExtended: diffDays > 30
    };
  }, [dateRange]);

  // 预设日期范围处理
  const handlePresetClick = useCallback((days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days + 1); // +1 确保包含今天
    
    onDateRangeChange({ from, to });
  }, [onDateRangeChange]);

  // 日期范围变化处理
  const handleDateRangeChange = useCallback((range: { from: Date; to: Date } | undefined) => {
    if (range?.from && range?.to) {
      onDateRangeChange({
        from: range.from,
        to: range.to
      });
    }
  }, [onDateRangeChange]);

  // 刷新处理
  const handleRefresh = useCallback(() => {
    if (onRefresh && !isLoading) {
      onRefresh();
    }
  }, [onRefresh, isLoading]);

  // 紧凑模式渲染
  if (compact) {
    return (
      <Card className={cn("border-l-4 border-l-primary", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              日期范围选择
            </CardTitle>
            <div className="flex items-center gap-2">
              {showStatistics && (
                <Badge variant="outline" className="text-xs">
                  {dateRangeStats.days}天
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* 日期选择器 */}
              <DateRangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                placeholder="选择日期范围"
                className="w-full"
              />

              {/* 预设按钮和刷新按钮 */}
              <div className="flex flex-wrap gap-2">
                {showPresets && DATE_PRESETS.slice(0, 3).map((preset) => (
                  <Button
                    key={preset.days}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetClick(preset.days)}
                    className="text-xs"
                  >
                    <preset.icon className="h-3 w-3 mr-1" />
                    {preset.label}
                  </Button>
                ))}
                
                {showRefreshButton && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="text-xs ml-auto"
                  >
                    <RefreshCw className={cn("h-3 w-3 mr-1", isLoading && "animate-spin")} />
                    刷新
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  // 完整模式渲染
  return (
    <Card className={cn("border-l-4 border-l-primary", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            日期范围选择
          </div>
          {showStatistics && (
            <div className="flex items-center gap-2">
              <Badge 
                variant={dateRangeStats.isRecent ? "default" : dateRangeStats.isExtended ? "secondary" : "outline"}
                className="text-sm"
              >
                {dateRangeStats.days}天数据
              </Badge>
              <Badge variant="outline" className="text-xs">
                {dateRangeStats.startDate} ~ {dateRangeStats.endDate}
              </Badge>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 主要日期选择器 */}
        <div className="space-y-3">
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            placeholder="选择日期范围"
            label="数据查询日期范围"
            className="w-full"
          />
          
          {showStatistics && (
            <div className="text-sm text-muted-foreground">
              已选择 <span className="font-medium text-foreground">{dateRangeStats.days}</span> 天的数据范围
            </div>
          )}
        </div>

        {/* 预设日期范围按钮 */}
        {showPresets && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">快速选择</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {DATE_PRESETS.map((preset) => (
                <Button
                  key={preset.days}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetClick(preset.days)}
                  className="flex items-center gap-2 text-xs"
                >
                  <preset.icon className="h-3 w-3" />
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        {showRefreshButton && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              刷新数据
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
