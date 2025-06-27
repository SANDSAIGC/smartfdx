import { AuthButton } from "@/components/auth-button";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { FlaskConical, Factory, Shield, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>SmartFDX 智能化验管理系统</Link>
            </div>
            <div className="flex items-center gap-4">
              <AuthButton />
              <ModeToggle />
            </div>
          </div>
        </nav>

        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          {/* Hero Section */}
          <div className="flex flex-col items-center text-center gap-6">
            <h1 className="text-4xl font-bold tracking-tight">
              SmartFDX 智能化验管理系统
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              专业的实验室样本记录与数据管理平台，提供高效的化验流程管理和数据分析功能
            </p>
            <div className="flex gap-4 mt-6">
              <Button asChild size="lg">
                <Link href="/auth/login">开始使用</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/lab">进入化验室</Link>
              </Button>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <FlaskConical className="h-8 w-8 text-blue-600" />
                <CardTitle className="text-lg">化验室管理</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  完整的样本记录系统，支持班样、压滤样、进厂样、出厂样等多种样本类型的管理
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Factory className="h-8 w-8 text-green-600" />
                <CardTitle className="text-lg">生产管理</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  实时监控生产数据，提供生产日报和数据分析功能，优化生产流程
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-purple-600" />
                <CardTitle className="text-lg">质量控制</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  严格的质量管理体系，确保产品质量符合标准要求
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-orange-600" />
                <CardTitle className="text-lg">数据分析</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  智能数据分析和可视化，帮助决策者快速了解生产和质量状况
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
