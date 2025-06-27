"use client";

import React, { useState, useEffect } from "react";
import { WorkspaceNavigation } from "@/components/workspace-navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FooterSignature } from "@/components/footer-signature";
import { 
  Clock, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  XCircle,
  Info,
  User,
  Building
} from "lucide-react";
import { useUser } from "@/lib/contexts/user-context";

interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'present' | 'absent' | 'late' | 'early_leave';
  location?: string;
}

export function AttendancePage() {
  const { user } = useUser();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 模拟获取今日考勤记录
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    // 这里应该从数据库获取今日考勤记录
    // 暂时使用模拟数据
    const mockRecord: AttendanceRecord = {
      id: '1',
      date: today,
      checkInTime: undefined,
      checkOutTime: undefined,
      status: 'absent',
      location: '化验室'
    };
    setTodayRecord(mockRecord);
  }, []);

  const handleCheckIn = async () => {
    setIsLoading(true);
    try {
      // 模拟打卡操作
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const now = new Date();
      const timeString = now.toLocaleTimeString('zh-CN', { hour12: false });
      
      if (todayRecord) {
        const updatedRecord = {
          ...todayRecord,
          checkInTime: timeString,
          status: 'present' as const
        };
        setTodayRecord(updatedRecord);
        setIsCheckedIn(true);
      }
    } catch (error) {
      console.error('打卡失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    try {
      // 模拟下班打卡操作
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const now = new Date();
      const timeString = now.toLocaleTimeString('zh-CN', { hour12: false });
      
      if (todayRecord) {
        const updatedRecord = {
          ...todayRecord,
          checkOutTime: timeString
        };
        setTodayRecord(updatedRecord);
      }
    } catch (error) {
      console.error('下班打卡失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">正常</Badge>;
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">迟到</Badge>;
      case 'early_leave':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200">早退</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200">缺勤</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <WorkspaceNavigation />
            <Clock className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">考勤打卡</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 当前时间显示 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              当前时间
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {currentTime.toLocaleTimeString('zh-CN', { hour12: false })}
              </div>
              <div className="text-lg text-muted-foreground">
                {currentTime.toLocaleDateString('zh-CN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'long'
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 员工信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              员工信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">姓名:</span>
                <span className="font-medium">{user?.姓名 || '未知'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">部门:</span>
                <span className="font-medium">{user?.部门 || '未知'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">职位:</span>
                <span className="font-medium">{user?.职位 || '未知'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 今日考勤状态 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              今日考勤状态
            </CardTitle>
            <CardDescription>
              查看今日的打卡记录和考勤状态
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayRecord ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">考勤状态:</span>
                  {getStatusBadge(todayRecord.status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">上班打卡:</span>
                    <span className="font-medium">
                      {todayRecord.checkInTime || '未打卡'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">下班打卡:</span>
                    <span className="font-medium">
                      {todayRecord.checkOutTime || '未打卡'}
                    </span>
                  </div>
                </div>

                {todayRecord.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">打卡地点:</span>
                    <span className="font-medium">{todayRecord.location}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                暂无今日考勤记录
              </div>
            )}
          </CardContent>
        </Card>

        {/* 打卡操作 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              打卡操作
            </CardTitle>
            <CardDescription>
              点击按钮进行上班或下班打卡
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleCheckIn}
                disabled={isLoading || (todayRecord?.checkInTime !== undefined)}
                className="flex items-center gap-2"
                size="lg"
              >
                <CheckCircle className="h-4 w-4" />
                {isLoading ? '打卡中...' : '上班打卡'}
              </Button>
              
              <Button
                onClick={handleCheckOut}
                disabled={isLoading || !todayRecord?.checkInTime || todayRecord?.checkOutTime !== undefined}
                variant="outline"
                className="flex items-center gap-2"
                size="lg"
              >
                <XCircle className="h-4 w-4" />
                {isLoading ? '打卡中...' : '下班打卡'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 提示信息 */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            考勤系统正在开发中，当前为演示版本。实际使用时将连接到考勤数据库，支持GPS定位打卡、人脸识别等功能。
          </AlertDescription>
        </Alert>
      </div>

      {/* 底部签名 */}
      <FooterSignature />
    </div>
  );
}
