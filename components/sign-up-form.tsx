"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
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
import { useRouter } from "next/navigation";
import { useState, useCallback, useMemo } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [account, setAccount] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [wechat, setWechat] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const router = useRouter();

  // 验证逻辑优化 - 使用useMemo缓存验证结果
  const validationResult = useMemo(() => {
    // 验证必填字段
    if (!account || !name || !department || !phone || !password || !confirmPassword) {
      return { isValid: false, error: "请填写所有必填字段" };
    }

    // 验证密码匹配
    if (password !== confirmPassword) {
      return { isValid: false, error: "两次输入的密码不一致" };
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return { isValid: false, error: "请输入正确的手机号码" };
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(account)) {
      return { isValid: false, error: "请输入正确的邮箱格式" };
    }

    return { isValid: true, error: null };
  }, [account, name, department, phone, password, confirmPassword]);

  // 优化的提交处理函数 - 使用useCallback避免重复创建
  const handleSignUp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // 立即设置按钮按下状态，提供即时反馈
    setIsButtonPressed(true);
    setTimeout(() => setIsButtonPressed(false), 150);

    // 使用预计算的验证结果
    if (!validationResult.isValid) {
      setError(validationResult.error);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: account,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
          data: {
            name,
            department,
            phone,
            wechat,
          },
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "注册失败，请重试");
    } finally {
      setIsLoading(false);
    }
  }, [validationResult, account, password, name, department, phone, wechat, router]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">用户注册</CardTitle>
          <CardDescription>创建新账号</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-4">
              {/* 1. 账号（必填） */}
              <div className="grid gap-2">
                <Label htmlFor="account">账号 <span className="text-red-500">*</span></Label>
                <Input
                  id="account"
                  type="email"
                  placeholder="请输入邮箱账号"
                  required
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                />
              </div>

              {/* 2. 姓名（必填） */}
              <div className="grid gap-2">
                <Label htmlFor="name">姓名 <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="请输入真实姓名"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* 3. 部门（必填） */}
              <div className="grid gap-2">
                <Label htmlFor="department">部门 <span className="text-red-500">*</span></Label>
                <Input
                  id="department"
                  type="text"
                  placeholder="请输入所属部门"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>

              {/* 4. 电话（必填） */}
              <div className="grid gap-2">
                <Label htmlFor="phone">电话 <span className="text-red-500">*</span></Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="请输入手机号码"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* 5. 微信（选填） */}
              <div className="grid gap-2">
                <Label htmlFor="wechat">微信 <span className="text-muted-foreground text-sm">(选填)</span></Label>
                <Input
                  id="wechat"
                  type="text"
                  placeholder="请输入微信号"
                  value={wechat}
                  onChange={(e) => setWechat(e.target.value)}
                />
              </div>

              {/* 6. 密码（必填） */}
              <div className="grid gap-2">
                <Label htmlFor="password">密码 <span className="text-red-500">*</span></Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* 7. 确认密码（必填） */}
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">确认密码 <span className="text-red-500">*</span></Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="请再次输入密码"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                type="submit"
                className={`w-full transition-all duration-150 ${
                  isButtonPressed ? 'scale-95' : 'scale-100'
                } ${
                  !validationResult.isValid ? 'opacity-50' : 'opacity-100'
                }`}
                disabled={isLoading || !validationResult.isValid}
              >
                {isLoading ? "注册中..." : "注册"}
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
