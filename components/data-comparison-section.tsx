"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { RefreshCw, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { DataLoading } from "@/components/loading-transition";

interface ComparisonData {
  date: string;
  fdx_grade: number;
  fdx_moisture: number;
  jdxy_grade: number;
  jdxy_moisture: number;
}

interface DateRange {
  from: Date;
  to: Date;
}

interface DataComparisonSectionProps {
  dateRange: DateRange;
}

export function DataComparisonSection({ dateRange }: DataComparisonSectionProps) {
  const [activeTab, setActiveTab] = useState<"incoming" | "production" | "outgoing">("incoming");
  const [isLoading, setIsLoading] = useState(false);
  const [incomingData, setIncomingData] = useState<ComparisonData[]>([]);
  const [productionData, setProductionData] = useState<ComparisonData[]>([]);
  const [outgoingData, setOutgoingData] = useState<ComparisonData[]>([]);

  // 图表配置
  const chartConfig = {
    fdx_grade: {
      label: "FDX品位",
      color: "#2563eb",
    },
    fdx_moisture: {
      label: "FDX水分",
      color: "#dc2626",
    },
    jdxy_grade: {
      label: "JDXY品位",
      color: "#16a34a",
    },
    jdxy_moisture: {
      label: "JDXY水分",
      color: "#ca8a04",
    },
  };

  // 获取数据
  const fetchComparisonData = async () => {
    setIsLoading(true);
    console.log('📊 [数据对比] 开始获取对比数据...', { 
      tab: activeTab, 
      dateRange: {
        from: format(dateRange.from, 'yyyy-MM-dd'),
        to: format(dateRange.to, 'yyyy-MM-dd')
      }
    });

    try {
      let tableName: string;
      switch (activeTab) {
        case "incoming":
          tableName = "进厂原矿-FDX";
          break;
        case "production":
          tableName = "生产日报对比";
          break;
        case "outgoing":
          tableName = "出厂精矿-FDX";
          break;
        default:
          tableName = "进厂原矿-FDX";
      }

      const response = await fetch('/api/get-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableName,
          dateRange: {
            start: format(dateRange.from, 'yyyy-MM-dd'),
            end: format(dateRange.to, 'yyyy-MM-dd')
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📋 [数据对比] 获取数据成功:', result);

      if (result.success && Array.isArray(result.data)) {
        const transformedData = result.data.map((item: any) => ({
          date: format(new Date(item.日期 || item.记录日期 || item.计量日期), 'MM-dd'),
          fdx_grade: parseFloat(item.FDX品位 || item.fdx_grade || 0),
          fdx_moisture: parseFloat(item.FDX水分 || item.fdx_moisture || 0),
          jdxy_grade: parseFloat(item.JDXY品位 || item.jdxy_grade || 0),
          jdxy_moisture: parseFloat(item.JDXY水分 || item.jdxy_moisture || 0),
        }));

        switch (activeTab) {
          case "incoming":
            setIncomingData(transformedData);
            break;
          case "production":
            setProductionData(transformedData);
            break;
          case "outgoing":
            setOutgoingData(transformedData);
            break;
        }
      } else {
        console.warn('⚠️ [数据对比] 数据格式异常:', result);
        // 设置空数据
        switch (activeTab) {
          case "incoming":
            setIncomingData([]);
            break;
          case "production":
            setProductionData([]);
            break;
          case "outgoing":
            setOutgoingData([]);
            break;
        }
      }
    } catch (error) {
      console.error('❌ [数据对比] 获取数据失败，使用模拟数据:', error);
      // 使用对应类型的模拟数据作为后备
      const mockData = generateMockData(activeTab);
      console.log('📊 [数据对比] 使用模拟数据:', { tab: activeTab, dataCount: mockData.length });

      switch (activeTab) {
        case "incoming":
          setIncomingData(mockData);
          break;
        case "production":
          setProductionData(mockData);
          break;
        case "outgoing":
          setOutgoingData(mockData);
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 生成模拟数据 - 为三个选项卡生成不同的合理数据
  const generateMockData = (dataType: "incoming" | "production" | "outgoing" = activeTab): ComparisonData[] => {
    const data: ComparisonData[] = [];
    const days = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));

    // 为最近7-10天生成数据
    const dataPoints = Math.min(Math.max(days, 7), 10);

    for (let i = 0; i < dataPoints; i++) {
      const date = new Date(dateRange.from);
      date.setDate(date.getDate() + i);

      let fdxGrade, fdxMoisture, jdxyGrade, jdxyMoisture;

      // 根据数据类型生成不同的合理数据范围
      switch (dataType) {
        case "incoming": // 进厂数据 - 原矿品位较低，水分较高
          fdxGrade = 15 + Math.random() * 5; // 15-20%
          fdxMoisture = 8 + Math.random() * 4; // 8-12%
          jdxyGrade = 16 + Math.random() * 4; // 16-20%
          jdxyMoisture = 7 + Math.random() * 3; // 7-10%
          break;

        case "production": // 生产数据 - 中等品位和水分
          fdxGrade = 18 + Math.random() * 4; // 18-22%
          fdxMoisture = 6 + Math.random() * 3; // 6-9%
          jdxyGrade = 19 + Math.random() * 3; // 19-22%
          jdxyMoisture = 5 + Math.random() * 3; // 5-8%
          break;

        case "outgoing": // 出厂数据 - 精矿品位高，水分低
          fdxGrade = 20 + Math.random() * 5; // 20-25%
          fdxMoisture = 5 + Math.random() * 2; // 5-7%
          jdxyGrade = 21 + Math.random() * 4; // 21-25%
          jdxyMoisture = 5 + Math.random() * 2; // 5-7%
          break;

        default:
          fdxGrade = 18 + Math.random() * 4;
          fdxMoisture = 7 + Math.random() * 3;
          jdxyGrade = 19 + Math.random() * 3;
          jdxyMoisture = 6 + Math.random() * 3;
      }

      data.push({
        date: format(date, 'MM-dd'),
        fdx_grade: Math.round(fdxGrade * 100) / 100, // 保留2位小数
        fdx_moisture: Math.round(fdxMoisture * 100) / 100,
        jdxy_grade: Math.round(jdxyGrade * 100) / 100,
        jdxy_moisture: Math.round(jdxyMoisture * 100) / 100,
      });
    }

    return data;
  };

  // 初始化所有选项卡的模拟数据
  const initializeMockData = () => {
    console.log('🚀 [数据对比] 初始化模拟数据...');

    const incomingMockData = generateMockData("incoming");
    const productionMockData = generateMockData("production");
    const outgoingMockData = generateMockData("outgoing");

    setIncomingData(incomingMockData);
    setProductionData(productionMockData);
    setOutgoingData(outgoingMockData);

    console.log('✅ [数据对比] 模拟数据初始化完成:', {
      incoming: incomingMockData.length,
      production: productionMockData.length,
      outgoing: outgoingMockData.length
    });
  };

  // 组件初始化时加载模拟数据
  useEffect(() => {
    initializeMockData();
  }, [dateRange.from, dateRange.to]);

  // 当标签页改变时，如果没有数据则尝试获取数据
  useEffect(() => {
    const currentData = activeTab === "incoming" ? incomingData :
                       activeTab === "production" ? productionData :
                       outgoingData;

    // 如果当前选项卡没有数据，尝试获取数据
    if (currentData.length === 0) {
      fetchComparisonData();
    }
  }, [activeTab]);

  // 获取当前数据
  const currentData = activeTab === "incoming" ? incomingData :
                     activeTab === "production" ? productionData :
                     outgoingData;

  // 计算统计信息
  const statistics = useMemo(() => {
    if (currentData.length === 0) return null;

    const fdxGradeAvg = currentData.reduce((sum, item) => sum + item.fdx_grade, 0) / currentData.length;
    const jdxyGradeAvg = currentData.reduce((sum, item) => sum + item.jdxy_grade, 0) / currentData.length;
    const fdxMoistureAvg = currentData.reduce((sum, item) => sum + item.fdx_moisture, 0) / currentData.length;
    const jdxyMoistureAvg = currentData.reduce((sum, item) => sum + item.jdxy_moisture, 0) / currentData.length;

    return {
      fdxGradeAvg: fdxGradeAvg.toFixed(2),
      jdxyGradeAvg: jdxyGradeAvg.toFixed(2),
      fdxMoistureAvg: fdxMoistureAvg.toFixed(2),
      jdxyMoistureAvg: jdxyMoistureAvg.toFixed(2),
      gradeDiff: (fdxGradeAvg - jdxyGradeAvg).toFixed(2),
      moistureDiff: (fdxMoistureAvg - jdxyMoistureAvg).toFixed(2),
    };
  }, [currentData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5" />
          数据对比
        </CardTitle>
        <CardDescription>
          FDX与JDXY相关数据对比分析
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 刷新按钮 */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            使用上方日期选择器设置的日期范围进行数据对比
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchComparisonData}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            刷新数据
          </Button>
        </div>

        {/* 数据对比轮播 */}
        <div className="space-y-4">
          {/* 轮播导航指示器 */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant={activeTab === "incoming" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("incoming")}
              className="min-w-[80px]"
            >
              进厂数据
            </Button>
            <Button
              variant={activeTab === "production" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("production")}
              className="min-w-[80px]"
            >
              生产数据
            </Button>
            <Button
              variant={activeTab === "outgoing" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("outgoing")}
              className="min-w-[80px]"
            >
              出厂数据
            </Button>
          </div>

          {/* 轮播内容 */}
          <Carousel className="w-full">
            <CarouselContent>
              <CarouselItem className={cn("transition-opacity duration-300", activeTab === "incoming" ? "opacity-100" : "opacity-0 absolute")}>
                <DataComparisonChart
                  data={incomingData}
                  isLoading={isLoading}
                  chartConfig={chartConfig}
                  statistics={statistics}
                  title="进厂数据对比"
                />
              </CarouselItem>
              <CarouselItem className={cn("transition-opacity duration-300", activeTab === "production" ? "opacity-100" : "opacity-0 absolute")}>
                <DataComparisonChart
                  data={productionData}
                  isLoading={isLoading}
                  chartConfig={chartConfig}
                  statistics={statistics}
                  title="生产数据对比"
                />
              </CarouselItem>
              <CarouselItem className={cn("transition-opacity duration-300", activeTab === "outgoing" ? "opacity-100" : "opacity-0 absolute")}>
                <DataComparisonChart
                  data={outgoingData}
                  isLoading={isLoading}
                  chartConfig={chartConfig}
                  statistics={statistics}
                  title="出厂数据对比"
                />
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious
              onClick={() => {
                const tabs = ["incoming", "production", "outgoing"] as const;
                const currentIndex = tabs.indexOf(activeTab);
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                setActiveTab(tabs[prevIndex]);
              }}
            />
            <CarouselNext
              onClick={() => {
                const tabs = ["incoming", "production", "outgoing"] as const;
                const currentIndex = tabs.indexOf(activeTab);
                const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                setActiveTab(tabs[nextIndex]);
              }}
            />
          </Carousel>
        </div>
      </CardContent>
    </Card>
  );
}

// 图表组件
interface DataComparisonChartProps {
  data: ComparisonData[];
  isLoading: boolean;
  chartConfig: any;
  statistics: any;
  title?: string;
}

function DataComparisonChart({ data, isLoading, chartConfig, statistics, title }: DataComparisonChartProps) {
  if (isLoading) {
    return (
      <div className="h-[300px] sm:h-[350px] md:h-[400px] flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm sm:text-base">加载数据中...</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-[300px] sm:h-[350px] md:h-[400px] flex flex-col items-center justify-center text-muted-foreground px-4">
        <TrendingDown className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mb-4 opacity-50" />
        <p className="text-base sm:text-lg font-medium text-center">暂无对比数据</p>
        <p className="text-xs sm:text-sm text-center mt-1">所选日期范围内没有找到相关记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 标题 */}
      {title && (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
      )}

      {/* 统计信息 */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <div className="text-center p-2 sm:p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-xs sm:text-sm text-muted-foreground">FDX平均品位</p>
            <p className="text-sm sm:text-lg font-semibold text-blue-600">{statistics.fdxGradeAvg}%</p>
          </div>
          <div className="text-center p-2 sm:p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="text-xs sm:text-sm text-muted-foreground">JDXY平均品位</p>
            <p className="text-sm sm:text-lg font-semibold text-green-600">{statistics.jdxyGradeAvg}%</p>
          </div>
          <div className="text-center p-2 sm:p-3 bg-red-50 dark:bg-red-950 rounded-lg">
            <p className="text-xs sm:text-sm text-muted-foreground">FDX平均水分</p>
            <p className="text-sm sm:text-lg font-semibold text-red-600">{statistics.fdxMoistureAvg}%</p>
          </div>
          <div className="text-center p-2 sm:p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
            <p className="text-xs sm:text-sm text-muted-foreground">JDXY平均水分</p>
            <p className="text-sm sm:text-lg font-semibold text-yellow-600">{statistics.jdxyMoistureAvg}%</p>
          </div>
        </div>
      )}

      {/* 图表 */}
      <ChartContainer config={chartConfig} className="h-[300px] sm:h-[350px] md:h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend />
            <Line 
              type="monotone" 
              dataKey="fdx_grade" 
              stroke={chartConfig.fdx_grade.color} 
              strokeWidth={2}
              name={chartConfig.fdx_grade.label}
            />
            <Line 
              type="monotone" 
              dataKey="jdxy_grade" 
              stroke={chartConfig.jdxy_grade.color} 
              strokeWidth={2}
              name={chartConfig.jdxy_grade.label}
            />
            <Line 
              type="monotone" 
              dataKey="fdx_moisture" 
              stroke={chartConfig.fdx_moisture.color} 
              strokeWidth={2}
              strokeDasharray="5 5"
              name={chartConfig.fdx_moisture.label}
            />
            <Line 
              type="monotone" 
              dataKey="jdxy_moisture" 
              stroke={chartConfig.jdxy_moisture.color} 
              strokeWidth={2}
              strokeDasharray="5 5"
              name={chartConfig.jdxy_moisture.label}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
