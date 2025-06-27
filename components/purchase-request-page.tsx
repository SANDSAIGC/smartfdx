"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  FileText,
  Package,
  Calendar,
  User,
  Building,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calculator,
  Upload,
  Download,
  RefreshCw,
  Loader2,
  Edit,
  Copy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';
import { ThemeToggle } from "@/components/theme-toggle";

// 定义数据类型
interface PurchaseRequestItem {
  id: string;
  name: string;
  category: string;
  specifications: string;
  quantity: number;
  unit: string;
  estimated_price: number;
  total_price: number;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  supplier_suggestion?: string;
  remarks?: string;
}

interface PurchaseRequest {
  id?: string;
  request_number?: string;
  title: string;
  department: string;
  requester: string;
  request_date: string;
  expected_date: string;
  items: PurchaseRequestItem[];
  total_amount: number;
  justification: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget_code?: string;
  approval_required: boolean;
  status?: 'draft' | 'submitted' | 'approved' | 'rejected';
  attachments?: string[];
}

export function PurchaseRequestPage() {
  const router = useRouter();
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expectedDate, setExpectedDate] = useState<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isExpectedDatePickerOpen, setIsExpectedDatePickerOpen] = useState(false);
  
  // 表单数据
  const [purchaseRequest, setPurchaseRequest] = useState<PurchaseRequest>({
    title: '',
    department: '',
    requester: '',
    request_date: new Date().toISOString(),
    expected_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    items: [],
    total_amount: 0,
    justification: '',
    priority: 'medium',
    budget_code: '',
    approval_required: true,
    attachments: []
  });

  // 当前编辑的物料项
  const [currentItem, setCurrentItem] = useState<PurchaseRequestItem>({
    id: '',
    name: '',
    category: '',
    specifications: '',
    quantity: 1,
    unit: '',
    estimated_price: 0,
    total_price: 0,
    urgency: 'medium',
    supplier_suggestion: '',
    remarks: ''
  });

  // 物料分类选项
  const categories = [
    '化学试剂',
    '设备配件',
    '安全用品',
    '办公用品',
    '维修材料',
    '实验器材',
    '电子设备',
    '其他'
  ];

  // 单位选项
  const units = [
    'kg', 'g', 'L', 'mL', '个', '套', '箱', '包', 
    '米', 'cm', '平方米', '立方米', '吨', '件'
  ];

  // 部门选项
  const departments = [
    '化验室',
    '生产部',
    '设备部',
    '安全部',
    '采购部',
    '财务部',
    '行政部',
    '技术部'
  ];

  // 计算物料项总价
  const calculateItemTotal = (quantity: number, price: number) => {
    return quantity * price;
  };

  // 计算申请总金额
  const calculateTotalAmount = (items: PurchaseRequestItem[]) => {
    return items.reduce((sum, item) => sum + item.total_price, 0);
  };

  // 添加物料项
  const addItem = () => {
    if (!currentItem.name || !currentItem.category || currentItem.quantity <= 0) {
      toast({
        title: "请填写完整的物料信息",
        description: "物料名称、分类和数量为必填项",
        variant: "destructive",
      });
      return;
    }

    const newItem: PurchaseRequestItem = {
      ...currentItem,
      id: `item-${Date.now()}`,
      total_price: calculateItemTotal(currentItem.quantity, currentItem.estimated_price)
    };

    const updatedItems = [...purchaseRequest.items, newItem];
    const totalAmount = calculateTotalAmount(updatedItems);

    setPurchaseRequest(prev => ({
      ...prev,
      items: updatedItems,
      total_amount: totalAmount
    }));

    // 重置当前物料项
    setCurrentItem({
      id: '',
      name: '',
      category: '',
      specifications: '',
      quantity: 1,
      unit: '',
      estimated_price: 0,
      total_price: 0,
      urgency: 'medium',
      supplier_suggestion: '',
      remarks: ''
    });

    toast({
      title: "物料已添加",
      description: "物料项已成功添加到申请列表",
    });
  };

  // 删除物料项
  const removeItem = (itemId: string) => {
    const updatedItems = purchaseRequest.items.filter(item => item.id !== itemId);
    const totalAmount = calculateTotalAmount(updatedItems);

    setPurchaseRequest(prev => ({
      ...prev,
      items: updatedItems,
      total_amount: totalAmount
    }));

    toast({
      title: "物料已删除",
      description: "物料项已从申请列表中移除",
    });
  };

  // 保存草稿
  const saveDraft = async () => {
    setSaving(true);
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const draftRequest = {
        ...purchaseRequest,
        status: 'draft' as const,
        request_number: `PR${new Date().getFullYear()}${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`
      };

      console.log('保存草稿:', draftRequest);
      
      toast({
        title: "草稿已保存",
        description: "采购申请已保存为草稿",
      });
    } catch (error) {
      console.error('保存草稿失败:', error);
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // 提交申请
  const submitRequest = async () => {
    if (!purchaseRequest.title || !purchaseRequest.department || !purchaseRequest.requester) {
      toast({
        title: "请填写必要信息",
        description: "申请标题、部门和申请人为必填项",
        variant: "destructive",
      });
      return;
    }

    if (purchaseRequest.items.length === 0) {
      toast({
        title: "请添加物料项",
        description: "至少需要添加一个物料项",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const submittedRequest = {
        ...purchaseRequest,
        status: 'submitted' as const,
        request_number: `PR${new Date().getFullYear()}${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`
      };

      console.log('提交申请:', submittedRequest);
      
      toast({
        title: "申请已提交",
        description: "采购申请已成功提交，等待审批",
      });

      // 提交成功后跳转到采购管理页面
      setTimeout(() => {
        router.push('/purchase-management');
      }, 2000);
    } catch (error) {
      console.error('提交申请失败:', error);
      toast({
        title: "提交失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // 获取优先级颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取优先级文本
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return '低';
      case 'medium': return '中';
      case 'high': return '高';
      case 'urgent': return '紧急';
      default: return '未知';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <div className="flex justify-between items-center p-6 border-b">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回</span>
          </Button>
          <h1 className="text-xl md:text-2xl font-semibold">采购申请</h1>
        </div>
        <ThemeToggle />
      </div>

      <div className="p-6 space-y-6">
        {/* 欢迎面板 */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-medium mb-2">新建采购申请</h2>
              <p className="text-sm text-muted-foreground">
                填写采购需求信息，提交审批流程
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              基本信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">申请标题 *</Label>
                <Input
                  id="title"
                  placeholder="请输入申请标题"
                  value={purchaseRequest.title}
                  onChange={(e) => setPurchaseRequest(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">申请部门 *</Label>
                <Select
                  value={purchaseRequest.department}
                  onValueChange={(value) => setPurchaseRequest(prev => ({ ...prev, department: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择部门" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requester">申请人 *</Label>
                <Input
                  id="requester"
                  placeholder="请输入申请人姓名"
                  value={purchaseRequest.requester}
                  onChange={(e) => setPurchaseRequest(prev => ({ ...prev, requester: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>申请日期</Label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "yyyy-MM-dd") : "选择日期"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date);
                          setPurchaseRequest(prev => ({ ...prev, request_date: date.toISOString() }));
                        }
                        setIsDatePickerOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>期望交付日期</Label>
                <Popover open={isExpectedDatePickerOpen} onOpenChange={setIsExpectedDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expectedDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {expectedDate ? format(expectedDate, "yyyy-MM-dd") : "选择日期"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={expectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setExpectedDate(date);
                          setPurchaseRequest(prev => ({ ...prev, expected_date: date.toISOString() }));
                        }
                        setIsExpectedDatePickerOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">优先级</Label>
                <Select
                  value={purchaseRequest.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') =>
                    setPurchaseRequest(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择优先级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="urgent">紧急</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget-code">预算代码</Label>
              <Input
                id="budget-code"
                placeholder="请输入预算代码（可选）"
                value={purchaseRequest.budget_code}
                onChange={(e) => setPurchaseRequest(prev => ({ ...prev, budget_code: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="justification">采购理由 *</Label>
              <Textarea
                id="justification"
                placeholder="请详细说明采购理由和用途"
                value={purchaseRequest.justification}
                onChange={(e) => setPurchaseRequest(prev => ({ ...prev, justification: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* 物料项管理 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              物料清单
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 添加物料项表单 */}
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-4">添加物料项</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item-name">物料名称 *</Label>
                  <Input
                    id="item-name"
                    placeholder="请输入物料名称"
                    value={currentItem.name}
                    onChange={(e) => setCurrentItem(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-category">物料分类 *</Label>
                  <Select
                    value={currentItem.category}
                    onValueChange={(value) => setCurrentItem(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-specifications">规格型号</Label>
                  <Input
                    id="item-specifications"
                    placeholder="请输入规格型号"
                    value={currentItem.specifications}
                    onChange={(e) => setCurrentItem(prev => ({ ...prev, specifications: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-quantity">数量 *</Label>
                  <Input
                    id="item-quantity"
                    type="number"
                    min="1"
                    placeholder="请输入数量"
                    value={currentItem.quantity}
                    onChange={(e) => {
                      const quantity = parseInt(e.target.value) || 0;
                      setCurrentItem(prev => ({
                        ...prev,
                        quantity,
                        total_price: calculateItemTotal(quantity, prev.estimated_price)
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-unit">单位</Label>
                  <Select
                    value={currentItem.unit}
                    onValueChange={(value) => setCurrentItem(prev => ({ ...prev, unit: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择单位" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-price">预估单价</Label>
                  <Input
                    id="item-price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="请输入预估单价"
                    value={currentItem.estimated_price}
                    onChange={(e) => {
                      const price = parseFloat(e.target.value) || 0;
                      setCurrentItem(prev => ({
                        ...prev,
                        estimated_price: price,
                        total_price: calculateItemTotal(prev.quantity, price)
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-urgency">紧急程度</Label>
                  <Select
                    value={currentItem.urgency}
                    onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') =>
                      setCurrentItem(prev => ({ ...prev, urgency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择紧急程度" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">低</SelectItem>
                      <SelectItem value="medium">中</SelectItem>
                      <SelectItem value="high">高</SelectItem>
                      <SelectItem value="urgent">紧急</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-supplier">建议供应商</Label>
                  <Input
                    id="item-supplier"
                    placeholder="建议供应商（可选）"
                    value={currentItem.supplier_suggestion}
                    onChange={(e) => setCurrentItem(prev => ({ ...prev, supplier_suggestion: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>预估总价</Label>
                  <div className="flex items-center space-x-2">
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-green-600">
                      ¥{currentItem.total_price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="item-remarks">备注</Label>
                <Textarea
                  id="item-remarks"
                  placeholder="物料备注信息（可选）"
                  value={currentItem.remarks}
                  onChange={(e) => setCurrentItem(prev => ({ ...prev, remarks: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="mt-4 flex justify-end">
                <Button onClick={addItem} className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>添加物料</span>
                </Button>
              </div>
            </div>

            {/* 物料列表 */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">已添加物料 ({purchaseRequest.items.length})</h4>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">总金额</p>
                  <p className="text-lg font-bold text-green-600">
                    ¥{purchaseRequest.total_amount.toLocaleString()}
                  </p>
                </div>
              </div>

              {purchaseRequest.items.length > 0 ? (
                <div className="space-y-3">
                  {purchaseRequest.items.map((item, index) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{item.name}</span>
                            <Badge variant="outline">{item.category}</Badge>
                            <Badge className={getPriorityColor(item.urgency)}>
                              {getPriorityText(item.urgency)}
                            </Badge>
                          </div>
                          {item.specifications && (
                            <p className="text-sm text-muted-foreground">
                              规格: {item.specifications}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">数量</p>
                          <p className="font-medium">{item.quantity} {item.unit}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">预估单价</p>
                          <p className="font-medium">¥{item.estimated_price.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">小计</p>
                          <p className="font-medium text-green-600">¥{item.total_price.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">建议供应商</p>
                          <p className="font-medium">{item.supplier_suggestion || '未指定'}</p>
                        </div>
                      </div>

                      {item.remarks && (
                        <div className="mt-3 p-2 bg-muted rounded">
                          <p className="text-sm">
                            <span className="font-medium">备注: </span>
                            {item.remarks}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-lg bg-muted/30">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">暂无物料项，请添加采购物料</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 申请摘要 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              申请摘要
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">物料种类</p>
                <p className="text-2xl font-bold text-blue-600">{purchaseRequest.items.length}</p>
                <p className="text-xs text-muted-foreground">个物料项</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">申请总额</p>
                <p className="text-2xl font-bold text-green-600">
                  ¥{(purchaseRequest.total_amount / 10000).toFixed(1)}万
                </p>
                <p className="text-xs text-muted-foreground">预估金额</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">优先级</p>
                <Badge className={getPriorityColor(purchaseRequest.priority)} variant="outline">
                  {getPriorityText(purchaseRequest.priority)}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">申请优先级</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 底部操作栏 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={saveDraft}
                disabled={saving || submitting}
                className="flex items-center space-x-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>保存草稿</span>
              </Button>

              <Button
                onClick={submitRequest}
                disabled={saving || submitting || purchaseRequest.items.length === 0}
                className="flex items-center space-x-2"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>提交申请</span>
              </Button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                提交后将进入审批流程，请确保信息准确无误
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
