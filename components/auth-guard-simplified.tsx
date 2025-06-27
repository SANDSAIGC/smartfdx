/**
 * 简化的认证守卫组件
 * 
 * 功能：
 * 1. 使用统一认证系统
 * 2. 智能重定向管理
 * 3. 简化的状态管理
 * 4. 更好的性能和用户体验
 */

"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-system';
import { RouteManager, AuthStrategy } from '@/lib/route-config';
import { RedirectManager } from '@/lib/redirect-manager';
import { AuthLoading } from '@/components/auth-loading';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requireAuth = true,
  fallback = null,
  redirectTo = '/auth/login'
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, checkAuthStatus } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  // 获取当前路径
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const verifyAuth = async () => {
      console.log('🔐 [简化AuthGuard] 认证检查开始...');
      console.log('🔍 [简化AuthGuard] 当前状态:', {
        currentPath,
        requireAuth,
        isLoading,
        isAuthenticated,
        hasUser: !!user,
        hasRedirected
      });

      // 如果路径为空，等待路径设置
      if (!currentPath) {
        console.log('⏳ [简化AuthGuard] 等待路径设置...');
        return;
      }

      // 获取当前路由配置
      const route = RouteManager.getRouteByPath(currentPath);
      if (!route) {
        console.log('❓ [简化AuthGuard] 未知路由，允许通过');
        return;
      }

      // 检查路由是否需要认证
      const routeRequiresAuth = RouteManager.requiresAuth(currentPath);
      const actualRequireAuth = requireAuth && routeRequiresAuth;

      console.log('📋 [简化AuthGuard] 路由认证需求:', {
        routeName: route.name,
        authStrategy: route.authStrategy,
        routeRequiresAuth,
        actualRequireAuth
      });

      // 如果不需要认证，直接通过
      if (!actualRequireAuth) {
        console.log('✅ [简化AuthGuard] 页面不需要认证，直接渲染');
        return;
      }

      // 如果认证系统还在初始化，等待完成
      if (isLoading) {
        console.log('⏳ [简化AuthGuard] 等待认证系统初始化...');
        return;
      }

      // 检查认证状态
      const authValid = checkAuthStatus();
      
      // 如果用户已认证，直接通过
      if (isAuthenticated && user && authValid) {
        console.log('✅ [简化AuthGuard] 用户已认证，直接渲染页面');
        console.log('👤 [简化AuthGuard] 用户信息:', {
          userId: user.id,
          username: user.账号,
          workspace: user.工作页面
        });
        setHasRedirected(false); // 重置重定向标志
        return;
      }

      // 如果已经重定向过，避免重复重定向
      if (hasRedirected) {
        console.log('🔄 [简化AuthGuard] 已经重定向过，跳过重复重定向');
        return;
      }

      // 用户未认证，检查是否已经在登录页面
      if (currentPath.startsWith('/auth/')) {
        console.log('📝 [简化AuthGuard] 已在认证页面，跳过重定向');
        return;
      }

      // 使用智能重定向管理器处理未认证用户
      console.log('❌ [简化AuthGuard] 用户未认证，使用智能重定向管理器');

      const redirectResult = RedirectManager.handleAuthRequired(currentPath, false);
      
      console.log('🔍 [简化AuthGuard] 重定向结果:', redirectResult);

      if (redirectResult.shouldRedirect) {
        // 设置重定向标志，防止重复重定向
        setHasRedirected(true);

        console.log('🚀 [简化AuthGuard] 执行重定向到:', redirectResult.targetUrl);
        
        // 使用适当的导航方法
        if (redirectResult.replaceHistory) {
          router.replace(redirectResult.targetUrl);
        } else {
          router.push(redirectResult.targetUrl);
        }
      }
    };

    verifyAuth();
  }, [currentPath, user, isAuthenticated, isLoading, requireAuth, redirectTo, router, hasRedirected, checkAuthStatus]);

  // 如果路径还未设置，显示加载状态
  if (!currentPath) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AuthLoading />
      </div>
    );
  }

  // 获取路由配置以确定是否需要认证
  const route = RouteManager.getRouteByPath(currentPath);
  const routeRequiresAuth = route ? RouteManager.requiresAuth(currentPath) : false;
  const actualRequireAuth = requireAuth && routeRequiresAuth;

  // 如果不需要认证，直接渲染子组件
  if (!actualRequireAuth) {
    return <>{children}</>;
  }

  // 如果认证系统正在加载，显示统一的加载组件
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AuthLoading />
      </div>
    );
  }

  // 检查认证状态
  const authValid = checkAuthStatus();

  // 如果用户已认证，直接渲染子组件
  if (isAuthenticated && user && authValid) {
    console.log('🎯 [简化AuthGuard] 认证通过，渲染页面内容');
    return <>{children}</>;
  }

  // 用户未认证，显示fallback或空内容（重定向已在useEffect中处理）
  return fallback || (
    <div className="min-h-screen flex items-center justify-center">
      <AuthLoading />
    </div>
  );
}

// 高阶组件版本
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AuthGuardProps, 'children'>
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

// 用于检查认证状态的Hook
export function useAuthGuard(requireAuth: boolean = true) {
  const { user, isAuthenticated, isLoading, checkAuthStatus } = useAuth();

  const verifyAuth = async (): Promise<boolean> => {
    if (!requireAuth) return true;
    if (isLoading) return false;
    if (!user) return false;

    return checkAuthStatus();
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    verifyAuth
  };
}

/**
 * 简化AuthGuard的优势：
 * 
 * 1. **统一认证系统**
 *    - 使用单一的AuthSystem管理所有认证状态
 *    - 避免了多个认证系统的冲突
 *    - 更简单的状态管理
 * 
 * 2. **智能路由检查**
 *    - 基于路由配置自动判断认证需求
 *    - 支持不同认证策略的页面
 *    - 减少了手动配置的需要
 * 
 * 3. **更好的性能**
 *    - 减少了不必要的重新渲染
 *    - 优化了认证检查逻辑
 *    - 更快的页面加载速度
 * 
 * 4. **简化的重定向逻辑**
 *    - 使用RedirectManager统一处理重定向
 *    - 避免了重复重定向问题
 *    - 更可靠的导航体验
 * 
 * 5. **更好的错误处理**
 *    - 优雅的降级处理
 *    - 清晰的错误日志
 *    - 用户友好的加载状态
 */
