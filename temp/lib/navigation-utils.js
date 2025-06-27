"use strict";
/**
 * 导航工具函数
 *
 * 功能：
 * 1. 统一的导航方法
 * 2. 路由验证和安全检查
 * 3. 导航历史管理
 * 4. 错误处理和回退
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigationUtils = void 0;
const route_config_1 = require("./route-config");
class NavigationUtils {
    /**
     * 安全导航到指定路径
     */
    static async navigateTo(router, targetPath, options = {}) {
        const { replace = false, preserveQuery = false, validatePermission = true, fallbackUrl = '/lab', onSuccess, onError } = options;
        try {
            console.log('🧭 [导航工具] 开始导航', {
                targetPath,
                options
            });
            // 1. 验证目标路径
            const route = route_config_1.RouteManager.getRouteByPath(targetPath);
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
            }
            else {
                router.push(finalUrl);
            }
            onSuccess?.();
            return {
                success: true,
                targetUrl: targetPath,
                actualUrl: finalUrl
            };
        }
        catch (error) {
            console.error('❌ [导航工具] 导航失败:', error);
            const errorObj = error instanceof Error ? error : new Error(String(error));
            onError?.(errorObj);
            // 尝试回退到安全页面
            try {
                console.log('🔄 [导航工具] 尝试回退到:', fallbackUrl);
                router.replace(fallbackUrl);
            }
            catch (fallbackError) {
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
    static async navigateToWorkspace(router, workspaceName, options = {}) {
        console.log('🏢 [导航工具] 导航到工作页面:', workspaceName);
        const targetUrl = route_config_1.RouteManager.getRedirectUrlByWorkspace(workspaceName);
        return this.navigateTo(router, targetUrl, {
            replace: true,
            ...options
        });
    }
    /**
     * 返回上一页（安全版本）
     */
    static goBack(router, fallbackUrl = '/lab') {
        try {
            console.log('⬅️ [导航工具] 尝试返回上一页');
            if (typeof window !== 'undefined' && window.history.length > 1) {
                window.history.back();
            }
            else {
                console.log('🔄 [导航工具] 无历史记录，重定向到回退页面');
                router.replace(fallbackUrl);
            }
        }
        catch (error) {
            console.error('❌ [导航工具] 返回上一页失败:', error);
            router.replace(fallbackUrl);
        }
    }
    /**
     * 刷新当前页面
     */
    static refresh() {
        try {
            console.log('🔄 [导航工具] 刷新当前页面');
            if (typeof window !== 'undefined') {
                window.location.reload();
            }
        }
        catch (error) {
            console.error('❌ [导航工具] 页面刷新失败:', error);
        }
    }
    /**
     * 获取当前路由信息
     */
    static getCurrentRoute() {
        try {
            if (typeof window === 'undefined')
                return null;
            const currentPath = window.location.pathname;
            return route_config_1.RouteManager.getRouteByPath(currentPath);
        }
        catch (error) {
            console.error('❌ [导航工具] 获取当前路由失败:', error);
            return null;
        }
    }
    /**
     * 检查是否可以导航到指定路径
     */
    static canNavigateTo(targetPath) {
        try {
            const route = route_config_1.RouteManager.getRouteByPath(targetPath);
            return route ? route.isActive : false;
        }
        catch (error) {
            console.error('❌ [导航工具] 路径检查失败:', error);
            return false;
        }
    }
    /**
     * 构建带查询参数的URL
     */
    static buildUrl(basePath, params) {
        try {
            if (!params || Object.keys(params).length === 0) {
                return basePath;
            }
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                searchParams.set(key, String(value));
            });
            return `${basePath}?${searchParams.toString()}`;
        }
        catch (error) {
            console.error('❌ [导航工具] URL构建失败:', error);
            return basePath;
        }
    }
    /**
     * 解析URL查询参数
     */
    static parseQuery(url) {
        try {
            const targetUrl = url || (typeof window !== 'undefined' ? window.location.search : '');
            const searchParams = new URLSearchParams(targetUrl);
            const params = {};
            searchParams.forEach((value, key) => {
                params[key] = value;
            });
            return params;
        }
        catch (error) {
            console.error('❌ [导航工具] 查询参数解析失败:', error);
            return {};
        }
    }
    /**
     * 获取面包屑导航数据
     */
    static getBreadcrumbs(currentPath) {
        try {
            const breadcrumbs = [];
            const route = route_config_1.RouteManager.getRouteByPath(currentPath);
            if (route) {
                // 添加首页
                const homeRoute = route_config_1.RouteManager.getRouteByPath('/');
                if (homeRoute && currentPath !== '/') {
                    breadcrumbs.push(homeRoute);
                }
                // 添加当前页面
                breadcrumbs.push(route);
            }
            return breadcrumbs;
        }
        catch (error) {
            console.error('❌ [导航工具] 面包屑生成失败:', error);
            return [];
        }
    }
    /**
     * 预加载路由
     */
    static preloadRoute(router, targetPath) {
        try {
            console.log('⚡ [导航工具] 预加载路由:', targetPath);
            router.prefetch(targetPath);
        }
        catch (error) {
            console.error('❌ [导航工具] 路由预加载失败:', error);
        }
    }
}
exports.NavigationUtils = NavigationUtils;
