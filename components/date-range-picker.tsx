"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CalendarDays } from "lucide-react";

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangePickerProps {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  className?: string;
}

export function DateRangePicker({ dateRange, setDateRange, className }: DateRangePickerProps) {
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setDateRange({
        ...dateRange,
        from: newDate
      });
    }
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setDateRange({
        ...dateRange,
        to: newDate
      });
    }
  };

  const setPresetRange = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);
    
    setDateRange({ from, to });
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="from-date" className="text-sm font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              开始日期
            </Label>
            <Input
              id="from-date"
              type="date"
              value={formatDate(dateRange.from)}
              onChange={handleFromDateChange}
            />
          </div>
          
          <div className="flex-1 space-y-2">
            <Label htmlFor="to-date" className="text-sm font-medium flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              结束日期
            </Label>
            <Input
              id="to-date"
              type="date"
              value={formatDate(dateRange.to)}
              onChange={handleToDateChange}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPresetRange(7)}
            >
              最近7天
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPresetRange(30)}
            >
              最近30天
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
