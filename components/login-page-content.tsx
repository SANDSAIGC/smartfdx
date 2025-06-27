"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { LoggedInInterface } from "@/components/logged-in-interface";
import { useUser } from "@/lib/contexts/user-context";
import { RedirectManager } from "@/lib/redirect-manager";
import { AuthLoading } from "@/components/loading-transition";

export function LoginPageContent() {
  const { user, isAuthenticated, isLoading, checkAuthStatus } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 如果用户已经认证，立即重定向
    if (isAuthenticated && user) {
      console.log('✅ [登录页面] 用户已登录，立即重定向');

      // 使用智能重定向管理器处理重定向
      const redirectToWorkspace = () => {
        try {
          const redirectParam = searchParams.get('redirect');
          const redirectResult = RedirectManager.handleLoginSuccess(user, redirectParam);

          console.log('🎯 [登录页面] 智能重定向结果:', redirectResult);

          if (redirectResult.shouldRedirect) {
            if (redirectResult.replaceHistory) {
              router.replace(redirectResult.targetUrl);
            } else {
              router.push(redirectResult.targetUrl);
            }
          }
        } catch (error) {
          console.error('❌ [登录页面] 重定向异常:', error);
          router.replace('/lab');
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
