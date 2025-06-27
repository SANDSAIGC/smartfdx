"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  FileText, Bell, CalendarCheck, Shield, ArrowLeft,
  FileInput, FileChartLine, FileImage, FileOutput, 
  Table, Gauge, Wrench, ShoppingCart, Bot,
  TrendingUp, BarChart3, DollarSign, Users,
  Activity, Target, Award, Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

// 类型定义
interface ManagementModule {
  icon: React.ReactNode;
  label: string;
  path: string;
  description: string;
  status?: "active" | "development" | "completed";
}

interface BusinessMetric {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "stable";
  icon: React.ReactNode;
  color: string;
}

export function BossPage() {
  const router = useRouter();
  
  // 状态管理
  const [productionRate, setProductionRate] = useState(72);
  const [isLoading, setIsLoading] = useState(false);
  
  // 管理模块配置
  const managementModules: ManagementModule[] = [
    {
      icon: <FileInput className="w-6 h-6 text-blue-500" />,
      label: "进厂数据",
      path: "/incoming-data-details-new",
      description: "原料进厂数据管理",
      status: "active"
    },
    {
      icon: <FileChartLine className="w-6 h-6 text-green-500" />,
      label: "生产数据", 
      path: "/process-management",
      description: "生产过程数据监控",
      status: "active"
    },
    {
      icon: <FileImage className="w-6 h-6 text-purple-500" />,
      label: "压滤数据",
      path: "/filter-press-data-details",
      description: "压滤工艺数据",
      status: "active"
    },
    {
      icon: <FileOutput className="w-6 h-6 text-orange-500" />,
      label: "出厂数据",
      path: "/outgoing-data-details",
      description: "产品出厂数据",
      status: "active"
    },
    {
      icon: <Table className="w-6 h-6 text-indigo-500" />,
      label: "表格汇总",
      path: "/data-table-center",
      description: "数据报表中心",
      status: "completed"
    },
    {
      icon: <Wrench className="w-6 h-6 text-red-500" />,
      label: "机器运行",
      path: "/machine-running-details",
      description: "设备运行状态",
      status: "active"
    }
  ];

  // 业务指标数据
  const businessMetrics: BusinessMetric[] = [
    {
      title: "月度营收",
      value: "¥2,847万",
      change: "+15.3%",
      trend: "up",
      icon: <DollarSign className="h-4 w-4" />,
      color: "text-green-600"
    },
    {
      title: "生产效率",
      value: "87.2%",
      change: "+5.1%",
      trend: "up", 
      icon: <Activity className="h-4 w-4" />,
      color: "text-blue-600"
    },
    {
      title: "员工满意度",
      value: "94.5%",
      change: "+2.3%",
      trend: "up",
      icon: <Users className="h-4 w-4" />,
      color: "text-purple-600"
    },
    {
      title: "质量达标率",
      value: "98.7%",
      change: "-0.2%",
      trend: "down",
      icon: <Target className="h-4 w-4" />,
      color: "text-orange-600"
    }
  ];

  // 获取状态颜色
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "development": return "bg-yellow-500";
      case "completed": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  // 获取趋势颜色
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up": return "text-green-600";
      case "down": return "text-red-600";
      case "stable": return "text-gray-600";
      default: return "text-gray-600";
    }
  };

  // 处理模块点击
  const handleModuleClick = (path: string) => {
    setIsLoading(true);
    setTimeout(() => {
      router.push(path);
      setIsLoading(false);
    }, 500);
  };

  // 处理AI智能统计师点击
  const handleAIStatisticianClick = () => {
    // 这里可以添加AI功能的实现
    console.log("AI智能统计师功能开发中...");
  };

  // 模拟数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setProductionRate(prev => {
        const newValue = prev + Math.random() * 4 - 2; // 随机波动
        return Math.max(60, Math.min(95, newValue));
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <div className="flex justify-between items-center p-6 border-b">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">智能决策中心</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAIStatisticianClick}
            className="flex items-center space-x-2"
          >
            <Bot className="h-4 w-4" />
            <span>AI助手</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* 欢迎区域 */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">企业云管理平台</h1>
            <p className="text-muted-foreground text-lg">智能决策 · 数据驱动 · 高效管理</p>
          </div>

          {/* 业务指标卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  <div className={metric.color}>
                    {metric.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className={`text-xs ${getTrendColor(metric.trend)}`}>
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    {metric.change} 较上月
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 生产效率监控 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gauge className="w-5 h-5 mr-2 text-purple-500" />
                企业生产效率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">当前效率</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {productionRate.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={productionRate} 
                  className="h-3"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>目标: 90%</span>
                  <span>状态: 进行中</span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setProductionRate(prev => Math.min(prev + 5, 100))}
                  >
                    +5%
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setProductionRate(prev => Math.max(prev - 5, 0))}
                  >
                    -5%
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 管理模块 */}
          <Card>
            <CardHeader>
              <CardTitle>企业管理模块</CardTitle>
              <p className="text-sm text-muted-foreground">点击进入相应管理模块</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {managementModules.map((module, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center space-y-2 relative"
                    onClick={() => handleModuleClick(module.path)}
                    disabled={isLoading}
                  >
                    {module.status && (
                      <Badge 
                        className={`absolute top-2 right-2 w-2 h-2 p-0 ${getStatusColor(module.status)}`}
                      />
                    )}
                    {module.icon}
                    <div className="text-center">
                      <div className="font-medium text-sm">{module.label}</div>
                      <div className="text-xs text-muted-foreground">{module.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI智能统计师 */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                AI智能统计师
                <Badge className="ml-2 bg-blue-600">
                  <Zap className="w-3 h-3 mr-1" />
                  AI
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">AI驱动的数据统计分析平台</h3>
                  <p className="text-sm text-muted-foreground">智能分析企业数据，提供决策支持</p>
                </div>
                <Button onClick={handleAIStatisticianClick} className="bg-blue-600 hover:bg-blue-700">
                  <Bot className="w-4 h-4 mr-2" />
                  启动AI助手
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 底部导航 */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="flex justify-around items-center p-4">
          <Button 
            variant="ghost" 
            className="flex flex-col items-center space-y-1 h-auto py-2"
            onClick={() => router.push("/situation-management")}
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs">情况处理</span>
          </Button>
          <Button 
            variant="ghost" 
            className="flex flex-col items-center space-y-1 h-auto py-2"
            onClick={() => router.push("/task-assignment")}
          >
            <Bell className="w-5 h-5" />
            <span className="text-xs">任务指派</span>
          </Button>
          <Button 
            variant="ghost" 
            className="flex flex-col items-center space-y-1 h-auto py-2"
            onClick={() => router.push("/attendance-management")}
          >
            <CalendarCheck className="w-5 h-5" />
            <span className="text-xs">考勤查看</span>
          </Button>
          <Button 
            variant="ghost" 
            className="flex flex-col items-center space-y-1 h-auto py-2"
            onClick={() => router.push("/purchase-management")}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-xs">采购管理</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
