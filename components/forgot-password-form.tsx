"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Phone, Copy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  const phoneNumber = "1818389930";

  const handleCopyPhone = async () => {
    // 立即设置按钮按下状态，提供即时反馈
    setIsButtonPressed(true);
    setTimeout(() => setIsButtonPressed(false), 150);

    try {
      // 尝试使用现代的 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(phoneNumber);
      } else {
        // 降级方案：使用传统的 document.execCommand
        const textArea = document.createElement("textarea");
        textArea.value = phoneNumber;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
      // 可以添加错误提示
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">重置密码</CardTitle>
          <CardDescription>
            联络管理员提交重置申请
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {/* 电话号码信息展示区域 */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">管理员联系电话</p>

                {/* 电话号码展示卡片 */}
                <div className="relative bg-muted/30 border border-muted rounded-lg p-4 hover:bg-muted/50 transition-colors duration-200">
                  <div className="flex items-center justify-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span
                      className="text-lg font-mono font-medium tracking-wider select-all cursor-text"
                      onClick={handleCopyPhone}
                    >
                      {phoneNumber}
                    </span>
                  </div>

                  {/* 点击提示 */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-background/80 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Copy className="h-4 w-4" />
                      <span>点击复制</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {copySuccess && (
              <div className="text-center">
                <p className="text-sm text-green-600 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md py-2 px-3">
                  ✓ 电话号码已复制到剪贴板
                </p>
              </div>
            )}

            <Button
              type="button"
              onClick={handleCopyPhone}
              className={`w-full transition-all duration-150 ${
                isButtonPressed ? 'scale-95' : 'scale-100'
              }`}
              variant="outline"
            >
              <Copy className="h-4 w-4 mr-2" />
              {copySuccess ? "已复制" : "复制电话号码"}
            </Button>
          </div>

          <div className="mt-4 text-center text-sm">
            已有账号？{" "}
            <Link
              href="/auth/login"
              className="underline underline-offset-4 hover:text-primary transition-colors duration-150 active:scale-95 transform"
            >
              立即登录
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
