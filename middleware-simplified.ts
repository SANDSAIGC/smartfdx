/**
 * 简化的中间件配置
 * 
 * 功能：
 * 1. 移除Supabase Auth依赖
 * 2. 基于路由配置的智能认证检查
 * 3. 简化的重定向逻辑
 * 4. 更好的性能和可维护性
 */

import { NextRequest, NextResponse } from 'next/server';
import { RouteManager, AuthStrategy } from './lib/route-config';

export async function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;
  
  console.log('🔍 [简化中间件] 处理请求:', currentPath);

  try {
    // 获取路由配置
    const route = RouteManager.getRouteByPath(currentPath);
    
    if (!route) {
      console.log('❓ [简化中间件] 未知路由，允许通过');
      return NextResponse.next();
    }

    console.log('📋 [简化中间件] 路由配置:', {
      path: route.path,
      name: route.name,
      authStrategy: route.authStrategy,
      pageType: route.pageType,
      isActive: route.isActive
    });

    // 检查路由是否激活
    if (!route.isActive) {
      console.log('🚫 [简化中间件] 路由已禁用，重定向到首页');
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // 根据认证策略处理
    switch (route.authStrategy) {
      case AuthStrategy.NONE:
        console.log('✅ [简化中间件] 无需认证，直接通过');
        return NextResponse.next();

      case AuthStrategy.SIMPLE:
        console.log('🔓 [简化中间件] 简化认证，由客户端处理');
        return NextResponse.next();

      case AuthStrategy.SUPABASE:
        console.log('🔐 [简化中间件] Supabase认证页面，暂时允许通过');
        // 注意：在优化阶段，我们暂时允许所有页面通过
        // 认证检查将由客户端的AuthGuard组件处理
        return NextResponse.next();

      case AuthStrategy.ADMIN:
        console.log('👑 [简化中间件] 管理员页面，由客户端处理权限检查');
        return NextResponse.next();

      default:
        console.log('❓ [简化中间件] 未知认证策略，默认允许通过');
        return NextResponse.next();
    }

  } catch (error) {
    console.error('❌ [简化中间件] 处理异常:', error);
    
    // 发生错误时，允许请求通过，由客户端处理
    return NextResponse.next();
  }
}

// 配置中间件匹配规则
export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

/**
 * 中间件优化说明：
 * 
 * 1. **移除Supabase Auth依赖**
 *    - 不再调用 supabase.auth.getUser()
 *    - 避免了复杂的Supabase会话管理
 *    - 减少了网络请求和延迟
 * 
 * 2. **基于路由配置的智能处理**
 *    - 使用统一的路由配置系统
 *    - 根据认证策略动态处理
 *    - 支持不同类型的认证需求
 * 
 * 3. **简化的错误处理**
 *    - 发生错误时允许请求通过
 *    - 由客户端AuthGuard组件处理具体认证
 *    - 避免中间件层面的认证失败
 * 
 * 4. **更好的性能**
 *    - 减少了异步操作
 *    - 避免了数据库查询
 *    - 更快的响应时间
 * 
 * 5. **职责分离**
 *    - 中间件只负责路由级别的基础检查
 *    - 具体的认证逻辑由客户端处理
 *    - 更清晰的架构分层
 * 
 * 使用方法：
 * 1. 将此文件重命名为 middleware.ts 替换现有中间件
 * 2. 确保客户端AuthGuard组件正确配置
 * 3. 测试所有路由的认证流程
 */
