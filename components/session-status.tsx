"use client";

import { useUser } from '@/lib/contexts/user-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, User, Shield, LogOut, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface SessionStatusProps {
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export function SessionStatus({ showDetails = false, compact = false, className = '' }: SessionStatusProps) {
  const { user, session, isAuthenticated, logout, refreshSession } = useUser();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSession();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const getTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const remaining = expiresAt - now;
    
    if (remaining <= 0) return '已过期';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    } else {
      return `${minutes}分钟`;
    }
  };

  if (!isAuthenticated || !user || !session) {
    return (
      <div className={`text-center ${className}`}>
        <Badge variant="secondary">未登录</Badge>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="default" className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {user.姓名 || user.账号}
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {getTimeRemaining(session.expiresAt)}
        </Badge>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5" />
          登录状态
        </CardTitle>
        <CardDescription>
          当前会话信息
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 用户信息 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">用户</span>
            <Badge variant="default">{user.姓名 || user.账号}</Badge>
          </div>
          
          {user.部门 && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">部门</span>
              <span className="text-sm text-muted-foreground">{user.部门}</span>
            </div>
          )}
          
          {user.职称 && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">职称</span>
              <span className="text-sm text-muted-foreground">{user.职称}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* 会话信息 */}
        {showDetails && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">登录时间</span>
              <span className="text-sm text-muted-foreground">
                {formatTime(session.loginTime)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">最后活动</span>
              <span className="text-sm text-muted-foreground">
                {formatTime(session.lastActivity)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">会话过期</span>
              <span className="text-sm text-muted-foreground">
                {formatTime(session.expiresAt)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">剩余时间</span>
              <Badge variant={session.expiresAt - Date.now() < 30 * 60 * 1000 ? "destructive" : "outline"}>
                {getTimeRemaining(session.expiresAt)}
              </Badge>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex-1"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            刷新会话
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={logout}
            className="flex-1"
          >
            <LogOut className="h-4 w-4 mr-2" />
            退出登录
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 简化版本的会话状态组件
export function SessionBadge({ className = '' }: { className?: string }) {
  return <SessionStatus compact={true} className={className} />;
}

// 详细版本的会话状态组件
export function SessionDetails({ className = '' }: { className?: string }) {
  return <SessionStatus showDetails={true} className={className} />;
}
