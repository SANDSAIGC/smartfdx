"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DatePicker } from "@/components/ui/date-picker";

interface DemoRecord {
  id: string;
  日期: string;
  进厂数据: number;
  生产数据: number;
  出厂数据: number;
  created_at: string;
}

// 简单的日期格式化函数
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 格式化显示日期
function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日`;
}

interface DataDisplayCardProps {
  refreshTrigger?: number;
}

export function DataDisplayCard({ refreshTrigger }: DataDisplayCardProps) {
  const [date, setDate] = useState<Date>();
  const [records, setRecords] = useState<DemoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchData = async (selectedDate: Date) => {
    setIsLoading(true);

    try {
      console.log('=== 开始获取数据 ===');
      const dateString = formatDate(selectedDate);
      console.log('查询日期:', dateString);

      // 使用API路由获取数据
      const response = await fetch(`/api/get-data?date=${encodeURIComponent(dateString)}&limit=50`);
      console.log('API响应状态:', response.status, response.statusText);

      const result = await response.json();
      console.log('API响应数据:', result);

      if (!result.success) {
        throw new Error(`数据获取失败: ${result.error || '未知错误'}`);
      }

      console.log('获取到数据条数:', result.count);
      setRecords(result.data || []);

    } catch (error) {
      console.error('获取数据失败:', error);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取所有数据
  const fetchAllData = async () => {
    setIsLoading(true);

    try {
      console.log('=== 开始获取所有数据 ===');

      // 使用API路由获取所有数据（不指定日期）
      const response = await fetch('/api/get-data?limit=100');
      console.log('API响应状态:', response.status, response.statusText);

      const result = await response.json();
      console.log('API响应数据:', result);

      if (!result.success) {
        throw new Error(`数据获取失败: ${result.error || '未知错误'}`);
      }

      console.log('获取到所有数据条数:', result.count);
      setRecords(result.data || []);

    } catch (error) {
      console.error('获取所有数据失败:', error);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 当日期改变时获取数据
  useEffect(() => {
    if (date) {
      fetchData(date);
    }
  }, [date]);

  // 当数据录入成功后刷新当前选中日期的数据
  useEffect(() => {
    if (refreshTrigger && date) {
      fetchData(date);
    }
  }, [refreshTrigger, date]);

  // 初始加载所有数据
  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>数据查询与展示</CardTitle>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">选择查询日期</label>
            <div className="flex gap-2">
              <DatePicker
                date={date}
                onSelect={setDate}
                placeholder="选择查询日期"
                className="w-full md:w-[280px]"
              />
              <Button
                onClick={fetchAllData}
                variant="outline"
                disabled={isLoading}
              >
                {isLoading ? '加载中...' : '显示所有数据'}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {!date ? (
          <div className="text-center py-8 text-muted-foreground">
            请选择日期以查看数据
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            所选日期暂无数据
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>进厂数据</TableHead>
                  <TableHead>生产数据</TableHead>
                  <TableHead>出厂数据</TableHead>
                  <TableHead>记录时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.进厂数据}
                    </TableCell>
                    <TableCell>{record.生产数据}</TableCell>
                    <TableCell>{record.出厂数据}</TableCell>
                    <TableCell>
                      {isMounted ? new Date(record.created_at).toLocaleTimeString('zh-CN', { hour12: false }) : "--:--:--"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
