"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Settings,
  Power,
  PowerOff,
  Scale,
  Clock,
  FileEdit,
  CalendarCheck,
  Factory,
  AreaChart,
  FileText,
  Bell,
  ShoppingCart,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

// 定义数据类型
interface MachineOperationRecord {
  id: string;
  name: string;
  operation_action: '开机' | '停机';
  operation_status: '正常运行' | '设备维护';
  record_date_time: string;
  remarks?: string;
  duration?: string;
}

interface OreTonnageRecord {
  id: string;
  name: string;
  reading_start: number;
  reading_end: number;
  tonnage_result: number;
  record_date: string;
  shift: '早班' | '夜班';
}

export function ProductionControlPage() {
  const router = useRouter();
  
  // 通用状态
  const [activeTab, setActiveTab] = useState('machine-operation');
  const [loading, setLoading] = useState(false);
  
  // 设备运行记录状态
  const [recordDateTime, setRecordDateTime] = useState<Date>(new Date());
  const [operationAction, setOperationAction] = useState<'开机' | '停机'>('开机');
  const [operationStatus, setOperationStatus] = useState<'正常运行' | '设备维护'>('正常运行');
  const [operationRemarks, setOperationRemarks] = useState('');
  const [isSubmittingOperation, setIsSubmittingOperation] = useState(false);
  const [machineOperationRecords, setMachineOperationRecords] = useState<MachineOperationRecord[]>([]);
  const [isDateTimePickerOpen, setIsDateTimePickerOpen] = useState(false);
  
  // 进料量记录状态
  const [tonnageDate, setTonnageDate] = useState<Date>(new Date());
  const [selectedShift, setSelectedShift] = useState<'早班' | '夜班'>('早班');
  const [readingStart, setReadingStart] = useState<string>('');
  const [readingEnd, setReadingEnd] = useState<string>('');
  const [tonnageResult, setTonnageResult] = useState<string>('');
  const [isSubmittingTonnage, setIsSubmittingTonnage] = useState(false);
  const [oreTonnageRecords, setOreTonnageRecords] = useState<OreTonnageRecord[]>([]);
  const [isTonnageDatePickerOpen, setIsTonnageDatePickerOpen] = useState(false);

  // 自动计算吨位结果
  useEffect(() => {
    if (readingStart && readingEnd) {
      const start = parseFloat(readingStart);
      const end = parseFloat(readingEnd);
      if (!isNaN(start) && !isNaN(end) && end >= start) {
        setTonnageResult((end - start).toFixed(2));
      } else {
        setTonnageResult('');
      }
    } else {
      setTonnageResult('');
    }
  }, [readingStart, readingEnd]);

  // 根据所选时间自动判断班次
  useEffect(() => {
    if (tonnageDate) {
      const hour = tonnageDate.getHours();
      if (hour >= 8 && hour < 20) {
        setSelectedShift('早班');
      } else {
        setSelectedShift('夜班');
      }
    }
  }, [tonnageDate]);

  // 状态随操作动作变化
  useEffect(() => {
    setOperationStatus(operationAction === '开机' ? '正常运行' : '设备维护');
  }, [operationAction]);

  // 生成模拟设备运行记录
  const generateMockMachineRecords = (): MachineOperationRecord[] => {
    const records: MachineOperationRecord[] = [];
    const names = ['张三', '李四', '王五', '赵六'];
    const actions: ('开机' | '停机')[] = ['开机', '停机'];
    
    for (let i = 0; i < 5; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      records.push({
        id: `machine-${i + 1}`,
        name: names[Math.floor(Math.random() * names.length)],
        operation_action: action,
        operation_status: action === '开机' ? '正常运行' : '设备维护',
        record_date_time: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        remarks: Math.random() > 0.5 ? '设备运行正常' : '',
        duration: Math.random() > 0.5 ? `${Math.floor(Math.random() * 8) + 1}小时` : undefined
      });
    }
    
    return records.sort((a, b) => new Date(b.record_date_time).getTime() - new Date(a.record_date_time).getTime());
  };

  // 生成模拟进料量记录
  const generateMockTonnageRecords = (): OreTonnageRecord[] => {
    const records: OreTonnageRecord[] = [];
    const names = ['张三', '李四', '王五', '赵六'];
    const shifts: ('早班' | '夜班')[] = ['早班', '夜班'];
    
    for (let i = 0; i < 5; i++) {
      const start = Math.random() * 100 + 50;
      const end = start + Math.random() * 50 + 10;
      records.push({
        id: `tonnage-${i + 1}`,
        name: names[Math.floor(Math.random() * names.length)],
        reading_start: start,
        reading_end: end,
        tonnage_result: end - start,
        record_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        shift: shifts[Math.floor(Math.random() * shifts.length)]
      });
    }
    
    return records.sort((a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime());
  };

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (activeTab === 'machine-operation') {
        setMachineOperationRecords(generateMockMachineRecords());
      } else {
        setOreTonnageRecords(generateMockTonnageRecords());
      }
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
  }, [activeTab]);

  // 提交设备运行记录
  const handleSubmitMachineOperation = async () => {
    if (!recordDateTime) {
      toast({
        title: "请选择记录时间",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmittingOperation(true);
    try {
      // 模拟API提交
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newRecord: MachineOperationRecord = {
        id: `machine-${Date.now()}`,
        name: '当前用户',
        operation_action: operationAction,
        operation_status: operationStatus,
        record_date_time: recordDateTime.toISOString(),
        remarks: operationRemarks
      };
      
      setMachineOperationRecords(prev => [newRecord, ...prev.slice(0, 4)]);
      
      toast({
        title: "设备运行记录已提交",
        description: `${operationAction}操作记录成功`,
      });
      
      // 重置表单
      setOperationRemarks('');
    } catch (error) {
      console.error('提交设备运行记录失败:', error);
      toast({
        title: "提交失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingOperation(false);
    }
  };

  // 提交进料量记录
  const handleSubmitOreTonnage = async () => {
    if (!tonnageDate || !readingStart || !readingEnd || !tonnageResult) {
      toast({
        title: "请填写所有必填项",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmittingTonnage(true);
    try {
      // 模拟API提交
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newRecord: OreTonnageRecord = {
        id: `tonnage-${Date.now()}`,
        name: '当前用户',
        reading_start: parseFloat(readingStart),
        reading_end: parseFloat(readingEnd),
        tonnage_result: parseFloat(tonnageResult),
        record_date: tonnageDate.toISOString(),
        shift: selectedShift
      };
      
      setOreTonnageRecords(prev => [newRecord, ...prev.slice(0, 4)]);
      
      toast({
        title: "进料量记录已提交",
        description: `${tonnageResult}吨进料量记录成功`,
      });
      
      // 重置表单
      setReadingStart('');
      setReadingEnd('');
      setTonnageResult('');
    } catch (error) {
      console.error('提交进料量记录失败:', error);
      toast({
        title: "提交失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingTonnage(false);
    }
  };

  const handleBack = () => {
    router.back();
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
          <h1 className="text-xl md:text-2xl font-semibold">生产控制</h1>
        </div>
        <ThemeToggle />
      </div>

      <div className="p-6 space-y-6">
        {/* 欢迎面板 */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-medium mb-2">生产控制工作台</h2>
              <p className="text-sm text-muted-foreground">
                管理设备运行状态和进料量记录
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 选项卡 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="machine-operation" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>设备运行记录</span>
            </TabsTrigger>
            <TabsTrigger value="ore-tonnage" className="flex items-center space-x-2">
              <Scale className="h-4 w-4" />
              <span>进料量记录</span>
            </TabsTrigger>
          </TabsList>

          {/* 设备运行记录选项卡 */}
          <TabsContent value="machine-operation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  设备运行记录
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 时间选择 */}
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    选择时间
                  </Label>
                  <Popover open={isDateTimePickerOpen} onOpenChange={setIsDateTimePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !recordDateTime && "text-muted-foreground"
                        )}
                      >
                        <CalendarCheck className="mr-2 h-4 w-4" />
                        {recordDateTime ? format(recordDateTime, "yyyy-MM-dd HH:mm") : "选择日期时间"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={recordDateTime}
                        onSelect={(date) => {
                          if (date) {
                            const newDateTime = new Date(date);
                            newDateTime.setHours(recordDateTime.getHours());
                            newDateTime.setMinutes(recordDateTime.getMinutes());
                            setRecordDateTime(newDateTime);
                          }
                        }}
                        initialFocus
                      />
                      <div className="p-3 border-t">
                        <div className="flex items-center space-x-2">
                          <Input
                            type="time"
                            value={format(recordDateTime, "HH:mm")}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':');
                              const newDateTime = new Date(recordDateTime);
                              newDateTime.setHours(parseInt(hours));
                              newDateTime.setMinutes(parseInt(minutes));
                              setRecordDateTime(newDateTime);
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => setIsDateTimePickerOpen(false)}
                          >
                            确定
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* 运行操作选择 */}
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Power className="h-4 w-4 mr-2" />
                    运行操作
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={operationAction === '开机' ? 'default' : 'outline'}
                      className={cn(
                        "h-12 flex items-center justify-center space-x-2",
                        operationAction === '开机' && "bg-green-600 hover:bg-green-700"
                      )}
                      onClick={() => setOperationAction('开机')}
                    >
                      <Power className="h-4 w-4" />
                      <span>开机</span>
                    </Button>
                    <Button
                      variant={operationAction === '停机' ? 'default' : 'outline'}
                      className={cn(
                        "h-12 flex items-center justify-center space-x-2",
                        operationAction === '停机' && "bg-red-600 hover:bg-red-700"
                      )}
                      onClick={() => setOperationAction('停机')}
                    >
                      <PowerOff className="h-4 w-4" />
                      <span>停机</span>
                    </Button>
                  </div>
                </div>

                {/* 设备状态显示 */}
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    设备状态
                  </Label>
                  <div className={cn(
                    "p-3 rounded-lg border text-center font-medium",
                    operationStatus === '正常运行'
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  )}>
                    {operationStatus}
                  </div>
                </div>

                {/* 备注输入 */}
                <div className="space-y-2">
                  <Label htmlFor="operation-remarks" className="flex items-center">
                    <FileEdit className="h-4 w-4 mr-2" />
                    备注（选填）
                  </Label>
                  <Textarea
                    id="operation-remarks"
                    value={operationRemarks}
                    onChange={(e) => setOperationRemarks(e.target.value)}
                    placeholder="输入备注信息（选填）"
                    className="min-h-[100px]"
                  />
                </div>

                {/* 提交按钮 */}
                <Button
                  onClick={handleSubmitMachineOperation}
                  disabled={isSubmittingOperation}
                  className="w-full"
                  size="lg"
                >
                  {isSubmittingOperation ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    "提交记录"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 设备运行记录历史 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <AreaChart className="h-5 w-5 mr-2" />
                  最近记录
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
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ))
                  ) : machineOperationRecords.length > 0 ? (
                    machineOperationRecords.map((record) => (
                      <div key={record.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            {record.operation_action === '开机' ? (
                              <Power className="h-5 w-5 text-green-600" />
                            ) : (
                              <PowerOff className="h-5 w-5 text-red-600" />
                            )}
                            <div>
                              <p className="font-medium">
                                {record.name} - {record.operation_action}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(record.record_date_time), 'yyyy-MM-dd HH:mm:ss')}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={record.operation_status === '正常运行' ? 'default' : 'destructive'}
                          >
                            {record.operation_status}
                          </Badge>
                        </div>
                        {record.remarks && (
                          <p className="text-sm bg-muted p-3 rounded-lg">
                            {record.remarks}
                          </p>
                        )}
                        {record.duration && (
                          <p className="text-xs text-muted-foreground">
                            持续时间: {record.duration}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      暂无设备运行记录
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 进料量记录选项卡 */}
          <TabsContent value="ore-tonnage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scale className="h-5 w-5 mr-2" />
                  进料量记录
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 日期选择 */}
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <CalendarCheck className="h-4 w-4 mr-2" />
                    选择日期
                  </Label>
                  <Popover open={isTonnageDatePickerOpen} onOpenChange={setIsTonnageDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !tonnageDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarCheck className="mr-2 h-4 w-4" />
                        {tonnageDate ? format(tonnageDate, "yyyy-MM-dd") : "选择日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={tonnageDate}
                        onSelect={(date) => {
                          if (date) {
                            setTonnageDate(date);
                            setIsTonnageDatePickerOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* 班次选择 */}
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    班次
                  </Label>
                  <RadioGroup
                    value={selectedShift}
                    onValueChange={(value) => setSelectedShift(value as '早班' | '夜班')}
                    className="flex space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="早班" id="shift-day" />
                      <Label htmlFor="shift-day" className="cursor-pointer">早班</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="夜班" id="shift-night" />
                      <Label htmlFor="shift-night" className="cursor-pointer">夜班</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* 起始读数 */}
                <div className="space-y-2">
                  <Label htmlFor="reading-start" className="flex items-center">
                    <Scale className="h-4 w-4 mr-2" />
                    起始读数
                  </Label>
                  <Input
                    id="reading-start"
                    type="number"
                    step="0.01"
                    value={readingStart}
                    onChange={(e) => setReadingStart(e.target.value)}
                    placeholder="输入起始读数"
                  />
                </div>

                {/* 结束读数 */}
                <div className="space-y-2">
                  <Label htmlFor="reading-end" className="flex items-center">
                    <Scale className="h-4 w-4 mr-2" />
                    结束读数
                  </Label>
                  <Input
                    id="reading-end"
                    type="number"
                    step="0.01"
                    value={readingEnd}
                    onChange={(e) => setReadingEnd(e.target.value)}
                    placeholder="输入结束读数"
                  />
                </div>

                {/* 吨位结果 */}
                <div className="space-y-2">
                  <Label htmlFor="tonnage-result" className="flex items-center">
                    <Factory className="h-4 w-4 mr-2" />
                    吨位结果
                  </Label>
                  <Input
                    id="tonnage-result"
                    type="number"
                    step="0.01"
                    value={tonnageResult}
                    onChange={(e) => setTonnageResult(e.target.value)}
                    placeholder="自动计算吨位结果"
                    disabled
                    className="bg-muted"
                  />
                </div>

                {/* 提交按钮 */}
                <Button
                  onClick={handleSubmitOreTonnage}
                  disabled={isSubmittingTonnage}
                  className="w-full"
                  size="lg"
                >
                  {isSubmittingTonnage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    "提交记录"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 进料量记录历史 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <AreaChart className="h-5 w-5 mr-2" />
                  最近记录
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
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ))
                  ) : oreTonnageRecords.length > 0 ? (
                    oreTonnageRecords.map((record) => (
                      <div key={record.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {record.name} - {record.tonnage_result.toFixed(2)} 吨
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(record.record_date), 'yyyy-MM-dd HH:mm:ss')}
                              <Badge variant="outline" className="ml-2">
                                {record.shift}
                              </Badge>
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <p>
                              <span className="text-muted-foreground">起始:</span> {record.reading_start.toFixed(2)}
                            </p>
                            <p>
                              <span className="text-muted-foreground">结束:</span> {record.reading_end.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      暂无进料量记录
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 底部导航 */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 gap-4">
              <Button
                variant="ghost"
                className="flex flex-col items-center space-y-2 h-auto py-4"
                onClick={() => router.push('/situation-report')}
              >
                <FileText className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">情况上报</span>
              </Button>
              <Button
                variant="ghost"
                className="flex flex-col items-center space-y-2 h-auto py-4"
                onClick={() => router.push('/task-notification')}
              >
                <Bell className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">任务通知</span>
              </Button>
              <Button
                variant="ghost"
                className="flex flex-col items-center space-y-2 h-auto py-4"
                onClick={() => router.push('/attendance-record')}
              >
                <CalendarCheck className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">考勤打卡</span>
              </Button>
              <Button
                variant="ghost"
                className="flex flex-col items-center space-y-2 h-auto py-4"
                onClick={() => router.push('/purchase-request')}
              >
                <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">采购申请</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
