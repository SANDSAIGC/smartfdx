"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUser } from "@/lib/contexts/user-context";
import { Menu, User, Trophy, LogOut, Info, IdCard } from "lucide-react";
import { LoggedInInterface } from "@/components/logged-in-interface";

export function WorkspaceNavigation() {
  const { user, logout } = useUser();
  const router = useRouter();
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showPointsDialog, setShowPointsDialog] = useState(false);

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
            className="hover:bg-primary/10 hover:border-primary transition-colors"
            title="菜单"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <IdCard className="h-4 w-4" />
            {user?.姓名 || '用户'}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleShowProfile} className="cursor-pointer">
            <User className="h-4 w-4 mr-2" />
            角色
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleShowPoints} className="cursor-pointer">
            <Trophy className="h-4 w-4 mr-2" />
            积分
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleLogout} 
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" />
            登出
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
