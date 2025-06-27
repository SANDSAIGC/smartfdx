"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/lib/contexts/user-context";
import { RouteManager } from "@/lib/route-config";
import { NavigationUtils } from "@/lib/navigation-utils";
import {
  Menu,
  User,
  Trophy,
  LogOut,
  Info,
  IdCard,
  Home,
  FlaskConical,
  Factory,
  Settings,
  BarChart3,
  FileText,
  Users,
  Clock,
  Filter,
  Beaker,
  Truck,
  ChevronRight,
  MapPin,
  Bell,
  AlertTriangle,
  UserCheck
} from "lucide-react";
import { LoggedInInterface } from "@/components/logged-in-interface";

export function WorkspaceNavigation() {
  const { user, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showPointsDialog, setShowPointsDialog] = useState(false);

  // 获取当前页面信息
  const currentRoute = RouteManager.getRouteByPath(pathname);
  const currentPageTitle = currentRoute?.title || '未知页面';

  // 工作区快捷导航配置
  const workspaceShortcuts = [
    {
      icon: Home,
      label: "首页",
      description: "返回系统首页",
      path: "/",
      category: "main"
    },
    {
      icon: FlaskConical,
      label: "化验室",
      description: "化验室工作空间",
      path: "/lab",
      category: "workspace"
    },
    {
      icon: Factory,
      label: "生产车间",
      description: "生产管理工作区",
      path: "/production-control",
      category: "workspace"
    },
    {
      icon: BarChart3,
      label: "数据中心",
      description: "数据分析与报表",
      path: "/data-table-center",
      category: "workspace"
    }
  ];

  // 样本记录快捷导航
  const sampleShortcuts = [
    {
      icon: Clock,
      label: "班样记录",
      description: "班次样品化验记录",
      path: "/shift-sample",
      category: "sample"
    },
    {
      icon: Filter,
      label: "压滤样记录",
      description: "压滤机样品化验记录",
      path: "/filter-sample",
      category: "sample"
    },
    {
      icon: Beaker,
      label: "进厂样记录",
      description: "进厂原矿化验记录",
      path: "/incoming-sample",
      category: "sample"
    },
    {
      icon: Truck,
      label: "出厂样记录",
      description: "出厂精矿化验记录",
      path: "/outgoing-sample",
      category: "sample"
    }
  ];

  // 导航处理函数
  const handleNavigation = async (path: string, label: string) => {
    console.log(`🧭 [工作区导航] 导航到: ${label} (${path})`);

    try {
      await NavigationUtils.navigateTo(router, path, {
        replace: false,
        validatePermission: false,
        onSuccess: () => {
          console.log(`✅ [工作区导航] 成功导航到: ${label}`);
        },
        onError: (error) => {
          console.error(`❌ [工作区导航] 导航失败:`, error);
        }
      });
    } catch (error) {
      console.error(`❌ [工作区导航] 导航异常:`, error);
      // 回退到简单导航
      router.push(path);
    }
  };

  const handleLogout = async () => {
    console.log('🚪 [导航菜单] 开始登出流程...');

    try {
      // 执行登出
      logout();
      console.log('✅ [导航菜单] 登出成功');

      // 重定向到登录页面
      router.push('/auth/login');
    } catch (error) {
      console.error('❌ [导航菜单] 登出失败:', error);
    }
  };

  const handleShowProfile = () => {
    console.log('👤 [导航菜单] 显示用户资料');
    setShowUserProfile(true);
  };

  const handleShowPoints = () => {
    console.log('🏆 [导航菜单] 显示积分功能');
    setShowPointsDialog(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-primary/10 hover:border-primary transition-colors relative"
            title="工作区导航菜单"
          >
            <Menu className="h-4 w-4" />
            {/* 当前页面指示器 */}
            {pathname !== '/' && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          {/* 用户信息头部 */}
          <DropdownMenuLabel className="flex items-center justify-between gap-2 py-3">
            <div className="flex items-center gap-2">
              <IdCard className="h-4 w-4" />
              <span className="font-medium">{user?.姓名 || '用户'}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <Badge variant="outline" className="text-xs">
                {currentPageTitle}
              </Badge>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* 工作区快捷导航 */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
              工作区导航
            </DropdownMenuLabel>
            {workspaceShortcuts.map((shortcut) => (
              <DropdownMenuItem
                key={shortcut.path}
                onClick={() => handleNavigation(shortcut.path, shortcut.label)}
                className={`cursor-pointer flex items-center gap-3 py-2 ${
                  pathname === shortcut.path ? 'bg-primary/10 text-primary' : ''
                }`}
              >
                <shortcut.icon className="h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium text-sm">{shortcut.label}</div>
                  <div className="text-xs text-muted-foreground">{shortcut.description}</div>
                </div>
                {pathname === shortcut.path && (
                  <div className="w-2 h-2 bg-primary rounded-full" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* 样本记录快捷导航 */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <FlaskConical className="h-4 w-4 mr-2" />
              <span>样本记录</span>
              <ChevronRight className="h-3 w-3 ml-auto" />
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-64">
              <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
                化验记录系统
              </DropdownMenuLabel>
              {sampleShortcuts.map((shortcut) => (
                <DropdownMenuItem
                  key={shortcut.path}
                  onClick={() => handleNavigation(shortcut.path, shortcut.label)}
                  className={`cursor-pointer flex items-center gap-3 py-2 ${
                    pathname === shortcut.path ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  <shortcut.icon className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{shortcut.label}</div>
                    <div className="text-xs text-muted-foreground">{shortcut.description}</div>
                  </div>
                  {pathname === shortcut.path && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {/* 用户功能菜单 - 按照任务要求重构 */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
              用户功能
            </DropdownMenuLabel>

            {/* 角色 */}
            <DropdownMenuItem onClick={handleShowProfile} className="cursor-pointer">
              <User className="h-4 w-4 mr-2" />
              <span>角色</span>
            </DropdownMenuItem>

            {/* 任务 */}
            <DropdownMenuItem
              onClick={() => handleNavigation('/task-notification', '任务通知')}
              className="cursor-pointer"
            >
              <Bell className="h-4 w-4 mr-2" />
              <span>任务</span>
            </DropdownMenuItem>

            {/* 情况 */}
            <DropdownMenuItem
              onClick={() => handleNavigation('/situation-report', '情况上报')}
              className="cursor-pointer"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span>情况</span>
            </DropdownMenuItem>

            {/* 考勤 */}
            <DropdownMenuItem
              onClick={() => handleNavigation('/attendance', '考勤打卡')}
              className="cursor-pointer"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              <span>考勤</span>
            </DropdownMenuItem>

            {/* 积分 */}
            <DropdownMenuItem onClick={handleShowPoints} className="cursor-pointer">
              <Trophy className="h-4 w-4 mr-2" />
              <span>积分</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* 登出 */}
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>登出</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 用户资料对话框 */}
      <Dialog open={showUserProfile} onOpenChange={setShowUserProfile}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              员工信息
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <LoggedInInterface showActions={false} />
          </div>
        </DialogContent>
      </Dialog>

      {/* 积分功能对话框 */}
      <Dialog open={showPointsDialog} onOpenChange={setShowPointsDialog}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              积分系统
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                积分功能正在开发中，敬请期待！
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full mb-3">
                <Trophy className="h-8 w-8 text-yellow-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                即将推出的功能包括：
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• 工作任务完成积分</li>
                <li>• 数据录入准确性奖励</li>
                <li>• 月度表现排行榜</li>
                <li>• 积分兑换奖励</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
