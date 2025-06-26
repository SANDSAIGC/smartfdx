"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/contexts/user-context';

interface AutoLoginOptions {
  enabled?: boolean;
  redirectTo?: string;
  onSuccess?: () => void;
  onFailure?: () => void;
  checkInterval?: number; // 检查间隔（毫秒）
}

interface AutoLoginResult {
  isChecking: boolean;
  isAuthenticated: boolean;
  user: any;
  error: string | null;
  retry: () => void;
}

/**
 * 自动登录检查Hook
 * 在组件挂载时自动检查登录状态，并可选择性地重定向
 */
export function useAutoLogin(options: AutoLoginOptions = {}): AutoLoginResult {
  const {
    enabled = true,
    redirectTo = '/auth/login',
    onSuccess,
    onFailure,
    checkInterval = 5 * 60 * 1000 // 默认5分钟检查一次
  } = options;

  const { user, session, isAuthenticated, isLoading, checkAuthStatus, refreshSession } = useUser();
  const router = useRouter();
  
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 执行认证检查
  const performAuthCheck = async (): Promise<boolean> => {
    if (!enabled) return true;
    
    try {
      setIsChecking(true);
      setError(null);
      
      console.log('🔍 [AutoLogin] 执行认证检查...');
      
      // 如果没有用户或会话，直接返回false
      if (!user || !session) {
        console.log('❌ [AutoLogin] 没有用户或会话数据');
        return false;
      }
      
      // 检查会话状态
      const isValid = await checkAuthStatus();
      
      if (isValid) {
        console.log('✅ [AutoLogin] 认证检查通过');
        onSuccess?.();
        return true;
      } else {
        console.log('❌ [AutoLogin] 认证检查失败');
        onFailure?.();
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '认证检查失败';
      console.error('❌ [AutoLogin] 认证检查异常:', errorMessage);
      setError(errorMessage);
      onFailure?.();
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  // 重试函数
  const retry = () => {
    performAuthCheck();
  };

  // 初始认证检查
  useEffect(() => {
    if (!enabled || isLoading) return;
    
    const checkAuth = async () => {
      const isValid = await performAuthCheck();
      
      // 如果认证失败且需要重定向，执行重定向
      if (!isValid && redirectTo) {
        console.log(`🔄 [AutoLogin] 重定向到: ${redirectTo}`);
        router.replace(redirectTo);
      }
    };
    
    checkAuth();
  }, [enabled, isLoading, user, session]);

  // 定期检查认证状态
  useEffect(() => {
    if (!enabled || !isAuthenticated || checkInterval <= 0) return;

    console.log(`⏰ [AutoLogin] 设置定期检查，间隔: ${checkInterval}ms`);
    
    const intervalId = setInterval(async () => {
      console.log('🔄 [AutoLogin] 执行定期认证检查...');
      
      const isValid = await performAuthCheck();
      
      if (!isValid) {
        console.log('❌ [AutoLogin] 定期检查失败，可能需要重新登录');
        
        // 尝试刷新会话
        const refreshed = await refreshSession();
        if (!refreshed && redirectTo) {
          console.log(`🔄 [AutoLogin] 会话刷新失败，重定向到: ${redirectTo}`);
          router.replace(redirectTo);
        }
      }
    }, checkInterval);

    return () => {
      console.log('🛑 [AutoLogin] 清除定期检查');
      clearInterval(intervalId);
    };
  }, [enabled, isAuthenticated, checkInterval, refreshSession]);

  return {
    isChecking: isLoading || isChecking,
    isAuthenticated,
    user,
    error,
    retry
  };
}

/**
 * 页面级别的自动登录检查Hook
 * 专门用于页面组件，提供更简单的API
 */
export function usePageAuth(requireAuth: boolean = true) {
  const autoLogin = useAutoLogin({
    enabled: requireAuth,
    redirectTo: requireAuth ? '/auth/login' : undefined
  });

  return {
    isLoading: autoLogin.isChecking,
    isAuthenticated: autoLogin.isAuthenticated,
    user: autoLogin.user,
    error: autoLogin.error
  };
}

/**
 * 静默认证检查Hook
 * 不会重定向，只是检查认证状态
 */
export function useSilentAuth() {
  return useAutoLogin({
    enabled: true,
    redirectTo: undefined // 不重定向
  });
}
