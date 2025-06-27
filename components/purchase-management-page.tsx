"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Loader2,
  Eye,
  Edit,
  Plus,
  Search,
  FileText,
  User,
  Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// 定义数据类型
interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier: string;
  items: PurchaseItem[];
  total_amount: number;
  status: 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_date: string;
  expected_date: string;
  created_by: string;
  approved_by?: string;
  remarks?: string;
}

interface PurchaseItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  specifications?: string;
}

interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  rating: number;
  status: 'active' | 'inactive';
}

interface PurchaseStats {
  total_orders: number;
  pending_orders: number;
  total_amount: number;
  monthly_spending: number;
  avg_order_value: number;
  top_categories: { name: string; amount: number; percentage: number }[];
}

export function PurchaseManagementPage() {
  const router = useRouter();
  
  // 状态管理
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // 数据状态
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseStats, setPurchaseStats] = useState<PurchaseStats | null>(null);

  // 生成模拟采购订单数据
  const generateMockPurchaseOrders = (): PurchaseOrder[] => {
    const suppliers = ['富鼎翔矿业', '金鼎锌业', '华鑫化工', '东方设备', '安全防护用品'];
    const statuses: ('pending' | 'approved' | 'ordered' | 'received' | 'cancelled')[] = 
      ['pending', 'approved', 'ordered', 'received', 'cancelled'];
    const priorities: ('low' | 'medium' | 'high' | 'urgent')[] = 
      ['low', 'medium', 'high', 'urgent'];
    const creators = ['张三', '李四', '王五', '赵六'];
    
    const orders: PurchaseOrder[] = [];
    
    for (let i = 0; i < 15; i++) {
      const items: PurchaseItem[] = [];
      const itemCount = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < itemCount; j++) {
        const quantity = Math.floor(Math.random() * 100) + 1;
        const unitPrice = Math.floor(Math.random() * 1000) + 50;
        
        items.push({
          id: `item-${i}-${j}`,
          name: `物料${String.fromCharCode(65 + j)}`,
          category: ['化学试剂', '设备配件', '安全用品', '办公用品'][Math.floor(Math.random() * 4)],
          quantity: quantity,
          unit: ['kg', '个', '套', '箱'][Math.floor(Math.random() * 4)],
          unit_price: unitPrice,
          total_price: quantity * unitPrice,
          specifications: Math.random() > 0.5 ? '标准规格' : undefined
        });
      }
      
      const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0);
      
      orders.push({
        id: `order-${i + 1}`,
        order_number: `PO${new Date().getFullYear()}${String(i + 1).padStart(4, '0')}`,
        supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
        items: items,
        total_amount: totalAmount,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        created_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        expected_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: creators[Math.floor(Math.random() * creators.length)],
        approved_by: Math.random() > 0.5 ? creators[Math.floor(Math.random() * creators.length)] : undefined,
        remarks: Math.random() > 0.7 ? '紧急采购' : undefined
      });
    }
    
    return orders.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
  };

  // 生成模拟供应商数据
  const generateMockSuppliers = (): Supplier[] => {
    return [
      {
        id: 'supplier-1',
        name: '富鼎翔矿业',
        contact_person: '张经理',
        phone: '138-0000-0001',
        email: 'zhang@fdx.com',
        address: '云南省昆明市',
        rating: 4.8,
        status: 'active'
      },
      {
        id: 'supplier-2',
        name: '金鼎锌业',
        contact_person: '李总',
        phone: '138-0000-0002',
        email: 'li@jdzy.com',
        address: '云南省曲靖市',
        rating: 4.5,
        status: 'active'
      },
      {
        id: 'supplier-3',
        name: '华鑫化工',
        contact_person: '王主任',
        phone: '138-0000-0003',
        email: 'wang@hxhg.com',
        address: '四川省成都市',
        rating: 4.2,
        status: 'active'
      },
      {
        id: 'supplier-4',
        name: '东方设备',
        contact_person: '赵工',
        phone: '138-0000-0004',
        email: 'zhao@dfsb.com',
        address: '江苏省南京市',
        rating: 4.6,
        status: 'active'
      },
      {
        id: 'supplier-5',
        name: '安全防护用品',
        contact_person: '刘经理',
        phone: '138-0000-0005',
        email: 'liu@aqfh.com',
        address: '广东省深圳市',
        rating: 4.3,
        status: 'inactive'
      }
    ];
  };

  // 生成模拟统计数据
  const generateMockPurchaseStats = (orders: PurchaseOrder[]): PurchaseStats => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const totalAmount = orders.reduce((sum, order) => sum + order.total_amount, 0);
    
    // 计算本月支出
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlySpending = orders
      .filter(order => {
        const orderDate = new Date(order.created_date);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      })
      .reduce((sum, order) => sum + order.total_amount, 0);
    
    const avgOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;
    
    // 计算分类统计
    const categoryStats: { [key: string]: number } = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        categoryStats[item.category] = (categoryStats[item.category] || 0) + item.total_price;
      });
    });
    
    const topCategories = Object.entries(categoryStats)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: (amount / totalAmount) * 100
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    return {
      total_orders: totalOrders,
      pending_orders: pendingOrders,
      total_amount: totalAmount,
      monthly_spending: monthlySpending,
      avg_order_value: avgOrderValue,
      top_categories: topCategories
    };
  };

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const orders = generateMockPurchaseOrders();
      const suppliersData = generateMockSuppliers();
      const stats = generateMockPurchaseStats(orders);
      
      setPurchaseOrders(orders);
      setSuppliers(suppliersData);
      setPurchaseStats(stats);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: "数据加载失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // 筛选订单
  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleBack = () => {
    router.back();
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'ordered': return 'bg-purple-100 text-purple-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待审批';
      case 'approved': return '已审批';
      case 'ordered': return '已下单';
      case 'received': return '已收货';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
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
          <h1 className="text-xl md:text-2xl font-semibold">采购管理</h1>
        </div>
        <ThemeToggle />
      </div>

      <div className="p-6 space-y-6">
        {/* 欢迎面板 */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-medium mb-2">采购管理系统</h2>
              <p className="text-sm text-muted-foreground">
                管理采购订单、供应商信息和采购统计
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 选项卡 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>采购概览</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>采购订单</span>
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center space-x-2">
              <Building className="h-4 w-4" />
              <span>供应商管理</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>采购分析</span>
            </TabsTrigger>
          </TabsList>

          {/* 采购概览选项卡 */}
          <TabsContent value="overview" className="space-y-6">
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-8 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))
              ) : purchaseStats ? (
                <>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          总订单数
                        </p>
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {purchaseStats.total_orders}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        累计采购订单
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          待处理订单
                        </p>
                        <Clock className="h-4 w-4 text-yellow-600" />
                      </div>
                      <p className="text-2xl font-bold text-yellow-600">
                        {purchaseStats.pending_orders}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        需要审批处理
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          总采购金额
                        </p>
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        ¥{(purchaseStats.total_amount / 10000).toFixed(1)}万
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        累计采购支出
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          本月支出
                        </p>
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        ¥{(purchaseStats.monthly_spending / 10000).toFixed(1)}万
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        当月采购支出
                      </p>
                    </CardContent>
                  </Card>
                </>
              ) : null}
            </div>

            {/* 采购分类统计 */}
            {purchaseStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    采购分类统计
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {purchaseStats.top_categories.map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ¥{(category.amount / 10000).toFixed(1)}万
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={category.percentage} className="w-20 h-2" />
                          <span className="text-sm font-medium">
                            {category.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 快速操作 */}
            <Card>
              <CardHeader>
                <CardTitle>快速操作</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                    <Plus className="h-6 w-6" />
                    <span className="text-sm">新建采购申请</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                    <Search className="h-6 w-6" />
                    <span className="text-sm">查找订单</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                    <Building className="h-6 w-6" />
                    <span className="text-sm">供应商管理</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                    <Download className="h-6 w-6" />
                    <span className="text-sm">导出报表</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 采购订单选项卡 */}
          <TabsContent value="orders" className="space-y-6">
            {/* 搜索和筛选 */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>搜索订单</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="订单号或供应商"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>订单状态</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        <SelectItem value="pending">待审批</SelectItem>
                        <SelectItem value="approved">已审批</SelectItem>
                        <SelectItem value="ordered">已下单</SelectItem>
                        <SelectItem value="received">已收货</SelectItem>
                        <SelectItem value="cancelled">已取消</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>优先级</Label>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择优先级" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部优先级</SelectItem>
                        <SelectItem value="low">低</SelectItem>
                        <SelectItem value="medium">中</SelectItem>
                        <SelectItem value="high">高</SelectItem>
                        <SelectItem value="urgent">紧急</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>操作</Label>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadData}
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 订单列表 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  采购订单列表 ({filteredOrders.length})
                </CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  新建订单
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))
                  ) : filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <div key={order.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{order.order_number}</h4>
                              <Badge className={getStatusColor(order.status)}>
                                {getStatusText(order.status)}
                              </Badge>
                              <Badge className={getPriorityColor(order.priority)}>
                                {getPriorityText(order.priority)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              供应商: {order.supplier} | 创建人: {order.created_by}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              创建时间: {format(new Date(order.created_date), 'yyyy-MM-dd HH:mm')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              ¥{order.total_amount.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.items.length} 个物料
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">预期交付</p>
                            <p className="font-medium">
                              {format(new Date(order.expected_date), 'yyyy-MM-dd')}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">审批人</p>
                            <p className="font-medium">
                              {order.approved_by || '待审批'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">物料清单</p>
                            <p className="font-medium">
                              {order.items.slice(0, 2).map(item => item.name).join(', ')}
                              {order.items.length > 2 && '...'}
                            </p>
                          </div>
                        </div>

                        {order.remarks && (
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm">
                              <span className="font-medium">备注: </span>
                              {order.remarks}
                            </p>
                          </div>
                        )}

                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            查看详情
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            编辑
                          </Button>
                          {order.status === 'pending' && (
                            <Button size="sm">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              审批
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">暂无采购订单</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 供应商管理选项卡 */}
          <TabsContent value="suppliers" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  供应商列表
                </CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  添加供应商
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))
                  ) : suppliers.length > 0 ? (
                    suppliers.map((supplier) => (
                      <div key={supplier.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{supplier.name}</h4>
                              <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                                {supplier.status === 'active' ? '活跃' : '停用'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              联系人: {supplier.contact_person} | 电话: {supplier.phone}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              邮箱: {supplier.email}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1 mb-1">
                              <span className="text-sm">评分:</span>
                              <span className="font-medium text-yellow-600">
                                {supplier.rating.toFixed(1)}
                              </span>
                              <span className="text-sm text-muted-foreground">/5.0</span>
                            </div>
                            <Progress value={(supplier.rating / 5) * 100} className="w-20 h-2" />
                          </div>
                        </div>

                        <div className="text-sm">
                          <p className="text-muted-foreground">地址</p>
                          <p className="font-medium">{supplier.address}</p>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            查看详情
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            编辑
                          </Button>
                          <Button variant="ghost" size="sm">
                            <User className="h-4 w-4 mr-2" />
                            联系
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">暂无供应商信息</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 采购分析选项卡 */}
          <TabsContent value="analytics" className="space-y-6">
            {/* 月度采购趋势 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  月度采购趋势
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { month: '1月', amount: 120000, orders: 15 },
                      { month: '2月', amount: 150000, orders: 18 },
                      { month: '3月', amount: 180000, orders: 22 },
                      { month: '4月', amount: 160000, orders: 20 },
                      { month: '5月', amount: 200000, orders: 25 },
                      { month: '6月', amount: 220000, orders: 28 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#8884d8"
                        name="采购金额(元)"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        stroke="#82ca9d"
                        name="订单数量"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* 供应商分析 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    供应商分布
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">活跃供应商</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={80} className="w-20 h-2" />
                        <span className="text-sm font-medium">4/5</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">平均评分</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={88} className="w-20 h-2" />
                        <span className="text-sm font-medium">4.4/5.0</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">合作时长</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={75} className="w-20 h-2" />
                        <span className="text-sm font-medium">平均2.5年</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    采购提醒
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium">待审批订单</p>
                        <p className="text-xs text-muted-foreground">
                          {purchaseStats?.pending_orders || 0} 个订单等待审批
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">即将到期</p>
                        <p className="text-xs text-muted-foreground">3 个订单即将到达预期交付日期</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">本月完成</p>
                        <p className="text-xs text-muted-foreground">已完成 15 个采购订单</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* 底部操作栏 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => router.push('/purchase-request')}>
                <Plus className="h-4 w-4 mr-2" />
                新建采购申请
              </Button>
              <Button variant="outline" onClick={() => router.push('/supplier-management')}>
                <Building className="h-4 w-4 mr-2" />
                供应商管理
              </Button>
              <Button onClick={() => router.push('/purchase-analytics')}>
                <TrendingUp className="h-4 w-4 mr-2" />
                深度分析
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
