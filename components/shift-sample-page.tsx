"use client";

import React, { useState, useCallback, memo } from "react";
import { ShiftSampleHeader } from "@/components/sample-page-header";
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
import { DatePicker } from "@/components/ui/unified-date-picker";
import { FooterSignature } from "@/components/ui/footer-signature";
import { useConfirmationDialog, CONFIRMATION_CONFIGS } from "@/components/ui/confirmation-dialog";
import { 
  AnimatedPage, 
  AnimatedCard, 
  AnimatedContainer, 
  AnimatedButton,
  AnimatedListItem,
  AnimatedCounter,
  AnimatedProgress,
  AnimatedBadge
} from "@/components/ui/animated-components";
import { PerformanceWrapper, withPerformanceOptimization } from "@/components/performance-wrapper";
import { useRenderPerformance, useMemoryLeak, usePerformanceOptimization } from "@/hooks/use-performance-optimization";
import { LoadingTransition, SkeletonLoading } from "@/components/loading-transition";
import { cn } from "@/lib/utils";
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
  // 性能监控
  const { renderCount } = useRenderPerformance('ShiftSamplePage');
  const { addTimer, addListener } = useMemoryLeak('ShiftSamplePage');
  const { metrics } = usePerformanceOptimization();
  // 确认对话框
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();


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
  // submit操作确认包装
  const handleSubmitWithConfirmation = useCallback(() => {
    showConfirmation(
      CONFIRMATION_CONFIGS.SUBMIT_SAMPLE_DATA,
      handleSubmit
    );
  }, [showConfirmation, handleSubmit]);


  return (
    <PerformanceWrapper
      componentName="ShiftSamplePage"
      enableMonitoring={process.env.NODE_ENV === 'development'}
      enableMemoryTracking={true}
    >
      <AnimatedPage className="min-h-screen bg-background">
        {/* 统一标题栏 */}
        <ShiftSampleHeader
          showStatus={true}
          status={submitStatus === 'success' ? 'completed' : submitStatus === 'error' ? 'draft' : 'draft'}
        />

        {/* 主要内容 */}
      <div className="container mx-auto px-4 py-6">
        <AnimatedCard delay={0} className="max-w-4xl mx-auto">
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
            <AnimatedListItem index={0} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 日期选择 */}
              <AnimatedListItem index={0} className="space-y-2">
                <Label htmlFor="date">日期</Label>
                <DatePicker
                  mode="single"
                  value={formData.date}
                  onChange={(date) => updateFormField('date', date)}
                  placeholder="选择日期"
                />
              </div>

              {/* 班次选择 */}
              <AnimatedListItem index={1} className="space-y-2">
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
            <AnimatedListItem index={2} className="space-y-4">
              <h3 className="text-lg font-semibold">数据输入</h3>
              
              {/* 原矿数据 */}
              <AnimatedListItem index={3} className="space-y-4">
                <h4 className="text-md font-medium text-muted-foreground">原矿数据</h4>
                <AnimatedListItem index={1} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 原矿水份 - 带计算器 */}
                  <AnimatedListItem index={4} className="space-y-2">
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
                          <AnimatedButton variant="outline" size="icon">
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
                          <AnimatedListItem index={5} className="space-y-4">
                            <AnimatedListItem index={6} className="space-y-2">
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
                            <AnimatedListItem index={7} className="space-y-2">
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
                            <AnimatedListItem index={8} className="space-y-2">
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
                              <AnimatedButton 
                                onClick={fillMoistureResult} 
                                disabled={!calculateMoisture()}
                                className="flex-1"
                              >
                                一键填入
                              </Button>
                              <DialogClose asChild>
                                <AnimatedButton variant="outline">取消</Button>
                              </DialogClose>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* 原矿Pb品位 */}
                  <AnimatedListItem index={9} className="space-y-2">
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
                      <AnimatedButton 
                        variant="outline" 
                        size="icon"
                        onClick={() => openGradeCalculator('originalPbGrade')}
                      >
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* 原矿Zn品位 */}
                  <AnimatedListItem index={10} className="space-y-2">
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
                      <AnimatedButton 
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
              <AnimatedListItem index={11} className="space-y-4">
                <h4 className="text-md font-medium text-muted-foreground">精矿数据</h4>
                <AnimatedListItem index={2} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 精矿Pb品位 */}
                  <AnimatedListItem index={12} className="space-y-2">
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
                      <AnimatedButton
                        variant="outline"
                        size="icon"
                        onClick={() => openGradeCalculator('concentratePbGrade')}
                      >
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* 精矿Zn品位 */}
                  <AnimatedListItem index={13} className="space-y-2">
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
                      <AnimatedButton
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
              <AnimatedListItem index={14} className="space-y-4">
                <h4 className="text-md font-medium text-muted-foreground">尾矿数据</h4>
                <AnimatedListItem index={3} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 尾矿Pb品位 */}
                  <AnimatedListItem index={15} className="space-y-2">
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
                      <AnimatedButton
                        variant="outline"
                        size="icon"
                        onClick={() => openGradeCalculator('tailingsPbGrade')}
                      >
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* 尾矿Zn品位 */}
                  <AnimatedListItem index={16} className="space-y-2">
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
                      <AnimatedButton
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
              <AnimatedButton
                variant="outline"
                onClick={() => {
                  setFormData(initialFormData);
                  setSubmitStatus('idle');
                }}
                disabled={isSubmitting}
              >
                重置
              </Button>
              <AnimatedButton onClick={handleSubmitWithConfirmation} disabled={isSubmitting}>
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
        </AnimatedCard>
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
          <AnimatedListItem index={17} className="space-y-4">
            <AnimatedListItem index={18} className="space-y-2">
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
            <AnimatedListItem index={19} className="space-y-2">
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
            <AnimatedListItem index={20} className="space-y-2">
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
              <AnimatedButton
                onClick={fillGradeResult}
                disabled={!calculateGrade()}
                className="flex-1"
              >
                一键填入
              </Button>
              <DialogClose asChild>
                <AnimatedButton variant="outline">取消</Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>

        {/* 统一底部签名 */}
        <FooterSignature variant="default" />
      </div>
      {/* 确认对话框 */}

      <ConfirmationDialog />

    </PerformanceWrapper>
  );
});

ShiftSamplePage.displayName = 'ShiftSamplePage';
