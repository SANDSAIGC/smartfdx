"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  Calendar as CalendarIcon,
  CircleDot,
  Check,
  X,
  ArrowLeft,
  TrendingUp,
  BarChart3,
  PieChart
} from 'lucide-react';
import {
  UnifiedChart,
  TrendLineChart,
  ComparisonBarChart,
  UnifiedAreaChart,
  UnifiedPieChart,
  UnifiedComposedChart,
  createChartConfig,
  formatChartData,
  calculateTrend
} from "@/components/ui/unified-chart";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table";
import { PaginatedTable, ColumnConfig } from "@/components/ui/paginated-table";
import { cn } from '@/lib/utils';
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FooterSignature } from "@/components/ui/footer-signature";

import { 
  AnimatedPage, 
  AnimatedCard, 
  AnimatedContainer, 
  AnimatedButton,
  AnimatedListItem,
  AnimatedCounter,
  AnimatedProgress,
  AnimatedBadge
} from "@/components/ui/animated-components";
import { PerformanceWrapper, withPerformanceOptimization } from "@/components/performance-wrapper";
import { useRenderPerformance, useMemoryLeak, usePerformanceOptimization } from "@/hooks/use-performance-optimization";
// 定义数据类型
interface SampleData {
  id: string;
  grade_value: number | null;
  moisture_value: number | null;
  filter_press_number: string | null;
}

interface TrendData {
  date: string;
  fullDate: string;
  cycles: number | null;
  moisture: number | null;
  znGrade: number | null;
  pbGrade: number | null;
}

// 颜色配置
const COLORS = {
  tonnage: '#ff8a65',
  moisture: '#4fc3f7',
  znGrade: '#10B981',
  pbGrade: '#F59E0B',
  znMetal: '#8B5CF6', 
  pbMetal: '#EC4899',
  background: '#e0e5ec',
  text: '#403E43',
  grid: '#ccd3dc',
  axes: '#a0aec0'
};

export function FilterPressDataDetailsPage() {
  // 性能监控
  const { renderCount } = useRenderPerformance('filter-press-data-details-page');
  const { addTimer, addListener } = useMemoryLeak('filter-press-data-details-page');
  const { metrics } = usePerformanceOptimization();
  const router = useRouter();
  const [tab, setTab] = useState('filter');
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [latestDataDate, setLatestDataDate] = useState<Date | null>(null);

  // 压滤数据
  const [filterCycles, setFilterCycles] = useState<number>(0);
  const [znSamples, setZnSamples] = useState<SampleData[]>([]);
  const [pbSamples, setPbSamples] = useState<SampleData[]>([]);
  
  // 计算平均值
  const [avgMoisture, setAvgMoisture] = useState<number>(0);
  const [avgZnGrade, setAvgZnGrade] = useState<number>(0);
  const [avgPbGrade, setAvgPbGrade] = useState<number>(0);

  // 趋势图数据
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date>(new Date());

  // 模拟数据生成
  const generateMockData = () => {
    // 生成模拟样品数据
    const mockZnSamples: SampleData[] = Array.from({ length: 8 }, (_, index) => ({
      id: `zn_sample_${index + 1}`,
      grade_value: Math.random() * 15 + 5, // 5-20%
      moisture_value: Math.random() * 20 + 10, // 10-30%
      filter_press_number: `压滤机${index + 1}`
    }));

    const mockPbSamples: SampleData[] = Array.from({ length: 6 }, (_, index) => ({
      id: `pb_sample_${index + 1}`,
      grade_value: Math.random() * 8 + 2, // 2-10%
      moisture_value: null,
      filter_press_number: `压滤机${index + 1}`
    }));

    // 生成趋势数据（最近7天）
    const mockTrendData: TrendData[] = Array.from({ length: 7 }, (_, index) => {
      const date = subDays(new Date(), 6 - index);
      return {
        date: format(date, 'MM/dd'),
        fullDate: format(date, 'yyyy-MM-dd'),
        cycles: Math.floor(Math.random() * 20) + 30, // 30-50
        moisture: Math.random() * 10 + 15, // 15-25%
        znGrade: Math.random() * 5 + 10, // 10-15%
        pbGrade: Math.random() * 3 + 4 // 4-7%
      };
    });

    setZnSamples(mockZnSamples);
    setPbSamples(mockPbSamples);
    setTrendData(mockTrendData);
    setFilterCycles(Math.floor(Math.random() * 20) + 35);

    // 计算平均值
    const avgMoistureValue = mockZnSamples.reduce((sum, sample) => 
      sum + (sample.moisture_value || 0), 0) / mockZnSamples.length;
    const avgZnValue = mockZnSamples.reduce((sum, sample) => 
      sum + (sample.grade_value || 0), 0) / mockZnSamples.length;
    const avgPbValue = mockPbSamples.reduce((sum, sample) => 
      sum + (sample.grade_value || 0), 0) / mockPbSamples.length;

    setAvgMoisture(Number(avgMoistureValue.toFixed(2)));
    setAvgZnGrade(Number(avgZnValue.toFixed(2)));
    setAvgPbGrade(Number(avgPbValue.toFixed(2)));
    setLatestDataDate(new Date());
  };

  useEffect(() => {
    generateMockData();
    setLastUpdatedAt(new Date());
  }, [date]);

  // 日期处理函数
  const handleDateConfirm = () => {
    setDate(tempDate);
    setIsDatePickerOpen(false);
  };

  const handleDateCancel = () => {
    setTempDate(date);
    setIsDatePickerOpen(false);
  };

  const handleGoBack = () => {
    router.back();
  };

  // 准备圆环图数据
  const prepareDonutData = (value: number | null, max: number) => {
    if (value === null || isNaN(Number(value))) {
      return [{ name: '未知', value: 1 }, { name: '剩余值', value: 0 }];
    }
    const numValue = Number(value);
    return [
      { name: '当前值', value: numValue },
      { name: '剩余值', value: max - numValue > 0 ? max - numValue : 0 }
    ];
  };

  // 自定义工具提示
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
    <PerformanceWrapper
      componentName="filter-press-data-details-page"
      enableMonitoring={process.env.NODE_ENV === 'development'}
      enableMemoryTracking={true}
    >
      <div className="bg-background p-3 border rounded-lg shadow-lg text-sm">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="flex items-center">
              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.value !== null ? entry.value.toFixed(2) : '无数据'}
            </p>
          ))}
        </AnimatedPage>
    </PerformanceWrapper>
  );
    }
    return null;
  };

  // 渲染样品数据表格
  const renderSamplesTable = (samples: SampleData[], type: 'moisture' | 'zn' | 'pb') => {
    if (samples.length === 0) {
      return (
        <div className="text-center text-sm text-muted-foreground py-4">
          暂无数据
        </div>
      );
    }

    return (
      <Table className="text-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/2">压滤机号</TableHead>
            <TableHead className="w-1/2">
              {type === 'moisture' ? '水分 (%)' : type === 'zn' ? '锌品位 (%)' : '铅品位 (%)'}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {samples.map((sample, index) => (
            <TableRow key={sample.id || index}>
              <TableCell className="font-medium">
                {sample.filter_press_number || '未指定'}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-mono">
                  {type === 'moisture' 
                    ? sample.moisture_value !== null ? sample.moisture_value.toFixed(2) : '-'
                    : sample.grade_value !== null ? sample.grade_value.toFixed(2) : '-'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  // 渲染数据卡片
  const renderCards = () => {
    return (
      <AnimatedListItem index={0} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 压滤板数量卡片 */}
        <AnimatedCard delay={0}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart3 className="mr-2 h-4 w-4 text-primary" />
              压滤板数量
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl font-bold">{filterCycles}</div>
              <div className="w-16 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie 
                      data={prepareDonutData(filterCycles, 50)} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={12} 
                      outerRadius={20} 
                      paddingAngle={2} 
                      dataKey="value" 
                      strokeWidth={0}
                    >
                      <Cell fill={COLORS.tonnage} />
                      <Cell fill="#e5e7eb" />
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <Progress value={(filterCycles / 50) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">板/日</p>
          </CardContent>
        </AnimatedCard>

        {/* 水分含量卡片 */}
        <AnimatedCard delay={0.1}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <PieChart className="mr-2 h-4 w-4 text-blue-500" />
              水分含量
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl font-bold">{avgMoisture.toFixed(2)}%</div>
              <div className="w-16 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie 
                      data={prepareDonutData(avgMoisture, 40)} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={12} 
                      outerRadius={20} 
                      paddingAngle={2} 
                      dataKey="value" 
                      strokeWidth={0}
                    >
                      <Cell fill={COLORS.moisture} />
                      <Cell fill="#e5e7eb" />
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <Progress value={(avgMoisture / 40) * 100} className="h-2" />
            <div className="mt-4 max-h-32 overflow-y-auto">
              {renderSamplesTable(znSamples, 'moisture')}
            </div>
          </CardContent>
        </AnimatedCard>

        {/* 锌品位卡片 */}
        <AnimatedCard delay={0.2}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
              Zn品位
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl font-bold">{avgZnGrade.toFixed(2)}%</div>
              <div className="w-16 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie 
                      data={prepareDonutData(avgZnGrade, 20)} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={12} 
                      outerRadius={20} 
                      paddingAngle={2} 
                      dataKey="value" 
                      strokeWidth={0}
                    >
                      <Cell fill={COLORS.znGrade} />
                      <Cell fill="#e5e7eb" />
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <Progress value={(avgZnGrade / 20) * 100} className="h-2" />
            <div className="mt-4 max-h-32 overflow-y-auto">
              {renderSamplesTable(znSamples, 'zn')}
            </div>
          </CardContent>
        </AnimatedCard>

        {/* 铅品位卡片 */}
        <AnimatedCard delay={0.30000000000000004}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-yellow-500" />
              Pb品位
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl font-bold">{avgPbGrade.toFixed(2)}%</div>
              <div className="w-16 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie 
                      data={prepareDonutData(avgPbGrade, 10)} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={12} 
                      outerRadius={20} 
                      paddingAngle={2} 
                      dataKey="value" 
                      strokeWidth={0}
                    >
                      <Cell fill={COLORS.pbGrade} />
                      <Cell fill="#e5e7eb" />
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <Progress value={(avgPbGrade / 10) * 100} className="h-2" />
            <div className="mt-4 max-h-32 overflow-y-auto">
              {renderSamplesTable(pbSamples, 'pb')}
            </div>
          </CardContent>
        </AnimatedCard>
      </div>
    );
  };

  // 渲染趋势图
  const renderTrendCharts = () => {
    return (
      <AnimatedListItem index={1} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 压滤板数量趋势图 */}
        <AnimatedCard delay={0.4}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">压滤板数量趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="cycles" 
                    stroke={COLORS.tonnage} 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    name="压滤板数量" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* 水分含量趋势图 */}
        <AnimatedCard delay={0.5}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">水分含量趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="moisture" 
                    stroke={COLORS.moisture} 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    name="水分含量" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* 锌品位趋势图 */}
        <AnimatedCard delay={0.6000000000000001}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">锌品位趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="znGrade" 
                    stroke={COLORS.znGrade} 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    name="锌品位" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* 铅品位趋势图 */}
        <AnimatedCard delay={0.7000000000000001}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">铅品位趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="pbGrade" 
                    stroke={COLORS.pbGrade} 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    name="铅品位" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </AnimatedCard>
      </div>
    );
  };

  return (
    <AnimatedPage className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <div className="flex justify-between items-center p-6 border-b">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">压滤数据详情</span>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* 状态指示器 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CircleDot size={14} className="text-green-500 animate-pulse" />
              <span>数据实时同步中</span>
            </div>
            <span className="text-xs text-muted-foreground">
              最后更新: {format(lastUpdatedAt, 'yyyy-MM-dd HH:mm')}
            </span>
          </div>

          {/* 日期选择卡片 */}
          <AnimatedCard delay={0.8}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                选择日期
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <AnimatedButton 
                    variant="outline" 
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, 'yyyy年MM月dd日')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar 
                    mode="single" 
                    selected={tempDate} 
                    onSelect={(newDate) => newDate && setTempDate(newDate)} 
                    initialFocus 
                  />
                  <div className="p-3 border-t flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={handleDateCancel}>
                      <X className="h-3 w-3 mr-1" />
                      取消
                    </Button>
                    <Button size="sm" onClick={handleDateConfirm}>
                      <Check className="h-3 w-3 mr-1" />
                      确定
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              {latestDataDate && (
                <div className="mt-3 text-xs text-muted-foreground">
                  最近更新日期：{format(latestDataDate, 'yyyy年MM月dd日')}
                </div>
              )}
            </CardContent>
          </AnimatedCard>

          {/* 标签页切换 */}
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="filter">压滤机数据</TabsTrigger>
              <TabsTrigger value="analysis">趋势分析</TabsTrigger>
            </TabsList>
            
            <TabsContent value="filter" className="space-y-6 mt-6">
              {renderCards()}
            </TabsContent>
            
            <TabsContent value="analysis" className="space-y-6 mt-6">
              {renderTrendCharts()}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
