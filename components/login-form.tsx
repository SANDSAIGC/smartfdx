"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback, useMemo } from "react";
import { LoginRequest, LoginResponse } from "@/lib/types/auth";
import { useUser } from "@/lib/contexts/user-context";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const router = useRouter();
  const { login } = useUser();

  // 验证逻辑优化
  const isFormValid = useMemo(() => {
    return account.trim() !== "" && password.trim() !== "";
  }, [account, password]);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // 立即设置按钮按下状态，提供即时反馈
    setIsButtonPressed(true);
    setTimeout(() => setIsButtonPressed(false), 150);

    if (!isFormValid) {
      setError("请填写账号和密码");
      return;
    }

    setIsLoading(true);
    setError(null);

    console.log('🚀 [登录] 开始登录流程', { account, password: '***' });

    try {
      // 使用新的API路由进行身份验证
      const loginRequest: LoginRequest = {
        email: account, // 使用account作为登录凭据
        password,
      };

      console.log('📤 [登录] 发送登录请求', loginRequest);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginRequest),
      });

      console.log('📥 [登录] 收到响应', { status: response.status, ok: response.ok });

      const result: LoginResponse = await response.json();
      console.log('📋 [登录] 解析响应数据', result);

      if (!result.success) {
        console.error('❌ [登录] 登录失败', result.message);
        setError(result.message || "登录失败，请重试");
        return;
      }

      // 登录成功，显示成功消息
      console.log('✅ [登录] 登录成功', result.message);

      // 保存用户信息到Context
      if (result.user) {
        console.log('💾 [登录] 保存用户信息', result.user);
        // 构造完整的用户信息对象
        const userProfile = {
          id: result.user.id,
          账号: result.user.账号,
          姓名: result.user.姓名,
          部门: result.user.部门,
          电话: '', // API返回中没有这些字段，使用默认值
          密码: '', // 不保存密码
          工作页面: result.user.工作页面,
          职称: result.user.职称 || '化验师', // 使用API返回的职称，默认为化验师
          状态: '正常'
        };

        // 使用新的login函数，支持"记住我"功能
        login(userProfile, rememberMe);
        console.log('✅ [登录] 用户登录状态已保存，记住我:', rememberMe);
      }

      // 登录成功，立即触发重定向
      // 重定向逻辑由 LoginPageContent 组件统一处理，避免双重重定向
      console.log('✅ [登录] 登录成功，触发页面重新渲染以启动重定向...');

      // 立即重置加载状态，让 LoginPageContent 重新渲染并处理重定向
      setIsLoading(false);

    } catch (error: unknown) {
      console.error('❌ [登录] 请求错误:', error);
      setError("网络错误，请检查连接后重试");
      setIsLoading(false);
    }
    // 登录成功时已经在上面立即设置了 setIsLoading(false)
    // 登录失败时在 catch 块中设置 setIsLoading(false)
    // 不需要 finally 块
  }, [account, password, isFormValid, router]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">欢迎回来</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="account">账号</Label>
                <Input
                  id="account"
                  type="text"
                  placeholder="请输入工号或账号"
                  required
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">密码</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline hover:text-primary transition-colors duration-150 active:scale-95 transform"
                  >
                    忘记密码？
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* 记住账号复选框 */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm font-normal">
                  记住账号
                </Label>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                type="submit"
                className={`w-full transition-all duration-150 ${
                  isButtonPressed ? 'scale-95' : 'scale-100'
                } ${
                  !isFormValid ? 'opacity-50' : 'opacity-100'
                }`}
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? "登录中..." : "登录"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              还没有账号？{" "}
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-4 hover:text-primary transition-colors duration-150 active:scale-95 transform"
              >
                立即注册
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
