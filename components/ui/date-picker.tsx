"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DatePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
}

// 格式化日期为YYYY-MM-DD格式
function formatDate(date: Date | undefined): string {
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "选择日期",
  className,
  disabled = false,
  label,
}: DatePickerProps) {
  const [value, setValue] = React.useState(formatDate(date));

  // 同步外部date变化到内部状态
  React.useEffect(() => {
    setValue(formatDate(date));
  }, [date]);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label && (
        <Label htmlFor="date" className="px-1">
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          id="date"
          type="date"
          value={value}
          placeholder={placeholder}
          className="bg-background pr-10"
          disabled={disabled}
          onChange={(e) => {
            const inputValue = e.target.value;
            setValue(inputValue);

            // 解析日期
            if (inputValue) {
              const parsedDate = new Date(inputValue + 'T00:00:00');
              if (!isNaN(parsedDate.getTime())) {
                onSelect?.(parsedDate);
              }
            } else {
              onSelect?.(undefined);
            }
          }}
        />
        <CalendarIcon className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}
