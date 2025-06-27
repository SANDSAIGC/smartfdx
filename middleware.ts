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
     * - lab (实验室页面，使用简化身份验证)
     * - shift-sample, filter-sample, incoming-sample, outgoing-sample (样本记录页面，使用简化身份验证)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|api|lab|shift-sample|filter-sample|incoming-sample|outgoing-sample|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
