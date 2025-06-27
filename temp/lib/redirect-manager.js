"use strict";
/**
 * 智能重定向管理器
 *
 * 功能：
 * 1. 统一管理所有重定向逻辑
 * 2. 智能路由决策
 * 3. 用户工作页面映射
 * 4. 重定向参数处理
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedirectManager = exports.RedirectType = void 0;
const route_config_1 = require("./route-config");
// 重定向类型枚举
var RedirectType;
(function (RedirectType) {
    RedirectType["LOGIN_SUCCESS"] = "login_success";
    RedirectType["AUTH_REQUIRED"] = "auth_required";
    RedirectType["WORKSPACE"] = "workspace";
    RedirectType["DEFAULT"] = "default";
    RedirectType["PERMISSION_DENIED"] = "permission_denied";
    RedirectType["ERROR"] = "error"; // 错误重定向
})(RedirectType || (exports.RedirectType = RedirectType = {}));
class RedirectManager {
    /**
     * 处理登录成功后的重定向
     */
    static handleLoginSuccess(user, redirectParam) {
        console.log('🎯 [重定向管理器] 处理登录成功重定向', {
            user: user.姓名,
            workspaceName: user.工作页面,
            redirectParam
        });
        // 优先级1: 检查重定向参数（用户原本想访问的页面）
        if (redirectParam) {
            const decodedPath = decodeURIComponent(redirectParam);
            const route = route_config_1.RouteManager.getRouteByPath(decodedPath);
            if (route && route.isActive) {
                // 检查用户是否有权限访问目标页面
                if (route_config_1.RouteManager.hasPermission(decodedPath, user.职称)) {
                    console.log('✅ [重定向管理器] 返回原始访问页面:', decodedPath);
                    return {
                        shouldRedirect: true,
                        targetUrl: decodedPath,
                        type: RedirectType.LOGIN_SUCCESS,
                        reason: '返回用户原始访问页面',
                        replaceHistory: true
                    };
                }
                else {
                    console.log('❌ [重定向管理器] 用户无权限访问原始页面，使用工作页面重定向');
                }
            }
            else {
                console.log('⚠️ [重定向管理器] 原始访问页面无效，使用工作页面重定向');
            }
        }
        // 优先级2: 用户工作页面重定向
        if (user.工作页面) {
            const workspaceUrl = route_config_1.RouteManager.getRedirectUrlByWorkspace(user.工作页面);
            // 检查用户是否有权限访问工作页面
            if (route_config_1.RouteManager.hasPermission(workspaceUrl, user.职称)) {
                console.log('🏢 [重定向管理器] 重定向到用户工作页面:', workspaceUrl);
                return {
                    shouldRedirect: true,
                    targetUrl: workspaceUrl,
                    type: RedirectType.WORKSPACE,
                    reason: '重定向到用户配置的工作页面',
                    replaceHistory: true
                };
            }
            else {
                console.log('❌ [重定向管理器] 用户无权限访问配置的工作页面');
            }
        }
        // 优先级3: 默认页面重定向
        console.log('🔄 [重定向管理器] 使用默认页面重定向');
        return {
            shouldRedirect: true,
            targetUrl: '/lab',
            type: RedirectType.DEFAULT,
            reason: '使用默认页面（化验室）',
            replaceHistory: true
        };
    }
    /**
     * 处理需要认证的页面访问
     */
    static handleAuthRequired(currentPath, isAuthenticated = false) {
        console.log('🔐 [重定向管理器] 处理认证要求', {
            currentPath,
            isAuthenticated
        });
        if (isAuthenticated) {
            return {
                shouldRedirect: false,
                targetUrl: currentPath,
                type: RedirectType.AUTH_REQUIRED,
                reason: '用户已认证，允许访问'
            };
        }
        // 构建登录URL，保存当前路径作为重定向参数
        const loginUrl = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
        console.log('🚀 [重定向管理器] 重定向到登录页面:', loginUrl);
        return {
            shouldRedirect: true,
            targetUrl: loginUrl,
            type: RedirectType.AUTH_REQUIRED,
            reason: '用户未认证，需要登录',
            preserveQuery: true,
            replaceHistory: false
        };
    }
    /**
     * 处理权限不足的访问
     */
    static handlePermissionDenied(currentPath, user) {
        console.log('❌ [重定向管理器] 处理权限不足', {
            currentPath,
            user: user?.姓名,
            role: user?.职称
        });
        // 如果用户有工作页面，重定向到工作页面
        if (user?.工作页面) {
            const workspaceUrl = route_config_1.RouteManager.getRedirectUrlByWorkspace(user.工作页面);
            return {
                shouldRedirect: true,
                targetUrl: workspaceUrl,
                type: RedirectType.PERMISSION_DENIED,
                reason: '权限不足，重定向到用户工作页面',
                replaceHistory: true
            };
        }
        // 否则重定向到默认页面
        return {
            shouldRedirect: true,
            targetUrl: '/lab',
            type: RedirectType.PERMISSION_DENIED,
            reason: '权限不足，重定向到默认页面',
            replaceHistory: true
        };
    }
    /**
     * 检查是否需要重定向
     */
    static shouldRedirect(currentPath, user, redirectParam) {
        console.log('🔍 [重定向管理器] 检查重定向需求', {
            currentPath,
            user: user?.姓名,
            redirectParam
        });
        const route = route_config_1.RouteManager.getRouteByPath(currentPath);
        // 如果路由不存在，重定向到默认页面
        if (!route) {
            console.log('❓ [重定向管理器] 路由不存在，重定向到默认页面');
            return {
                shouldRedirect: true,
                targetUrl: '/lab',
                type: RedirectType.ERROR,
                reason: '路由不存在',
                replaceHistory: true
            };
        }
        // 如果路由被禁用，重定向到默认页面
        if (!route.isActive) {
            console.log('🚫 [重定向管理器] 路由已禁用，重定向到默认页面');
            return {
                shouldRedirect: true,
                targetUrl: '/lab',
                type: RedirectType.ERROR,
                reason: '路由已禁用',
                replaceHistory: true
            };
        }
        // 检查权限
        if (user && !route_config_1.RouteManager.hasPermission(currentPath, user.职称)) {
            return this.handlePermissionDenied(currentPath, user);
        }
        // 如果是登录页面且用户已登录，处理登录成功重定向
        if (currentPath.startsWith('/auth/login') && user) {
            return this.handleLoginSuccess(user, redirectParam);
        }
        // 如果需要认证但用户未登录
        if (route_config_1.RouteManager.requiresAuth(currentPath) && !user) {
            return this.handleAuthRequired(currentPath, false);
        }
        // 不需要重定向
        return {
            shouldRedirect: false,
            targetUrl: currentPath,
            type: RedirectType.DEFAULT,
            reason: '无需重定向'
        };
    }
    /**
     * 获取工作页面映射表（用于API查询）
     */
    static getWorkspaceMapping() {
        const mapping = {};
        Object.values(route_config_1.RouteManager.getNavigationMenu()).flat().forEach(route => {
            if (route.workspaceName) {
                mapping[route.workspaceName] = route.path;
            }
        });
        return mapping;
    }
    /**
     * 验证重定向URL的安全性
     */
    static isValidRedirectUrl(url) {
        try {
            // 检查是否是相对路径
            if (url.startsWith('/')) {
                const route = route_config_1.RouteManager.getRouteByPath(url);
                return route ? route.isActive : false;
            }
            // 不允许外部URL重定向
            return false;
        }
        catch (error) {
            console.error('❌ [重定向管理器] URL验证失败:', error);
            return false;
        }
    }
    /**
     * 构建重定向URL（包含查询参数）
     */
    static buildRedirectUrl(basePath, params) {
        if (!params || Object.keys(params).length === 0) {
            return basePath;
        }
        const searchParams = new URLSearchParams(params);
        return `${basePath}?${searchParams.toString()}`;
    }
}
exports.RedirectManager = RedirectManager;
