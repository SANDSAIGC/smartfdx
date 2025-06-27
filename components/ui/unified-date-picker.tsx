/**
 * 统一日期选择组件
 * 
 * 功能：
 * 1. 标准化的日期选择界面
 * 2. 中文本地化支持
 * 3. 多种显示模式（单日期、日期范围、日期时间）
 * 4. 一致的样式和交互体验
 * 5. 完整的TypeScript类型支持
 */

"use client";

import * as React from "react";
import { CalendarIcon, Clock, CalendarRange } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// 日期选择器类型
export type DatePickerMode = 'single' | 'range' | 'datetime' | 'input';

// 日期范围接口
export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

// 统一日期选择器属性
export interface UnifiedDatePickerProps {
  mode?: DatePickerMode;
  value?: Date | DateRange;
  onChange?: (value: Date | DateRange | undefined) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  showTime?: boolean;
  format?: string;
  locale?: any;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: (date: Date) => boolean;
}

// 时间选择器组件
function TimeSelector({ 
  value, 
  onChange, 
  disabled 
}: { 
  value: Date | undefined; 
  onChange: (date: Date) => void; 
  disabled?: boolean;
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const currentHour = value ? value.getHours().toString().padStart(2, '0') : '00';
  const currentMinute = value ? value.getMinutes().toString().padStart(2, '0') : '00';

  const updateTime = (hour: string, minute: string) => {
    const newDate = value ? new Date(value) : new Date();
    newDate.setHours(parseInt(hour), parseInt(minute), 0, 0);
    onChange(newDate);
  };

  return (
    <div className="flex items-center space-x-2 p-3 border-t">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <Select
        value={currentHour}
        onValueChange={(hour) => updateTime(hour, currentMinute)}
        disabled={disabled}
      >
        <SelectTrigger className="w-16">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {hours.map((hour) => (
            <SelectItem key={hour} value={hour}>
              {hour}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground">:</span>
      <Select
        value={currentMinute}
        onValueChange={(minute) => updateTime(currentHour, minute)}
        disabled={disabled}
      >
        <SelectTrigger className="w-16">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((minute) => (
            <SelectItem key={minute} value={minute}>
              {minute}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// 格式化日期显示
function formatDateDisplay(
  date: Date | DateRange | undefined, 
  mode: DatePickerMode, 
  formatStr: string = "yyyy-MM-dd",
  showTime: boolean = false
): string {
  if (!date) return "";

  const actualFormat = showTime ? `${formatStr} HH:mm` : formatStr;

  if (mode === 'range' && typeof date === 'object' && 'from' in date) {
    const { from, to } = date as DateRange;
    if (from && to) {
      return `${format(from, actualFormat, { locale: zhCN })} - ${format(to, actualFormat, { locale: zhCN })}`;
    } else if (from) {
      return format(from, actualFormat, { locale: zhCN });
    }
    return "";
  }

  if (date instanceof Date) {
    return format(date, actualFormat, { locale: zhCN });
  }

  return "";
}

// 主要的统一日期选择器组件
export function UnifiedDatePicker({
  mode = 'single',
  value,
  onChange,
  placeholder = "选择日期",
  label,
  disabled = false,
  className,
  required = false,
  showTime = false,
  format: formatStr = "yyyy-MM-dd",
  locale = zhCN,
  minDate,
  maxDate,
  disabledDates
}: UnifiedDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tempValue, setTempValue] = React.useState<Date | DateRange | undefined>(value);

  // 同步外部值变化
  React.useEffect(() => {
    setTempValue(value);
  }, [value]);

  // 输入模式的日期处理
  if (mode === 'input') {
    const inputValue = value instanceof Date ? format(value, "yyyy-MM-dd") : "";
    
    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <Label className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <div className="relative">
          <Input
            type="date"
            value={inputValue}
            onChange={(e) => {
              const newDate = e.target.value ? new Date(e.target.value + 'T00:00:00') : undefined;
              onChange?.(newDate);
            }}
            disabled={disabled}
            required={required}
            className="pr-10"
            min={minDate ? format(minDate, "yyyy-MM-dd") : undefined}
            max={maxDate ? format(maxDate, "yyyy-MM-dd") : undefined}
          />
          <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>
    );
  }

  // Popover模式的日期选择器
  const displayValue = formatDateDisplay(tempValue, mode, formatStr, showTime);
  const icon = mode === 'range' ? CalendarRange : CalendarIcon;
  const IconComponent = icon;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !displayValue && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <IconComponent className="mr-2 h-4 w-4" />
            {displayValue || placeholder}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent
          className="w-auto p-0 shadow-lg border-2"
          align="start"
          side="bottom"
          sideOffset={8}
        >
          <Calendar
            mode={mode === 'range' ? 'range' : 'single'}
            selected={tempValue}
            onSelect={(newValue) => {
              setTempValue(newValue);

              // 单日期模式且不需要时间选择时，立即关闭
              if (mode === 'single' && !showTime && newValue) {
                onChange?.(newValue);
                setIsOpen(false);
              } else if (mode === 'range') {
                onChange?.(newValue);
                // 日期范围选择完成后关闭
                if (newValue && typeof newValue === 'object' && 'from' in newValue && newValue.from && newValue.to) {
                  setIsOpen(false);
                }
              }
            }}
            disabled={disabledDates}
            locale={locale}
            numberOfMonths={mode === 'range' ? 2 : 1}
            fromDate={minDate}
            toDate={maxDate}
            initialFocus
            className="p-4"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center mb-4",
              caption_label: "text-base font-semibold",
              nav: "space-x-1 flex items-center",
              nav_button: "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-accent rounded-md transition-colors",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex mb-2",
              head_cell: "text-muted-foreground rounded-md w-10 font-normal text-sm text-center py-2",
              row: "flex w-full mt-2",
              cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-10 w-10 p-0 font-normal text-sm hover:bg-accent hover:text-accent-foreground rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 aria-selected:opacity-100",
              day_range_end: "day-range-end",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-medium",
              day_today: "bg-accent text-accent-foreground font-semibold",
              day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
              day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
              day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
            }}
          />
          
          {/* 时间选择器 */}
          {showTime && mode === 'single' && (
            <TimeSelector
              value={tempValue as Date}
              onChange={(newDate) => {
                setTempValue(newDate);
                onChange?.(newDate);
              }}
              disabled={disabled}
            />
          )}
          
          {/* 确认按钮（用于日期时间模式） */}
          {showTime && mode === 'single' && (
            <div className="p-3 border-t">
              <Button
                onClick={() => setIsOpen(false)}
                className="w-full"
                size="sm"
              >
                确认
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

// 便捷的单日期选择器
export function DatePicker(props: Omit<UnifiedDatePickerProps, 'mode'>) {
  return <UnifiedDatePicker {...props} mode="single" />;
}

// 便捷的日期范围选择器
export function DateRangePicker(props: Omit<UnifiedDatePickerProps, 'mode'>) {
  return <UnifiedDatePicker {...props} mode="range" />;
}

// 便捷的日期时间选择器
export function DateTimePicker(props: Omit<UnifiedDatePickerProps, 'mode' | 'showTime'>) {
  return <UnifiedDatePicker {...props} mode="datetime" showTime={true} />;
}

// 便捷的输入框日期选择器
export function DateInputPicker(props: Omit<UnifiedDatePickerProps, 'mode'>) {
  return <UnifiedDatePicker {...props} mode="input" />;
}

/**
 * 使用示例：
 * 
 * // 基础单日期选择
 * <DatePicker
 *   value={date}
 *   onChange={setDate}
 *   label="选择日期"
 *   placeholder="请选择日期"
 * />
 * 
 * // 日期范围选择
 * <DateRangePicker
 *   value={dateRange}
 *   onChange={setDateRange}
 *   label="选择日期范围"
 *   placeholder="请选择日期范围"
 * />
 * 
 * // 日期时间选择
 * <DateTimePicker
 *   value={datetime}
 *   onChange={setDatetime}
 *   label="选择日期和时间"
 *   format="yyyy年MM月dd日"
 * />
 * 
 * // 输入框模式
 * <DateInputPicker
 *   value={date}
 *   onChange={setDate}
 *   label="日期输入"
 *   required={true}
 * />
 */
