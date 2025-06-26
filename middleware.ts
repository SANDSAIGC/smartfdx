import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * - api routes (for testing purposes)
     * - test-kong (Kong测试页面，无需认证)
     * - demo (Demo页面，无需认证)
     * - lab (实验室页面，使用简化身份验证)
     * - test-login, debug-login (测试页面)
     * - lab-performance (性能监控页面)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|api|test-kong|demo|lab|test-login|debug-login|lab-performance|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
