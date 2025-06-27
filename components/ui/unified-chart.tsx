"use client";

import React from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ComposedChart
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Activity,
  RefreshCw,
  Download,
  Maximize2
} from "lucide-react";
import { AnimatedCard, AnimatedButton, AnimatedCounter } from "@/components/ui/animated-components";

// 图表类型定义
export type ChartType = 'line' | 'area' | 'bar' | 'pie' | 'scatter' | 'composed';

// 图表配置接口
export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
    theme?: {
      light: string;
      dark: string;
    };
  };
}

// 数据点接口
export interface DataPoint {
  [key: string]: any;
  name?: string;
  value?: number;
  date?: string;
}

// 图表属性接口
export interface UnifiedChartProps {
  type: ChartType;
  data: DataPoint[];
  config: ChartConfig;
  title?: string;
  description?: string;
  height?: number;
  width?: string;
  className?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  showActions?: boolean;
  isLoading?: boolean;
  error?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  onFullscreen?: () => void;
  xAxisKey?: string;
  yAxisKey?: string;
  strokeWidth?: number;
  fillOpacity?: number;
  animationDuration?: number;
  responsive?: boolean;
}

// 图表图标映射
const chartIcons = {
  line: LineChartIcon,
  area: Activity,
  bar: BarChart3,
  pie: PieChartIcon,
  scatter: Activity,
  composed: Activity
};

// 默认颜色调色板
const defaultColors = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00",
  "#0088fe", "#00c49f", "#ffbb28", "#ff8042", "#8dd1e1"
];

/**
 * 统一图表组件
 */
export function UnifiedChart({
  type,
  data,
  config,
  title,
  description,
  height = 400,
  width = "100%",
  className,
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  showActions = false,
  isLoading = false,
  error,
  onRefresh,
  onExport,
  onFullscreen,
  xAxisKey = "name",
  yAxisKey = "value",
  strokeWidth = 2,
  fillOpacity = 0.6,
  animationDuration = 300,
  responsive = true
}: UnifiedChartProps) {
  const ChartIcon = chartIcons[type];

  // 渲染图表内容
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    const xAxis = <XAxis dataKey={xAxisKey} />;
    const yAxis = <YAxis />;
    const grid = showGrid ? <CartesianGrid strokeDasharray="3 3" /> : null;
    const tooltip = showTooltip ? <ChartTooltip content={<ChartTooltipContent />} /> : null;
    const legend = showLegend ? <ChartLegend /> : null;

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {grid}
            {xAxis}
            {yAxis}
            {tooltip}
            {legend}
            {Object.entries(config).map(([key, itemConfig], index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={itemConfig.color || defaultColors[index % defaultColors.length]}
                strokeWidth={strokeWidth}
                name={itemConfig.label}
                animationDuration={animationDuration}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {grid}
            {xAxis}
            {yAxis}
            {tooltip}
            {legend}
            {Object.entries(config).map(([key, itemConfig], index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={itemConfig.color || defaultColors[index % defaultColors.length]}
                fill={itemConfig.color || defaultColors[index % defaultColors.length]}
                fillOpacity={fillOpacity}
                name={itemConfig.label}
                animationDuration={animationDuration}
              />
            ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {grid}
            {xAxis}
            {yAxis}
            {tooltip}
            {legend}
            {Object.entries(config).map(([key, itemConfig], index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={itemConfig.color || defaultColors[index % defaultColors.length]}
                name={itemConfig.label}
                animationDuration={animationDuration}
              />
            ))}
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart {...commonProps}>
            {tooltip}
            {legend}
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={Math.min(height * 0.3, 120)}
              fill="#8884d8"
              dataKey={yAxisKey}
              nameKey={xAxisKey}
              animationDuration={animationDuration}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={defaultColors[index % defaultColors.length]} 
                />
              ))}
            </Pie>
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            {grid}
            {xAxis}
            {yAxis}
            {tooltip}
            {legend}
            {Object.entries(config).map(([key, itemConfig], index) => (
              <Scatter
                key={key}
                dataKey={key}
                fill={itemConfig.color || defaultColors[index % defaultColors.length]}
                name={itemConfig.label}
              />
            ))}
          </ScatterChart>
        );

      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            {grid}
            {xAxis}
            {yAxis}
            {tooltip}
            {legend}
            {Object.entries(config).map(([key, itemConfig], index) => {
              // 根据配置决定渲染类型
              const renderType = itemConfig.type || 'line';
              switch (renderType) {
                case 'bar':
                  return (
                    <Bar
                      key={key}
                      dataKey={key}
                      fill={itemConfig.color || defaultColors[index % defaultColors.length]}
                      name={itemConfig.label}
                    />
                  );
                case 'area':
                  return (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={itemConfig.color || defaultColors[index % defaultColors.length]}
                      fill={itemConfig.color || defaultColors[index % defaultColors.length]}
                      fillOpacity={fillOpacity}
                      name={itemConfig.label}
                    />
                  );
                default:
                  return (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={itemConfig.color || defaultColors[index % defaultColors.length]}
                      strokeWidth={strokeWidth}
                      name={itemConfig.label}
                    />
                  );
              }
            })}
          </ComposedChart>
        );

      default:
        return <div className="flex items-center justify-center h-full text-muted-foreground">不支持的图表类型</div>;
    }
  };

  // 渲染加载状态
  if (isLoading) {
    return (
      <AnimatedCard className={cn("w-full", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChartIcon className="h-5 w-5" />
              <CardTitle>{title || "图表"}</CardTitle>
            </div>
            {showActions && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                </Button>
              </div>
            )}
          </div>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">加载图表数据中...</p>
            </div>
          </div>
        </CardContent>
      </AnimatedCard>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <AnimatedCard className={cn("w-full", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChartIcon className="h-5 w-5" />
              <CardTitle>{title || "图表"}</CardTitle>
            </div>
            {showActions && onRefresh && (
              <AnimatedButton variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </AnimatedButton>
            )}
          </div>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <div className="text-red-500 mb-2">⚠️</div>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChartIcon className="h-5 w-5" />
            <CardTitle>{title || "图表"}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {type.toUpperCase()}
            </Badge>
          </div>
          {showActions && (
            <div className="flex items-center gap-2">
              {onRefresh && (
                <AnimatedButton variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </AnimatedButton>
              )}
              {onExport && (
                <AnimatedButton variant="outline" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4" />
                </AnimatedButton>
              )}
              {onFullscreen && (
                <AnimatedButton variant="outline" size="sm" onClick={onFullscreen}>
                  <Maximize2 className="h-4 w-4" />
                </AnimatedButton>
              )}
            </div>
          )}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className={cn("w-full", `h-[${height}px]`)}>
          {responsive ? (
            <ResponsiveContainer width={width} height={height}>
              {renderChart()}
            </ResponsiveContainer>
          ) : (
            renderChart()
          )}
        </ChartContainer>
      </CardContent>
    </AnimatedCard>
  );
}

// 预设图表组件

/**
 * 趋势线图表组件
 */
export function TrendLineChart({
  data,
  config,
  title = "趋势分析",
  description = "数据趋势变化图表",
  ...props
}: Omit<UnifiedChartProps, 'type'>) {
  return (
    <UnifiedChart
      type="line"
      data={data}
      config={config}
      title={title}
      description={description}
      showGrid={true}
      showLegend={true}
      showTooltip={true}
      {...props}
    />
  );
}

/**
 * 对比柱状图组件
 */
export function ComparisonBarChart({
  data,
  config,
  title = "数据对比",
  description = "多维度数据对比分析",
  ...props
}: Omit<UnifiedChartProps, 'type'>) {
  return (
    <UnifiedChart
      type="bar"
      data={data}
      config={config}
      title={title}
      description={description}
      showGrid={true}
      showLegend={true}
      showTooltip={true}
      {...props}
    />
  );
}

/**
 * 面积图表组件
 */
export function UnifiedAreaChart({
  data,
  config,
  title = "面积分析",
  description = "累积数据变化趋势",
  ...props
}: Omit<UnifiedChartProps, 'type'>) {
  return (
    <UnifiedChart
      type="area"
      data={data}
      config={config}
      title={title}
      description={description}
      showGrid={true}
      showLegend={true}
      showTooltip={true}
      fillOpacity={0.3}
      {...props}
    />
  );
}

/**
 * 饼图组件
 */
export function UnifiedPieChart({
  data,
  config,
  title = "比例分析",
  description = "数据占比分布图",
  ...props
}: Omit<UnifiedChartProps, 'type'>) {
  return (
    <UnifiedChart
      type="pie"
      data={data}
      config={config}
      title={title}
      description={description}
      showGrid={false}
      showLegend={true}
      showTooltip={true}
      {...props}
    />
  );
}

/**
 * 组合图表组件
 */
export function UnifiedComposedChart({
  data,
  config,
  title = "综合分析",
  description = "多类型数据综合展示",
  ...props
}: Omit<UnifiedChartProps, 'type'>) {
  return (
    <UnifiedChart
      type="composed"
      data={data}
      config={config}
      title={title}
      description={description}
      showGrid={true}
      showLegend={true}
      showTooltip={true}
      {...props}
    />
  );
}

// 图表工具函数

/**
 * 生成图表配置
 */
export function createChartConfig(
  keys: string[],
  labels: string[],
  colors?: string[]
): ChartConfig {
  const config: ChartConfig = {};

  keys.forEach((key, index) => {
    config[key] = {
      label: labels[index] || key,
      color: colors?.[index] || defaultColors[index % defaultColors.length]
    };
  });

  return config;
}

/**
 * 格式化图表数据
 */
export function formatChartData(
  rawData: any[],
  xKey: string,
  yKeys: string[],
  xFormatter?: (value: any) => string,
  yFormatter?: (value: any) => number
): DataPoint[] {
  return rawData.map(item => {
    const formattedItem: DataPoint = {
      [xKey]: xFormatter ? xFormatter(item[xKey]) : item[xKey]
    };

    yKeys.forEach(yKey => {
      formattedItem[yKey] = yFormatter ? yFormatter(item[yKey]) : item[yKey];
    });

    return formattedItem;
  });
}

/**
 * 计算趋势指标
 */
export function calculateTrend(data: DataPoint[], key: string): {
  trend: 'up' | 'down' | 'stable';
  change: number;
  changePercent: number;
} {
  if (data.length < 2) {
    return { trend: 'stable', change: 0, changePercent: 0 };
  }

  const firstValue = data[0][key] as number;
  const lastValue = data[data.length - 1][key] as number;
  const change = lastValue - firstValue;
  const changePercent = firstValue !== 0 ? (change / firstValue) * 100 : 0;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (Math.abs(changePercent) > 1) {
    trend = changePercent > 0 ? 'up' : 'down';
  }

  return { trend, change, changePercent };
}
