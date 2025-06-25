"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { createClient, createServiceClient } from "@/lib/supabase/client";
import { diagnoseNetworkConnection } from "@/lib/network-diagnostics";
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
      const supabase = createClient();

      // 验证Supabase配置
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('Supabase ANON KEY长度:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length);
      console.log('Supabase客户端已创建');

      // 准备数据（移到前面，供备用方案使用）
      const dataToInsert = {
        '日期': formatDate(date),
        '进厂数据': incomingNum,
        '生产数据': productionNum,
        '出厂数据': outgoingNum,
      };

      // 运行完整的网络诊断
      console.log('开始网络诊断...');
      const diagnostics = await diagnoseNetworkConnection();

      if (!diagnostics.authentication) {
        console.log('anon key认证失败，尝试使用service key...');

        // 备用方案：使用service key
        try {
          const serviceClient = createServiceClient();
          const testResult = await serviceClient
            .from('demo')
            .select('count')
            .limit(1);

          if (testResult.error) {
            throw new Error(`Service key也失败: ${testResult.error.message}`);
          }

          console.log('Service key测试成功，使用service key提交数据');
          // 使用service client继续
          const supabase = serviceClient;

          const { data, error } = await supabase
            .from('demo')
            .insert(dataToInsert)
            .select();

          if (error) {
            throw new Error(`Service key提交失败: ${error.message}`);
          }

          console.log('使用Service key数据提交成功:', data);
          alert("数据提交成功（使用备用认证）");

          // 清空表单
          setDate(undefined);
          setIncomingData("");
          setProductionData("");
          setOutgoingData("");

          onDataSubmitted?.();
          return; // 成功退出

        } catch (serviceError) {
          console.error('Service key也失败:', serviceError);
          throw new Error('所有认证方式都失败，请检查控制台详细信息');
        }
      }

      console.log('网络诊断通过，继续数据提交...');


      console.log('准备提交的数据:', dataToInsert);

      const { data, error } = await supabase
        .from('demo')
        .insert(dataToInsert)
        .select();

      if (error) {
        console.error('Supabase错误详情:', error);

        // 处理特定的认证错误
        if (error.message.includes('Invalid authentication credentials')) {
          throw new Error('认证失败：请检查API密钥配置');
        }
        if (error.message.includes('JWT')) {
          throw new Error('认证令牌错误：请重新配置认证信息');
        }
        if (error.message.includes('permission')) {
          throw new Error('权限不足：无法写入数据库');
        }
        if (error.message.includes('RLS')) {
          throw new Error('数据库安全策略错误：请检查RLS配置');
        }

        throw new Error(`数据库错误: ${error.message}`);
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
          <div className="space-y-2">
            <Label>日期</Label>
            <DatePicker
              date={date}
              onSelect={setDate}
              placeholder="选择日期"
            />
          </div>

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
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "提交中..." : "提交数据"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
