"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function DebugLoginPage() {
  const [account, setAccount] = useState("lab001");
  const [password, setPassword] = useState("password");
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const debugLogin = async () => {
    setIsLoading(true);
    setLogs([]);
    
    addLog("开始登录流程");
    addLog(`账号: ${account}, 密码: ${password}`);

    try {
      addLog("发送登录请求...");
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: account,
          password: password
        }),
      });

      addLog(`响应状态: ${response.status}`);

      const result = await response.json();
      addLog(`响应数据: ${JSON.stringify(result, null, 2)}`);

      if (!result.success) {
        addLog(`登录失败: ${result.message}`);
        return;
      }

      addLog("登录成功!");
      
      if (result.redirectUrl) {
        addLog(`准备重定向到: ${result.redirectUrl}`);
        
        // 延迟重定向，让用户看到日志
        setTimeout(() => {
          addLog("执行重定向...");
          router.push(result.redirectUrl);
        }, 2000);
      } else {
        addLog("没有重定向URL，使用默认页面");
        setTimeout(() => {
          router.push('/demo');
        }, 2000);
      }

    } catch (error) {
      addLog(`请求错误: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testRedirect = () => {
    addLog("直接测试重定向到 /lab");
    router.push('/lab');
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>登录调试工具</CardTitle>
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
              onClick={debugLogin} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "登录中..." : "调试登录"}
            </Button>
            
            <Button 
              onClick={testRedirect} 
              variant="outline"
              className="w-full"
            >
              直接测试重定向到 /lab
            </Button>
          </div>

          {logs.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">调试日志:</h3>
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-semibold mb-2">调试说明:</h4>
            <ul className="text-sm space-y-1">
              <li>• 这个页面会显示详细的登录流程日志</li>
              <li>• 登录成功后会延迟2秒再重定向</li>
              <li>• 可以直接测试重定向功能</li>
              <li>• 检查浏览器控制台获取更多信息</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
