"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser, getUserDisplayName, getTimeGreeting } from '@/lib/contexts/user-context';
import { User, LogOut, Clock } from 'lucide-react';

export default function TestUserUIPage() {
  const { user, logout, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">用户界面测试页面</h1>
        <Button variant="outline" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />
          退出登录
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用户状态信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <span className="font-semibold">
                  {getTimeGreeting()}，{getUserDisplayName(user)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">账号：</span>
                  <span>{user.账号}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">姓名：</span>
                  <span>{user.姓名}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">部门：</span>
                  <span>{user.部门}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">职称：</span>
                  <span>{user.职称}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">工作页面：</span>
                  <span>{user.工作页面}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">状态：</span>
                  <Badge variant="outline">{user.状态}</Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">未登录用户</p>
              <Button className="mt-4" onClick={() => window.location.href = '/auth/login'}>
                前往登录
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>功能测试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>当前时间问候语：{getTimeGreeting()}</span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/lab'}
              disabled={!user}
            >
              访问实验室页面
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/auth/login'}
            >
              访问登录页面
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>原始用户数据</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
