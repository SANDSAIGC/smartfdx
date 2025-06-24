"use client";

import { useState } from "react";
import { DataEntryCard } from "@/components/data-entry-card";
import { DataDisplayCard } from "@/components/data-display-card";

export function DemoPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 当数据录入成功后，触发数据展示区刷新
  const handleDataSubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Demo 数据管理</h1>
        <p className="text-muted-foreground">
          生产数据录入与查询展示系统
        </p>
      </div>

      {/* 数据录入区 */}
      <DataEntryCard onDataSubmitted={handleDataSubmitted} />

      {/* 数据展示区 */}
      <DataDisplayCard refreshTrigger={refreshTrigger} />
    </div>
  );
}
