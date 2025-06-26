"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { LoggedInInterface } from "@/components/logged-in-interface";
import { useUser } from "@/lib/contexts/user-context";
import { Skeleton } from "@/components/ui/skeleton";

export function LoginPageContent() {
  const { user, isAuthenticated, isLoading, checkAuthStatus } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 如果用户已经认证，立即重定向
    if (isAuthenticated && user) {
      console.log('✅ [登录页面] 用户已登录，立即重定向');

      // 立即执行重定向，不显示任何过渡画面
      const redirectToWorkspace = async () => {
        try {
          // 优先检查是否有重定向参数（用户原本想访问的页面）
          const redirectParam = searchParams.get('redirect');
          if (redirectParam) {
            console.log('🎯 [登录页面] 发现重定向参数，返回原始访问页面:', redirectParam);
            router.replace(redirectParam);
            return;
          }

          // 如果没有重定向参数，则使用用户的默认工作页面
          if (user.工作页面) {
            console.log('🔍 [登录页面] 查询工作页面路由:', user.工作页面);

            const response = await fetch('/api/get-workspace-route', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ workspaceName: user.工作页面 })
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.route) {
                console.log('🚀 [登录页面] 立即重定向到工作页面:', data.route);
                router.replace(data.route);
                return;
              }
            }
          }

          // 如果没有工作页面或查询失败，重定向到默认页面
          console.log('🔄 [登录页面] 重定向到默认页面');
          router.replace('/demo');

        } catch (error) {
          console.error('❌ [登录页面] 重定向异常:', error);
          router.replace('/demo');
        }
      };

      // 使用 setTimeout 确保状态更新完成后再重定向
      setTimeout(redirectToWorkspace, 0);
    }
  }, [isAuthenticated, user, router]);

  // 如果已登录，不显示任何内容（立即重定向）
  if (isAuthenticated && user) {
    console.log('🎯 [登录页面] 用户已登录，重定向处理中...');
    return null;
  }

  // 未登录，显示登录表单
  console.log('📝 [登录页面] 显示登录表单');
  return <LoginForm />;
}
