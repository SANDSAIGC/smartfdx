"use client";

import * as React from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
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

  const formatDateValue = (date: Date | undefined) => {
    if (!date || !isMounted) return "";
    return format(date, "yyyy-MM-dd");
  };

  const formatDisplayDate = (date: Date | undefined) => {
    if (!date || !isMounted) return placeholder;
    return format(date, "yyyy年MM月dd日", { locale: zhCN });
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
        {formatDisplayDate(date)}
      </Button>
      
      {/* 隐藏的原生日期输入 */}
      <Input
        type="date"
        value={formatDateValue(date)}
        onChange={handleDateChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
        disabled={disabled}
        suppressHydrationWarning
      />
    </div>
  );
}
