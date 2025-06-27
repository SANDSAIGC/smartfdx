"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { 
  Activity, Terminal, BarChart4, ArrowLeft, Download, 
  TrendingUp, Gauge, Beaker, Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// 类型定义
interface ConcentrationData {
  time: string;
  feedAmount: number;
  firstMillDensity: number;
  secondMillDensity: number;
  secondMillFineness: number;
}

interface MonitorRecord {
  id: string;
  time: string;
  feedAmount: string;
  firstMillDensity: string;
  secondMillDensity: string;
  secondMillFineness: string;
  status: "normal" | "warning" | "alert";
}

export function ConcentrationFinenessMonitorPage() {
  const router = useRouter();
  
  // 状态管理
  const [currentTab, setCurrentTab] = useState("realtime");
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  
  // 模拟数据
  const [realtimeData, setRealtimeData] = useState<ConcentrationData[]>([
    { time: "08:00", feedAmount: 45.2, firstMillDensity: 68.5, secondMillDensity: 72.3, secondMillFineness: 85.2 },
    { time: "09:00", feedAmount: 47.1, firstMillDensity: 69.2, secondMillDensity: 73.1, secondMillFineness: 86.1 },
    { time: "10:00", feedAmount: 46.8, firstMillDensity: 68.9, secondMillDensity: 72.8, secondMillFineness: 85.8 },
    { time: "11:00", feedAmount: 48.3, firstMillDensity: 70.1, secondMillDensity: 74.2, secondMillFineness: 87.3 },
    { time: "12:00", feedAmount: 47.5, firstMillDensity: 69.6, secondMillDensity: 73.5, secondMillFineness: 86.5 },
    { time: "13:00", feedAmount: 46.2, firstMillDensity: 68.3, secondMillDensity: 72.1, secondMillFineness: 85.1 },
    { time: "14:00", feedAmount: 49.1, firstMillDensity: 70.8, secondMillDensity: 74.9, secondMillFineness: 88.2 },
    { time: "15:00", feedAmount: 48.7, firstMillDensity: 70.4, secondMillDensity: 74.5, secondMillFineness: 87.8 }
  ]);
  
  const [todayRecords, setTodayRecords] = useState<MonitorRecord[]>([
    {
      id: "1",
      time: "15:00",
      feedAmount: "48.7",
      firstMillDensity: "70.4",
      secondMillDensity: "74.5",
      secondMillFineness: "87.8",
      status: "normal"
    },
    {
      id: "2", 
      time: "14:00",
      feedAmount: "49.1",
      firstMillDensity: "70.8",
      secondMillDensity: "74.9",
      secondMillFineness: "88.2",
      status: "normal"
    },
    {
      id: "3",
      time: "13:00", 
      feedAmount: "46.2",
      firstMillDensity: "68.3",
      secondMillDensity: "72.1",
      secondMillFineness: "85.1",
      status: "warning"
    }
  ]);

  // 模拟数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdateTime(new Date());
    }, 30000); // 每30秒更新一次时间戳

    return () => clearInterval(interval);
  }, []);

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal": return "bg-green-500";
      case "warning": return "bg-yellow-500";
      case "alert": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case "normal": return "正常";
      case "warning": return "警告";
      case "alert": return "报警";
      default: return "未知";
    }
  };

  // 导出数据
  const handleExport = () => {
    setIsLoading(true);
    // 模拟导出过程
    setTimeout(() => {
      setIsLoading(false);
      // 这里可以添加实际的导出逻辑
      console.log("导出浓细度监控数据");
    }, 2000);
  };

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
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">浓细度监控</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>{isLoading ? "导出中..." : "导出数据"}</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* 状态卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">给料量</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48.7 t/h</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +2.3% 较上小时
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">一号球磨浓度</CardTitle>
              <Beaker className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">70.4%</div>
              <p className="text-xs text-muted-foreground">
                目标范围: 68-72%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">二号球磨浓度</CardTitle>
              <Beaker className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">74.5%</div>
              <p className="text-xs text-muted-foreground">
                目标范围: 72-76%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">二号球磨细度</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87.8%</div>
              <p className="text-xs text-muted-foreground">
                目标范围: 85-90%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 图表区域 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart4 className="w-5 h-5 mr-2" />
              浓细度趋势图
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="realtime">实时走势</TabsTrigger>
                <TabsTrigger value="daily">日累计</TabsTrigger>
              </TabsList>
              
              <TabsContent value="realtime" className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={realtimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="feedAmount" 
                      name="给料量(t/h)" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="firstMillDensity" 
                      name="一号球磨浓度(%)" 
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="secondMillDensity" 
                      name="二号球磨浓度(%)" 
                      stroke="#ffc658"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="secondMillFineness" 
                      name="二号球磨细度(%)" 
                      stroke="#ff7300"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="daily" className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={realtimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[60, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="firstMillDensity" 
                      name="一号球磨浓度(%)" 
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="secondMillDensity" 
                      name="二号球磨浓度(%)" 
                      stroke="#ffc658"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="secondMillFineness" 
                      name="二号球磨细度(%)" 
                      stroke="#ff7300"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
            
            <div className="mt-4 text-right text-sm text-muted-foreground">
              数据更新时间: {format(lastUpdateTime, "yyyy-MM-dd HH:mm:ss")}
            </div>
          </CardContent>
        </Card>

        {/* 数据表格 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Terminal className="w-5 h-5 mr-2" />
              今日浓细度记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead>给料量(t/h)</TableHead>
                  <TableHead>一号球磨浓度(%)</TableHead>
                  <TableHead>二号球磨浓度(%)</TableHead>
                  <TableHead>二号球磨细度(%)</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.time}</TableCell>
                    <TableCell>{record.feedAmount}</TableCell>
                    <TableCell>{record.firstMillDensity}</TableCell>
                    <TableCell>{record.secondMillDensity}</TableCell>
                    <TableCell>{record.secondMillFineness}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        {getStatusText(record.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
