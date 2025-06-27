"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, differenceInMinutes, differenceInHours } from 'date-fns';
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  CircleDot,
  Activity,
  Clock,
  UserRound,
  CircleArrowUp,
  CircleArrowDown,
  CalendarIcon,
  Loader2
} from 'lucide-react';
import { 
  UnifiedChart,
  TrendLineChart,
  ComparisonBarChart,
  AreaChart as UnifiedAreaChart,
  PieChart as UnifiedPieChart,
  ComposedChart as UnifiedComposedChart,
  createChartConfig,
  formatChartData,
  calculateTrend
} from "@/components/ui/unified-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PaginatedTable, ColumnConfig } from "@/components/ui/paginated-table";
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
interface MachineRunningRecord {
  id: string;
  name: string;
  operation_action: '开机' | '停机';
  operation_status: '正常运行' | '设备维护';
  record_date_time: string;
  duration?: string;
  remarks?: string;
  created_at: string;
}

interface DateRange {
  from: Date;
  to: Date;
}

interface DurationData {
  name: string;
  value: number;
  hours: string;
  percent: string;
}

// 颜色配置
const COLORS = {
  running: '#10B981',
  maintenance: '#F59E0B',
  background: '#e0e5ec',
  text: '#403E43',
  grid: '#ccd3dc',
  axes: '#a0aec0'
};

export function MachineRunningDetailsPage() {
  // 性能监控
  const { renderCount } = useRenderPerformance('machine-running-details-page');
  const { addTimer, addListener } = useMemoryLeak('machine-running-details-page');
  const { metrics } = usePerformanceOptimization();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [machineRecords, setMachineRecords] = useState<MachineRunningRecord[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), 3, 26), // 4月26日
    to: new Date()
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<DateRange>(dateRange);

  // 生成模拟数据
  const generateMockData = () => {
    const mockRecords: MachineRunningRecord[] = [];
    const now = new Date();
    
    // 生成最近7天的模拟记录
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // 每天生成2-4条记录
      const recordCount = Math.floor(Math.random() * 3) + 2;
      
      for (let j = 0; j < recordCount; j++) {
        const recordTime = new Date(date);
        recordTime.setHours(8 + j * 4 + Math.floor(Math.random() * 2));
        recordTime.setMinutes(Math.floor(Math.random() * 60));
        
        const isStartOperation = j % 2 === 0;
        const operators = ['张师傅', '李师傅', '王师傅', '赵师傅'];
        
        mockRecords.push({
          id: `record-${i}-${j}`,
          name: operators[Math.floor(Math.random() * operators.length)],
          operation_action: isStartOperation ? '开机' : '停机',
          operation_status: isStartOperation ? '正常运行' : '设备维护',
          record_date_time: recordTime.toISOString(),
          remarks: isStartOperation ? '设备正常启动' : '例行维护停机',
          created_at: recordTime.toISOString()
        });
      }
    }
    
    // 按时间倒序排列
    return mockRecords.sort((a, b) => 
      new Date(b.record_date_time).getTime() - new Date(a.record_date_time).getTime()
    );
  };

  // 计算持续时间
  const calculateDurations = (records: MachineRunningRecord[]): MachineRunningRecord[] => {
    if (!records || records.length <= 1) return records;
    
    const sortedRecords = [...records].sort((a, b) => 
      new Date(b.record_date_time).getTime() - new Date(a.record_date_time).getTime()
    );
    
    return sortedRecords.map((record, index) => {
      if (index === sortedRecords.length - 1) {
        const startDate = new Date(record.record_date_time);
        const endDate = new Date();
        const durationMinutes = differenceInMinutes(endDate, startDate);
        
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        return {
          ...record,
          duration: `${hours}时${minutes}分钟`
        };
      }
      
      const startDate = new Date(record.record_date_time);
      const endDate = new Date(sortedRecords[index + 1].record_date_time);
      const durationMinutes = differenceInMinutes(startDate, endDate);
      
      const hours = Math.floor(Math.abs(durationMinutes) / 60);
      const minutes = Math.abs(durationMinutes) % 60;
      return {
        ...record,
        duration: `${hours}时${minutes}分钟`
      };
    });
  };

  // 获取设备运行记录
  const fetchMachineRecords = async () => {
    setLoading(true);
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = generateMockData();
      const recordsWithDuration = calculateDurations(mockData);
      
      // 格式化日期和时间
      const formattedRecords = recordsWithDuration.map(record => ({
        ...record,
        record_date_time: format(new Date(record.record_date_time), 'yyyy-MM-dd HH:mm:ss')
      }));
      
      setMachineRecords(formattedRecords);
      toast({
        title: "数据加载成功",
        description: `已加载 ${formattedRecords.length} 条设备运行记录`,
      });
    } catch (error) {
      console.error('获取设备运行记录失败:', error);
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
    fetchMachineRecords();
  }, [dateRange]);

  // 时长分析计算
  const getDurationAnalysisData = (): DurationData[] => {
    let runningTime = 0;
    let maintenanceTime = 0;
    
    if (!machineRecords || machineRecords.length === 0) {
      return [
        { name: '运行时间', value: 0, hours: '0.0', percent: '0%' },
        { name: '维护时间', value: 0, hours: '0.0', percent: '0%' }
      ];
    }
    
    const sortedRecords = [...machineRecords].sort((a, b) => 
      new Date(a.record_date_time).getTime() - new Date(b.record_date_time).getTime()
    );
    
    let currentState: '运行' | '维护' = '维护';
    let lastValidTime = new Date(sortedRecords[0].record_date_time);
    
    if (sortedRecords[0].operation_action === '开机') {
      currentState = '维护';
    } else {
      currentState = '运行';
    }
    
    for (let i = 0; i < sortedRecords.length; i++) {
      const record = sortedRecords[i];
      const recordTime = new Date(record.record_date_time);
      
      const hoursDiff = differenceInHours(recordTime, lastValidTime) + 
                       (differenceInMinutes(recordTime, lastValidTime) % 60) / 60;
      
      if (currentState === '运行') {
        runningTime += hoursDiff;
      } else {
        maintenanceTime += hoursDiff;
      }
      
      let shouldChangeState = false;
      
      if (record.operation_action === '开机' && currentState === '维护') {
        currentState = '运行';
        shouldChangeState = true;
      } else if (record.operation_action === '停机' && currentState === '运行') {
        currentState = '维护';
        shouldChangeState = true;
      }
      
      if (shouldChangeState || i === 0) {
        lastValidTime = recordTime;
      }
    }
    
    const now = new Date();
    const finalHoursDiff = differenceInHours(now, lastValidTime) + 
                          (differenceInMinutes(now, lastValidTime) % 60) / 60;
    
    if (currentState === '运行') {
      runningTime += finalHoursDiff;
    } else {
      maintenanceTime += finalHoursDiff;
    }
    
    runningTime = Math.max(0, isNaN(runningTime) ? 0 : runningTime);
    maintenanceTime = Math.max(0, isNaN(maintenanceTime) ? 0 : maintenanceTime);
    
    const totalTime = runningTime + maintenanceTime;
    const runningPercent = totalTime > 0 ? Math.round((runningTime / totalTime) * 100) : 0;
    const maintenancePercent = totalTime > 0 ? Math.round((maintenanceTime / totalTime) * 100) : 0;
    
    return [
      { 
        name: '运行时间', 
        value: Math.round(runningTime * 100) / 100, 
        hours: runningTime.toFixed(1),
        percent: `${runningPercent}%`
      },
      { 
        name: '维护时间', 
        value: Math.round(maintenanceTime * 100) / 100, 
        hours: maintenanceTime.toFixed(1),
        percent: `${maintenancePercent}%`
      }
    ];
  };

  const handleBack = () => {
    router.back();
  };

  const handleDateRangeConfirm = () => {
    setDateRange(tempDateRange);
    setIsDatePickerOpen(false);
  };

  const handleDateRangeCancel = () => {
    setTempDateRange(dateRange);
    setIsDatePickerOpen(false);
  };

  // 自定义工具提示
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
    <PerformanceWrapper
      componentName="machine-running-details-page"
      enableMonitoring={process.env.NODE_ENV === 'development'}
      enableMemoryTracking={true}
    >
      <div className="bg-background p-3 border rounded-lg shadow-lg text-sm">
          <p className="font-semibold">{data.name}</p>
          <p>{data.hours} 小时 ({data.percent})</p>
        </AnimatedPage>
    </PerformanceWrapper>
  );
    }
    return null;
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
          <h1 className="text-xl md:text-2xl font-semibold">设备运行详情</h1>
        </div>
        <ThemeToggle />
      </div>

      <AnimatedListItem index={0} className="p-6 space-y-6">
        {/* 状态指示器 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <CircleDot size={14} className="text-green-500 animate-pulse" />
            <span>设备状态实时监控中</span>
          </div>
          <div className="text-xs text-muted-foreground">
            最后更新: {format(new Date(), 'HH:mm:ss')}
          </div>
        </div>

        {/* 当前设备状态卡片 */}
        <AnimatedCard delay={0}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              当前设备状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatedListItem index={0} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "h-3 w-3 rounded-full",
                  machineRecords[0]?.operation_status === '正常运行' ? "bg-green-500" : "bg-amber-500"
                )}></div>
                <div>
                  <p className="text-sm text-muted-foreground">设备状态</p>
                  <p className="font-medium">{machineRecords[0]?.operation_status || '数据加载中...'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {machineRecords[0]?.operation_action === '开机' ?
                  <CircleArrowUp className="h-5 w-5 text-green-500" /> :
                  <CircleArrowDown className="h-5 w-5 text-amber-500" />
                }
                <div>
                  <p className="text-sm text-muted-foreground">最近操作</p>
                  <p className="font-medium">{machineRecords[0]?.operation_action || '无数据'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">操作时间</p>
                  <p className="font-medium text-xs">
                    {machineRecords[0]?.record_date_time ?
                      format(new Date(machineRecords[0].record_date_time), 'MM-dd HH:mm') :
                      '无数据'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <UserRound className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">操作人</p>
                  <p className="font-medium">{machineRecords[0]?.name || '无数据'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* 日期范围选择 */}
        <AnimatedCard delay={0.1}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">查询时间范围</CardTitle>
          </CardHeader>
          <CardContent>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <AnimatedButton
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateRange.from, 'yyyy年MM月dd日')} - {format(dateRange.to, 'yyyy年MM月dd日')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3">
                  <AnimatedListItem index={1} className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">开始日期</p>
                      <Calendar
                        mode="single"
                        selected={tempDateRange.from}
                        onSelect={(date) => date && setTempDateRange(prev => ({ ...prev, from: date }))}
                        initialFocus
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">结束日期</p>
                      <Calendar
                        mode="single"
                        selected={tempDateRange.to}
                        onSelect={(date) => date && setTempDateRange(prev => ({ ...prev, to: date }))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                    <Button variant="outline" size="sm" onClick={handleDateRangeCancel}>
                      取消
                    </Button>
                    <Button size="sm" onClick={handleDateRangeConfirm}>
                      确定
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </CardContent>
        </AnimatedCard>

        {/* 运行统计卡片 */}
        <AnimatedCard delay={0.2}>
          <CardHeader>
            <CardTitle className="text-lg">运行统计</CardTitle>
            <CardDescription>
              查看设备的开关机记录和运行状态变化 ({format(dateRange.from, 'yyyy-MM-dd')} 至 {format(dateRange.to, 'yyyy-MM-dd')})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatedListItem index={2} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{machineRecords.length}</p>
                <p className="text-sm text-muted-foreground">总记录数</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {machineRecords.filter(r => r.operation_action === '开机').length}
                </p>
                <p className="text-sm text-muted-foreground">开机次数</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {machineRecords.filter(r => r.operation_action === '停机').length}
                </p>
                <p className="text-sm text-muted-foreground">停机次数</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {machineRecords.filter(r => r.operation_status === '正常运行').length}
                </p>
                <p className="text-sm text-muted-foreground">正常运行状态</p>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* 开停机时长分析 */}
        <AnimatedCard delay={0.30000000000000004}>
          <CardHeader>
            <CardTitle>开停机时长分析</CardTitle>
            <CardDescription>
              基于开停机动作计算的运行时间与维护时间占比分析（已处理连续相同动作）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatedListItem index={3} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 饼图 */}
              <div className="h-[300px] flex items-center justify-center">
                
                  <UnifiedPieChart>
                    <Pie
                      data={getDurationAnalysisData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${percent}`}
                      labelLine={false}
                    >
                      {getDurationAnalysisData().map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? COLORS.running : COLORS.maintenance}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </UnifiedPieChart>
                
              </div>

              {/* 统计数据 */}
              <AnimatedListItem index={1} className="space-y-4">
                <h3 className="text-lg font-medium">时长统计</h3>
                <AnimatedListItem index={2} className="space-y-4">
                  {getDurationAnalysisData().map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: index === 0 ? COLORS.running : COLORS.maintenance }}
                          ></div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <Badge variant="outline" className="font-mono">
                          {item.hours} 小时 ({item.percent})
                        </Badge>
                      </div>
                      <Progress
                        value={parseFloat(item.percent.replace('%', ''))}
                        className="h-2"
                        style={{
                          backgroundColor: '#e5e7eb'
                        }}
                      />
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-lg">总计</span>
                      <Badge variant="default" className="font-mono text-base">
                        {getDurationAnalysisData().reduce((total, item) => total + parseFloat(item.hours), 0).toFixed(1)} 小时
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* 设备运行详细记录 */}
        <AnimatedCard delay={0.4}>
          <CardHeader>
            <CardTitle>设备运行详细记录</CardTitle>
            <CardDescription>
              展示所有设备开关机和状态变化记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">数据加载中...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <PaginatedTable
          data={record || []}
          columns={columns || []}
          title="设备运行详情"
          description="设备运行状态详细监控"
          searchable={true}
          sortable={true}
          pagination={{
            page: 1,
            pageSize: 20,
            total: (record || []).length,
            showSizeChanger: true,
            showTotal: true,
            pageSizeOptions: [10, 20, 50, 100]
          }}
          showActions={true}
          emptyText="暂无数据"
        />

                {machineRecords.length === 0 && !loading && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>暂无设备运行记录</p>
                    <p className="text-sm">请调整查询时间范围或稍后重试</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </AnimatedCard>
      </div>
    </div>
  );
}
