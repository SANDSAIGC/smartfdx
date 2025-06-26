"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function TestLoginPage() {
  const [account, setAccount] = useState("lab001");
  const [password, setPassword] = useState("password");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testLogin = async (apiEndpoint: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: account,
          password: password
        }),
      });

      const data = await response.json();
      setResult({
        status: response.status,
        data: data,
        endpoint: apiEndpoint
      });
    } catch (error) {
      setResult({
        status: 'ERROR',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        endpoint: apiEndpoint
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>登录API测试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="account">账号</Label>
            <Input
              id="account"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="输入账号"
            />
          </div>
          
          <div>
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
            />
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => testLogin('/api/auth/login')}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "测试中..." : "测试原始登录API"}
            </Button>

            <Button
              onClick={() => testLogin('/api/test-auth')}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? "测试中..." : "测试调试API"}
            </Button>
          </div>

          {result && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">测试结果:</h3>
              <div className="bg-muted p-4 rounded-lg">
                <div className="mb-2">
                  <strong>API端点:</strong> {result.endpoint}
                </div>
                <div className="mb-2">
                  <strong>状态码:</strong> {result.status}
                </div>
                <div>
                  <strong>响应数据:</strong>
                  <pre className="mt-2 text-sm overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-semibold mb-2">测试说明:</h4>
            <ul className="text-sm space-y-1">
              <li>• 默认测试账号: lab001</li>
              <li>• 默认密码: password</li>
              <li>• 预期重定向: /lab</li>
              <li>• 用户姓名: 楚留香</li>
              <li>• 部门: 化验室</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
