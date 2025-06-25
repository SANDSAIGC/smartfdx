'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NetworkTestPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const runNetworkTest = async () => {
    setIsLoading(true);
    setTestResult('开始网络测试...\n');

    try {
      let result = '=== 网络连接详细测试 ===\n\n';

      // 测试1: 基本网络连接
      result += '1. 测试基本网络连接...\n';
      try {
        const basicResponse = await fetch('http://132.232.143.210:28000/', {
          method: 'GET',
        });
        result += `   状态: ${basicResponse.status} ${basicResponse.statusText}\n`;
        result += `   可访问: ${basicResponse.ok ? '✅' : '❌'}\n`;
      } catch (error) {
        result += `   ❌ 连接失败: ${error}\n`;
      }

      // 测试2: API路由测试
      result += '\n2. 测试API路由...\n';
      try {
        const apiResponse = await fetch('/api/test-supabase', {
          method: 'GET',
        });
        const apiResult = await apiResponse.json();
        result += `   API状态: ${apiResponse.status}\n`;
        result += `   API结果: ${JSON.stringify(apiResult, null, 2)}\n`;
      } catch (error) {
        result += `   ❌ API测试失败: ${error}\n`;
      }

      // 测试3: 直接Supabase连接
      result += '\n3. 测试直接Supabase连接...\n';
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!anonKey) {
        result += '   ❌ 环境变量ANON_KEY缺失\n';
      } else {
        try {
          const supabaseResponse = await fetch('http://132.232.143.210:28000/rest/v1/demo?select=*&limit=1', {
            method: 'GET',
            headers: {
              'apikey': anonKey,
              'Authorization': `Bearer ${anonKey}`,
              'Content-Type': 'application/json',
            }
          });
          
          result += `   状态: ${supabaseResponse.status} ${supabaseResponse.statusText}\n`;
          
          if (supabaseResponse.ok) {
            const data = await supabaseResponse.json();
            result += `   ✅ 成功获取数据: ${JSON.stringify(data, null, 2)}\n`;
          } else {
            const errorText = await supabaseResponse.text();
            result += `   ❌ 错误: ${errorText}\n`;
          }
        } catch (error) {
          result += `   ❌ 连接异常: ${error}\n`;
        }
      }

      // 测试4: POST请求测试
      result += '\n4. 测试POST请求...\n';
      if (anonKey) {
        try {
          const testData = {
            '日期': '2024-12-26',
            '进厂数据': 999,
            '生产数据': 888,
            '出厂数据': 777
          };

          const postResponse = await fetch('http://132.232.143.210:28000/rest/v1/demo', {
            method: 'POST',
            headers: {
              'apikey': anonKey,
              'Authorization': `Bearer ${anonKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(testData)
          });

          result += `   POST状态: ${postResponse.status} ${postResponse.statusText}\n`;
          
          if (postResponse.ok) {
            const data = await postResponse.json();
            result += `   ✅ POST成功: ${JSON.stringify(data, null, 2)}\n`;
          } else {
            const errorText = await postResponse.text();
            result += `   ❌ POST错误: ${errorText}\n`;
          }
        } catch (error) {
          result += `   ❌ POST异常: ${error}\n`;
        }
      }

      setTestResult(result);

    } catch (error) {
      setTestResult(`测试异常: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>网络连接详细测试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runNetworkTest}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? '测试中...' : '🔍 开始网络测试'}
          </Button>

          {testResult && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
