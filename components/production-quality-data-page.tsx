"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Loader2,
  Eye,
  FileText,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// 定义数据类型
interface QualityMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  timestamp: string;
}

interface QualityRecord {
  id: string;
  date: string;
  shift: '早班' | '夜班';
  product_type: string;
  zinc_grade: number;
  lead_grade: number;
  moisture: number;
  recovery_rate: number;
  quality_score: number;
  inspector: string;
  remarks?: string;
}

interface TrendData {
  date: string;
  zinc_grade: number;
  lead_grade: number;
  moisture: number;
  recovery_rate: number;
}

export function ProductionQualityDataPage() {
  const router = useRouter();
  
  // 状态管理
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // 数据状态
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([]);
  const [qualityRecords, setQualityRecords] = useState<QualityRecord[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  // 生成模拟质量指标数据
  const generateMockQualityMetrics = (): QualityMetric[] => {
    const metrics = [
      {
        id: 'zinc-grade',
        name: '锌品位',
        value: 58.5,
        target: 60.0,
        unit: '%',
        status: 'warning' as const,
        trend: 'down' as const,
        timestamp: new Date().toISOString()
      },
      {
        id: 'lead-grade',
        name: '铅品位',
        value: 2.8,
        target: 3.0,
        unit: '%',
        status: 'normal' as const,
        trend: 'up' as const,
        timestamp: new Date().toISOString()
      },
      {
        id: 'moisture',
        name: '水分含量',
        value: 8.2,
        target: 8.0,
        unit: '%',
        status: 'warning' as const,
        trend: 'stable' as const,
        timestamp: new Date().toISOString()
      },
      {
        id: 'recovery-rate',
        name: '回收率',
        value: 92.5,
        target: 90.0,
        unit: '%',
        status: 'normal' as const,
        trend: 'up' as const,
        timestamp: new Date().toISOString()
      }
    ];
    
    return metrics;
  };

  // 生成模拟质量记录数据
  const generateMockQualityRecords = (): QualityRecord[] => {
    const records: QualityRecord[] = [];
    const inspectors = ['张三', '李四', '王五', '赵六'];
    const products = ['精矿A', '精矿B', '精矿C'];
    const shifts: ('早班' | '夜班')[] = ['早班', '夜班'];
    
    for (let i = 0; i < 10; i++) {
      const zinc = 55 + Math.random() * 10;
      const lead = 2 + Math.random() * 2;
      const moisture = 7 + Math.random() * 3;
      const recovery = 85 + Math.random() * 15;
      
      records.push({
        id: `record-${i + 1}`,
        date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        shift: shifts[Math.floor(Math.random() * shifts.length)],
        product_type: products[Math.floor(Math.random() * products.length)],
        zinc_grade: zinc,
        lead_grade: lead,
        moisture: moisture,
        recovery_rate: recovery,
        quality_score: (zinc * 0.4 + lead * 0.2 + (100 - moisture) * 0.2 + recovery * 0.2),
        inspector: inspectors[Math.floor(Math.random() * inspectors.length)],
        remarks: Math.random() > 0.7 ? '质量良好' : undefined
      });
    }
    
    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // 生成模拟趋势数据
  const generateMockTrendData = (): TrendData[] => {
    const data: TrendData[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: format(date, 'MM-dd'),
        zinc_grade: 55 + Math.random() * 10,
        lead_grade: 2 + Math.random() * 2,
        moisture: 7 + Math.random() * 3,
        recovery_rate: 85 + Math.random() * 15
      });
    }
    
    return data;
  };

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setQualityMetrics(generateMockQualityMetrics());
      setQualityRecords(generateMockQualityRecords());
      setTrendData(generateMockTrendData());
    } catch (error) {
      console.error('加载数据失败:', error);
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
    loadData();
  }, [activeTab, selectedDate, selectedShift, selectedProduct]);

  // 导出数据
  const handleExportData = () => {
    toast({
      title: "导出成功",
      description: "质量数据已导出到Excel文件",
    });
  };

  const handleBack = () => {
    router.back();
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // 获取趋势图标
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
          <h1 className="text-xl md:text-2xl font-semibold">生产质量数据</h1>
        </div>
        <ThemeToggle />
      </div>

      <div className="p-6 space-y-6">
        {/* 欢迎面板 */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-medium mb-2">生产质量数据监控</h2>
              <p className="text-sm text-muted-foreground">
                实时监控生产质量指标和数据分析
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 选项卡 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>质量概览</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>趋势分析</span>
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>质量记录</span>
            </TabsTrigger>
          </TabsList>

          {/* 质量概览选项卡 */}
          <TabsContent value="overview" className="space-y-6">
            {/* 质量指标卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-8 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                qualityMetrics.map((metric) => (
                  <Card key={metric.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          {metric.name}
                        </p>
                        {getTrendIcon(metric.trend)}
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <p className={cn("text-2xl font-bold", getStatusColor(metric.status))}>
                          {metric.value.toFixed(1)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {metric.unit}
                        </p>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>目标: {metric.target}{metric.unit}</span>
                          <span>{((metric.value / metric.target) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress
                          value={(metric.value / metric.target) * 100}
                          className="h-2"
                        />
                      </div>
                      <Badge
                        variant={metric.status === 'normal' ? 'default' : 'destructive'}
                        className="mt-2"
                      >
                        {metric.status === 'normal' ? '正常' :
                         metric.status === 'warning' ? '警告' : '异常'}
                      </Badge>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* 质量分布图 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  质量指标分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={qualityMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="实际值" />
                      <Bar dataKey="target" fill="#82ca9d" name="目标值" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 趋势分析选项卡 */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  质量指标趋势
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="zinc_grade"
                        stroke="#8884d8"
                        name="锌品位(%)"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="lead_grade"
                        stroke="#82ca9d"
                        name="铅品位(%)"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="moisture"
                        stroke="#ffc658"
                        name="水分含量(%)"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="recovery_rate"
                        stroke="#ff7300"
                        name="回收率(%)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* 质量分析摘要 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    达标率统计
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">锌品位达标率</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={85} className="w-20 h-2" />
                        <span className="text-sm font-medium">85%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">铅品位达标率</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={92} className="w-20 h-2" />
                        <span className="text-sm font-medium">92%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">水分控制达标率</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={78} className="w-20 h-2" />
                        <span className="text-sm font-medium">78%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">回收率达标率</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={95} className="w-20 h-2" />
                        <span className="text-sm font-medium">95%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    质量预警
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium">锌品位偏低</p>
                        <p className="text-xs text-muted-foreground">当前值低于目标2%</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium">水分含量超标</p>
                        <p className="text-xs text-muted-foreground">建议调整工艺参数</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">回收率良好</p>
                        <p className="text-xs text-muted-foreground">超出目标值2.5%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 质量记录选项卡 */}
          <TabsContent value="records" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  质量检验记录
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadData}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))
                  ) : qualityRecords.length > 0 ? (
                    qualityRecords.map((record) => (
                      <div key={record.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{record.product_type}</h4>
                              <Badge variant="outline">{record.shift}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(record.date), 'yyyy-MM-dd HH:mm')} | 检验员: {record.inspector}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              质量评分: {record.quality_score.toFixed(1)}
                            </p>
                            <Badge
                              variant={record.quality_score >= 80 ? 'default' : 'destructive'}
                            >
                              {record.quality_score >= 80 ? '合格' : '不合格'}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">锌品位</p>
                            <p className="font-medium">{record.zinc_grade.toFixed(2)}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">铅品位</p>
                            <p className="font-medium">{record.lead_grade.toFixed(2)}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">水分含量</p>
                            <p className="font-medium">{record.moisture.toFixed(2)}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">回收率</p>
                            <p className="font-medium">{record.recovery_rate.toFixed(2)}%</p>
                          </div>
                        </div>

                        {record.remarks && (
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm">
                              <span className="font-medium">备注: </span>
                              {record.remarks}
                            </p>
                          </div>
                        )}

                        <div className="flex justify-end">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            查看详情
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">暂无质量检验记录</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 底部操作栏 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => router.push('/quality-settings')}>
                <Settings className="h-4 w-4 mr-2" />
                质量设置
              </Button>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                导出报告
              </Button>
              <Button onClick={() => router.push('/quality-analysis')}>
                <BarChart3 className="h-4 w-4 mr-2" />
                深度分析
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

        {/* 筛选控件 */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 日期选择 */}
              <div className="space-y-2">
                <Label>选择日期</Label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "yyyy-MM-dd") : "选择日期"}
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
              </div>

              {/* 班次选择 */}
              <div className="space-y-2">
                <Label>班次</Label>
                <Select value={selectedShift} onValueChange={setSelectedShift}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择班次" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部班次</SelectItem>
                    <SelectItem value="早班">早班</SelectItem>
                    <SelectItem value="夜班">夜班</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 产品类型选择 */}
              <div className="space-y-2">
                <Label>产品类型</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择产品" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部产品</SelectItem>
                    <SelectItem value="精矿A">精矿A</SelectItem>
                    <SelectItem value="精矿B">精矿B</SelectItem>
                    <SelectItem value="精矿C">精矿C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-2">
                <Label>操作</Label>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadData}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportData}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
