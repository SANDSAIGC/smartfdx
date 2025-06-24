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
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const newDate = new Date(value);
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
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !date && "text-muted-foreground"
        )}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {getDisplayDate(date)}
      </Button>

      {/* 隐藏的原生日期输入 */}
      <Input
        type="date"
        value={getDateValue(date)}
        onChange={handleDateChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
        disabled={disabled}
        suppressHydrationWarning
      />
    </div>
  );
}
