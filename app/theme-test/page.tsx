import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ThemeTestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">主题测试页面</h1>
          <ModeToggle />
        </div>

        {/* Theme Demo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>主要颜色</CardTitle>
              <CardDescription>测试主要颜色在不同主题下的表现</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="default">默认按钮</Button>
              <Button variant="secondary">次要按钮</Button>
              <Button variant="outline">轮廓按钮</Button>
              <Button variant="destructive">危险按钮</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>背景颜色</CardTitle>
              <CardDescription>测试背景和前景色对比</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-md">
                <p className="text-muted-foreground">静音背景文本</p>
              </div>
              <div className="p-4 bg-accent rounded-md">
                <p className="text-accent-foreground">强调背景文本</p>
              </div>
              <div className="p-4 bg-primary rounded-md">
                <p className="text-primary-foreground">主要背景文本</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>边框和输入</CardTitle>
              <CardDescription>测试边框和输入元素</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input 
                type="text" 
                placeholder="输入框测试" 
                className="w-full p-2 border border-input rounded-md bg-background"
              />
              <div className="p-4 border border-border rounded-md">
                <p>边框容器</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
            <CardDescription>如何测试主题切换功能</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>点击右上角的主题切换按钮</li>
              <li>选择 "Light"、"Dark" 或 "System" 模式</li>
              <li>观察页面颜色的变化</li>
              <li>检查所有元素在不同主题下的可读性</li>
            </ol>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle>颜色调色板</CardTitle>
            <CardDescription>当前主题的颜色变量</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="w-full h-12 bg-background border border-border rounded"></div>
                <p className="text-sm">background</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-12 bg-foreground rounded"></div>
                <p className="text-sm">foreground</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-12 bg-primary rounded"></div>
                <p className="text-sm">primary</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-12 bg-secondary rounded"></div>
                <p className="text-sm">secondary</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-12 bg-muted rounded"></div>
                <p className="text-sm">muted</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-12 bg-accent rounded"></div>
                <p className="text-sm">accent</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-12 bg-destructive rounded"></div>
                <p className="text-sm">destructive</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-12 bg-border border border-foreground rounded"></div>
                <p className="text-sm">border</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
