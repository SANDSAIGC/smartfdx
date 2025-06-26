"use client";

import React, { useState, useEffect, useCallback, useMemo, memo, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { WorkspaceNavigation } from "@/components/workspace-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import {
  Beaker,
  Clock,
  Filter,
  Truck,
  FlaskConical,
  X,
  Edit,
  Save,
  Search,
  RefreshCw
} from "lucide-react";
import { usePageAuth } from "@/lib/hooks/use-auto-login";
import { usePerformanceMonitor } from "@/lib/performance-monitor";
import { SampleData, DataSource } from "@/lib/mock-data-generator";
import { LabSkeleton, TableSkeleton, ProgressiveLoad } from "@/components/lab-skeleton";
import { DataLoading, RouteLoading } from "@/components/loading-transition";

// 懒加载组件
const WelcomePanel = lazy(() => import("@/components/welcome-panel").then(module => ({ default: module.WelcomePanel })));
const DateRangePicker = lazy(() => import("@/components/date-range-picker").then(module => ({ default: module.DateRangePicker })));
const DataComparisonSection = lazy(() => import("@/components/data-comparison-section").then(module => ({ default: module.DataComparisonSection })));

// 接口定义移到了 mock-data-generator.ts 中

interface DateRange {
  from: Date;
  to: Date;
}

// 数据转换函数：将Supabase数据转换为组件期望的格式
const transformSupabaseData = (supabaseData: any[], dataSource: DataSource): SampleData[] => {
  if (!Array.isArray(supabaseData)) return [];

  return supabaseData.map((item, index) => {
    // 生成唯一ID
    const id = item.id || `${dataSource}-${index}-${Date.now()}`;

    // 根据不同数据源进行字段映射
    switch (dataSource) {
      case 'shift_samples': // 生产日报-FDX
        return {
          id,
          record_date: item.日期 || item.记录日期,
          shift: item.班次,
          mineral_type: item.矿物类型 || item.产品类型,
          element: item.元素 || item.化验元素,
          grade_value: parseFloat(item.品位) || parseFloat(item.品位值) || null,
          moisture_value: parseFloat(item.水分) || parseFloat(item.水分值) || null,
          created_at: item.created_at,
          updated_at: item.updated_at
        } as SampleData;

      case 'filter_samples': // 压滤样化验记录
        return {
          id,
          record_date: item.日期 || item.记录日期,
          element: item.元素 || item.化验元素,
          grade_value: parseFloat(item.品位) || parseFloat(item.品位值) || null,
          moisture_value: parseFloat(item.水分) || parseFloat(item.水分值) || null,
          filter_press_number: item.压滤机编号 || item.设备编号,
          created_at: item.created_at,
          updated_at: item.updated_at
        } as SampleData;

      case 'incoming_samples': // 进厂原矿-FDX
        return {
          id,
          record_date: item.日期 || item.进厂日期,
          element: item.元素 || item.化验元素,
          grade_value: parseFloat(item.品位) || parseFloat(item.品位值) || null,
          moisture_value: parseFloat(item.水分) || parseFloat(item.水分值) || null,
          supplier: item.供应商 || item.供货单位,
          created_at: item.created_at,
          updated_at: item.updated_at
        } as SampleData;

      case 'outgoing_sample': // 出厂精矿-FDX
        return {
          id,
          shipment_date: item.出厂日期 || item.日期,
          purchasing_unit_name: item.采购单位 || item.购买单位,
          assayed_metal_element: item.化验元素 || item.元素,
          shipment_sample_grade_percentage: parseFloat(item.出厂样品位) || parseFloat(item.品位) || null,
          shipment_sample_moisture_percentage: parseFloat(item.出厂样水分) || parseFloat(item.水分) || null,
          created_at: item.created_at,
          updated_at: item.updated_at
        } as SampleData;

      default:
        return {
          id,
          record_date: item.日期 || item.记录日期,
          created_at: item.created_at,
          updated_at: item.updated_at
        } as SampleData;
    }
  });
};

export function LabPage() {
  // 路由管理
  const router = useRouter();

  // 认证状态检查
  const { isLoading: authLoading } = usePageAuth(false); // lab页面不强制要求登录

  // 性能监控
  const { start, end, measure } = usePerformanceMonitor();

  // 状态管理
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [tableData, setTableData] = useState<SampleData[]>([]);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource>('shift_samples');
  const [selectedItem, setSelectedItem] = useState<SampleData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SampleData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    // 开始日期：2025-04-26
    const startDate = new Date('2025-04-26');
    // 结束日期：当前日期减去2天
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 2);

    return {
      from: startDate,
      to: endDate
    };
  });

  // 数据源标签映射
  const dataSourceLabel = {
    'shift_samples': '班样',
    'filter_samples': '压滤样',
    'incoming_samples': '进厂样',
    'outgoing_sample': '出厂样'
  };

  // 专项作业区配置
  const workAreas = [
    {
      icon: Clock,
      label: "班样",
      description: "班次样品化验",
      dataSource: 'shift_samples' as DataSource,
      isNavigationButton: true,
      route: '/shift-sample'
    },
    {
      icon: Filter,
      label: "压滤样",
      description: "压滤机样品化验",
      dataSource: 'filter_samples' as DataSource,
      isNavigationButton: false
    },
    {
      icon: Beaker,
      label: "进厂样",
      description: "进厂原矿化验",
      dataSource: 'incoming_samples' as DataSource,
      isNavigationButton: false
    },
    {
      icon: Truck,
      label: "出厂样",
      description: "出厂精矿化验",
      dataSource: 'outgoing_sample' as DataSource,
      isNavigationButton: false
    }
  ];

  // 优化的数据获取函数 - 使用真实Supabase数据
  const fetchData = useCallback(async () => {
    await measure('data-fetch', async () => {
      setIsLoading(true);
      try {
        // 格式化日期为YYYY-MM-DD格式
        const startDate = dateRange.from.toISOString().split('T')[0];
        const endDate = dateRange.to.toISOString().split('T')[0];

        // 调用新的实验室数据API
        const response = await fetch(`/api/lab-data?sampleType=${selectedDataSource}&startDate=${startDate}&endDate=${endDate}&limit=50`);
        const result = await response.json();

        if (result.success) {
          // 转换Supabase数据格式为组件期望的格式
          const transformedData = transformSupabaseData(result.data, selectedDataSource);
          setTableData(transformedData);
        } else {
          console.error('API查询失败:', result.error || 'Unknown error');
          // 不再回退到模拟数据，直接设置为空数组
          setTableData([]);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
        // 不再回退到模拟数据，直接设置为空数组
        setTableData([]);
      } finally {
        setIsLoading(false);
      }
    }, { dataSource: selectedDataSource, dateRange: `${dateRange.from.toISOString()} - ${dateRange.to.toISOString()}` });
  }, [selectedDataSource, dateRange, measure]);

  // 优化的数据源切换
  const handleDataSourceChange = useCallback(async (source: DataSource) => {
    await measure('data-switch', async () => {
      setSelectedDataSource(source);
    }, { from: selectedDataSource, to: source });
  }, [selectedDataSource, measure]);

  // 处理专项作业区点击
  const handleWorkAreaClick = useCallback((area: typeof workAreas[0]) => {
    console.log('🎯 [化验室] 专项作业区点击:', area.label);

    if (area.isNavigationButton && area.route) {
      // 跳转到指定路由
      console.log('🚀 [化验室] 导航按钮点击，跳转到:', area.route);
      console.log('📍 [化验室] 当前页面:', window.location.pathname);
      console.log('🔄 [化验室] 执行路由跳转...');

      router.push(area.route);

      // 添加延迟日志确认跳转
      setTimeout(() => {
        console.log('✅ [化验室] 路由跳转命令已发送');
      }, 100);
    } else {
      // 切换数据源
      console.log('🔄 [化验室] 数据源切换按钮点击，切换到:', area.dataSource);
      handleDataSourceChange(area.dataSource);
    }
  }, [router, handleDataSourceChange]);

  // 优化的行点击处理
  const handleRowClick = useCallback((item: SampleData) => {
    start('dialog-open', { itemId: item.id });
    setSelectedItem(item);
    setEditingItem({ ...item });
    setIsEditing(false);
    setDialogOpen(true);
    end('dialog-open');
  }, [start, end]);

  // 优化的表格列配置（使用 useMemo）
  const columns = useMemo(() => {
    const commonColumns = [
      {
        key: 'record_date',
        header: '日期',
        render: (item: SampleData) => <span>{item.record_date || item.shipment_date}</span>
      }
    ];

    switch (selectedDataSource) {
      case 'shift_samples':
        return [
          ...commonColumns,
          {
            key: 'shift',
            header: '班次',
            render: (item: SampleData) => <span>{item.shift}</span>
          },
          {
            key: 'mineral_type',
            header: '矿物类型',
            render: (item: SampleData) => <span>{item.mineral_type}</span>
          },
          {
            key: 'element',
            header: '元素',
            render: (item: SampleData) => <span>{item.element}</span>
          },
          {
            key: 'grade_value',
            header: '品位',
            render: (item: SampleData) => <span>{item.grade_value !== null ? `${item.grade_value}%` : '-'}</span>
          },
          {
            key: 'moisture_value',
            header: '水分',
            render: (item: SampleData) => <span>{item.moisture_value ? `${item.moisture_value}%` : '-'}</span>
          }
        ];
      case 'filter_samples':
        return [
          ...commonColumns,
          {
            key: 'element',
            header: '元素',
            render: (item: SampleData) => <span>{item.element}</span>
          },
          {
            key: 'grade_value',
            header: '品位',
            render: (item: SampleData) => <span>{item.grade_value !== null ? `${item.grade_value}%` : '-'}</span>
          },
          {
            key: 'filter_press_number',
            header: '压滤机编号',
            render: (item: SampleData) => <span>{item.filter_press_number || '-'}</span>
          }
        ];
      case 'incoming_samples':
        return [
          ...commonColumns,
          {
            key: 'element',
            header: '元素',
            render: (item: SampleData) => <span>{item.element}</span>
          },
          {
            key: 'grade_value',
            header: '品位',
            render: (item: SampleData) => <span>{item.grade_value !== null ? `${item.grade_value}%` : '-'}</span>
          },
          {
            key: 'supplier',
            header: '供应商',
            render: (item: SampleData) => <span>{item.supplier || '-'}</span>
          }
        ];
      case 'outgoing_sample':
        return [
          {
            key: 'shipment_date',
            header: '出厂日期',
            render: (item: SampleData) => <span>{item.shipment_date}</span>
          },
          {
            key: 'purchasing_unit_name',
            header: '采购单位',
            render: (item: SampleData) => <span>{item.purchasing_unit_name || '-'}</span>
          },
          {
            key: 'assayed_metal_element',
            header: '化验元素',
            render: (item: SampleData) => <span>{item.assayed_metal_element || '-'}</span>
          },
          {
            key: 'shipment_sample_grade_percentage',
            header: '出厂样品位',
            render: (item: SampleData) => <span>{item.shipment_sample_grade_percentage !== null ? `${item.shipment_sample_grade_percentage}%` : '-'}</span>
          }
        ];
      default:
        return commonColumns;
    }
  }, [selectedDataSource]);

  // 优化的可编辑字段配置（使用 useMemo）
  const editableFields = useMemo(() => {
    switch (selectedDataSource) {
      case 'shift_samples':
        return [
          { key: 'shift', label: '班次', type: 'text' },
          { key: 'mineral_type', label: '矿物类型', type: 'text' },
          { key: 'element', label: '元素', type: 'text' },
          { key: 'grade_value', label: '品位(%)', type: 'number' },
          { key: 'moisture_value', label: '水分(%)', type: 'number' }
        ];
      case 'filter_samples':
        return [
          { key: 'element', label: '元素', type: 'text' },
          { key: 'grade_value', label: '品位(%)', type: 'number' },
          { key: 'moisture_value', label: '水分(%)', type: 'number' },
          { key: 'filter_press_number', label: '压滤机编号', type: 'text' }
        ];
      case 'incoming_samples':
        return [
          { key: 'element', label: '元素', type: 'text' },
          { key: 'grade_value', label: '品位(%)', type: 'number' },
          { key: 'moisture_value', label: '水分(%)', type: 'number' },
          { key: 'supplier', label: '供应商', type: 'text' }
        ];
      case 'outgoing_sample':
        return [
          { key: 'purchasing_unit_name', label: '采购单位', type: 'text' },
          { key: 'assayed_metal_element', label: '化验元素', type: 'text' },
          { key: 'shipment_sample_grade_percentage', label: '出厂样品位(%)', type: 'number' },
          { key: 'shipment_sample_moisture_percentage', label: '出厂样水分(%)', type: 'number' }
        ];
      default:
        return [];
    }
  }, [selectedDataSource]);

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingItem || !selectedItem) return;

    setIsLoading(true);
    try {
      // 这里应该调用实际的更新API
      console.log('保存数据:', editingItem);

      // 模拟保存成功
      setIsEditing(false);
      setEditingItem(null);
      setDialogOpen(false);
      fetchData(); // 重新加载数据
    } catch (error) {
      console.error('保存数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 页面初始化
  useEffect(() => {
    const initializePage = async () => {
      start('page-load');
      setIsInitialLoading(true);

      try {
        // 直接获取当前数据源的数据
        await fetchData();
      } catch (error) {
        console.error('页面初始化失败:', error);
      } finally {
        setIsInitialLoading(false);
        end('page-load');
      }
    };

    initializePage();
  }, []); // 只在组件挂载时执行一次

  // 数据源或日期范围变化时重新获取数据（添加防抖）
  useEffect(() => {
    if (!isInitialLoading) {
      const timeoutId = setTimeout(() => {
        fetchData();
      }, 300); // 300ms防抖

      return () => clearTimeout(timeoutId);
    }
  }, [selectedDataSource, dateRange.from?.getTime(), dateRange.to?.getTime(), isInitialLoading]); // 使用时间戳避免对象引用变化

  // 如果是初始加载，显示完整的骨架屏
  if (isInitialLoading) {
    return <LabSkeleton />;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* 页面头部 */}
      <div className="relative">
        {/* 导航菜单 - 左上角 */}
        <div className="absolute top-0 left-0">
          <WorkspaceNavigation />
        </div>

        {/* 主题切换按钮 - 右上角 */}
        <div className="absolute top-0 right-0">
          <ThemeToggle />
        </div>

        {/* 页面标题 - 居中 */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <FlaskConical className="h-6 w-6 sm:h-8 sm:w-8" />
            化验室
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            样品化验数据管理与查询系统
          </p>
        </div>
      </div>

      {/* 欢迎面板 - 懒加载 */}
      <Suspense fallback={<div className="h-20 bg-muted animate-pulse rounded-lg" />}>
        <WelcomePanel className="mb-6" />
      </Suspense>

      {/* 专项作业区域 */}
      <Card>
        <CardHeader>
          <CardTitle>专项作业区</CardTitle>
          <CardDescription>
            点击选择专项作业区
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {workAreas.map((area) => {
              const IconComponent = area.icon;

              if (area.isNavigationButton) {
                // 渲染为跳转按钮
                return (
                  <Button
                    key={area.dataSource}
                    variant="outline"
                    className="h-auto p-3 sm:p-4 flex flex-col items-center space-y-1 sm:space-y-2 hover:bg-primary/5 hover:border-primary"
                    onClick={() => handleWorkAreaClick(area)}
                  >
                    <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    <div className="text-center">
                      <h3 className="font-semibold text-xs sm:text-sm">{area.label}</h3>
                      <p className="text-xs text-muted-foreground hidden sm:block">{area.description}</p>
                    </div>
                  </Button>
                );
              } else {
                // 渲染为选择卡片
                return (
                  <Card
                    key={area.dataSource}
                    className={`cursor-pointer hover:shadow-md transition-all ${
                      selectedDataSource === area.dataSource
                        ? 'ring-2 ring-primary bg-primary/5'
                        : ''
                    }`}
                    onClick={() => handleWorkAreaClick(area)}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2">
                        <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                        <h3 className="font-semibold text-xs sm:text-sm">{area.label}</h3>
                        <p className="text-xs text-muted-foreground hidden sm:block">{area.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
            })}
          </div>
        </CardContent>
      </Card>

      {/* 化验数据查询区域 */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg sm:text-xl">化验数据查询</CardTitle>
            <CardDescription className="text-sm">
              查看 {dataSourceLabel[selectedDataSource]} 的历史化验记录
            </CardDescription>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              刷新数据
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 日期范围选择器 - 懒加载 */}
          <Suspense fallback={<div className="h-24 bg-muted animate-pulse rounded-lg mb-4" />}>
            <DateRangePicker
              dateRange={dateRange}
              setDateRange={setDateRange}
              className="mb-4"
            />
          </Suspense>

          {/* 数据源切换按钮 */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-4">
            {(['shift_samples', 'filter_samples', 'incoming_samples', 'outgoing_sample'] as const).map((source) => (
              <Button
                key={source}
                variant={selectedDataSource === source ? "default" : "outline"}
                size="sm"
                onClick={() => handleDataSourceChange(source)}
                className="text-xs sm:text-sm"
              >
                {dataSourceLabel[source]}
              </Button>
            ))}
          </div>

          {/* 数据表格 - 渐进式加载 */}
          <ProgressiveLoad
            isLoading={isLoading}
            skeleton={<TableSkeleton rows={5} columns={columns.length} />}
            delay={100}
          >
            <div className="relative overflow-hidden">
              {tableData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Search className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">暂无 {dataSourceLabel[selectedDataSource]} 数据</p>
                  <p className="text-sm mt-2">所选日期范围内没有找到相关记录</p>
                  <p className="text-sm">请尝试调整日期范围或联系管理员</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.map((column) => (
                          <TableHead key={column.key}>
                            {column.header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableData.map((item) => (
                        <TableRow
                          key={item.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleRowClick(item)}
                        >
                          {columns.map((column) => (
                            <TableCell key={`${item.id}-${column.key}`}>
                              {column.render ? column.render(item) : String(item[column.key] || '-')}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </ProgressiveLoad>
        </CardContent>
      </Card>

      {/* 进出厂数据对比 - 懒加载 */}
      <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-lg" />}>
        <DataComparisonSection dateRange={dateRange} />
      </Suspense>

      {/* 详情对话框 */}
      {selectedItem && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md mx-auto">
            <DialogHeader className="relative">
              <DialogTitle>
                {dataSourceLabel[selectedDataSource]}数据详情
              </DialogTitle>
              <DialogClose className="absolute right-0 top-0">
                <X className="w-4 h-4" />
              </DialogClose>
            </DialogHeader>

            <div className="mt-4">
              {isEditing ? (
                <div className="space-y-4">
                  {editableFields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={field.key} className="text-sm font-medium">
                        {field.label}
                      </Label>
                      <Input
                        id={field.key}
                        type={field.type}
                        value={editingItem?.[field.key] || ''}
                        onChange={(e) => setEditingItem({
                          ...editingItem!,
                          [field.key]: field.type === 'number' ? parseFloat(e.target.value) || null : e.target.value
                        })}
                      />
                    </div>
                  ))}

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSaveEdit}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {isLoading ? '保存中...' : '保存'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setEditingItem({ ...selectedItem });
                      }}
                      className="flex-1"
                    >
                      取消
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Table>
                    <TableBody>
                      {Object.entries(selectedItem).map(([key, value]) => {
                        // 跳过不需要显示的字段
                        if (['id', 'created_at', 'updated_at'].includes(key)) return null;

                        // 中文化字段名
                        const fieldLabels: Record<string, string> = {
                          record_date: '记录日期',
                          shipment_date: '出厂日期',
                          shift: '班次',
                          mineral_type: '矿物类型',
                          element: '化验元素',
                          assayed_metal_element: '化验元素',
                          grade_value: '品位(%)',
                          moisture_value: '水分(%)',
                          shipment_sample_grade_percentage: '出厂样品位(%)',
                          shipment_sample_moisture_percentage: '出厂样水分(%)',
                          filter_press_number: '压滤机编号',
                          supplier: '供应商',
                          purchasing_unit_name: '采购单位'
                        };

                        return (
                          <TableRow key={key}>
                            <TableCell className="font-medium">
                              {fieldLabels[key] || key}
                            </TableCell>
                            <TableCell className="text-right">
                              {value !== null ? String(value) : '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      编辑
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
