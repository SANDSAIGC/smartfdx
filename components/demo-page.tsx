"use client";

import React, { useState, useEffect } from "react";
import { DataEntryCard } from "@/components/data-entry-card";
import { DataDisplayCard } from "@/components/data-display-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { diagnoseNetworkConnection } from "@/lib/network-diagnostics";
import { testDirectAPI, testDifferentURLs } from "@/lib/direct-api-test";
import { createProxyClient } from "@/lib/supabase-proxy-client";

export function DemoPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 调试：检查环境变量
  useEffect(() => {
    console.log('=== Demo页面环境变量检查 ===');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY存在:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY长度:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length);
    console.log('================================');
  }, []);

  // 当数据录入成功后，触发数据展示区刷新
  const handleDataSubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // 独立的网络测试功能
  const handleNetworkTest = async () => {
    console.log('=== 手动网络测试开始 ===');
    try {
      const result = await diagnoseNetworkConnection();
      alert(`网络测试完成！\n认证测试: ${result.authentication ? '✅ 成功' : '❌ 失败'}\n请查看控制台详细信息`);
    } catch (error) {
      console.error('网络测试异常:', error);
      alert('网络测试异常，请查看控制台详细信息');
    }
  };

  // 直接API测试功能
  const handleDirectAPITest = async () => {
    console.log('=== 直接API测试开始 ===');
    try {
      const result = await testDirectAPI();
      alert(`直接API测试完成！\n成功: ${result.success ? '✅ 是' : '❌ 否'}\n方法: ${result.method || '无'}\n请查看控制台详细信息`);
    } catch (error) {
      console.error('直接API测试异常:', error);
      alert('直接API测试异常，请查看控制台详细信息');
    }
  };

  // URL测试功能
  const handleURLTest = async () => {
    console.log('=== URL测试开始 ===');
    try {
      const result = await testDifferentURLs();
      alert(`URL测试完成！\n成功: ${result.success ? '✅ 是' : '❌ 否'}\n工作URL: ${result.workingUrl || '无'}\n请查看控制台详细信息`);
    } catch (error) {
      console.error('URL测试异常:', error);
      alert('URL测试异常，请查看控制台详细信息');
    }
  };

  // 代理测试功能
  const handleProxyTest = async () => {
    console.log('=== 代理测试开始 ===');
    try {
      const proxyClient = createProxyClient();
      const result = await proxyClient.testConnection();
      alert(`代理测试完成！\n成功: ${result.success ? '✅ 是' : '❌ 否'}\n${result.success ? '数据: ' + JSON.stringify(result.data) : '错误: ' + result.error}\n请查看控制台详细信息`);
    } catch (error) {
      console.error('代理测试异常:', error);
      alert('代理测试异常，请查看控制台详细信息');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* 页面头部，包含标题和主题切换按钮 */}
      <div className="relative">
        {/* 主题切换按钮 - 右上角 */}
        <div className="absolute top-0 right-0">
          <ThemeToggle />
        </div>

        {/* 页面标题 - 居中 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Demo 数据管理 - 性能优化版</h1>
          <p className="text-muted-foreground">
            生产数据录入与查询展示系统
          </p>

          {/* 测试按钮组 */}
          <div className="mt-4 space-x-2">
            <Button
              onClick={handleNetworkTest}
              variant="outline"
              size="sm"
            >
              🔍 网络连接测试
            </Button>
            <Button
              onClick={handleDirectAPITest}
              variant="outline"
              size="sm"
            >
              🎯 直接API测试
            </Button>
            <Button
              onClick={handleURLTest}
              variant="outline"
              size="sm"
            >
              🌐 URL测试
            </Button>
          </div>
        </div>
      </div>

      {/* 数据录入区 */}
      <DataEntryCard onDataSubmitted={handleDataSubmitted} />

      {/* 数据展示区 */}
      <DataDisplayCard refreshTrigger={refreshTrigger} />
    </div>
  );
}
