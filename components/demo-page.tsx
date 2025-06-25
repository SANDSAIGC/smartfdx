"use client";

import React, { useState, useEffect } from "react";
import { DataEntryCard } from "@/components/data-entry-card";
import { DataDisplayCard } from "@/components/data-display-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { diagnoseNetworkConnection } from "@/lib/network-diagnostics";

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

          {/* 网络测试按钮 */}
          <div className="mt-4">
            <Button
              onClick={handleNetworkTest}
              variant="outline"
              size="sm"
            >
              🔍 网络连接测试
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
