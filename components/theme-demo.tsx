"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ThemeDemo() {
  const [mounted, setMounted] = useState(false)
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>主题信息</CardTitle>
          <CardDescription>加载中...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>当前主题信息</CardTitle>
        <CardDescription>显示当前主题设置和实际应用的主题</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">设置的主题:</span>
          <Badge variant="outline">{theme || "未设置"}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">实际主题:</span>
          <Badge variant={resolvedTheme === "dark" ? "default" : "secondary"}>
            {resolvedTheme || "未知"}
          </Badge>
        </div>
        <div className="pt-4">
          <p className="text-sm text-muted-foreground">
            当选择 "系统" 主题时，实际主题会根据您的系统设置自动切换。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
