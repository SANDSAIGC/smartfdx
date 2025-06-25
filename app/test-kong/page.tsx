'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestKongPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [newKeys, setNewKeys] = useState<string>('');

  const testKongConnection = async () => {
    setIsLoading(true);
    setTestResult('开始详细诊断...\n');

    try {
      const supabaseUrl = 'http://132.232.143.210:28000';
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzUwNjk0NDAwLCJleHAiOjE5MDg0NjA4MDB9.1wMtd68DjY3b9BM82ynEuN2oi9KfS-FJvVLROVULq7w';

      let result = '=== Kong详细诊断报告 ===\n\n';
      result += `URL: ${supabaseUrl}\n`;
      result += `Key长度: ${anonKey.length}\n\n`;

      // 测试1: 基础连接（无认证）
      result += '1. 测试基础连接（无认证头部）...\n';
      try {
        const basicResponse = await fetch(`${supabaseUrl}/`, {
          method: 'GET',
        });
        result += `   状态: ${basicResponse.status} ${basicResponse.statusText}\n`;
        if (!basicResponse.ok) {
          const basicError = await basicResponse.text();
          result += `   错误: ${basicError}\n`;
        }
      } catch (error) {
        result += `   异常: ${error}\n`;
      }

      // 测试2: OPTIONS预检请求
      result += '\n2. 测试CORS预检请求...\n';
      try {
        const optionsResponse = await fetch(`${supabaseUrl}/rest/v1/demo`, {
          method: 'OPTIONS',
          headers: {
            'Origin': 'http://localhost:3000',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'apikey,authorization,content-type',
          }
        });
        result += `   状态: ${optionsResponse.status} ${optionsResponse.statusText}\n`;
        result += `   CORS头部:\n`;
        optionsResponse.headers.forEach((value, key) => {
          if (key.toLowerCase().includes('access-control')) {
            result += `     ${key}: ${value}\n`;
          }
        });
      } catch (error) {
        result += `   异常: ${error}\n`;
      }

      // 测试3: 带认证的GET请求
      result += '\n3. 测试带认证的API请求...\n';
      try {
        const authResponse = await fetch(`${supabaseUrl}/rest/v1/demo?select=*&limit=1`, {
          method: 'GET',
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });
        result += `   状态: ${authResponse.status} ${authResponse.statusText}\n`;

        if (authResponse.ok) {
          const data = await authResponse.json();
          result += `   ✅ 成功！数据: ${JSON.stringify(data)}\n`;
        } else {
          const errorText = await authResponse.text();
          result += `   ❌ 失败！错误: ${errorText}\n`;
        }
      } catch (error) {
        result += `   异常: ${error}\n`;
      }

      // 测试4: 验证JWT密钥
      result += '\n4. JWT密钥分析...\n';
      try {
        const jwtParts = anonKey.split('.');
        if (jwtParts.length === 3) {
          const payload = JSON.parse(atob(jwtParts[1]));
          result += `   JWT有效期: ${new Date(payload.exp * 1000).toLocaleString()}\n`;
          result += `   JWT角色: ${payload.role}\n`;
          result += `   JWT签发者: ${payload.iss}\n`;
          result += `   JWT签发时间: ${new Date(payload.iat * 1000).toLocaleString()}\n`;
        }
      } catch (error) {
        result += `   JWT解析失败: ${error}\n`;
      }

      setTestResult(result);

    } catch (error) {
      console.error('诊断异常:', error);
      setTestResult(`❌ 诊断异常: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewJWTKeys = () => {
    const jwtSecret = '6d4k6jQ2WgOB8SwjwzLGAdmIzkQyi2r3';

    function base64UrlEncode(str: string) {
      return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    }

    function createJWT(payload: any, secret: string) {
      const header = { alg: 'HS256', typ: 'JWT' };
      const encodedHeader = base64UrlEncode(JSON.stringify(header));
      const encodedPayload = base64UrlEncode(JSON.stringify(payload));

      // 简化的HMAC-SHA256签名（仅用于演示）
      const signature = base64UrlEncode(`${encodedHeader}.${encodedPayload}.${secret}`);
      return `${encodedHeader}.${encodedPayload}.${signature}`;
    }

    const now = Math.floor(Date.now() / 1000);
    const exp = now + (365 * 24 * 60 * 60); // 1年后过期

    const anonPayload = {
      role: 'anon',
      iss: 'supabase',
      iat: now,
      exp: exp
    };

    const servicePayload = {
      role: 'service_role',
      iss: 'supabase',
      iat: now,
      exp: exp
    };

    const newAnonKey = createJWT(anonPayload, jwtSecret);
    const newServiceKey = createJWT(servicePayload, jwtSecret);

    const result = `=== 新生成的JWT密钥 ===

JWT_SECRET: ${jwtSecret}

ANON_KEY:
${newAnonKey}

SERVICE_ROLE_KEY:
${newServiceKey}

=== 更新.env.local ===
NEXT_PUBLIC_SUPABASE_ANON_KEY=${newAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${newServiceKey}

注意：这些密钥使用简化算法生成，仅用于测试。
生产环境请使用官方JWT生成器。`;

    setNewKeys(result);
  };

  const testEnvironmentSync = async () => {
    setIsLoading(true);
    setTestResult('检查环境变量同步状态...\n');

    try {
      const supabaseUrl = 'http://132.232.143.210:28000';
      const frontendKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzUwODMxNTI0LCJleHAiOjE3ODIzNjc1MjR9.ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnliMnhsSWpvaVlXNXZiaUlzSW1semN5STZJbk4xY0dGaVlYTmxJaXdpYVdGMElqb3hOelV3T0RNeE5USTBMQ0psZUhBaU9qRTNPREl6TmpjMU1qUjkuNmQ0azZqUTJXZ09COFN3and6TEdBZG1JemtReWkycjM';

      let result = '=== 环境变量同步检查 ===\n\n';
      result += `前端使用的密钥: ${frontendKey.substring(0, 50)}...\n\n`;

      // 测试不同的密钥组合
      const testKeys = [
        {
          name: '当前前端密钥',
          key: frontendKey
        },
        {
          name: '原始MCP密钥',
          key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzUwNjk0NDAwLCJleHAiOjE5MDg0NjA4MDB9.1wMtd68DjY3b9BM82ynEuN2oi9KfS-FJvVLROVULq7w'
        }
      ];

      for (const testKey of testKeys) {
        result += `测试 ${testKey.name}:\n`;
        try {
          const response = await fetch(`${supabaseUrl}/rest/v1/demo?select=*&limit=1`, {
            method: 'GET',
            headers: {
              'apikey': testKey.key,
              'Authorization': `Bearer ${testKey.key}`,
              'Content-Type': 'application/json',
            }
          });

          if (response.ok) {
            const data = await response.json();
            result += `  ✅ 成功！状态: ${response.status}, 数据: ${JSON.stringify(data)}\n`;
          } else {
            const errorText = await response.text();
            result += `  ❌ 失败！状态: ${response.status}, 错误: ${errorText}\n`;
          }
        } catch (error) {
          result += `  ❌ 异常: ${error}\n`;
        }
        result += '\n';
      }

      result += '=== 诊断结论 ===\n';
      result += '如果原始MCP密钥成功而前端密钥失败，说明Kong容器环境变量未更新\n';
      result += '如果两个密钥都失败，说明Kong服务本身有问题\n';
      result += '如果两个密钥都成功，说明问题已解决\n';

      setTestResult(result);

    } catch (error) {
      setTestResult(`环境检查异常: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Kong配置测试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>此页面用于测试Kong网关的CORS配置是否生效</p>
            <p>URL: http://132.232.143.210:28000</p>
            <p>Key长度: 169</p>
            <p className="text-green-600">✅ 此页面无需登录，可直接访问</p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={testKongConnection}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? '测试中...' : '🔍 详细诊断Kong连接'}
            </Button>

            <Button
              onClick={generateNewJWTKeys}
              variant="outline"
              className="w-full"
            >
              🔑 生成新的JWT密钥
            </Button>

            <Button
              onClick={testEnvironmentSync}
              variant="secondary"
              className="w-full"
              disabled={isLoading}
            >
              🔄 检查环境变量同步
            </Button>
          </div>

          {testResult && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">诊断结果：</h3>
              <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
            </div>
          )}

          {newKeys && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">新生成的JWT密钥：</h3>
              <pre className="whitespace-pre-wrap text-sm text-blue-700 dark:text-blue-300">{newKeys}</pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Kong环境变量配置说明：</h3>
            <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-2">
              <p><strong>配置引用机制：</strong></p>
              <code className="block bg-yellow-100 dark:bg-yellow-800 p-2 rounded text-xs">
                kong.yml中的 $SUPABASE_ANON_KEY → Kong容器环境变量 → 宝塔.env文件
              </code>
              <p><strong>如果测试失败，需要检查：</strong></p>
              <ol className="list-decimal list-inside space-y-1">
                <li>宝塔面板中Kong容器的环境变量是否与.env文件一致</li>
                <li>Kong容器是否已重启以加载新的环境变量</li>
                <li>Docker Compose配置是否正确传递环境变量</li>
                <li>容器启动参数是否包含正确的环境变量映射</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
