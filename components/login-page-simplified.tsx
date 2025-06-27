/**
 * 简化的登录页面组件
 * 
 * 功能：
 * 1. 使用统一认证系统
 * 2. 智能重定向处理
 * 3. 简化的状态管理
 * 4. 更好的用户体验
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-system';
import { RedirectManager } from '@/lib/redirect-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ThemeToggle } from '@/components/theme-toggle';
import { AuthLoading } from '@/components/auth-loading';
import { LoggedInInterface } from '@/components/logged-in-interface';

export function LoginPageSimplified() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, user, login } = useAuth();
  
  // 表单状态
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 获取重定向参数
  const redirectParam = searchParams.get('redirect');

  // 处理已登录用户的重定向
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      console.log('✅ [简化登录页] 用户已登录，处理重定向');
      
      const redirectResult = RedirectManager.handleLoginSuccess(user, redirectParam);
      
      console.log('🎯 [简化登录页] 重定向结果:', redirectResult);
      
      if (redirectResult.shouldRedirect) {
        console.log('🚀 [简化登录页] 执行重定向到:', redirectResult.targetUrl);
        
        if (redirectResult.replaceHistory) {
          router.replace(redirectResult.targetUrl);
        } else {
          router.push(redirectResult.targetUrl);
        }
      }
    }
  }, [isAuthenticated, user, isLoading, redirectParam, router]);

  // 处理表单输入
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除错误信息
    if (error) {
      setError('');
    }
  };

  // 处理登录提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    console.log('🔐 [简化登录页] 开始登录流程');
    
    setIsSubmitting(true);
    setError('');

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      if (result.success && result.user) {
        console.log('✅ [简化登录页] 登录成功');
        
        // 使用智能重定向管理器处理重定向
        const redirectResult = RedirectManager.handleLoginSuccess(result.user, redirectParam);
        
        console.log('🎯 [简化登录页] 登录后重定向:', redirectResult);
        
        if (redirectResult.shouldRedirect) {
          if (redirectResult.replaceHistory) {
            router.replace(redirectResult.targetUrl);
          } else {
            router.push(redirectResult.targetUrl);
          }
        }
      } else {
        console.log('❌ [简化登录页] 登录失败:', result.message);
        setError(result.message || '登录失败，请重试');
      }
    } catch (error) {
      console.error('❌ [简化登录页] 登录异常:', error);
      setError('网络错误，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 如果认证系统正在初始化，显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AuthLoading />
      </div>
    );
  }

  // 如果用户已登录，显示已登录界面
  if (isAuthenticated && user) {
    return <LoggedInInterface />;
  }

  // 渲染登录表单
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* 主题切换按钮 */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-lg">智能FDX系统</CardTitle>
          <CardDescription className="text-base">
            请输入您的账号和密码登录
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 账号输入 */}
            <div className="space-y-2">
              <Label htmlFor="email">账号</Label>
              <Input
                id="email"
                type="text"
                placeholder="请输入账号"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* 密码输入 */}
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* 记住我选项 */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => handleInputChange('rememberMe', !!checked)}
                disabled={isSubmitting}
              />
              <Label htmlFor="rememberMe" className="text-sm">
                记住我（30天内免登录）
              </Label>
            </div>

            {/* 错误信息 */}
            {error && (
              <div className="text-sm text-destructive text-center p-2 bg-destructive/10 rounded">
                {error}
              </div>
            )}

            {/* 登录按钮 */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !formData.email || !formData.password}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </Button>
          </form>

          {/* 提示信息 */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>支持员工工号、用户名等多种账号格式</p>
            <p className="mt-1">如有问题请联系系统管理员</p>
          </div>
        </CardContent>
      </Card>

      {/* 底部版权信息 */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-muted-foreground">
        © 2024 智能FDX系统. 保留所有权利.
      </div>
    </div>
  );
}

/**
 * 简化登录页面的优势：
 * 
 * 1. **统一认证流程**
 *    - 使用单一的AuthSystem处理登录
 *    - 避免了多个认证系统的复杂性
 *    - 更可靠的登录体验
 * 
 * 2. **智能重定向处理**
 *    - 使用RedirectManager统一处理重定向逻辑
 *    - 支持返回原始访问页面
 *    - 避免了重定向循环问题
 * 
 * 3. **简化的状态管理**
 *    - 减少了不必要的状态变量
 *    - 更清晰的组件逻辑
 *    - 更好的性能表现
 * 
 * 4. **更好的用户体验**
 *    - 清晰的加载状态指示
 *    - 友好的错误信息显示
 *    - 响应式设计支持
 * 
 * 5. **灵活的账号支持**
 *    - 支持多种账号格式
 *    - 不强制要求邮箱格式
 *    - 更适合企业内部使用
 */
