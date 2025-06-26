"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useUser } from "@/lib/contexts/user-context";
import { User, LogOut, ArrowRight, Clock, Building, Phone, IdCard, Shield, MessageCircle } from "lucide-react";
import { AvatarSelector } from "@/components/avatar-selector";

interface LoggedInInterfaceProps {
  showActions?: boolean; // 是否显示操作按钮
}

interface AvatarData {
  type: 'preset' | 'upload' | 'generated';
  value: string;
  color?: string;
}

export function LoggedInInterface({ showActions = true }: LoggedInInterfaceProps) {
  const { user, session, logout } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userAvatar, setUserAvatar] = useState<AvatarData | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // 在组件挂载时加载用户头像偏好
  useEffect(() => {
    if (user?.账号) {
      const savedAvatar = loadUserAvatar();
      if (savedAvatar) {
        setUserAvatar(savedAvatar);
      }
    }
  }, [user?.账号]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    console.log('🚪 [已登录界面] 开始登出流程...');
    
    try {
      // 执行登出
      logout();
      console.log('✅ [已登录界面] 登出成功');
      
      // 可选：显示登出成功消息
      // 页面会自动刷新显示登录表单
    } catch (error) {
      console.error('❌ [已登录界面] 登出失败:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleContinueToWorkspace = async () => {
    console.log('🚀 [已登录界面] 继续到工作区...');

    // 优先检查是否有重定向参数（用户原本想访问的页面）
    const redirectParam = searchParams.get('redirect');
    if (redirectParam) {
      console.log('🎯 [已登录界面] 发现重定向参数，返回原始访问页面:', redirectParam);
      router.push(redirectParam);
      return;
    }

    // 如果没有重定向参数，则使用用户的默认工作页面
    if (user?.工作页面) {
      console.log('🔄 [已登录界面] 查询工作页面路由:', user.工作页面);

      try {
        // 查询工作页面表获取正确的路由
        const response = await fetch('/api/get-workspace-route', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workspaceName: user.工作页面
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.route) {
            console.log('✅ [已登录界面] 获取到工作页面路由:', data.route);
            router.push(data.route);
            return;
          }
        }

        console.warn('⚠️ [已登录界面] 工作页面路由查询失败，使用默认路由');
      } catch (error) {
        console.error('❌ [已登录界面] 工作页面路由查询异常:', error);
      }
    }

    // 默认重定向到demo页面
    console.log('🔄 [已登录界面] 使用默认重定向到 /demo');
    router.push('/demo');
  };



  const handleAvatarSelect = async (avatarData: AvatarData) => {
    console.log('🎨 [头像选择] 用户选择了新头像:', avatarData);

    try {
      // 保存头像偏好到本地存储
      const avatarKey = `fdx_user_avatar_${user?.账号}`;
      localStorage.setItem(avatarKey, JSON.stringify(avatarData));

      // 更新状态
      setUserAvatar(avatarData);

      console.log('✅ [头像选择] 头像偏好已保存');
    } catch (error) {
      console.error('❌ [头像选择] 保存头像偏好失败:', error);
    }
  };

  // 加载用户头像偏好
  const loadUserAvatar = () => {
    if (!user?.账号) return null;

    try {
      const avatarKey = `fdx_user_avatar_${user.账号}`;
      const savedAvatar = localStorage.getItem(avatarKey);

      if (savedAvatar) {
        const avatarData = JSON.parse(savedAvatar) as AvatarData;
        setUserAvatar(avatarData);
        return avatarData;
      }
    } catch (error) {
      console.error('❌ [头像加载] 加载头像偏好失败:', error);
    }

    return null;
  };

  // 渲染头像内容
  const renderAvatarContent = () => {
    const savedAvatar = userAvatar;

    if (savedAvatar) {
      switch (savedAvatar.type) {
        case 'preset':
        case 'upload':
          return <AvatarImage src={savedAvatar.value} alt="用户头像" />;
        case 'generated':
          return (
            <AvatarFallback className={`${savedAvatar.color} text-white text-lg font-semibold`}>
              {savedAvatar.value}
            </AvatarFallback>
          );
      }
    }

    // 默认头像
    return (
      <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
        {user?.姓名?.charAt(0) || user?.账号?.charAt(0) || 'U'}
      </AvatarFallback>
    );
  };

  const formatSessionTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSessionTimeRemaining = () => {
    if (!session?.expiresAt) return null;
    
    const now = Date.now();
    const remaining = session.expiresAt - now;
    
    if (remaining <= 0) return '已过期';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    } else {
      return `${minutes}分钟`;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      {/* 员工卡片头部 - 使用shadcn/ui原生组件 */}
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          {/* 头像区域 - 可点击的头像选择器 */}
          <div className="w-16">
            <AvatarSelector
              currentAvatar={userAvatar?.value}
              userName={user.姓名 || user.账号 || 'User'}
              onAvatarSelect={handleAvatarSelect}
            >
              <div className="cursor-pointer hover:opacity-80 transition-opacity">
                <AspectRatio ratio={1} className="bg-muted rounded-full overflow-hidden">
                  <Avatar className="w-full h-full">
                    {renderAvatarContent()}
                  </Avatar>
                </AspectRatio>
              </div>
            </AvatarSelector>
          </div>

          {/* 基本信息 */}
          <div className="flex-1 space-y-3">
            <h2 className="text-xl font-bold">{user.姓名}</h2>

            {/* 部门信息 - 蓝色系Badge */}
            {user.部门 && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-blue-600" />
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                >
                  {user.部门}
                </Badge>
              </div>
            )}

            {/* 职称信息 - 绿色系Badge */}
            {user.职称 && (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                >
                  {user.职称}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pb-8 space-y-6">
        {/* 员工详细信息 */}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <IdCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">员工账号</p>
              <p className="font-medium">{user.账号}</p>
            </div>
          </div>

          {user.电话 && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">电话号码</p>
                <p className="font-medium">{user.电话}</p>
              </div>
            </div>
          )}

          {user.微信 && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">微信</p>
                <p className="font-medium">{user.微信}</p>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* 会话信息 */}
        {session && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              会话信息
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">登录时间</span>
                <span>{formatSessionTime(session.loginTime)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">剩余时间</span>
                <span>{getSessionTimeRemaining()}</span>
              </div>
              
              {localStorage.getItem('fdx_remember_me') === 'true' && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">记住登录</span>
                  <Badge variant="outline" className="text-xs">已启用</Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {showActions && (
          <>
            <Separator />

            {/* 操作按钮 */}
            <div className="space-y-3">
              <Button
                onClick={handleContinueToWorkspace}
                className="w-full"
                size="lg"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                继续到工作区
              </Button>

              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full"
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isLoggingOut ? "登出中..." : "登出"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
