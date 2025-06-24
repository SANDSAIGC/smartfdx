"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// import { toast } from "sonner";

interface DataEntryCardProps {
  onDataSubmitted?: () => void;
}

export function DataEntryCard({ onDataSubmitted }: DataEntryCardProps) {
  const [date, setDate] = useState<Date>();
  const [incomingData, setIncomingData] = useState("");
  const [productionData, setProductionData] = useState("");
  const [outgoingData, setOutgoingData] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      alert("请选择日期");
      return;
    }

    if (!incomingData || !productionData || !outgoingData) {
      alert("请填写所有数据字段");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('demo')
        .insert({
          '日期': format(date, 'yyyy-MM-dd'),
          '进厂数据': parseInt(incomingData),
          '生产数据': parseInt(productionData),
          '出厂数据': parseInt(outgoingData),
        });

      if (error) throw error;

      alert("数据提交成功");

      // 清空表单
      setDate(undefined);
      setIncomingData("");
      setProductionData("");
      setOutgoingData("");

      // 触发数据展示区刷新
      onDataSubmitted?.();

    } catch (error) {
      console.error('提交数据失败:', error);
      alert("数据提交失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>数据录入</CardTitle>
        <CardDescription>
          选择日期并输入生产相关数据
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* 日期选择 */}
          <div className="space-y-2">
            <Label>日期</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {!isMounted ? "选择日期" : date ? format(date, "yyyy年MM月dd日", { locale: zhCN }) : "选择日期"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" suppressHydrationWarning>
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

          {/* 数据输入字段 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="incoming">进厂数据</Label>
              <Input
                id="incoming"
                type="number"
                placeholder="请输入进厂数量"
                value={incomingData}
                onChange={(e) => setIncomingData(e.target.value)}
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="production">生产数据</Label>
              <Input
                id="production"
                type="number"
                placeholder="请输入生产数量"
                value={productionData}
                onChange={(e) => setProductionData(e.target.value)}
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="outgoing">出厂数据</Label>
              <Input
                id="outgoing"
                type="number"
                placeholder="请输入出厂数量"
                value={outgoingData}
                onChange={(e) => setOutgoingData(e.target.value)}
                min="0"
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "提交中..." : "提交数据"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
