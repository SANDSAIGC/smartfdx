"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DatePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// 本地日期格式化函数
function formatDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}年${month}月${day}日`;
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "选择日期",
  className,
  disabled = false,
}: DatePickerProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const newDate = new Date(value + 'T00:00:00');
      if (!isNaN(newDate.getTime())) {
        onSelect?.(newDate);
      }
    } else {
      onSelect?.(undefined);
    }
  };

  const getDateValue = (date: Date | undefined) => {
    if (!date || !isMounted) return "";
    return formatDateValue(date);
  };

  const getDisplayDate = (date: Date | undefined) => {
    if (!date || !isMounted) return placeholder;
    return formatDisplayDate(date);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* 显示选中的日期 */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <CalendarIcon className="h-4 w-4" />
        <span>{getDisplayDate(date)}</span>
      </div>

      {/* 原生日期输入 */}
      <Input
        type="date"
        value={getDateValue(date)}
        onChange={handleDateChange}
        disabled={disabled}
        className="w-full"
        placeholder={placeholder}
      />
    </div>
  );
}
