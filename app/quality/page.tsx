import { ModeToggle } from "@/components/mode-toggle";

export default function QualityPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <div className="border-b">
        <div className="flex h-16 items-center px-4 justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">质量控制系统</h1>
          </div>
          <ModeToggle />
        </div>
      </div>

      {/* 主要内容 */}
      <div className="container mx-auto py-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">欢迎来到质量控制页面</h2>
          <p className="text-muted-foreground">
            这是为质检部门用户设计的专用工作页面
          </p>
          <div className="bg-card border rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">页面功能</h3>
            <ul className="text-left space-y-2 text-sm">
              <li>• 质量检测记录</li>
              <li>• 不合格品管理</li>
              <li>• 检测标准维护</li>
              <li>• 质量报告生成</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
