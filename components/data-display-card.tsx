"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface DemoRecord {
  id: string;
  日期: string;
  进厂数据: number;
  生产数据: number;
  出厂数据: number;
  created_at: string;
}

interface DataDisplayCardProps {
  refreshTrigger?: number;
}

export function DataDisplayCard({ refreshTrigger }: DataDisplayCardProps) {
  const [date, setDate] = useState<Date>();
  const [records, setRecords] = useState<DemoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async (selectedDate: Date) => {
    setIsLoading(true);
    
    try {
      const supabase = createClient();
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('demo')
        .select('*')
        .eq('日期', dateString)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRecords(data || []);
    } catch (error) {
      console.error('获取数据失败:', error);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 当日期改变时获取数据
  useEffect(() => {
    if (date) {
      fetchData(date);
    }
  }, [date]);

  // 当数据录入成功后刷新当前选中日期的数据
  useEffect(() => {
    if (refreshTrigger && date) {
      fetchData(date);
    }
  }, [refreshTrigger, date]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>数据查询与展示</CardTitle>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">选择查询日期</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full md:w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "yyyy年MM月dd日", { locale: zhCN }) : "选择查询日期"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={zhCN}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {!date ? (
          <div className="text-center py-8 text-muted-foreground">
            请选择日期以查看数据
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            所选日期暂无数据
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>进厂数据</TableHead>
                  <TableHead>生产数据</TableHead>
                  <TableHead>出厂数据</TableHead>
                  <TableHead>记录时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.进厂数据}
                    </TableCell>
                    <TableCell>{record.生产数据}</TableCell>
                    <TableCell>{record.出厂数据}</TableCell>
                    <TableCell>
                      {format(new Date(record.created_at), "HH:mm:ss", { locale: zhCN })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
