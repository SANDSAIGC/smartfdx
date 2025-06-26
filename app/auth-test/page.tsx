"use client";

import { useState } from 'react';
import { useUser } from '@/lib/contexts/user-context';
import { usePageAuth, useSilentAuth } from '@/lib/hooks/use-auto-login';
import { SessionStatus, SessionBadge, SessionDetails } from '@/components/session-status';
import { AuthGuard } from '@/components/auth-guard';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, 
  User, 
  Clock, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Home
} from 'lucide-react';
import Link from 'next/link';

export default function AuthTestPage() {
  const { user, session, isAuthenticated, isLoading, logout, refreshSession, checkAuthStatus } = useUser();
  const pageAuth = usePageAuth(false); // 不强制要求登录
  const silentAuth = useSilentAuth();
  
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runAuthTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    try {
      addTestResult('开始认证系统测试...');
      
      // 测试1: 检查用户状态
      addTestResult(`用户状态: ${user ? '已登录' : '未登录'}`);
      if (user) {
        addTestResult(`用户信息: ${user.姓名} (${user.账号})`);
      }
      
      // 测试2: 检查会话状态
      addTestResult(`会话状态: ${session ? '存在' : '不存在'}`);
      if (session) {
        const now = Date.now();
        const isExpired = now > session.expiresAt;
        addTestResult(`会话过期状态: ${isExpired ? '已过期' : '有效'}`);
        addTestResult(`剩余时间: ${Math.floor((session.expiresAt - now) / 1000 / 60)} 分钟`);
      }
      
      // 测试3: 检查认证状态
      const authStatus = await checkAuthStatus();
      addTestResult(`认证检查结果: ${authStatus ? '通过' : '失败'}`);
      
      // 测试4: 测试会话刷新
      if (session) {
        const refreshResult = await refreshSession();
        addTestResult(`会话刷新结果: ${refreshResult ? '成功' : '失败'}`);
      }
      
      // 测试5: 检查localStorage
      const storedUser = localStorage.getItem('fdx_user_data');
      const storedSession = localStorage.getItem('fdx_session_data');
      addTestResult(`localStorage用户数据: ${storedUser ? '存在' : '不存在'}`);
      addTestResult(`localStorage会话数据: ${storedSession ? '存在' : '不存在'}`);
      
      addTestResult('认证系统测试完成!');
    } catch (error) {
      addTestResult(`测试错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  const clearTests = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <Home className="h-5 w-5" />
              <span className="font-semibold">首页</span>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-xl font-bold">认证系统测试</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <SessionBadge />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：认证状态概览 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  认证状态概览
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>认证状态</span>
                  <Badge variant={isAuthenticated ? "default" : "secondary"}>
                    {isAuthenticated ? "已认证" : "未认证"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>加载状态</span>
                  <Badge variant={isLoading ? "outline" : "secondary"}>
                    {isLoading ? "加载中" : "已完成"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>页面认证</span>
                  <Badge variant={pageAuth.isAuthenticated ? "default" : "secondary"}>
                    {pageAuth.isAuthenticated ? "通过" : "未通过"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>静默认证</span>
                  <Badge variant={silentAuth.isAuthenticated ? "default" : "secondary"}>
                    {silentAuth.isAuthenticated ? "通过" : "未通过"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* 会话详情 */}
            {isAuthenticated && <SessionDetails />}
          </div>

          {/* 右侧：测试和详细信息 */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="tests" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tests">功能测试</TabsTrigger>
                <TabsTrigger value="details">详细信息</TabsTrigger>
                <TabsTrigger value="storage">存储状态</TabsTrigger>
              </TabsList>

              <TabsContent value="tests" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>认证系统功能测试</CardTitle>
                    <CardDescription>
                      测试持久化登录状态管理系统的各项功能
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button 
                        onClick={runAuthTests} 
                        disabled={isRunningTests}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className={`h-4 w-4 ${isRunningTests ? 'animate-spin' : ''}`} />
                        运行测试
                      </Button>
                      <Button variant="outline" onClick={clearTests}>
                        清除结果
                      </Button>
                    </div>

                    {testResults.length > 0 && (
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-medium mb-2">测试结果:</h4>
                        <div className="space-y-1 text-sm font-mono">
                          {testResults.map((result, index) => (
                            <div key={index} className="text-muted-foreground">
                              {result}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>详细信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">用户信息</h4>
                        <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                          {JSON.stringify(user, null, 2)}
                        </pre>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">会话信息</h4>
                        <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                          {JSON.stringify(session, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="storage" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>本地存储状态</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {['fdx_user_data', 'fdx_session_data', 'fdx_remember_me'].map(key => {
                      const value = localStorage.getItem(key);
                      return (
                        <div key={key}>
                          <h4 className="font-medium mb-2">{key}</h4>
                          <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                            {value || '(空)'}
                          </pre>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
