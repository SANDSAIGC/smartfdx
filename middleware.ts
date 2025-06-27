import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";
import { RouteManager, AuthStrategy } from "@/lib/route-config";

export async function middleware(request: NextRequest) {
  console.log('🔍 [中间件] 处理请求:', request.nextUrl.pathname);

  // 检查当前路径的认证策略
  const currentPath = request.nextUrl.pathname;
  const route = RouteManager.getRouteByPath(currentPath);

  if (route) {
    console.log('📋 [中间件] 路由配置:', {
      path: route.path,
      name: route.name,
      authStrategy: route.authStrategy,
      pageType: route.pageType
    });

    // 如果是无需认证或简化认证的页面，跳过Supabase Auth检查
    if (route.authStrategy === AuthStrategy.NONE || route.authStrategy === AuthStrategy.SIMPLE) {
      console.log('✅ [中间件] 跳过Supabase Auth检查');
      return;
    }
  }

  // 对于需要Supabase Auth的页面，执行标准认证流程
  console.log('🔐 [中间件] 执行Supabase Auth检查');
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 智能路由匹配器 - 基于统一路由配置
     *
     * 排除以下路径：
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (网站图标)
     * - api (API路由)
     * - 静态资源文件 (.svg, .png, .jpg, .jpeg, .gif, .webp)
     *
     * 动态排除使用简化认证的页面：
     * - 通过RouteManager.getMiddlewareExcludedPaths()获取
     * - 包括所有AuthStrategy.NONE和AuthStrategy.SIMPLE的页面
     */
    "/((?!_next/static|_next/image|favicon.ico|api|auth|lab|shift-sample|filter-sample|incoming-sample|outgoing-sample|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
