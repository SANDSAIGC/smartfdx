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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
            <div className="grid gap-2">
              <Label htmlFor="phone">电话号码</Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                readOnly
                className="bg-muted cursor-default"
              />
            </div>

            {copySuccess && (
              <p className="text-sm text-green-600 text-center">
                电话号码已复制到剪贴板
              </p>
            )}

            <Button
              type="button"
              onClick={handleCopyPhone}
              className={`w-full transition-all duration-150 ${
                isButtonPressed ? 'scale-95' : 'scale-100'
              }`}
            >
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
