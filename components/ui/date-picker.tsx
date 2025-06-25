"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  const inputRef = React.useRef<HTMLInputElement>(null);

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

  const handleButtonClick = () => {
    if (inputRef.current && !disabled) {
      try {
        // 尝试使用现代的showPicker API
        if ('showPicker' in inputRef.current) {
          inputRef.current.showPicker();
        } else {
          // 回退到focus和click
          inputRef.current.focus();
          inputRef.current.click();
        }
      } catch (error) {
        // 如果showPicker失败，回退到focus
        inputRef.current.focus();
      }
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
        onClick={handleButtonClick}
        type="button"
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {getDisplayDate(date)}
      </Button>

      {/* 隐藏的原生日期输入 */}
      <input
        ref={inputRef}
        type="date"
        value={getDateValue(date)}
        onChange={handleDateChange}
        className="absolute top-0 left-0 w-0 h-0 opacity-0 pointer-events-none"
        disabled={disabled}
        suppressHydrationWarning
        tabIndex={-1}
        style={{ position: 'absolute', left: '-9999px' }}
      />
    </div>
  );
}
