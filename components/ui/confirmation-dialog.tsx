"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  Save,
  Trash2,
  RefreshCw,
  Send,
  Download,
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils";

// 确认对话框类型
export type ConfirmationType = 
  | 'submit'      // 普通提交 (蓝色主题)
  | 'delete'      // 删除操作 (红色警告主题)
  | 'update'      // 重要更新 (黄色注意主题)
  | 'reset'       // 重置操作 (橙色警告主题)
  | 'export'      // 导出操作 (绿色主题)
  | 'upload'      // 上传操作 (紫色主题)
  | 'info';       // 信息提示 (灰色主题)

// 确认对话框配置
interface ConfirmationConfig {
  type: ConfirmationType;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

// 预设配置
const CONFIRMATION_PRESETS: Record<ConfirmationType, Partial<ConfirmationConfig>> = {
  submit: {
    icon: <Save className="h-5 w-5" />,
    confirmText: "确认提交",
    cancelText: "取消",
    variant: "default"
  },
  delete: {
    icon: <Trash2 className="h-5 w-5" />,
    confirmText: "确认删除",
    cancelText: "取消",
    variant: "destructive"
  },
  update: {
    icon: <RefreshCw className="h-5 w-5" />,
    confirmText: "确认更新",
    cancelText: "取消",
    variant: "default"
  },
  reset: {
    icon: <XCircle className="h-5 w-5" />,
    confirmText: "确认重置",
    cancelText: "取消",
    variant: "destructive"
  },
  export: {
    icon: <Download className="h-5 w-5" />,
    confirmText: "确认导出",
    cancelText: "取消",
    variant: "default"
  },
  upload: {
    icon: <Upload className="h-5 w-5" />,
    confirmText: "确认上传",
    cancelText: "取消",
    variant: "default"
  },
  info: {
    icon: <Info className="h-5 w-5" />,
    confirmText: "确定",
    cancelText: "取消",
    variant: "outline"
  }
};

// 主题样式配置
const THEME_STYLES: Record<ConfirmationType, string> = {
  submit: "text-blue-600 dark:text-blue-400",
  delete: "text-red-600 dark:text-red-400", 
  update: "text-yellow-600 dark:text-yellow-400",
  reset: "text-orange-600 dark:text-orange-400",
  export: "text-green-600 dark:text-green-400",
  upload: "text-purple-600 dark:text-purple-400",
  info: "text-gray-600 dark:text-gray-400"
};

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  config: ConfirmationConfig;
  loading?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  config,
  loading = false
}: ConfirmationDialogProps) {
  const preset = CONFIRMATION_PRESETS[config.type];
  const themeStyle = THEME_STYLES[config.type];
  
  const finalConfig = {
    ...preset,
    ...config,
    icon: config.icon || preset.icon,
    confirmText: config.confirmText || preset.confirmText,
    cancelText: config.cancelText || preset.cancelText,
    variant: config.variant || preset.variant
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            {finalConfig.icon && (
              <span className={cn("flex-shrink-0", themeStyle)}>
                {finalConfig.icon}
              </span>
            )}
            <span>{finalConfig.title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            {finalConfig.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {finalConfig.cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              finalConfig.variant === 'destructive' && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            )}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                <span>处理中...</span>
              </div>
            ) : (
              finalConfig.confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook for easier usage
export function useConfirmationDialog() {
  const [dialogState, setDialogState] = React.useState<{
    open: boolean;
    config: ConfirmationConfig | null;
    onConfirm: (() => void) | null;
    loading: boolean;
  }>({
    open: false,
    config: null,
    onConfirm: null,
    loading: false
  });

  const showConfirmation = React.useCallback((
    config: ConfirmationConfig,
    onConfirm: () => void
  ) => {
    setDialogState({
      open: true,
      config,
      onConfirm,
      loading: false
    });
  }, []);

  const hideConfirmation = React.useCallback(() => {
    setDialogState(prev => ({
      ...prev,
      open: false
    }));
  }, []);

  const setLoading = React.useCallback((loading: boolean) => {
    setDialogState(prev => ({
      ...prev,
      loading
    }));
  }, []);

  const handleConfirm = React.useCallback(() => {
    if (dialogState.onConfirm) {
      setDialogState(prev => ({ ...prev, loading: true }));
      dialogState.onConfirm();
    }
  }, [dialogState.onConfirm]);

  const ConfirmationDialogComponent = React.useCallback(() => {
    if (!dialogState.config) return null;

    return (
      <ConfirmationDialog
        open={dialogState.open}
        onOpenChange={hideConfirmation}
        onConfirm={handleConfirm}
        config={dialogState.config}
        loading={dialogState.loading}
      />
    );
  }, [dialogState, hideConfirmation, handleConfirm]);

  return {
    showConfirmation,
    hideConfirmation,
    setLoading,
    ConfirmationDialog: ConfirmationDialogComponent
  };
}

// 预设确认对话框配置
export const CONFIRMATION_CONFIGS = {
  // 数据提交相关
  SUBMIT_FORM: {
    type: 'submit' as ConfirmationType,
    title: '确认提交数据',
    description: '您确定要提交当前表单数据吗？提交后数据将被保存到系统中。'
  },
  SUBMIT_SAMPLE_DATA: {
    type: 'submit' as ConfirmationType,
    title: '确认提交样本数据',
    description: '您确定要提交当前样本记录吗？提交后数据将被保存到数据库中。'
  },
  SAVE_DRAFT: {
    type: 'info' as ConfirmationType,
    title: '保存草稿',
    description: '您确定要保存当前内容为草稿吗？'
  },

  // 删除操作相关
  DELETE_RECORD: {
    type: 'delete' as ConfirmationType,
    title: '确认删除记录',
    description: '您确定要删除这条记录吗？此操作不可撤销，删除后数据将无法恢复。'
  },
  DELETE_ITEM: {
    type: 'delete' as ConfirmationType,
    title: '确认删除项目',
    description: '您确定要删除这个项目吗？删除后将无法恢复。'
  },

  // 重置操作相关
  RESET_FORM: {
    type: 'reset' as ConfirmationType,
    title: '确认重置表单',
    description: '您确定要重置表单吗？所有已填写的数据将被清空。'
  },
  CLEAR_DATA: {
    type: 'reset' as ConfirmationType,
    title: '确认清空数据',
    description: '您确定要清空所有数据吗？此操作将删除当前页面的所有内容。'
  },

  // 导出操作相关
  EXPORT_DATA: {
    type: 'export' as ConfirmationType,
    title: '确认导出数据',
    description: '您确定要导出当前数据吗？系统将生成文件供您下载。'
  },

  // 上传操作相关
  UPLOAD_FILE: {
    type: 'upload' as ConfirmationType,
    title: '确认上传文件',
    description: '您确定要上传选中的文件吗？上传后文件将被保存到系统中。'
  },

  // 更新操作相关
  UPDATE_STATUS: {
    type: 'update' as ConfirmationType,
    title: '确认更新状态',
    description: '您确定要更新当前状态吗？更新后相关人员将收到通知。'
  }
} as const;
