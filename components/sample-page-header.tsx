"use client";

import React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { WorkspaceNavigation } from "@/components/workspace-navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  FlaskConical, 
  Filter, 
  TruckIcon, 
  Package,
  Clock,
  Beaker,
  BarChart3,
  Info
} from "lucide-react";
import { useRouter } from "next/navigation";

// 样本类型枚举
export type SampleType = 'shift' | 'filter' | 'incoming' | 'outgoing';

// 样本类型配置
const SAMPLE_CONFIG = {
  shift: {
    icon: FlaskConical,
    title: "班样记录",
    subtitle: "生产日报数据填报",
    description: "请填写班样记录数据，数据将同步到生产日报-FDX数据表",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800"
  },
  filter: {
    icon: Filter,
    title: "压滤样记录",
    subtitle: "压滤样化验数据填报",
    description: "请填写压滤样记录数据，包含开始时间、结束时间和化验结果",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800"
  },
  incoming: {
    icon: TruckIcon,
    title: "进厂样记录",
    subtitle: "进厂原矿化验数据填报",
    description: "请填写进厂样记录数据，包含日期和化验结果",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    borderColor: "border-orange-200 dark:border-orange-800"
  },
  outgoing: {
    icon: Package,
    title: "出厂样记录",
    subtitle: "出厂精矿化验数据填报",
    description: "请填写出厂样记录数据，包含日期和化验结果",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    borderColor: "border-purple-200 dark:border-purple-800"
  }
} as const;

// 组件属性接口
export interface SamplePageHeaderProps {
  sampleType: SampleType;
  showBackButton?: boolean;
  showBreadcrumb?: boolean;
  showStatus?: boolean;
  status?: 'draft' | 'submitted' | 'processing' | 'completed';
  className?: string;
  onBack?: () => void;
  children?: React.ReactNode;
}

export function SamplePageHeader({
  sampleType,
  showBackButton = false,
  showBreadcrumb = true,
  showStatus = false,
  status = 'draft',
  className,
  onBack,
  children
}: SamplePageHeaderProps) {
  const router = useRouter();
  const config = SAMPLE_CONFIG[sampleType];
  const IconComponent = config.icon;

  // 状态配置
  const statusConfig = {
    draft: { label: "草稿", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
    submitted: { label: "已提交", color: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200" },
    processing: { label: "处理中", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200" },
    completed: { label: "已完成", color: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200" }
  };

  // 返回处理
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className={cn("border-b", className)}>
      <div className="container mx-auto px-4 py-4">
        {/* 面包屑导航 */}
        {showBreadcrumb && (
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <span>化验室</span>
            <span className="mx-2">/</span>
            <span>样本记录</span>
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium">{config.title}</span>
          </div>
        )}

        {/* 主标题栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* 返回按钮 */}
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="rounded-full hover:bg-muted"
                title="返回"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}

            {/* 工作区导航 */}
            <WorkspaceNavigation />

            {/* 页面图标和标题 */}
            <div className="flex items-center space-x-3">
              <div className={cn(
                "p-2 rounded-lg",
                config.bgColor,
                config.borderColor,
                "border"
              )}>
                <IconComponent className={cn("h-6 w-6", config.color)} />
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl sm:text-2xl font-bold">{config.title}</h1>
                  
                  {/* 状态标识 */}
                  {showStatus && (
                    <Badge className={statusConfig[status].color}>
                      {statusConfig[status].label}
                    </Badge>
                  )}
                </div>
                
                {/* 副标题 */}
                <p className="text-sm text-muted-foreground mt-1">
                  {config.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* 右侧操作区 */}
          <div className="flex items-center space-x-3">
            {/* 自定义内容 */}
            {children}
            
            {/* 主题切换 */}
            <ThemeToggle />
          </div>
        </div>

        {/* 描述信息 */}
        <div className={cn(
          "mt-4 p-3 rounded-lg flex items-start space-x-2",
          config.bgColor,
          config.borderColor,
          "border"
        )}>
          <Info className={cn("h-4 w-4 mt-0.5 flex-shrink-0", config.color)} />
          <p className="text-sm text-muted-foreground">
            {config.description}
          </p>
        </div>
      </div>
    </div>
  );
}

// 便捷组件导出
export const ShiftSampleHeader = (props: Omit<SamplePageHeaderProps, 'sampleType'>) => (
  <SamplePageHeader {...props} sampleType="shift" />
);

export const FilterSampleHeader = (props: Omit<SamplePageHeaderProps, 'sampleType'>) => (
  <SamplePageHeader {...props} sampleType="filter" />
);

export const IncomingSampleHeader = (props: Omit<SamplePageHeaderProps, 'sampleType'>) => (
  <SamplePageHeader {...props} sampleType="incoming" />
);

export const OutgoingSampleHeader = (props: Omit<SamplePageHeaderProps, 'sampleType'>) => (
  <SamplePageHeader {...props} sampleType="outgoing" />
);

// 默认导出
export default SamplePageHeader;
