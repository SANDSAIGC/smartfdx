/**
 * 导航工具函数
 * 
 * 功能：
 * 1. 统一的导航方法
 * 2. 路由验证和安全检查
 * 3. 导航历史管理
 * 4. 错误处理和回退
 */

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { RouteManager, RouteConfig } from './route-config';
import { RedirectManager, RedirectType } from './redirect-manager';

// 导航选项接口
export interface NavigationOptions {
  replace?: boolean;           // 是否替换当前历史记录
  preserveQuery?: boolean;     // 是否保留查询参数
  validatePermission?: boolean; // 是否验证权限
  fallbackUrl?: string;        // 权限不足时的回退URL
  onSuccess?: () => void;      // 导航成功回调
  onError?: (error: Error) => void; // 导航失败回调
}

// 导航结果接口
export interface NavigationResult {
  success: boolean;
  targetUrl: string;
  actualUrl?: string;
  error?: string;
  redirectType?: RedirectType;
}

export class NavigationUtils {
  /**
   * 安全导航到指定路径
   */
  static async navigateTo(
    router: AppRouterInstance,
    targetPath: string,
    options: NavigationOptions = {}
  ): Promise<NavigationResult> {
    const {
      replace = false,
      preserveQuery = false,
      validatePermission = true,
      fallbackUrl = '/lab',
      onSuccess,
      onError
    } = options;

    try {
      console.log('🧭 [导航工具] 开始导航', {
        targetPath,
        options
      });

      // 1. 验证目标路径
      const route = RouteManager.getRouteByPath(targetPath);
      if (!route) {
        const error = new Error(`路由不存在: ${targetPath}`);
        onError?.(error);
        return {
          success: false,
          targetUrl: targetPath,
          error: error.message
        };
      }

      if (!route.isActive) {
        const error = new Error(`路由已禁用: ${targetPath}`);
        onError?.(error);
        return {
          success: false,
          targetUrl: targetPath,
          error: error.message
        };
      }

      // 2. 权限验证（如果需要）
      if (validatePermission) {
        // 这里可以添加用户权限检查逻辑
        // 暂时跳过，因为权限检查需要用户上下文
      }

      // 3. 构建最终URL
      let finalUrl = targetPath;
      if (preserveQuery && typeof window !== 'undefined') {
        const currentSearch = window.location.search;
        if (currentSearch) {
          finalUrl += currentSearch;
        }
      }

      // 4. 执行导航
      console.log('🚀 [导航工具] 执行导航到:', finalUrl);
      
      if (replace) {
        router.replace(finalUrl);
      } else {
        router.push(finalUrl);
      }

      onSuccess?.();

      return {
        success: true,
        targetUrl: targetPath,
        actualUrl: finalUrl
      };

    } catch (error) {
      console.error('❌ [导航工具] 导航失败:', error);
      
      const errorObj = error instanceof Error ? error : new Error(String(error));
      onError?.(errorObj);

      // 尝试回退到安全页面
      try {
        console.log('🔄 [导航工具] 尝试回退到:', fallbackUrl);
        router.replace(fallbackUrl);
      } catch (fallbackError) {
        console.error('❌ [导航工具] 回退也失败了:', fallbackError);
      }

      return {
        success: false,
        targetUrl: targetPath,
        error: errorObj.message
      };
    }
  }

  /**
   * 导航到工作页面
   */
  static async navigateToWorkspace(
    router: AppRouterInstance,
    workspaceName: string,
    options: NavigationOptions = {}
  ): Promise<NavigationResult> {
    console.log('🏢 [导航工具] 导航到工作页面:', workspaceName);

    const targetUrl = RouteManager.getRedirectUrlByWorkspace(workspaceName);
    
    return this.navigateTo(router, targetUrl, {
      replace: true,
      ...options
    });
  }

  /**
   * 返回上一页（安全版本）
   */
  static goBack(
    router: AppRouterInstance,
    fallbackUrl: string = '/lab'
  ): void {
    try {
      console.log('⬅️ [导航工具] 尝试返回上一页');
      
      if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
      } else {
        console.log('🔄 [导航工具] 无历史记录，重定向到回退页面');
        router.replace(fallbackUrl);
      }
    } catch (error) {
      console.error('❌ [导航工具] 返回上一页失败:', error);
      router.replace(fallbackUrl);
    }
  }

  /**
   * 刷新当前页面
   */
  static refresh(): void {
    try {
      console.log('🔄 [导航工具] 刷新当前页面');
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ [导航工具] 页面刷新失败:', error);
    }
  }

  /**
   * 获取当前路由信息
   */
  static getCurrentRoute(): RouteConfig | null {
    try {
      if (typeof window === 'undefined') return null;
      
      const currentPath = window.location.pathname;
      return RouteManager.getRouteByPath(currentPath);
    } catch (error) {
      console.error('❌ [导航工具] 获取当前路由失败:', error);
      return null;
    }
  }

  /**
   * 检查是否可以导航到指定路径
   */
  static canNavigateTo(targetPath: string): boolean {
    try {
      const route = RouteManager.getRouteByPath(targetPath);
      return route ? route.isActive : false;
    } catch (error) {
      console.error('❌ [导航工具] 路径检查失败:', error);
      return false;
    }
  }

  /**
   * 构建带查询参数的URL
   */
  static buildUrl(
    basePath: string,
    params?: Record<string, string | number | boolean>
  ): string {
    try {
      if (!params || Object.keys(params).length === 0) {
        return basePath;
      }

      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.set(key, String(value));
      });

      return `${basePath}?${searchParams.toString()}`;
    } catch (error) {
      console.error('❌ [导航工具] URL构建失败:', error);
      return basePath;
    }
  }

  /**
   * 解析URL查询参数
   */
  static parseQuery(url?: string): Record<string, string> {
    try {
      const targetUrl = url || (typeof window !== 'undefined' ? window.location.search : '');
      const searchParams = new URLSearchParams(targetUrl);
      const params: Record<string, string> = {};
      
      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      return params;
    } catch (error) {
      console.error('❌ [导航工具] 查询参数解析失败:', error);
      return {};
    }
  }

  /**
   * 获取面包屑导航数据
   */
  static getBreadcrumbs(currentPath: string): RouteConfig[] {
    try {
      const breadcrumbs: RouteConfig[] = [];
      const route = RouteManager.getRouteByPath(currentPath);
      
      if (route) {
        // 添加首页
        const homeRoute = RouteManager.getRouteByPath('/');
        if (homeRoute && currentPath !== '/') {
          breadcrumbs.push(homeRoute);
        }
        
        // 添加当前页面
        breadcrumbs.push(route);
      }

      return breadcrumbs;
    } catch (error) {
      console.error('❌ [导航工具] 面包屑生成失败:', error);
      return [];
    }
  }

  /**
   * 预加载路由
   */
  static preloadRoute(router: AppRouterInstance, targetPath: string): void {
    try {
      console.log('⚡ [导航工具] 预加载路由:', targetPath);
      router.prefetch(targetPath);
    } catch (error) {
      console.error('❌ [导航工具] 路由预加载失败:', error);
    }
  }
}
