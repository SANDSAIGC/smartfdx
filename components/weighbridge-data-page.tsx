"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  FileText, Bell, CalendarCheck, 
  Truck, CalendarRange, ArrowDownUp, Scale, Check, Package,
  FileEdit, ShoppingCart, Building, ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ThemeToggle } from "@/components/theme-toggle";

// 类型定义
interface WeighbridgeRecord {
  recordDateTime: Date;
  plateNumber: string;
  relatedUnit: string;
  direction: "in" | "out";
  weight: string;
  remark: string;
  cargoType: string;
}

export function WeighbridgeDataPage() {
  const router = useRouter();
  
  // 状态管理
  const [recordDateTime, setRecordDateTime] = useState<Date>(new Date());
  const [plateNumber, setPlateNumber] = useState<string>("");
  const [relatedUnit, setRelatedUnit] = useState<string>("");
  const [direction, setDirection] = useState<"in" | "out">("in");
  const [weight, setWeight] = useState<string>("");
  const [remark, setRemark] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [isSuccess, setIsSuccess] = useState(false);
  const [cargoType, setCargoType] = useState<string>("其他");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // 提交处理
  const handleSubmit = async () => {
    if (!recordDateTime || !weight) return;
    
    setIsSubmitting(true);
    setSubmissionStatus('submitting');
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmissionStatus('success');
      setIsSuccess(true);
      
      // 重置表单
      setPlateNumber("");
      setRelatedUnit("");
      setWeight("");
      setRemark("");
      
      setTimeout(() => {
        setIsSubmitting(false);
        setTimeout(() => {
          setSubmissionStatus('idle');
          setIsSuccess(false);
        }, 3000);
      }, 500);
    } catch (error) {
      console.error('提交磅房记录失败:', error);
      setSubmissionStatus('error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 顶部导航 */}
      <div className="flex justify-between items-center p-6 border-b">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-xl font-semibold tracking-wider">磅房数据</span>
        </div>
        <ThemeToggle />
      </div>
      
      {/* 主要内容 */}
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">车辆称重登记</h1>
            <p className="text-muted-foreground">记录来往车辆的称重数据</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="mr-2 h-5 w-5" />
                车辆信息登记
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 载物类型选择 */}
              <div className="space-y-3">
                <Label className="flex items-center text-sm font-medium">
                  <Package className="mr-2 h-4 w-4" />
                  载物类型
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {['原矿', '销售矿', '其他'].map((type) => (
                    <Button
                      key={type}
                      variant={cargoType === type ? "default" : "outline"}
                      className="h-12"
                      onClick={() => setCargoType(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* 时间选择 */}
              <div className="space-y-3">
                <Label className="flex items-center text-sm font-medium">
                  <CalendarRange className="mr-2 h-4 w-4" />
                  记录时间
                </Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !recordDateTime && "text-muted-foreground"
                      )}
                    >
                      <CalendarRange className="mr-2 h-4 w-4" />
                      {recordDateTime ? format(recordDateTime, "yyyy-MM-dd HH:mm") : "选择时间"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={recordDateTime}
                      onSelect={(date) => {
                        if (date) {
                          setRecordDateTime(date);
                          setIsCalendarOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* 关联单位 */}
              <div className="space-y-3">
                <Label htmlFor="related-unit" className="flex items-center text-sm font-medium">
                  <Building className="mr-2 h-4 w-4" />
                  关联单位
                </Label>
                <Input
                  id="related-unit"
                  value={relatedUnit}
                  onChange={(e) => setRelatedUnit(e.target.value)}
                  placeholder="输入关联单位"
                />
              </div>
              
              {/* 车牌号 */}
              <div className="space-y-3">
                <Label htmlFor="plate-number" className="flex items-center text-sm font-medium">
                  <Truck className="mr-2 h-4 w-4" />
                  车牌号（选填）
                </Label>
                <Input
                  id="plate-number"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  placeholder="输入车牌号（选填）"
                />
              </div>
              
              {/* 进出状态 */}
              <div className="space-y-3">
                <Label className="flex items-center text-sm font-medium">
                  <ArrowDownUp className="mr-2 h-4 w-4" />
                  进出状态
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={direction === "in" ? "default" : "outline"}
                    className="h-12"
                    onClick={() => setDirection("in")}
                  >
                    进厂
                  </Button>
                  <Button
                    variant={direction === "out" ? "default" : "outline"}
                    className="h-12"
                    onClick={() => setDirection("out")}
                  >
                    出厂
                  </Button>
                </div>
              </div>
              
              {/* 重量 */}
              <div className="space-y-3">
                <Label htmlFor="weight" className="flex items-center text-sm font-medium">
                  <Scale className="mr-2 h-4 w-4" />
                  重量 (KG) *
                </Label>
                <Input
                  id="weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="输入重量"
                  type="number"
                  required
                />
              </div>
              
              {/* 备注 */}
              <div className="space-y-3">
                <Label htmlFor="remark" className="flex items-center text-sm font-medium">
                  <FileEdit className="mr-2 h-4 w-4" />
                  备注（选填）
                </Label>
                <Textarea
                  id="remark"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="输入备注信息（选填）"
                  className="min-h-[100px]"
                />
              </div>
              
              {/* 提交按钮 */}
              <div className="pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !weight}
                  className={cn(
                    "w-full h-12 relative overflow-hidden transition-all duration-300",
                    isSuccess && "bg-green-500 hover:bg-green-600"
                  )}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                      提交中...
                    </div>
                  ) : submissionStatus === 'success' ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      提交成功
                    </>
                  ) : "提交记录"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* 底部导航 */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="flex justify-around items-center p-4">
          <Button variant="ghost" className="flex flex-col items-center space-y-1 h-auto py-2">
            <FileText className="w-5 h-5" />
            <span className="text-xs">情况上报</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center space-y-1 h-auto py-2">
            <Bell className="w-5 h-5" />
            <span className="text-xs">任务通知</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center space-y-1 h-auto py-2">
            <CalendarCheck className="w-5 h-5" />
            <span className="text-xs">考勤打卡</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center space-y-1 h-auto py-2">
            <ShoppingCart className="w-5 h-5" />
            <span className="text-xs">采购申请</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
