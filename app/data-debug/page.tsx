'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// 日期格式化函数（与主组件保持一致）
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function DataDebugPage() {
  const [date, setDate] = useState<Date>();
  const [incomingData, setIncomingData] = useState('');
  const [productionData, setProductionData] = useState('');
  const [outgoingData, setOutgoingData] = useState('');
  const [debugResult, setDebugResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const runDataDebug = async () => {
    setIsLoading(true);
    setDebugResult('开始数据调试...\n');

    try {
      let result = '=== 数据流调试报告 ===\n\n';

      // 1. 前端数据验证
      result += '1. 前端数据收集:\n';
      result += `   日期选择: ${date ? date.toString() : '未选择'}\n`;
      result += `   日期ISO: ${date ? date.toISOString() : 'N/A'}\n`;
      result += `   格式化日期: ${date ? formatDate(date) : 'N/A'}\n`;
      result += `   进厂数据: "${incomingData}" (类型: ${typeof incomingData})\n`;
      result += `   生产数据: "${productionData}" (类型: ${typeof productionData})\n`;
      result += `   出厂数据: "${outgoingData}" (类型: ${typeof outgoingData})\n`;

      // 2. 数据转换
      result += '\n2. 数据转换:\n';
      const incomingNum = parseInt(incomingData);
      const productionNum = parseInt(productionData);
      const outgoingNum = parseInt(outgoingData);
      
      result += `   转换后进厂: ${incomingNum} (类型: ${typeof incomingNum}, 有效: ${!isNaN(incomingNum)})\n`;
      result += `   转换后生产: ${productionNum} (类型: ${typeof productionNum}, 有效: ${!isNaN(productionNum)})\n`;
      result += `   转换后出厂: ${outgoingNum} (类型: ${typeof outgoingNum}, 有效: ${!isNaN(outgoingNum)})\n`;

      // 3. 构建提交数据
      if (date) {
        const dataToSubmit = {
          '日期': formatDate(date),
          '进厂数据': incomingNum,
          '生产数据': productionNum,
          '出厂数据': outgoingNum,
        };

        result += '\n3. 构建的提交数据:\n';
        result += `   JSON字符串: ${JSON.stringify(dataToSubmit, null, 2)}\n`;
        result += `   字节长度: ${JSON.stringify(dataToSubmit).length}\n`;

        // 4. API调用测试
        result += '\n4. API调用测试:\n';
        try {
          const response = await fetch('/api/submit-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSubmit)
          });

          result += `   响应状态: ${response.status} ${response.statusText}\n`;
          result += `   响应头Content-Type: ${response.headers.get('content-type')}\n`;

          const responseData = await response.json();
          result += `   响应数据: ${JSON.stringify(responseData, null, 2)}\n`;

          if (responseData.success) {
            result += '   ✅ API调用成功\n';
          } else {
            result += '   ❌ API调用失败\n';
          }

        } catch (apiError) {
          result += `   ❌ API调用异常: ${apiError}\n`;
        }

        // 5. 数据库验证
        result += '\n5. 数据库验证:\n';
        try {
          const verifyResponse = await fetch('/api/test-supabase', {
            method: 'GET'
          });
          
          const verifyData = await verifyResponse.json();
          result += `   数据库查询状态: ${verifyResponse.status}\n`;
          result += `   最新数据: ${verifyData.responseText}\n`;
          
        } catch (verifyError) {
          result += `   ❌ 数据库验证失败: ${verifyError}\n`;
        }
      } else {
        result += '\n❌ 请先选择日期\n';
      }

      setDebugResult(result);

    } catch (error) {
      setDebugResult(`调试异常: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>数据流调试工具</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 日期选择 */}
          <div className="space-y-2">
            <Label>日期</Label>
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
                  {date ? format(date, "yyyy-MM-dd") : "选择日期"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* 数据输入 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>进厂数据</Label>
              <Input
                type="number"
                value={incomingData}
                onChange={(e) => setIncomingData(e.target.value)}
                placeholder="输入进厂数据"
              />
            </div>
            <div className="space-y-2">
              <Label>生产数据</Label>
              <Input
                type="number"
                value={productionData}
                onChange={(e) => setProductionData(e.target.value)}
                placeholder="输入生产数据"
              />
            </div>
            <div className="space-y-2">
              <Label>出厂数据</Label>
              <Input
                type="number"
                value={outgoingData}
                onChange={(e) => setOutgoingData(e.target.value)}
                placeholder="输入出厂数据"
              />
            </div>
          </div>

          <Button 
            onClick={runDataDebug}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? '调试中...' : '🔍 开始数据流调试'}
          </Button>

          {debugResult && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{debugResult}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
