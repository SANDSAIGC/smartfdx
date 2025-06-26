import { LoginPageContent } from "@/components/login-page-content";
import { ModeToggle } from "@/components/mode-toggle";

export default function Page() {
  return (
    <div className="min-h-svh w-full relative">
      {/* 左上角标题 */}
      <div className="absolute top-6 left-6 z-10">
        <h1 className="text-lg font-bold text-foreground">Fdx Smart Work 2.0</h1>
      </div>

      {/* 右上角主题切换按钮 */}
      <div className="absolute top-6 right-6 z-10">
        <ModeToggle />
      </div>

      {/* 主要内容区域 */}
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm pt-16 sm:pt-12 md:pt-8">
          {/* 中心内容 - 增加顶部间距避免与标题冲突 */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">富鼎翔工业</h2>
            <p className="text-muted-foreground">智能车间2.0</p>
          </div>

          <LoginPageContent />
        </div>
      </div>

      {/* 底部版权信息 - 确保在框体外 */}
      <div className="absolute bottom-10 left-0 right-0 z-10">
        <p className="text-xs text-muted-foreground text-center">
          FDX@2025 滇ICP备2025058380号
        </p>
      </div>
    </div>
  );
}
