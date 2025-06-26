"use client";

import React, { useState, useCallback, memo } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { WorkspaceNavigation } from "@/components/workspace-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  CalendarIcon,
  Calculator,
  Save,
  Loader2,
  FlaskConical,
  Droplets,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// 表单数据接口
interface ShiftSampleFormData {
  date: Date | undefined;
  shift: string;
  originalMoisture: string;
  originalPbGrade: string;
  originalZnGrade: string;
  concentratePbGrade: string;
  concentrateZnGrade: string;
  tailingsPbGrade: string;
  tailingsZnGrade: string;
}

// 计算器数据接口
interface MoistureCalculatorData {
  wetWeight: string;
  tareWeight: string;
  dryWeight: string;
}

interface GradeCalculatorData {
  edtaConsumption: string;
  edtaConcentration: string;
  sampleWeight: string;
}

// 初始表单数据
const initialFormData: ShiftSampleFormData = {
  date: undefined,
  shift: "",
  originalMoisture: "",
  originalPbGrade: "",
  originalZnGrade: "",
  concentratePbGrade: "",
  concentrateZnGrade: "",
  tailingsPbGrade: "",
  tailingsZnGrade: "",
};

// 初始计算器数据
const initialMoistureData: MoistureCalculatorData = {
  wetWeight: "",
  tareWeight: "",
  dryWeight: "",
};

const initialGradeData: GradeCalculatorData = {
  edtaConsumption: "",
  edtaConcentration: "",
  sampleWeight: "",
};

export const ShiftSamplePage = memo(() => {
  // 状态管理
  const [formData, setFormData] = useState<ShiftSampleFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moistureCalcData, setMoistureCalcData] = useState<MoistureCalculatorData>(initialMoistureData);
  const [gradeCalcData, setGradeCalcData] = useState<GradeCalculatorData>(initialGradeData);
  const [moistureDialogOpen, setMoistureDialogOpen] = useState(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [currentGradeField, setCurrentGradeField] = useState<string>("");
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState<string>("");

  // 表单字段更新
  const updateFormField = useCallback((field: keyof ShiftSampleFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // 数字输入验证
  const handleNumberInput = useCallback((field: keyof ShiftSampleFormData, value: string) => {
    // 只允许数字和小数点
    const numericValue = value.replace(/[^0-9.]/g, '');
    updateFormField(field, numericValue);
  }, [updateFormField]);

  // 水份计算
  const calculateMoisture = useCallback(() => {
    const { wetWeight, tareWeight, dryWeight } = moistureCalcData;
    const wet = parseFloat(wetWeight);
    const tare = parseFloat(tareWeight);
    const dry = parseFloat(dryWeight);

    if (isNaN(wet) || isNaN(tare) || isNaN(dry)) {
      return null;
    }

    if (wet <= tare || dry <= tare) {
      return null;
    }

    // 水份% = (湿重-干重)/(湿重-皮重) × 100%
    const moisture = ((wet - dry) / (wet - tare)) * 100;
    return moisture.toFixed(2);
  }, [moistureCalcData]);

  // 品位计算
  const calculateGrade = useCallback(() => {
    const { edtaConsumption, edtaConcentration, sampleWeight } = gradeCalcData;
    const consumption = parseFloat(edtaConsumption);
    const concentration = parseFloat(edtaConcentration);
    const weight = parseFloat(sampleWeight);

    if (isNaN(consumption) || isNaN(concentration) || isNaN(weight) || weight === 0) {
      return null;
    }

    // 品位% = (EDTA消耗量 × EDTA浓度)/样品质量 × 100%
    const grade = (consumption * concentration) / weight * 100;
    return grade.toFixed(2);
  }, [gradeCalcData]);

  // 一键填入水份
  const fillMoistureResult = useCallback(() => {
    const result = calculateMoisture();
    if (result !== null) {
      updateFormField('originalMoisture', result);
      setMoistureDialogOpen(false);
      setMoistureCalcData(initialMoistureData);
    }
  }, [calculateMoisture, updateFormField]);

  // 一键填入品位
  const fillGradeResult = useCallback(() => {
    const result = calculateGrade();
    if (result !== null && currentGradeField) {
      updateFormField(currentGradeField as keyof ShiftSampleFormData, result);
      setGradeDialogOpen(false);
      setGradeCalcData(initialGradeData);
      setCurrentGradeField("");
    }
  }, [calculateGrade, currentGradeField, updateFormField]);

  // 打开品位计算器
  const openGradeCalculator = useCallback((fieldName: string) => {
    setCurrentGradeField(fieldName);
    setGradeDialogOpen(true);
  }, []);

  // 表单提交
  const handleSubmit = useCallback(async () => {
    if (!formData.date || !formData.shift) {
      setSubmitStatus('error');
      setSubmitMessage('请选择日期和班次');
      setTimeout(() => setSubmitStatus('idle'), 3000);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
      console.log('=== 班样记录提交开始 ===');
      console.log('原始表单数据:', formData);

      // 格式化日期
      const formattedDate = formData.date.toISOString().split('T')[0];

      // 准备提交数据
      const submitData = {
        date: formattedDate,
        shift: formData.shift,
        originalMoisture: formData.originalMoisture,
        originalPbGrade: formData.originalPbGrade,
        originalZnGrade: formData.originalZnGrade,
        concentratePbGrade: formData.concentratePbGrade,
        concentrateZnGrade: formData.concentrateZnGrade,
        tailingsPbGrade: formData.tailingsPbGrade,
        tailingsZnGrade: formData.tailingsZnGrade,
      };

      console.log('准备提交的数据:', submitData);

      // 调用API
      const response = await fetch('/api/shift-sample', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();
      console.log('API响应:', result);

      if (result.success) {
        setSubmitStatus('success');
        setSubmitMessage(`数据${result.operation === 'UPDATE' ? '更新' : '提交'}成功！`);
        setFormData(initialFormData);
        setTimeout(() => setSubmitStatus('idle'), 3000);
      } else {
        throw new Error(result.error || '提交失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      setSubmitStatus('error');
      setSubmitMessage(`提交失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <WorkspaceNavigation />
            <FlaskConical className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">班样记录</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FlaskConical className="h-5 w-5" />
              <span>生产日报数据填报</span>
            </CardTitle>
            <CardDescription>
              请填写班样记录数据，数据将同步到生产日报-FDX数据表
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 基础信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 日期选择 */}
              <div className="space-y-2">
                <Label htmlFor="date">日期</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? (
                        format(formData.date, "yyyy年MM月dd日", { locale: zhCN })
                      ) : (
                        <span>选择日期</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => updateFormField('date', date)}
                      initialFocus
                      locale={zhCN}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* 班次选择 */}
              <div className="space-y-2">
                <Label htmlFor="shift">班次</Label>
                <Select value={formData.shift} onValueChange={(value) => updateFormField('shift', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择班次" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="白班">白班</SelectItem>
                    <SelectItem value="夜班">夜班</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 数据输入字段 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">数据输入</h3>
              
              {/* 原矿数据 */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-muted-foreground">原矿数据</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 原矿水份 - 带计算器 */}
                  <div className="space-y-2">
                    <Label htmlFor="originalMoisture">原矿水份 (%)</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="originalMoisture"
                        type="text"
                        value={formData.originalMoisture}
                        onChange={(e) => handleNumberInput('originalMoisture', e.target.value)}
                        placeholder="0.00"
                        className="flex-1"
                      />
                      <Dialog open={moistureDialogOpen} onOpenChange={setMoistureDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Calculator className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              <Droplets className="h-5 w-5" />
                              <span>水份计算器</span>
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="wetWeight">湿重 (g)</Label>
                              <Input
                                id="wetWeight"
                                type="text"
                                value={moistureCalcData.wetWeight}
                                onChange={(e) => setMoistureCalcData(prev => ({
                                  ...prev,
                                  wetWeight: e.target.value.replace(/[^0-9.]/g, '')
                                }))}
                                placeholder="0.00"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="tareWeight">皮重 (g)</Label>
                              <Input
                                id="tareWeight"
                                type="text"
                                value={moistureCalcData.tareWeight}
                                onChange={(e) => setMoistureCalcData(prev => ({
                                  ...prev,
                                  tareWeight: e.target.value.replace(/[^0-9.]/g, '')
                                }))}
                                placeholder="0.00"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="dryWeight">干重 (g)</Label>
                              <Input
                                id="dryWeight"
                                type="text"
                                value={moistureCalcData.dryWeight}
                                onChange={(e) => setMoistureCalcData(prev => ({
                                  ...prev,
                                  dryWeight: e.target.value.replace(/[^0-9.]/g, '')
                                }))}
                                placeholder="0.00"
                              />
                            </div>
                            {calculateMoisture() && (
                              <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">计算结果:</p>
                                <p className="text-lg font-semibold">{calculateMoisture()}%</p>
                              </div>
                            )}
                            <div className="flex space-x-2">
                              <Button 
                                onClick={fillMoistureResult} 
                                disabled={!calculateMoisture()}
                                className="flex-1"
                              >
                                一键填入
                              </Button>
                              <DialogClose asChild>
                                <Button variant="outline">取消</Button>
                              </DialogClose>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* 原矿Pb品位 */}
                  <div className="space-y-2">
                    <Label htmlFor="originalPbGrade">原矿Pb品位 (%)</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="originalPbGrade"
                        type="text"
                        value={formData.originalPbGrade}
                        onChange={(e) => handleNumberInput('originalPbGrade', e.target.value)}
                        placeholder="0.00"
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => openGradeCalculator('originalPbGrade')}
                      >
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* 原矿Zn品位 */}
                  <div className="space-y-2">
                    <Label htmlFor="originalZnGrade">原矿Zn品位 (%)</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="originalZnGrade"
                        type="text"
                        value={formData.originalZnGrade}
                        onChange={(e) => handleNumberInput('originalZnGrade', e.target.value)}
                        placeholder="0.00"
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => openGradeCalculator('originalZnGrade')}
                      >
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 精矿数据 */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-muted-foreground">精矿数据</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 精矿Pb品位 */}
                  <div className="space-y-2">
                    <Label htmlFor="concentratePbGrade">精矿Pb品位 (%)</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="concentratePbGrade"
                        type="text"
                        value={formData.concentratePbGrade}
                        onChange={(e) => handleNumberInput('concentratePbGrade', e.target.value)}
                        placeholder="0.00"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openGradeCalculator('concentratePbGrade')}
                      >
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* 精矿Zn品位 */}
                  <div className="space-y-2">
                    <Label htmlFor="concentrateZnGrade">精矿Zn品位 (%)</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="concentrateZnGrade"
                        type="text"
                        value={formData.concentrateZnGrade}
                        onChange={(e) => handleNumberInput('concentrateZnGrade', e.target.value)}
                        placeholder="0.00"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openGradeCalculator('concentrateZnGrade')}
                      >
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 尾矿数据 */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-muted-foreground">尾矿数据</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 尾矿Pb品位 */}
                  <div className="space-y-2">
                    <Label htmlFor="tailingsPbGrade">尾矿Pb品位 (%)</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="tailingsPbGrade"
                        type="text"
                        value={formData.tailingsPbGrade}
                        onChange={(e) => handleNumberInput('tailingsPbGrade', e.target.value)}
                        placeholder="0.00"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openGradeCalculator('tailingsPbGrade')}
                      >
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* 尾矿Zn品位 */}
                  <div className="space-y-2">
                    <Label htmlFor="tailingsZnGrade">尾矿Zn品位 (%)</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="tailingsZnGrade"
                        type="text"
                        value={formData.tailingsZnGrade}
                        onChange={(e) => handleNumberInput('tailingsZnGrade', e.target.value)}
                        placeholder="0.00"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openGradeCalculator('tailingsZnGrade')}
                      >
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 状态提示 */}
            {submitStatus !== 'idle' && (
              <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                submitStatus === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {submitStatus === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span>{submitMessage}</span>
              </div>
            )}

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setFormData(initialFormData);
                  setSubmitStatus('idle');
                }}
                disabled={isSubmitting}
              >
                重置
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    提交数据
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 品位计算器Dialog */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FlaskConical className="h-5 w-5" />
              <span>品位计算器</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edtaConsumption">EDTA消耗量 (ml)</Label>
              <Input
                id="edtaConsumption"
                type="text"
                value={gradeCalcData.edtaConsumption}
                onChange={(e) => setGradeCalcData(prev => ({
                  ...prev,
                  edtaConsumption: e.target.value.replace(/[^0-9.]/g, '')
                }))}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edtaConcentration">EDTA浓度 (%)</Label>
              <Input
                id="edtaConcentration"
                type="text"
                value={gradeCalcData.edtaConcentration}
                onChange={(e) => setGradeCalcData(prev => ({
                  ...prev,
                  edtaConcentration: e.target.value.replace(/[^0-9.]/g, '')
                }))}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sampleWeight">样品质量 (g)</Label>
              <Input
                id="sampleWeight"
                type="text"
                value={gradeCalcData.sampleWeight}
                onChange={(e) => setGradeCalcData(prev => ({
                  ...prev,
                  sampleWeight: e.target.value.replace(/[^0-9.]/g, '')
                }))}
                placeholder="0.00"
              />
            </div>
            {calculateGrade() && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">计算结果:</p>
                <p className="text-lg font-semibold">{calculateGrade()}%</p>
              </div>
            )}
            <div className="flex space-x-2">
              <Button
                onClick={fillGradeResult}
                disabled={!calculateGrade()}
                className="flex-1"
              >
                一键填入
              </Button>
              <DialogClose asChild>
                <Button variant="outline">取消</Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

ShiftSamplePage.displayName = 'ShiftSamplePage';
