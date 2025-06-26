"use client";

import React, { useState, useEffect } from "react";
import { createClient, createServiceClient } from "@/lib/supabase/client";
import { SubmitLoading } from "@/components/loading-transition";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
// import { toast } from "sonner";

interface DataEntryCardProps {
  onDataSubmitted?: () => void;
}

// 简单的日期格式化函数
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DataEntryCard({ onDataSubmitted }: DataEntryCardProps) {
  const [date, setDate] = useState<Date>();
  const [incomingData, setIncomingData] = useState("");
  const [productionData, setProductionData] = useState("");
  const [outgoingData, setOutgoingData] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 防止SSR不匹配
  if (!isMounted) {
    return <div>加载中...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      alert("请选择日期");
      return;
    }

    if (!incomingData || !productionData || !outgoingData) {
      alert("请填写所有数据字段");
      return;
    }

    // 验证数据格式
    const incomingNum = parseInt(incomingData);
    const productionNum = parseInt(productionData);
    const outgoingNum = parseInt(outgoingData);

    if (isNaN(incomingNum) || isNaN(productionNum) || isNaN(outgoingNum)) {
      alert("请输入有效的数字");
      return;
    }

    if (incomingNum < 0 || productionNum < 0 || outgoingNum < 0) {
      alert("数据不能为负数");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('=== 数据提交流程开始 ===');
      console.log('1. 原始输入数据:');
      console.log('   选择的日期对象:', date);
      console.log('   日期的ISO字符串:', date.toISOString());
      console.log('   日期的本地字符串:', date.toLocaleDateString());
      console.log('   进厂数据输入:', incomingData, '(类型:', typeof incomingData, ')');
      console.log('   生产数据输入:', productionData, '(类型:', typeof productionData, ')');
      console.log('   出厂数据输入:', outgoingData, '(类型:', typeof outgoingData, ')');

      console.log('2. 数据转换:');
      const formattedDate = formatDate(date);
      console.log('   格式化后的日期:', formattedDate);
      console.log('   转换后的数字:', { incomingNum, productionNum, outgoingNum });

      // 准备最终提交的数据
      const dataToInsert = {
        '日期': formattedDate,
        '进厂数据': incomingNum,
        '生产数据': productionNum,
        '出厂数据': outgoingNum,
      };

      console.log('3. 最终提交数据:', dataToInsert);
      console.log('   数据类型检查:');
      console.log('   - 日期类型:', typeof dataToInsert['日期'], '值:', dataToInsert['日期']);
      console.log('   - 进厂数据类型:', typeof dataToInsert['进厂数据'], '值:', dataToInsert['进厂数据']);
      console.log('   - 生产数据类型:', typeof dataToInsert['生产数据'], '值:', dataToInsert['生产数据']);
      console.log('   - 出厂数据类型:', typeof dataToInsert['出厂数据'], '值:', dataToInsert['出厂数据']);

      // 使用API路由提交数据
      console.log('4. 开始API路由提交...');

      try {
        console.log('5. 发送API请求...');
        const response = await fetch('/api/submit-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToInsert)
        });

        console.log('6. API响应状态:', response.status, response.statusText);

        const result = await response.json();
        console.log('7. API响应数据:', result);

        if (!result.success) {
          console.error('API提交失败详情:', result);
          throw new Error(`API提交失败: ${result.error || result.details || '未知错误'}`);
        }

        console.log('8. ✅ API路由提交成功:', result);
        alert("数据提交成功！");

        // 清空表单
        setDate(undefined);
        setIncomingData("");
        setProductionData("");
        setOutgoingData("");

        onDataSubmitted?.();
        return; // 成功退出

      } catch (apiError) {
        console.error('9. ❌ API路由提交失败:', apiError);
        throw new Error(`数据提交失败: ${apiError instanceof Error ? apiError.message : '未知错误'}`);
      }

      console.log('数据提交成功:', data);
      alert("数据提交成功");

      // 清空表单
      setDate(undefined);
      setIncomingData("");
      setProductionData("");
      setOutgoingData("");

      // 触发数据展示区刷新
      onDataSubmitted?.();

    } catch (error) {
      console.error('提交数据失败:', error);

      // 显示更详细的错误信息
      let errorMessage = "数据提交失败，请重试";
      if (error instanceof Error) {
        errorMessage = `提交失败: ${error.message}`;
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>数据录入</CardTitle>
        <CardDescription>
          选择日期并输入生产相关数据
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* 日期选择 */}
          <DatePicker
            date={date}
            onSelect={setDate}
            placeholder="请选择日期"
            label="日期"
          />

          {/* 数据输入字段 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="incoming">进厂数据</Label>
              <Input
                id="incoming"
                type="number"
                placeholder="请输入进厂数量"
                value={incomingData}
                onChange={(e) => setIncomingData(e.target.value)}
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="production">生产数据</Label>
              <Input
                id="production"
                type="number"
                placeholder="请输入生产数量"
                value={productionData}
                onChange={(e) => setProductionData(e.target.value)}
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="outgoing">出厂数据</Label>
              <Input
                id="outgoing"
                type="number"
                placeholder="请输入出厂数量"
                value={outgoingData}
                onChange={(e) => setOutgoingData(e.target.value)}
                min="0"
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <SubmitLoading />
                <span className="ml-2">提交中...</span>
              </div>
            ) : (
              "提交数据"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
