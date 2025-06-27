"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  FlaskConical, Gauge, Scale, Construction, ArrowLeft,
  Filter, ShoppingBag, ClipboardList, Building2,
  Users, MapPin, Briefcase, MessageCircle, Bot
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

// 类型定义
interface WorkStation {
  icon: React.ReactNode;
  label: string;
  path: string;
  description: string;
  department: string;
  status: "active" | "maintenance" | "offline";
  userCount?: number;
}

export function CosPlayPage() {
  const router = useRouter();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  
  // 工作站配置
  const workStations: WorkStation[] = [
    {
      icon: <FlaskConical className="w-6 h-6 text-blue-500" />,
      label: "化验室",
      path: "/lab",
      description: "样品检测与质量分析",
      department: "质检部",
      status: "active",
      userCount: 8
    },
    {
      icon: <Gauge className="w-6 h-6 text-green-500" />,
      label: "生产控制",
      path: "/production-control",
      description: "生产过程监控管理",
      department: "生产部",
      status: "active",
      userCount: 12
    },
    {
      icon: <Scale className="w-6 h-6 text-purple-500" />,
      label: "磅房",
      path: "/weighbridge-data",
      description: "车辆称重数据记录",
      department: "物流部",
      status: "active",
      userCount: 4
    },
    {
      icon: <Construction className="w-6 h-6 text-orange-500" />,
      label: "球磨车间",
      path: "/ball-mill-workshop",
      description: "球磨设备操作管理",
      department: "生产部",
      status: "active",
      userCount: 15
    },
    {
      icon: <Filter className="w-6 h-6 text-indigo-500" />,
      label: "压滤车间",
      path: "/filter-press-workshop",
      description: "压滤工艺操作管理",
      department: "生产部",
      status: "maintenance",
      userCount: 10
    },
    {
      icon: <ShoppingBag className="w-6 h-6 text-red-500" />,
      label: "采购申请",
      path: "/purchase-request",
      description: "物资采购申请管理",
      department: "采购部",
      status: "active",
      userCount: 6
    },
    {
      icon: <ClipboardList className="w-6 h-6 text-teal-500" />,
      label: "采购管理",
      path: "/purchase-management",
      description: "采购流程管理",
      department: "采购部",
      status: "active",
      userCount: 8
    },
    {
      icon: <Building2 className="w-6 h-6 text-gray-500" />,
      label: "办公室",
      path: "/manager",
      description: "管理办公工作站",
      department: "管理部",
      status: "active",
      userCount: 5
    }
  ];

  // 部门列表
  const departments = ["all", "质检部", "生产部", "物流部", "采购部", "管理部"];

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "maintenance": return "bg-yellow-500";
      case "offline": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "运行中";
      case "maintenance": return "维护中";
      case "offline": return "离线";
      default: return "未知";
    }
  };

  // 过滤工作站
  const filteredWorkStations = selectedDepartment === "all" 
    ? workStations 
    : workStations.filter(station => station.department === selectedDepartment);

  // 处理工作站点击
  const handleStationClick = (path: string, status: string) => {
    if (status === "offline") {
      console.log("工作站离线，无法访问");
      return;
    }
    router.push(path);
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
            <Users className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">工作站导航</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Bot className="h-4 w-4" />
            <span>AI助手</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* 欢迎区域 */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">部门工作站</h1>
            <p className="text-muted-foreground text-lg">选择要进入的工作站进行操作</p>
          </div>

          {/* 部门筛选 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                部门筛选
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {departments.map((dept) => (
                  <Button
                    key={dept}
                    variant={selectedDepartment === dept ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDepartment(dept)}
                  >
                    {dept === "all" ? "全部部门" : dept}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 工作站网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkStations.map((station, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    station.status === "offline" ? "opacity-50" : ""
                  }`}
                  onClick={() => handleStationClick(station.path, station.status)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-muted rounded-lg">
                          {station.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{station.label}</CardTitle>
                          <p className="text-sm text-muted-foreground">{station.department}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge 
                          className={`${getStatusColor(station.status)} text-white text-xs`}
                        >
                          {getStatusText(station.status)}
                        </Badge>
                        {station.userCount && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Users className="w-3 h-3 mr-1" />
                            {station.userCount}人在线
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {station.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">工作站</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant={station.status === "active" ? "default" : "secondary"}
                        disabled={station.status === "offline"}
                      >
                        {station.status === "offline" ? "离线" : "进入"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* 统计信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                工作站统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {workStations.filter(s => s.status === "active").length}
                  </div>
                  <div className="text-sm text-muted-foreground">运行中</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {workStations.filter(s => s.status === "maintenance").length}
                  </div>
                  <div className="text-sm text-muted-foreground">维护中</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {workStations.filter(s => s.status === "offline").length}
                  </div>
                  <div className="text-sm text-muted-foreground">离线</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {workStations.reduce((sum, s) => sum + (s.userCount || 0), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">总在线人数</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
