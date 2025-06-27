"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";
import { format, subDays } from 'date-fns';
import { DateRange } from "react-day-picker";
import { motion } from 'framer-motion';
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  DownloadCloud, 
  ArrowUp, 
  ArrowDown, 
  Filter, 
  List, 
  Database,
  Layers,
  PackageOpen,
  BarChart,
  X,
  FileDown,
  Check,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { FooterSignature } from "@/components/ui/footer-signature";

import { PaginatedTable, ColumnConfig } from "@/components/ui/paginated-table";
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
interface DataRecord {
  id?: string | number;
  task_id?: string;
  [key: string]: any;
}

// 定义数据分类
type DataCategory = '进厂数据' | '生产数据' | '出厂数据' | '管理数据';

// 允许的表名称类型
type AllowedTableName = 
  | 'incoming_samples'
  | 'ore_tonnage_records'
  | 'shift_samples'
  | 'filter_samples'
  | 'filter_press_records'
  | 'filter_press_cycles'
  | 'ball_mill_work_records'
  | 'machine_running_records'
  | 'outsourcing_shift_reports'
  | 'purchase_requests'
  | 'attendance_records'
  | 'boardroom_records'
  | 'fdx_vs_jdxy_input'
  | 'fdx_vs_jdxy_output'
  | 'jdxy_input_data'
  | 'jdxy_input_detail'
  | 'jdxy_output_data'
  | 'jdxy_boardroom_records'
  | 'outgoing_sample'
  | 'situations'
  | 'tasks';

// 定义排序类型
type SortDirection = 'asc' | 'desc';
type SortField = string;

export function DataTableCenterPage() {
  // 性能监控
  const { renderCount } = useRenderPerformance('data-table-center-page');
  const { addTimer, addListener } = useMemoryLeak('data-table-center-page');
  const { metrics } = usePerformanceOptimization();
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date()
  });
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<DataCategory>('进厂数据');
  const [activeTable, setActiveTable] = useState<AllowedTableName>('incoming_samples');
  const [sortField, setSortField] = useState<SortField>('record_date_time');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedRecord, setSelectedRecord] = useState<DataRecord | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false); 
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  
  // 数据分类配置
  const dataCategories: Record<DataCategory, {tables: {id: AllowedTableName, name: string}[], icon: React.ReactNode}> = {
    '进厂数据': {
      tables: [
        { id: 'incoming_samples', name: '进厂样品' },
        { id: 'jdxy_input_data', name: '金鼎进厂数据' },
        { id: 'jdxy_input_detail', name: '金鼎进厂明细' },
        { id: 'boardroom_records', name: '进出记录' },
        { id: 'fdx_vs_jdxy_input', name: '进厂数据对比' }
      ],
      icon: <Database className="h-5 w-5" />
    },
    '生产数据': {
      tables: [
        { id: 'ore_tonnage_records', name: '生产控制' },
        { id: 'shift_samples', name: '班样数据' },
        { id: 'filter_samples', name: '过滤样品' },
        { id: 'filter_press_records', name: '压滤记录' },
        { id: 'filter_press_cycles', name: '压滤周期' },
        { id: 'ball_mill_work_records', name: '球磨记录' },
        { id: 'machine_running_records', name: '设备运行记录' },
        { id: 'outsourcing_shift_reports', name: '代加工报表' }
      ],
      icon: <Layers className="h-5 w-5" />
    },
    '出厂数据': {
      tables: [
        { id: 'outgoing_sample', name: '出厂样品' },
        { id: 'jdxy_output_data', name: '金鼎出厂数据' },
        { id: 'fdx_vs_jdxy_output', name: '出厂数据对比' }
      ],
      icon: <PackageOpen className="h-5 w-5" />
    },
    '管理数据': {
      tables: [
        { id: 'purchase_requests', name: '采购申请' },
        { id: 'attendance_records', name: '考勤统计' },
        { id: 'situations', name: '情况记录' },
        { id: 'tasks', name: '任务记录' }
      ],
      icon: <BarChart className="h-5 w-5" />
    }
  };
  
  // 表格列配置
  const tableColumns: Record<string, {field: string, header: string, sortable?: boolean}[]> = {
    'incoming_samples': [
      { field: 'record_date_time', header: '记录时间', sortable: true },
      { field: 'name', header: '记录人' },
      { field: 'supplier', header: '供应商' },
      { field: 'element', header: '元素' },
      { field: 'grade_value', header: '品位值(%)' },
      { field: 'moisture_value', header: '水分值(%)' },
      { field: 'remarks', header: '备注' }
    ],
    'shift_samples': [
      { field: 'record_date', header: '日期', sortable: true },
      { field: 'record_time', header: '时间' },
      { field: 'shift', header: '班次' },
      { field: 'name', header: '记录人' },
      { field: 'mineral_type', header: '矿物类型' },
      { field: 'element', header: '元素' },
      { field: 'grade_value', header: '品位值(%)' },
      { field: 'moisture_value', header: '水分值(%)' }
    ],
    'filter_samples': [
      { field: 'record_date', header: '日期', sortable: true },
      { field: 'record_time', header: '时间' },
      { field: 'shift', header: '班次' },
      { field: 'name', header: '记录人' },
      { field: 'element', header: '元素' },
      { field: 'grade_value', header: '品位值(%)' },
      { field: 'moisture_value', header: '水分值(%)' },
      { field: 'filter_press_number', header: '压滤机号' }
    ],
    'ore_tonnage_records': [
      { field: 'record_date', header: '日期', sortable: true },
      { field: 'name', header: '记录人' },
      { field: 'shift', header: '班次' },
      { field: 'reading_start', header: '起始读数' },
      { field: 'reading_end', header: '终止读数' },
      { field: 'tonnage_result', header: '吨位结果' }
    ],
    'purchase_requests': [
      { field: 'request_date', header: '申请日期', sortable: true },
      { field: 'applicant_name', header: '申请人' },
      { field: 'product_name', header: '产品名称' },
      { field: 'quantity', header: '数量' },
      { field: 'purpose', header: '用途' },
      { field: 'status', header: '状态' },
      { field: 'notes', header: '备注' }
    ],
    'tasks': [
      { field: 'due_date', header: '截止日期', sortable: true },
      { field: 'title', header: '标题' },
      { field: 'description', header: '描述' },
      { field: 'department', header: '部门' },
      { field: 'created_by', header: '创建人' },
      { field: 'assigned_to', header: '指派给' },
      { field: 'priority', header: '优先级' },
      { field: 'state', header: '状态' },
      { field: 'created_at', header: '创建时间' }
    ]
  };
  
  // 获取当前表格的列定义
  const getCurrentColumns = () => {
    return tableColumns[activeTable] || [];
  };

  // 根据表格类型获取对应的日期字段名
  const getDateField = (tableType: AllowedTableName): string => {
    const dateFields: Record<AllowedTableName, string> = {
      'incoming_samples': 'record_date_time',
      'shift_samples': 'record_date',
      'filter_samples': 'record_date',
      'ore_tonnage_records': 'record_date',
      'filter_press_records': 'record_date',
      'filter_press_cycles': 'record_date',
      'ball_mill_work_records': 'record_date',
      'machine_running_records': 'record_date_time',
      'outsourcing_shift_reports': 'record_date',
      'purchase_requests': 'request_date',
      'attendance_records': 'timestamp',
      'boardroom_records': 'record_date',
      'fdx_vs_jdxy_input': 'record_date',
      'fdx_vs_jdxy_output': 'record_date',
      'jdxy_input_data': 'measurement_date',
      'jdxy_input_detail': 'created_at',
      'jdxy_output_data': 'measurement_date',
      'jdxy_boardroom_records': 'record_date',
      'outgoing_sample': 'shipment_date',
      'situations': 'created_at',
      'tasks': 'due_date'
    };
    
    return dateFields[tableType] || 'record_date';
  };

  // 更新排序字段为当前表格的默认日期字段
  const updateSortFieldForTable = useCallback((tableName: AllowedTableName) => {
    const defaultDateField = getDateField(tableName);
    setSortField(defaultDateField);
    setSortDirection('desc');
  }, []);

  // 模拟数据获取
  const fetchData = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "请选择日期范围",
        description: "获取数据需要选择有效的日期范围",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 生成模拟数据
      const mockData: DataRecord[] = Array.from({ length: 10 }, (_, index) => ({
        id: `${activeTable}_${index + 1}`,
        record_date: format(new Date(), 'yyyy-MM-dd'),
        record_time: '08:00',
        name: `操作员${index + 1}`,
        shift: index % 2 === 0 ? '白班' : '夜班',
        element: index % 2 === 0 ? 'Pb' : 'Zn',
        grade_value: (Math.random() * 10 + 5).toFixed(2),
        moisture_value: (Math.random() * 5 + 2).toFixed(2),
        remarks: `测试数据${index + 1}`
      }));

      setData(mockData);
    } catch (error) {
      toast({
        title: "获取数据失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange, activeTable, sortField, sortDirection]);

  // 当数据表变更时，清除详情对话框并更新排序字段
  useEffect(() => {
    if (showDetailDialog) {
      setShowDetailDialog(false);
    }
    setSelectedRecord(null);
    updateSortFieldForTable(activeTable);
  }, [activeTable, updateSortFieldForTable]);

  // 导出功能
  const handleExport = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "请选择日期范围",
        description: "导出数据需要选择有效的日期范围",
        variant: "destructive"
      });
      return;
    }

    setExporting(true);
    try {
      // 模拟导出过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setExportSuccess(true);
      toast({
        title: "导出成功",
        description: "数据已成功导出为Excel文件"
      });
      
      setTimeout(() => {
        setExportSuccess(false);
      }, 3000);
    } catch (error) {
      toast({
        title: "导出失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setExporting(false);
      }, 1000);
    }
  };

  // 处理排序
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 获取排序指示器
  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ArrowUp className="inline h-4 w-4 ml-1" /> : 
      <ArrowDown className="inline h-4 w-4 ml-1" />;
  };

  // 获取当前表格名称
  const getCurrentTableName = (): string => {
    for (const category of Object.keys(dataCategories) as DataCategory[]) {
      const table = dataCategories[category].tables.find(t => t.id === activeTable);
      if (table) {
        return table.name;
      }
    }
    return activeTable;
  };

  // 显示记录详情
  const showRecordDetails = (record: DataRecord) => {
    setSelectedRecord({ ...record });
    setShowDetailDialog(true);
  };

  // 切换数据分类
  const handleCategoryChange = (category: DataCategory) => {
    setActiveCategory(category);
    if (dataCategories[category].tables.length > 0) {
      const firstTable = dataCategories[category].tables[0].id;
      setActiveTable(firstTable);
      updateSortFieldForTable(firstTable);
    }
  };

  // 切换表格时更新排序字段
  const handleTableChange = (tableName: AllowedTableName) => {
    setActiveTable(tableName);
    updateSortFieldForTable(tableName);
  };

  // 返回上一页
  const handleGoBack = () => {
    router.back();
  };

  // 创建类别图标映射
  const getCategoryIcon = (category: DataCategory) => {
    return dataCategories[category].icon;
  };

  // 格式化时间戳为可读格式
  const formatDateTime = (dateTimeString: string | null): string => {
    if (!dateTimeString) return '无数据';
    try {
      return format(new Date(dateTimeString), 'yyyy-MM-dd HH:mm:ss');
    } catch (e) {
      return '格式错误';
    }
  };

  // 渲染字段值的函数
  const renderFieldValue = (key: string, value: any): string => {
    if (key === 'record_date' || key === 'request_date' || key === 'due_date') {
      if (!value) return '无数据';
      try {
        return format(new Date(value), 'yyyy-MM-dd');
      } catch {
        return String(value);
      }
    }
    
    if (typeof value === 'number' && (key.includes('grade') || key.includes('moisture') || key.includes('weight'))) {
      return value.toFixed(2);
    }
    
    if (typeof value === 'boolean') {
      return value ? '是' : '否';
    }
    
    return value !== null && value !== undefined ? String(value) : '无数据';
  };

  return (
    <PerformanceWrapper
      componentName="data-table-center-page"
      enableMonitoring={process.env.NODE_ENV === 'development'}
      enableMemoryTracking={true}
    >
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
            <Database className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">数据中心</span>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* 数据分类选择 */}
          <AnimatedListItem index={0} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.keys(dataCategories) as DataCategory[]).map((category) => (
              <motion.div
                key={category}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <AnimatedButton
                  variant={activeCategory === category ? "default" : "outline"}
                  onClick={() => handleCategoryChange(category)}
                  className="w-full h-16 flex flex-col items-center justify-center gap-2"
                >
                  {getCategoryIcon(category)}
                  <span className="text-sm">{category}</span>
                </Button>
              </motion.div>
            ))}
          </div>
          
          {/* 表格选择 */}
          <div className="overflow-x-auto">
            <motion.div 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex flex-nowrap gap-2 pb-2"
            >
              {dataCategories[activeCategory].tables.map((table) => (
                <AnimatedButton
                  key={table.id}
                  variant={activeTable === table.id ? "default" : "ghost"}
                  onClick={() => handleTableChange(table.id)}
                  className="whitespace-nowrap px-5"
                >
                  {table.name}
                </Button>
              ))}
            </motion.div>
          </div>
          
          {/* 日期范围选择 */}
          <AnimatedListItem index={1} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <AnimatedButton
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "yyyy-MM-dd")} -{" "}
                        {format(dateRange.to, "yyyy-MM-dd")}
                      </>
                    ) : (
                      format(dateRange.from, "yyyy-MM-dd")
                    )
                  ) : (
                    <span>选择日期范围</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            
            {/* 导出按钮 */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <AnimatedButton 
                onClick={handleExport}
                disabled={loading || exporting}
                className={cn(
                  "w-full",
                  exportSuccess 
                    ? "bg-green-500 text-white hover:bg-green-600" 
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                )}
              >
                {exporting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    处理中...
                  </div>
                ) : exportSuccess ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    导出成功
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" />
                    导出数据
                  </>
                )}
              </Button>
            </motion.div>
          </div>
          
          {/* 数据显示区域 */}
          {loading ? (
            <AnimatedListItem index={0} className="space-y-4">
              {Array(3).fill(0).map((_, index) => (
                <AnimatedCard delay={0} key={index} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-6 bg-muted rounded mb-3"></div>
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-4 w-1/3 bg-muted rounded"></div>
                      <div className="h-4 w-1/4 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </AnimatedCard>
              ))}
            </div>
          ) : data.length === 0 ? (
            <AnimatedCard delay={0.1}>
              <CardContent className="flex flex-col items-center py-12">
                <List className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  没有找到符合条件的数据
                </p>
              </CardContent>
            </AnimatedCard>
          ) : (
            <AnimatedCard delay={0.2}>
              <ScrollArea className="w-full">
                <div className="max-h-[60vh] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow>
                        {getCurrentColumns().map(column => (
                          <TableHead 
                            key={column.field}
                            className={cn(
                              "whitespace-nowrap text-sm font-medium py-4",
                              column.sortable ? 'cursor-pointer hover:text-primary transition-colors' : ''
                            )}
                            onClick={() => column.sortable ? handleSort(column.field) : null}
                          >
                            {column.header} {column.sortable && getSortIndicator(column.field)}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((record, index) => (
                        <TableRow 
                          key={record.id || index} 
                          className="hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => showRecordDetails(record)}
                        >
                          {getCurrentColumns().map(column => (
                            <TableCell key={column.field} className="text-sm p-4">
                              {renderFieldValue(column.field, record[column.field])}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </AnimatedCard>
          )}
        </motion.div>
      </div>

      {/* 数据详情对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-medium">
                {getCurrentTableName()}
              </DialogTitle>
              <DialogClose className="rounded-full p-2 hover:bg-muted transition-colors">
                <X className="h-5 w-5" />
              </DialogClose>
            </div>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <AnimatedListItem index={1} className="space-y-4">
                  {Object.entries(selectedRecord).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-3 border-b last:border-0">
                      <div className="text-sm font-medium text-muted-foreground flex-shrink-0 mr-4">
                        {key}
                      </div>
                      <div className="text-sm text-right flex-1 min-w-0">
                        {renderFieldValue(key, value)}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AnimatedPage>
    </PerformanceWrapper>
  );
}
