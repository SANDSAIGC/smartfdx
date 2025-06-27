"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  CircleDot,
  Activity,
  BarChart3,
  TrendingUp,
  Calendar,
  CalendarIcon,
  Loader2,
  Download,
  RefreshCw
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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SkeletonLoading, TableSkeletonLoading } from "@/components/loading-transition";
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
interface ShiftReportData {
  date: string;
  shift: string;
  wetWeight: number;
  moisture: number;
  dryWeight: number;
  oreZnGrade: number;
  orePbGrade: number;
  oreZnMetalAmount: number;
  orePbMetalAmount: number;
  concentrateAmount: number;
  concentrateZnGrade: number;
  concentratePbGrade: number;
  concentrateZnMetalAmount: number;
  concentratePbMetalAmount: number;
  tailingAmount: number;
  tailingZnGrade: number;
  tailingPbGrade: number;
  theoreticalRecovery: number;
  materialInputAmount: number;
  materialConsumptionAmount: number;
  concentrateOutput: number;
  concentrateOutputShipped: number;
}

interface CumulativeStats {
  totalWetWeight: number;
  totalDryWeight: number;
  avgOreMoisture: number;
  avgOreZnGrade: number;
  avgOrePbGrade: number;
  totalOreZnMetalAmount: number;
  totalOrePbMetalAmount: number;
  totalConcentrateAmount: number;
  avgConcentrateZnGrade: number;
  avgConcentratePbGrade: number;
  totalConcentrateZnMetalAmount: number;
  totalConcentratePbMetalAmount: number;
  totalTailingAmount: number;
  avgTailingZnGrade: number;
  avgTailingPbGrade: number;
  avgTheoreticalRecovery: number;
  totalMaterialInput: number;
  totalMaterialConsumption: number;
  totalOutputAmount: number;
}

interface DateRange {
  from: Date;
  to: Date;
}

// 颜色配置
const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  warning: '#EF4444',
  info: '#8B5CF6',
  success: '#059669'
};

export function ProcessManagementPage() {
  // 性能监控
  const { renderCount } = useRenderPerformance('process-management-page');
  const { addTimer, addListener } = useMemoryLeak('process-management-page');
  const { metrics } = usePerformanceOptimization();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("shift-report");
  const [loading, setLoading] = useState(false);
  
  // 班报相关状态
  const [selectedDate, setSelectedDate] = useState<Date>(subDays(new Date(), 2));
  const [selectedShift, setSelectedShift] = useState<string>('day');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // 累计数据相关状态
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(2024, 3, 26), // 4月26日
    to: subDays(new Date(), 2)
  });
  const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<DateRange>(dateRange);
  
  // 数据状态
  const [shiftReportData, setShiftReportData] = useState<ShiftReportData | null>(null);
  const [cumulativeStats, setCumulativeStats] = useState<CumulativeStats | null>(null);

  // 生成模拟班报数据
  const generateMockShiftData = (): ShiftReportData => {
    const random = (min: number, max: number) => Math.random() * (max - min) + min;
    
    return {
      date: format(selectedDate, 'yyyy-MM-dd'),
      shift: selectedShift === 'day' ? '白班' : '夜班',
      wetWeight: random(80, 95),
      moisture: random(6, 9),
      dryWeight: random(75, 88),
      oreZnGrade: random(11, 14),
      orePbGrade: random(2.5, 3.2),
      oreZnMetalAmount: random(8, 12),
      orePbMetalAmount: random(1.8, 2.5),
      concentrateAmount: random(42, 48),
      concentrateZnGrade: random(18, 22),
      concentratePbGrade: random(3.5, 4.2),
      concentrateZnMetalAmount: random(8.5, 10.5),
      concentratePbMetalAmount: random(1.6, 2.0),
      tailingAmount: random(35, 42),
      tailingZnGrade: random(2.0, 2.8),
      tailingPbGrade: random(0.7, 1.0),
      theoreticalRecovery: random(85, 90),
      materialInputAmount: random(88, 95),
      materialConsumptionAmount: random(82, 90),
      concentrateOutput: random(42, 48),
      concentrateOutputShipped: random(40, 46)
    };
  };

  // 生成模拟累计数据
  const generateMockCumulativeData = (): CumulativeStats => {
    const random = (min: number, max: number) => Math.random() * (max - min) + min;
    
    return {
      totalWetWeight: random(580, 620),
      totalDryWeight: random(540, 580),
      avgOreMoisture: random(7, 8),
      avgOreZnGrade: random(12, 13),
      avgOrePbGrade: random(2.7, 3.0),
      totalOreZnMetalAmount: random(65, 75),
      totalOrePbMetalAmount: random(14, 17),
      totalConcentrateAmount: random(310, 330),
      avgConcentrateZnGrade: random(19, 21),
      avgConcentratePbGrade: random(3.8, 4.1),
      totalConcentrateZnMetalAmount: random(60, 68),
      totalConcentratePbMetalAmount: random(12, 14),
      totalTailingAmount: random(270, 290),
      avgTailingZnGrade: random(2.2, 2.6),
      avgTailingPbGrade: random(0.8, 1.0),
      avgTheoreticalRecovery: random(86, 89),
      totalMaterialInput: random(630, 670),
      totalMaterialConsumption: random(580, 620),
      totalOutputAmount: random(300, 320)
    };
  };

  // 获取数据
  const fetchData = async () => {
    setLoading(true);
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (activeTab === 'shift-report') {
        const mockData = generateMockShiftData();
        setShiftReportData(mockData);
        toast({
          title: "班报数据加载成功",
          description: `已加载 ${format(selectedDate, 'yyyy年MM月dd日')} ${mockData.shift} 数据`,
        });
      } else if (activeTab === 'cumulative') {
        const mockStats = generateMockCumulativeData();
        setCumulativeStats(mockStats);
        toast({
          title: "累计数据加载成功",
          description: `已加载 ${format(dateRange.from, 'MM月dd日')} - ${format(dateRange.to, 'MM月dd日')} 累计数据`,
        });
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      toast({
        title: "数据加载失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedDate, selectedShift, dateRange]);

  const handleBack = () => {
    router.back();
  };

  const handleDateRangeConfirm = () => {
    setDateRange(tempDateRange);
    setIsDateRangePickerOpen(false);
  };

  const handleDateRangeCancel = () => {
    setTempDateRange(dateRange);
    setIsDateRangePickerOpen(false);
  };

  const handleExport = () => {
    toast({
      title: "导出功能",
      description: "数据导出功能开发中...",
    });
  };

  // 圆环图数据
  const getDonutData = (value: number, maxValue: number, label: string, unit: string, color: string) => {
    const percentage = Math.min((value / maxValue) * 100, 100);
    return [
      { name: 'value', value: percentage, color },
      { name: 'remaining', value: 100 - percentage, color: '#e5e7eb' }
    ];
  };

  // 自定义圆环图组件
  const DonutChart = ({ value, maxValue, label, unit, color }: {
    value: number;
    maxValue: number;
    label: string;
    unit: string;
    color: string;
  }) => {
    const data = getDonutData(value, maxValue, label, unit, color);

    return (
    <PerformanceWrapper
      componentName="process-management-page"
      enableMonitoring={process.env.NODE_ENV === 'development'}
      enableMemoryTracking={true}
    >
      <AnimatedListItem index={0} className="flex flex-col items-center space-y-2">
        <div className="relative w-16 h-16">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={20}
                outerRadius={30}
                startAngle={90}
                endAngle={450}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold">{value.toFixed(1)}</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{unit}</p>
        </div>
      </AnimatedPage>
    </PerformanceWrapper>
  );
  };

  return (
    <AnimatedPage className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <div className="flex justify-between items-center p-6 border-b">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回</span>
          </Button>
          <h1 className="text-xl md:text-2xl font-semibold">生产管理</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <ThemeToggle />
        </div>
      </div>

      <AnimatedListItem index={1} className="p-6 space-y-6">
        {/* 状态指示器 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <CircleDot size={14} className="text-green-500 animate-pulse" />
            <span>部门作业实时同步中</span>
          </div>
          <div className="text-xs text-muted-foreground">
            最后更新: {format(new Date(), 'HH:mm:ss')}
          </div>
        </div>

        {/* 选项卡 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="shift-report">生产班报</TabsTrigger>
            <TabsTrigger value="cumulative">生产累计</TabsTrigger>
            <TabsTrigger value="monitoring">生产监控</TabsTrigger>
          </TabsList>

          {/* 生产班报选项卡 */}
          <TabsContent value="shift-report" className="space-y-6">
            {/* 日期和班次选择 */}
            <AnimatedCard delay={0}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">班报查询</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <AnimatedButton
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedDate, 'yyyy年MM月dd日')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          if (date) {
                            setSelectedDate(date);
                            setIsDatePickerOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Select value={selectedShift} onValueChange={setSelectedShift}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">白班</SelectItem>
                      <SelectItem value="night">夜班</SelectItem>
                    </SelectContent>
                  </Select>

                  <AnimatedButton onClick={fetchData} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                    刷新
                  </Button>
                </div>
              </CardContent>
            </AnimatedCard>

            {loading ? (
              <SkeletonLoading rows={3} className="h-32" />
            ) : shiftReportData ? (
              <>
                {/* 原矿数据 */}
                <AnimatedCard delay={0.1}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      原矿数据·班次
                    </CardTitle>
                    <CardDescription>
                      {shiftReportData.date} {shiftReportData.shift}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AnimatedListItem index={0} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6">
                      <DonutChart value={shiftReportData.wetWeight} maxValue={100} label="原矿湿重" unit="吨" color={COLORS.primary} />
                      <DonutChart value={shiftReportData.moisture} maxValue={20} label="原矿水分" unit="%" color={COLORS.accent} />
                      <DonutChart value={shiftReportData.dryWeight} maxValue={100} label="原矿干重" unit="吨" color={COLORS.secondary} />
                      <DonutChart value={shiftReportData.oreZnGrade} maxValue={40} label="原矿锌品位" unit="%" color={COLORS.info} />
                      <DonutChart value={shiftReportData.orePbGrade} maxValue={10} label="原矿铅品位" unit="%" color={COLORS.warning} />
                      <DonutChart value={shiftReportData.oreZnMetalAmount} maxValue={15} label="原矿锌金属量" unit="吨" color="#A855F7" />
                      <DonutChart value={shiftReportData.orePbMetalAmount} maxValue={5} label="原矿铅金属量" unit="吨" color="#6366F1" />
                    </div>
                  </CardContent>
                </AnimatedCard>

                {/* 精矿数据 */}
                <AnimatedCard delay={0.2}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      精矿数据·班次
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AnimatedListItem index={1} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                      <DonutChart value={shiftReportData.concentrateAmount} maxValue={50} label="精矿产量" unit="吨" color="#2563EB" />
                      <DonutChart value={shiftReportData.concentrateZnGrade} maxValue={30} label="精矿锌品位" unit="%" color="#DB2777" />
                      <DonutChart value={shiftReportData.concentratePbGrade} maxValue={10} label="精矿铅品位" unit="%" color="#7C3AED" />
                      <DonutChart value={shiftReportData.concentrateZnMetalAmount} maxValue={15} label="精矿锌金属量" unit="吨" color="#4F46E5" />
                      <DonutChart value={shiftReportData.concentratePbMetalAmount} maxValue={5} label="精矿铅金属量" unit="吨" color="#9333EA" />
                    </div>
                  </CardContent>
                </AnimatedCard>

                {/* 尾矿数据 */}
                <AnimatedCard delay={0.30000000000000004}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      尾矿数据·班次
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AnimatedListItem index={2} className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      <DonutChart value={shiftReportData.tailingAmount} maxValue={80} label="尾矿产量" unit="吨" color="#0D9488" />
                      <DonutChart value={shiftReportData.tailingZnGrade} maxValue={5} label="尾矿锌品位" unit="%" color="#DC2626" />
                      <DonutChart value={shiftReportData.tailingPbGrade} maxValue={3} label="尾矿铅品位" unit="%" color="#CA8A04" />
                    </div>
                  </CardContent>
                </AnimatedCard>

                {/* 回收率 */}
                <AnimatedCard delay={0.4}>
                  <CardHeader>
                    <CardTitle>回收率·班次</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      <div className="w-32 h-32 relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getDonutData(shiftReportData.theoreticalRecovery, 100, "理论回收率", "%", COLORS.success)}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={60}
                              startAngle={90}
                              endAngle={450}
                              dataKey="value"
                              stroke="none"
                            >
                              {getDonutData(shiftReportData.theoreticalRecovery, 100, "理论回收率", "%", COLORS.success).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-lg font-bold">{shiftReportData.theoreticalRecovery.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-4">
                      <p className="font-medium">理论回收率</p>
                      <Badge variant="outline" className="mt-2">
                        {shiftReportData.theoreticalRecovery > 85 ? '优秀' : shiftReportData.theoreticalRecovery > 80 ? '良好' : '需改进'}
                      </Badge>
                    </div>
                  </CardContent>
                </AnimatedCard>

                {/* 物料流转 */}
                <AnimatedCard delay={0.5}>
                  <CardHeader>
                    <CardTitle>物料流转·每日</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AnimatedListItem index={3} className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                      <DonutChart value={shiftReportData.materialInputAmount} maxValue={100} label="原料倒入量" unit="吨" color="#A855F7" />
                      <DonutChart value={shiftReportData.materialConsumptionAmount} maxValue={100} label="原料消耗量" unit="吨" color="#F43F5E" />
                      <DonutChart value={shiftReportData.concentrateOutput} maxValue={100} label="精矿产出量" unit="吨" color="#0EA5E9" />
                      <DonutChart value={shiftReportData.concentrateOutputShipped} maxValue={100} label="精矿出厂量" unit="吨" color="#10B981" />
                    </div>
                  </CardContent>
                </AnimatedCard>
              </>
            ) : (
              <AnimatedCard delay={0.6000000000000001}>
                <CardContent className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">暂无班报数据</p>
                  <p className="text-sm text-muted-foreground">请选择日期和班次后点击刷新</p>
                </CardContent>
              </AnimatedCard>
            )}
          </TabsContent>

          {/* 生产累计选项卡 */}
          <TabsContent value="cumulative" className="space-y-6">
            {/* 日期范围选择 */}
            <AnimatedCard delay={0.7000000000000001}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">累计数据查询</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Popover open={isDateRangePickerOpen} onOpenChange={setIsDateRangePickerOpen}>
                    <PopoverTrigger asChild>
                      <AnimatedButton
                        variant="outline"
                        className="justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(dateRange.from, 'MM月dd日')} - {format(dateRange.to, 'MM月dd日')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4" align="start">
                      <AnimatedListItem index={2} className="space-y-4">
                        <div className="text-sm font-medium">选择日期范围</div>
                        <AnimatedListItem index={4} className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-muted-foreground">开始日期</label>
                            <CalendarComponent
                              mode="single"
                              selected={tempDateRange.from}
                              onSelect={(date) => {
                                if (date) {
                                  setTempDateRange(prev => ({ ...prev, from: date }));
                                }
                              }}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">结束日期</label>
                            <CalendarComponent
                              mode="single"
                              selected={tempDateRange.to}
                              onSelect={(date) => {
                                if (date) {
                                  setTempDateRange(prev => ({ ...prev, to: date }));
                                }
                              }}
                              className="w-full"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={handleDateRangeCancel}>
                            取消
                          </Button>
                          <Button size="sm" onClick={handleDateRangeConfirm}>
                            确认
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <AnimatedButton onClick={fetchData} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                    刷新
                  </Button>
                </div>
              </CardContent>
            </AnimatedCard>

            {loading ? (
              <SkeletonLoading rows={3} className="h-32" />
            ) : cumulativeStats ? (
              <>
                {/* 原矿累计数据 */}
                <AnimatedCard delay={0.8}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      原矿数据累计
                    </CardTitle>
                    <CardDescription>
                      {format(dateRange.from, 'yyyy年MM月dd日')} - {format(dateRange.to, 'yyyy年MM月dd日')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AnimatedListItem index={5} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                      <DonutChart value={cumulativeStats.totalWetWeight} maxValue={cumulativeStats.totalWetWeight * 1.2} label="原矿湿重累计" unit="t" color={COLORS.primary} />
                      <DonutChart value={cumulativeStats.avgOreMoisture} maxValue={20} label="原矿水分平均" unit="%" color={COLORS.accent} />
                      <DonutChart value={cumulativeStats.totalDryWeight} maxValue={cumulativeStats.totalDryWeight * 1.2} label="原矿干重累计" unit="t" color={COLORS.secondary} />
                      <DonutChart value={cumulativeStats.avgOreZnGrade} maxValue={40} label="原矿锌品位平均" unit="%" color={COLORS.info} />
                      <DonutChart value={cumulativeStats.avgOrePbGrade} maxValue={10} label="原矿铅品位平均" unit="%" color={COLORS.warning} />
                      <DonutChart value={cumulativeStats.totalOreZnMetalAmount} maxValue={cumulativeStats.totalOreZnMetalAmount * 1.2} label="原矿锌金属量累计" unit="t" color="#A855F7" />
                      <DonutChart value={cumulativeStats.totalOrePbMetalAmount} maxValue={cumulativeStats.totalOrePbMetalAmount * 1.2} label="原矿铅金属量累计" unit="t" color="#6366F1" />
                    </div>
                  </CardContent>
                </AnimatedCard>

                {/* 精矿累计数据 */}
                <AnimatedCard delay={0.9}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      精矿数据累计
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AnimatedListItem index={6} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                      <DonutChart value={cumulativeStats.totalConcentrateAmount} maxValue={cumulativeStats.totalConcentrateAmount * 1.2} label="精矿产量累计" unit="t" color="#8B5CF6" />
                      <DonutChart value={cumulativeStats.avgConcentrateZnGrade} maxValue={30} label="精矿锌品位平均" unit="%" color="#9333EA" />
                      <DonutChart value={cumulativeStats.avgConcentratePbGrade} maxValue={10} label="精矿铅品位平均" unit="%" color="#DB2777" />
                      <DonutChart value={cumulativeStats.totalConcentrateZnMetalAmount} maxValue={cumulativeStats.totalConcentrateZnMetalAmount * 1.2} label="精矿锌金属量累计" unit="t" color="#0EA5E9" />
                      <DonutChart value={cumulativeStats.totalConcentratePbMetalAmount} maxValue={cumulativeStats.totalConcentratePbMetalAmount * 1.2} label="精矿铅金属量累计" unit="t" color="#F43F5E" />
                    </div>
                  </CardContent>
                </AnimatedCard>

                {/* 尾矿累计数据 */}
                <AnimatedCard delay={1}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      尾矿数据累计
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AnimatedListItem index={7} className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      <DonutChart value={cumulativeStats.totalTailingAmount} maxValue={cumulativeStats.totalTailingAmount * 1.2} label="尾矿产量累计" unit="t" color="#0D9488" />
                      <DonutChart value={cumulativeStats.avgTailingZnGrade} maxValue={5} label="尾矿锌品位平均" unit="%" color="#DC2626" />
                      <DonutChart value={cumulativeStats.avgTailingPbGrade} maxValue={3} label="尾矿铅品位平均" unit="%" color="#CA8A04" />
                    </div>
                  </CardContent>
                </AnimatedCard>

                {/* 回收率累计 */}
                <AnimatedCard delay={1.1}>
                  <CardHeader>
                    <CardTitle>回收率累计</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      <div className="w-32 h-32 relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getDonutData(cumulativeStats.avgTheoreticalRecovery, 100, "理论回收率平均", "%", COLORS.success)}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={60}
                              startAngle={90}
                              endAngle={450}
                              dataKey="value"
                              stroke="none"
                            >
                              {getDonutData(cumulativeStats.avgTheoreticalRecovery, 100, "理论回收率平均", "%", COLORS.success).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-lg font-bold">{cumulativeStats.avgTheoreticalRecovery.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-4">
                      <p className="font-medium">理论回收率平均值</p>
                      <Badge variant="outline" className="mt-2">
                        {cumulativeStats.avgTheoreticalRecovery > 85 ? '优秀' : cumulativeStats.avgTheoreticalRecovery > 80 ? '良好' : '需改进'}
                      </Badge>
                    </div>
                  </CardContent>
                </AnimatedCard>

                {/* 物料流转累计 */}
                <AnimatedCard delay={1.2000000000000002}>
                  <CardHeader>
                    <CardTitle>物料流转累计</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AnimatedListItem index={8} className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      <DonutChart value={cumulativeStats.totalMaterialInput} maxValue={cumulativeStats.totalMaterialInput * 1.2} label="原料倒入量累计" unit="t" color="#A855F7" />
                      <DonutChart value={cumulativeStats.totalMaterialConsumption} maxValue={cumulativeStats.totalMaterialConsumption * 1.2} label="原料消耗量累计" unit="t" color="#F43F5E" />
                      <DonutChart value={cumulativeStats.totalOutputAmount} maxValue={cumulativeStats.totalOutputAmount * 1.2} label="精矿出厂量累计" unit="t" color="#10B981" />
                    </div>
                  </CardContent>
                </AnimatedCard>
              </>
            ) : (
              <AnimatedCard delay={1.3}>
                <CardContent className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">暂无累计数据</p>
                  <p className="text-sm text-muted-foreground">请选择日期范围后点击刷新</p>
                </CardContent>
              </AnimatedCard>
            )}
          </TabsContent>

          {/* 生产监控选项卡 */}
          <TabsContent value="monitoring" className="space-y-6">
            <AnimatedCard delay={1.4000000000000001}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  实时生产监控
                </CardTitle>
                <CardDescription>
                  实时监控生产设备状态和关键指标
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnimatedListItem index={9} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* 设备状态监控 */}
                  <AnimatedListItem index={3} className="space-y-4">
                    <h3 className="font-medium">设备状态</h3>
                    <AnimatedListItem index={4} className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm">球磨机</span>
                        </div>
                        <Badge variant="outline" className="text-green-600">运行中</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm">浮选机</span>
                        </div>
                        <Badge variant="outline" className="text-green-600">运行中</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm">压滤机</span>
                        </div>
                        <Badge variant="outline" className="text-yellow-600">维护中</Badge>
                      </div>
                    </div>
                  </div>

                  {/* 关键指标 */}
                  <AnimatedListItem index={5} className="space-y-4">
                    <h3 className="font-medium">关键指标</h3>
                    <AnimatedListItem index={6} className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">处理量</span>
                          <span className="text-sm font-medium">85.2 t/h</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">回收率</span>
                          <span className="text-sm font-medium">87.4%</span>
                        </div>
                        <Progress value={87} className="h-2" />
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">精矿品位</span>
                          <span className="text-sm font-medium">19.8%</span>
                        </div>
                        <Progress value={79} className="h-2" />
                      </div>
                    </div>
                  </div>

                  {/* 报警信息 */}
                  <AnimatedListItem index={7} className="space-y-4">
                    <h3 className="font-medium">报警信息</h3>
                    <AnimatedListItem index={8} className="space-y-3">
                      <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm">压滤机需要维护</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(), 'HH:mm')}
                        </p>
                      </div>
                      <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">原料库存偏低</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(subDays(new Date(), 0), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 趋势图表 */}
                <div className="mt-8">
                  <h3 className="font-medium mb-4">生产趋势</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { time: '00:00', 处理量: 82, 回收率: 86, 品位: 19.2 },
                          { time: '04:00', 处理量: 85, 回收率: 87, 品位: 19.5 },
                          { time: '08:00', 处理量: 88, 回收率: 88, 品位: 19.8 },
                          { time: '12:00', 处理量: 86, 回收率: 87, 品位: 19.6 },
                          { time: '16:00', 处理量: 84, 回收率: 86, 品位: 19.4 },
                          { time: '20:00', 处理量: 87, 回收率: 88, 品位: 19.7 },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="处理量" stroke={COLORS.primary} strokeWidth={2} />
                        <Line type="monotone" dataKey="回收率" stroke={COLORS.secondary} strokeWidth={2} />
                        <Line type="monotone" dataKey="品位" stroke={COLORS.accent} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </AnimatedCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
