"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ArrowDownUp,
  CircleDot,
  Check,
  X,
  ArrowLeft,
  TrendingUp,
  BarChart3,
  PieChart,
  Loader2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// 定义数据类型
interface OutgoingData {
  weight: number;
  moisture: number;
  znGrade: number;
  pbGrade: number;
  znMetal: number;
  pbMetal: number;
}

interface TrendData {
  date: string;
  fullDate: string;
  weight: number;
  moisture: number;
  znGrade: number;
  pbGrade: number;
}

interface ComparisonData {
  fdx_wet_weight: number;
  jdxy_wet_weight: number;
  weight_diff: number;
  fdx_moisture: number;
  jdxy_moisture: number;
  moisture_diff: number;
  fdx_zn_grade: number;
  jdxy_zn_grade: number;
  zn_grade_diff: number;
  fdx_pb_grade: number;
  jdxy_pb_grade: number;
  pb_grade_diff: number;
  fdx_zn_metal: number;
  jdxy_zn_metal: number;
  zn_metal_diff: number;
  fdx_pb_metal: number;
  jdxy_pb_metal: number;
  pb_metal_diff: number;
}

// 颜色配置
const COLORS = {
  weight: '#4F46E5',
  moisture: '#0EA5E9',
  znGrade: '#10B981',
  pbGrade: '#F59E0B',
  znMetal: '#8B5CF6',
  pbMetal: '#EC4899',
  background: '#e0e5ec',
  text: '#403E43',
  grid: '#ccd3dc',
  axes: '#a0aec0'
};

export function OutgoingDataDetailsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'fdx' | 'jdxy' | 'diff'>('fdx');
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [latestRecordDate, setLatestRecordDate] = useState<Date | null>(null);

  // 出货单位相关状态
  const [outgoingUnits, setOutgoingUnits] = useState<string[]>([]);
  const [selectedOutgoingUnit, setSelectedOutgoingUnit] = useState<string>('全部单位');

  // 富鼎翔数据
  const [fdxData, setFdxData] = useState<OutgoingData>({
    weight: 0,
    moisture: 0,
    znGrade: 0,
    pbGrade: 0,
    znMetal: 0,
    pbMetal: 0
  });

  // 金鼎锌业数据
  const [jdxyData, setJdxyData] = useState<OutgoingData>({
    weight: 0,
    moisture: 0,
    znGrade: 0,
    pbGrade: 0,
    znMetal: 0,
    pbMetal: 0
  });

  // 对比数据
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);

  // 趋势图数据
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date>(new Date());

  // 模拟数据生成
  const generateMockData = () => {
    // 生成模拟富鼎翔数据
    const mockFdxData: OutgoingData = {
      weight: Math.random() * 400 + 100, // 100-500吨
      moisture: Math.random() * 15 + 10, // 10-25%
      znGrade: Math.random() * 40 + 20, // 20-60%
      pbGrade: Math.random() * 20 + 10, // 10-30%
      znMetal: 0,
      pbMetal: 0
    };

    // 计算金属量
    mockFdxData.znMetal = (mockFdxData.weight * mockFdxData.znGrade) / 100;
    mockFdxData.pbMetal = (mockFdxData.weight * mockFdxData.pbGrade) / 100;

    // 生成模拟金鼎锌业数据
    const mockJdxyData: OutgoingData = {
      weight: Math.random() * 300 + 80, // 80-380吨
      moisture: Math.random() * 12 + 8, // 8-20%
      znGrade: Math.random() * 15 + 5, // 5-20%
      pbGrade: Math.random() * 8 + 2, // 2-10%
      znMetal: 0,
      pbMetal: 0
    };

    // 计算金属量
    mockJdxyData.znMetal = (mockJdxyData.weight * mockJdxyData.znGrade) / 100;
    mockJdxyData.pbMetal = (mockJdxyData.weight * mockJdxyData.pbGrade) / 100;

    // 生成对比数据
    const mockComparisonData: ComparisonData = {
      fdx_wet_weight: mockFdxData.weight,
      jdxy_wet_weight: mockJdxyData.weight,
      weight_diff: mockFdxData.weight - mockJdxyData.weight,
      fdx_moisture: mockFdxData.moisture,
      jdxy_moisture: mockJdxyData.moisture,
      moisture_diff: mockFdxData.moisture - mockJdxyData.moisture,
      fdx_zn_grade: mockFdxData.znGrade,
      jdxy_zn_grade: mockJdxyData.znGrade,
      zn_grade_diff: mockFdxData.znGrade - mockJdxyData.znGrade,
      fdx_pb_grade: mockFdxData.pbGrade,
      jdxy_pb_grade: mockJdxyData.pbGrade,
      pb_grade_diff: mockFdxData.pbGrade - mockJdxyData.pbGrade,
      fdx_zn_metal: mockFdxData.znMetal,
      jdxy_zn_metal: mockJdxyData.znMetal,
      zn_metal_diff: mockFdxData.znMetal - mockJdxyData.znMetal,
      fdx_pb_metal: mockFdxData.pbMetal,
      jdxy_pb_metal: mockJdxyData.pbMetal,
      pb_metal_diff: mockFdxData.pbMetal - mockJdxyData.pbMetal
    };

    // 生成趋势数据（最近7天）
    const mockTrendData: TrendData[] = Array.from({ length: 7 }, (_, index) => {
      const date = subDays(new Date(), 6 - index);
      return {
        date: format(date, 'MM/dd'),
        fullDate: format(date, 'yyyy-MM-dd'),
        weight: Math.random() * 400 + 100,
        moisture: Math.random() * 15 + 10,
        znGrade: tab === 'fdx' ? Math.random() * 40 + 20 : Math.random() * 15 + 5,
        pbGrade: tab === 'fdx' ? Math.random() * 20 + 10 : Math.random() * 8 + 2
      };
    });

    // 生成模拟出货单位
    const mockUnits = ['华友钴业', '中金岭南', '株冶集团', '驰宏锌锗', '西部矿业'];

    setFdxData(mockFdxData);
    setJdxyData(mockJdxyData);
    setComparisonData(mockComparisonData);
    setTrendData(mockTrendData);
    setOutgoingUnits(mockUnits);
    setLatestRecordDate(new Date());
  };

  useEffect(() => {
    generateMockData();
    setLastUpdatedAt(new Date());
  }, [date, tab, selectedOutgoingUnit]);

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
        <div className="bg-background p-3 border rounded-lg shadow-lg text-sm">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="flex items-center">
              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.value !== null ? entry.value.toFixed(2) : '无数据'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 渲染数据卡片
  const renderDataCard = (
    title: string,
    value: number,
    unit: string,
    icon: React.ReactNode,
    color: string,
    maxValue: number
  ) => {
    const progressValue = (value / maxValue) * 100;

    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <span className={`mr-2 ${color}`}>{icon}</span>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl font-bold">{value.toFixed(2)}</div>
            <div className="w-16 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={prepareDonutData(value, maxValue)}
                    cx="50%"
                    cy="50%"
                    innerRadius={12}
                    outerRadius={20}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    <Cell fill={color.includes('blue') ? COLORS.weight :
                              color.includes('cyan') ? COLORS.moisture :
                              color.includes('green') ? COLORS.znGrade : COLORS.pbGrade} />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <Progress value={progressValue} className="h-2" />
          <div className="flex justify-between items-center mt-2">
            <Badge variant="secondary" className="text-xs">{unit}</Badge>
            <span className="text-xs text-muted-foreground">最大: {maxValue}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  // 渲染对比数据卡片
  const renderComparisonCard = (
    title: string,
    fdxValue: number,
    jdxyValue: number,
    diffValue: number,
    unit: string,
    icon: React.ReactNode
  ) => {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <span className="mr-2 text-primary">{icon}</span>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">富鼎翔</span>
            <Badge variant="outline">{fdxValue.toFixed(2)} {unit}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">金鼎锌业</span>
            <Badge variant="outline">{jdxyValue.toFixed(2)} {unit}</Badge>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm font-medium">差值</span>
            <Badge
              variant={diffValue >= 0 ? "default" : "destructive"}
              className="font-mono"
            >
              {diffValue >= 0 ? '+' : ''}{diffValue.toFixed(2)} {unit}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  // 渲染数据卡片组
  const renderCards = () => {
    if (tab === 'diff' && comparisonData) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderComparisonCard(
            "出厂吨位对比",
            comparisonData.fdx_wet_weight,
            comparisonData.jdxy_wet_weight,
            comparisonData.weight_diff,
            "吨",
            <BarChart3 className="h-4 w-4" />
          )}
          {renderComparisonCard(
            "水分含量对比",
            comparisonData.fdx_moisture,
            comparisonData.jdxy_moisture,
            comparisonData.moisture_diff,
            "%",
            <PieChart className="h-4 w-4" />
          )}
          {renderComparisonCard(
            "锌品位对比",
            comparisonData.fdx_zn_grade,
            comparisonData.jdxy_zn_grade,
            comparisonData.zn_grade_diff,
            "%",
            <TrendingUp className="h-4 w-4" />
          )}
          {renderComparisonCard(
            "铅品位对比",
            comparisonData.fdx_pb_grade,
            comparisonData.jdxy_pb_grade,
            comparisonData.pb_grade_diff,
            "%",
            <TrendingUp className="h-4 w-4" />
          )}
          {renderComparisonCard(
            "锌金属量对比",
            comparisonData.fdx_zn_metal,
            comparisonData.jdxy_zn_metal,
            comparisonData.zn_metal_diff,
            "吨",
            <BarChart3 className="h-4 w-4" />
          )}
          {renderComparisonCard(
            "铅金属量对比",
            comparisonData.fdx_pb_metal,
            comparisonData.jdxy_pb_metal,
            comparisonData.pb_metal_diff,
            "吨",
            <BarChart3 className="h-4 w-4" />
          )}
        </div>
      );
    }

    // 根据当前标签页选择数据
    const currentData = tab === 'fdx' ? fdxData : jdxyData;
    const maxValues = tab === 'fdx' ? { weight: 500, moisture: 30, znGrade: 60, pbGrade: 30 } : { weight: 400, moisture: 25, znGrade: 20, pbGrade: 10 };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderDataCard(
          "出厂吨位",
          currentData.weight,
          "吨",
          <BarChart3 className="h-4 w-4" />,
          "text-blue-500",
          maxValues.weight
        )}
        {renderDataCard(
          "水分含量",
          currentData.moisture,
          "%",
          <PieChart className="h-4 w-4" />,
          "text-cyan-500",
          maxValues.moisture
        )}
        {renderDataCard(
          "锌品位",
          currentData.znGrade,
          "%",
          <TrendingUp className="h-4 w-4" />,
          "text-green-500",
          maxValues.znGrade
        )}
        {renderDataCard(
          "铅品位",
          currentData.pbGrade,
          "%",
          <TrendingUp className="h-4 w-4" />,
          "text-yellow-500",
          maxValues.pbGrade
        )}
      </div>
    );
  };

  // 渲染趋势图
  const renderTrendCharts = () => {
    if (tab === 'diff') return null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 出厂吨位趋势图 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">出厂吨位趋势</CardTitle>
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
                    dataKey="weight"
                    stroke={COLORS.weight}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="出厂吨位"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 水分含量趋势图 */}
        <Card>
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
        </Card>

        {/* 锌品位趋势图 */}
        <Card>
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
        </Card>

        {/* 铅品位趋势图 */}
        <Card>
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
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <div className="flex justify-between items-center p-6 border-b">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回</span>
          </Button>
          <h1 className="text-xl md:text-2xl font-semibold">出厂数据详情</h1>
        </div>
        <ThemeToggle />
      </div>

      <div className="p-6 space-y-6">
        {/* 状态指示器 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <CircleDot size={14} className="text-green-500 animate-pulse" />
            <span>数据实时同步中</span>
          </div>
          <div className="text-xs text-muted-foreground">
            最后更新: {format(lastUpdatedAt, 'HH:mm:ss')}
          </div>
        </div>

        {/* 日期选择卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>选择日期</span>
              {latestRecordDate && (
                <Badge variant="outline" className="text-xs">
                  最新: {format(latestRecordDate, 'MM/dd')}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
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
                    <X className="h-4 w-4 mr-1" />
                    取消
                  </Button>
                  <Button size="sm" onClick={handleDateConfirm}>
                    <Check className="h-4 w-4 mr-1" />
                    确定
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        {/* 标签页切换 */}
        <Tabs value={tab} onValueChange={(value: 'fdx' | 'jdxy' | 'diff') => setTab(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fdx">富鼎翔数据</TabsTrigger>
            <TabsTrigger value="jdxy">金鼎锌业数据</TabsTrigger>
            <TabsTrigger value="diff">数据对比</TabsTrigger>
          </TabsList>

          <TabsContent value="fdx" className="space-y-6">
            {/* 出货单位选择 */}
            {outgoingUnits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>出货单位</span>
                    <Badge variant="outline" className="text-xs">
                      共 {outgoingUnits.length} 个单位
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedOutgoingUnit} onValueChange={setSelectedOutgoingUnit}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择出货单位" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="全部单位">全部单位</SelectItem>
                      {outgoingUnits.map((unit, index) => (
                        <SelectItem key={index} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="mt-2 text-xs text-muted-foreground">
                    当前显示: {selectedOutgoingUnit}
                  </div>
                </CardContent>
              </Card>
            )}

            {renderCards()}
            {renderTrendCharts()}
          </TabsContent>

          <TabsContent value="jdxy" className="space-y-6">
            {renderCards()}
            {renderTrendCharts()}
          </TabsContent>

          <TabsContent value="diff" className="space-y-6">
            {renderCards()}

            {/* 数据对比说明 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">数据对比说明</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• 正值表示富鼎翔数据高于金鼎锌业数据</p>
                  <p>• 负值表示富鼎翔数据低于金鼎锌业数据</p>
                  <p>• 数据来源于当日实际生产记录</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 加载状态 */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">数据加载中...</span>
          </div>
        )}
      </div>
    </div>
  );
}