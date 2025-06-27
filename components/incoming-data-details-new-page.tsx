"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  CalendarIcon,
  ArrowLeft,
  TrendingUp,
  Weight,
  Droplets,
  Zap,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// 定义数据类型
interface IncomingData {
  weight: number | null;
  moisture: number | null;
  znGrade: number | null;
  pbGrade: number | null;
}

export function IncomingDataDetailsNewPage() {
  const router = useRouter();
  const [date, setDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<IncomingData>({
    weight: null,
    moisture: null,
    znGrade: null,
    pbGrade: null
  });

  // 模拟数据获取
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 生成模拟数据
      const mockData: IncomingData = {
        weight: Math.random() * 500 + 100, // 100-600吨
        moisture: Math.random() * 15 + 5, // 5-20%
        znGrade: Math.random() * 10 + 5, // 5-15%
        pbGrade: Math.random() * 5 + 2 // 2-7%
      };
      
      setData(mockData);
      
      toast({
        title: "数据加载成功",
        description: `已获取 ${format(date, 'yyyy年MM月dd日')} 的进厂数据`
      });
    } catch (error) {
      console.error('获取数据失败:', error);
      toast({
        variant: "destructive",
        title: "数据加载失败",
        description: "请稍后重试"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  const handleGoBack = () => {
    router.back();
  };

  // 渲染数据卡片
  const renderDataCard = (
    title: string,
    value: number | null,
    unit: string,
    icon: React.ReactNode,
    color: string,
    maxValue: number
  ) => {
    const displayValue = value !== null ? value.toFixed(2) : '0.00';
    const progressValue = value !== null ? (value / maxValue) * 100 : 0;

    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <span className={`mr-2 ${color}`}>{icon}</span>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {displayValue}
              </div>
              <Badge variant="secondary" className="text-xs">
                {unit}
              </Badge>
            </div>
            
            <Progress 
              value={progressValue} 
              className="h-2"
            />
            
            <div className="text-xs text-muted-foreground">
              最大值: {maxValue} {unit}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
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
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">进厂数据详情</span>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* 欢迎面板 */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">进厂原料数据监控</h2>
                <p className="text-muted-foreground">实时查看进厂原料的重量、水分含量和品位数据</p>
              </div>
            </CardContent>
          </Card>

          {/* 日期选择器 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                选择查询日期
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'yyyy年MM月dd日') : "选择日期..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          {/* 加载状态 */}
          {isLoading && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>正在加载数据...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 数据展示卡片 */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 进厂吨位 */}
              {renderDataCard(
                "进厂吨位",
                data.weight,
                "吨",
                <Weight className="h-4 w-4" />,
                "text-blue-500",
                600
              )}

              {/* 水分含量 */}
              {renderDataCard(
                "水分含量",
                data.moisture,
                "%",
                <Droplets className="h-4 w-4" />,
                "text-cyan-500",
                25
              )}

              {/* 锌品位 */}
              {renderDataCard(
                "锌(Zn)品位",
                data.znGrade,
                "%",
                <Zap className="h-4 w-4" />,
                "text-green-500",
                20
              )}

              {/* 铅品位 */}
              {renderDataCard(
                "铅(Pb)品位",
                data.pbGrade,
                "%",
                <Zap className="h-4 w-4" />,
                "text-yellow-500",
                10
              )}
            </div>
          )}

          {/* 数据汇总 */}
          {!isLoading && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">数据汇总</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-blue-500">
                      {data.weight?.toFixed(0) || '0'}
                    </div>
                    <div className="text-sm text-muted-foreground">总吨位</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-cyan-500">
                      {data.moisture?.toFixed(1) || '0.0'}%
                    </div>
                    <div className="text-sm text-muted-foreground">平均水分</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-green-500">
                      {data.znGrade?.toFixed(2) || '0.00'}%
                    </div>
                    <div className="text-sm text-muted-foreground">锌品位</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-yellow-500">
                      {data.pbGrade?.toFixed(2) || '0.00'}%
                    </div>
                    <div className="text-sm text-muted-foreground">铅品位</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-center space-x-4">
            <Button onClick={fetchData} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  刷新中...
                </>
              ) : (
                "刷新数据"
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
