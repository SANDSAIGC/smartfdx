"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  FileText,
  Calendar,
  Clock,
  User,
  Building,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Activity,
  Target,
  Zap,
  Settings,
  RefreshCw,
  Loader2,
  Bell,
  Flag,
  MessageSquare,
  PieChart,
  LineChart,
  MapPin,
  Camera,
  Paperclip
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';
import { ThemeToggle } from "@/components/theme-toggle";

// 定义数据类型
interface SituationReport {
  id: string;
  report_number: string;
  title: string;
  description: string;
  category: 'production' | 'safety' | 'quality' | 'equipment' | 'personnel' | 'environment';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  reporter: string;
  reporter_department: string;
  incident_date: string;
  report_date: string;
  location: string;
  affected_personnel?: string[];
  immediate_actions?: string;
  root_cause?: string;
  corrective_actions?: string;
  preventive_measures?: string;
  estimated_cost?: number;
  actual_cost?: number;
  attachments?: string[];
  reviewer?: string;
  review_date?: string;
  review_comments?: string;
  approval_date?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
}

interface ReportStats {
  total_reports: number;
  draft_reports: number;
  submitted_reports: number;
  approved_reports: number;
  rejected_reports: number;
  pending_review: number;
}

export function SituationReportPage() {
  const router = useRouter();
  
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<SituationReport[]>([]);
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState<Partial<SituationReport>>({
    title: '',
    description: '',
    category: 'production',
    priority: 'medium',
    location: '',
    incident_date: new Date().toISOString(),
    immediate_actions: '',
    root_cause: '',
    corrective_actions: '',
    preventive_measures: '',
    follow_up_required: false
  });

  // 模拟数据生成
  const generateMockData = () => {
    const mockReports: SituationReport[] = [
      {
        id: '1',
        report_number: 'RPT-2024-001',
        title: '球磨机轴承过热事件报告',
        description: '1号球磨机主轴承温度异常升高，达到85°C，超过正常工作温度范围',
        category: 'equipment',
        priority: 'high',
        status: 'approved',
        reporter: '张工程师',
        reporter_department: '设备部',
        incident_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        report_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        location: '球磨车间1号机组',
        affected_personnel: ['操作员A', '维修工B'],
        immediate_actions: '立即停机检查，更换轴承润滑油',
        root_cause: '润滑系统故障，润滑油流量不足',
        corrective_actions: '更换润滑泵，清洗润滑管路',
        preventive_measures: '建立定期润滑系统检查制度',
        estimated_cost: 15000,
        actual_cost: 12000,
        reviewer: '设备主管',
        review_date: new Date().toISOString(),
        approval_date: new Date().toISOString(),
        follow_up_required: true,
        follow_up_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        report_number: 'RPT-2024-002',
        title: '化验室试剂泄漏事件',
        description: '硫酸试剂瓶破裂导致少量试剂泄漏，已及时处理',
        category: 'safety',
        priority: 'medium',
        status: 'under_review',
        reporter: '王化验员',
        reporter_department: '化验室',
        incident_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        report_date: new Date().toISOString(),
        location: '化验室试剂储存区',
        immediate_actions: '立即清理泄漏物，通风处理',
        root_cause: '试剂瓶质量问题',
        corrective_actions: '更换所有同批次试剂瓶',
        preventive_measures: '加强试剂瓶质量检查',
        estimated_cost: 2000,
        reviewer: '安全主管',
        follow_up_required: false
      },
      {
        id: '3',
        report_number: 'RPT-2024-003',
        title: '产品质量异常分析报告',
        description: '出厂产品锌品位检测结果低于标准，需要深入分析原因',
        category: 'quality',
        priority: 'urgent',
        status: 'submitted',
        reporter: '质检员',
        reporter_department: '质检部',
        incident_date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        report_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        location: '压滤车间',
        immediate_actions: '暂停该批次产品出厂，重新检测',
        root_cause: '压滤工艺参数偏差',
        corrective_actions: '调整压滤工艺参数，重新处理',
        preventive_measures: '加强工艺参数监控',
        estimated_cost: 8000,
        follow_up_required: true
      },
      {
        id: '4',
        report_number: 'RPT-2024-004',
        title: '新员工培训效果评估',
        description: '本月新员工培训完成情况及效果评估报告',
        category: 'personnel',
        priority: 'low',
        status: 'draft',
        reporter: '人事专员',
        reporter_department: '人事部',
        incident_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        report_date: new Date().toISOString(),
        location: '培训中心',
        immediate_actions: '完成培训考核',
        follow_up_required: true,
        follow_up_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const mockStats: ReportStats = {
      total_reports: mockReports.length,
      draft_reports: mockReports.filter(r => r.status === 'draft').length,
      submitted_reports: mockReports.filter(r => r.status === 'submitted').length,
      approved_reports: mockReports.filter(r => r.status === 'approved').length,
      rejected_reports: mockReports.filter(r => r.status === 'rejected').length,
      pending_review: mockReports.filter(r => r.status === 'under_review').length
    };

    return { mockReports, mockStats };
  };

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { mockReports, mockStats } = generateMockData();
      setReports(mockReports);
      setReportStats(mockStats);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载报告数据，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    loadData();
  }, []);

  // 筛选报告
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reporter.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  const handleBack = () => {
    router.back();
  };

  // 获取分类颜色
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'production': return 'bg-blue-100 text-blue-800';
      case 'safety': return 'bg-red-100 text-red-800';
      case 'quality': return 'bg-green-100 text-green-800';
      case 'equipment': return 'bg-orange-100 text-orange-800';
      case 'personnel': return 'bg-purple-100 text-purple-800';
      case 'environment': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取分类文本
  const getCategoryText = (category: string) => {
    switch (category) {
      case 'production': return '生产';
      case 'safety': return '安全';
      case 'quality': return '质量';
      case 'equipment': return '设备';
      case 'personnel': return '人员';
      case 'environment': return '环境';
      default: return '其他';
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return '草稿';
      case 'submitted': return '已提交';
      case 'under_review': return '审核中';
      case 'approved': return '已批准';
      case 'rejected': return '已拒绝';
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
          <h1 className="text-xl md:text-2xl font-semibold">情况报告</h1>
        </div>
        <ThemeToggle />
      </div>

      <div className="p-6 space-y-6">
        {/* 欢迎面板 */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-medium mb-2">情况报告管理</h2>
              <p className="text-sm text-muted-foreground">
                创建、管理和跟踪各类情况报告
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 统计面板 */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-8 w-12 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reportStats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <FileText className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm text-muted-foreground">总数</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{reportStats.total_reports}</div>
                <p className="text-xs text-muted-foreground">全部报告</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Edit className="h-4 w-4 text-gray-600 mr-1" />
                  <span className="text-sm text-muted-foreground">草稿</span>
                </div>
                <div className="text-2xl font-bold text-gray-600">{reportStats.draft_reports}</div>
                <p className="text-xs text-muted-foreground">待完善</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Upload className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm text-muted-foreground">已提交</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{reportStats.submitted_reports}</div>
                <p className="text-xs text-muted-foreground">等待审核</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-4 w-4 text-yellow-600 mr-1" />
                  <span className="text-sm text-muted-foreground">审核中</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600">{reportStats.pending_review}</div>
                <p className="text-xs text-muted-foreground">正在审核</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-muted-foreground">已批准</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{reportStats.approved_reports}</div>
                <p className="text-xs text-muted-foreground">审核通过</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-sm text-muted-foreground">已拒绝</span>
                </div>
                <div className="text-2xl font-bold text-red-600">{reportStats.rejected_reports}</div>
                <p className="text-xs text-muted-foreground">需要修改</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 主要内容区域 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="reports">报告列表</TabsTrigger>
            <TabsTrigger value="create">创建报告</TabsTrigger>
            <TabsTrigger value="analytics">统计分析</TabsTrigger>
          </TabsList>

          {/* 概览标签页 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 最新报告 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    最新报告
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="p-3 border rounded">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-1/2 mb-1" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reports.slice(0, 5).map((report) => (
                        <div key={report.id} className="p-3 border rounded hover:bg-muted/50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm">{report.title}</h4>
                            <Badge className={getPriorityColor(report.priority)} variant="outline">
                              {getPriorityText(report.priority)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {report.description}
                          </p>
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center space-x-2">
                              <Badge className={getCategoryColor(report.category)} variant="outline">
                                {getCategoryText(report.category)}
                              </Badge>
                              <Badge className={getStatusColor(report.status)} variant="outline">
                                {getStatusText(report.status)}
                              </Badge>
                            </div>
                            <span className="text-muted-foreground">
                              {format(new Date(report.report_date), 'MM-dd HH:mm')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 快速操作 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    快速操作
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setActiveTab('create')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    创建新报告
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    搜索历史报告
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    生成统计报告
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    导出报告数据
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    报告模板设置
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 报告列表标签页 */}
          <TabsContent value="reports" className="space-y-6">
            {/* 搜索和筛选 */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">搜索</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="搜索报告..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>分类</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择分类" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部分类</SelectItem>
                        <SelectItem value="production">生产</SelectItem>
                        <SelectItem value="safety">安全</SelectItem>
                        <SelectItem value="quality">质量</SelectItem>
                        <SelectItem value="equipment">设备</SelectItem>
                        <SelectItem value="personnel">人员</SelectItem>
                        <SelectItem value="environment">环境</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>状态</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        <SelectItem value="draft">草稿</SelectItem>
                        <SelectItem value="submitted">已提交</SelectItem>
                        <SelectItem value="under_review">审核中</SelectItem>
                        <SelectItem value="approved">已批准</SelectItem>
                        <SelectItem value="rejected">已拒绝</SelectItem>
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
                      <Button variant="outline" size="sm" onClick={loadData}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 报告列表 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>报告列表 ({filteredReports.length})</span>
                  <Button size="sm" onClick={() => setActiveTab('create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    新建报告
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="p-4 border rounded">
                        <Skeleton className="h-5 w-3/4 mb-3" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredReports.length > 0 ? (
                  <div className="space-y-4">
                    {filteredReports.map((report) => (
                      <div key={report.id} className="p-4 border rounded hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium">{report.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {report.report_number}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {report.description}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span>报告人: {report.reporter}</span>
                              <span>•</span>
                              <span>部门: {report.reporter_department}</span>
                              <span>•</span>
                              <span>地点: {report.location}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Badge className={getCategoryColor(report.category)} variant="outline">
                              {getCategoryText(report.category)}
                            </Badge>
                            <Badge className={getStatusColor(report.status)} variant="outline">
                              {getStatusText(report.status)}
                            </Badge>
                            <Badge className={getPriorityColor(report.priority)} variant="outline">
                              {getPriorityText(report.priority)}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span>事件: {format(new Date(report.incident_date), 'yyyy-MM-dd')}</span>
                            <span className="mx-2">•</span>
                            <span>报告: {format(new Date(report.report_date), 'yyyy-MM-dd HH:mm')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">没有找到符合条件的报告</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 创建报告标签页 */}
          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  创建新报告
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 基本信息 */}
                  <div className="space-y-4">
                    <h3 className="font-medium">基本信息</h3>

                    <div className="space-y-2">
                      <Label htmlFor="title">报告标题 *</Label>
                      <Input
                        id="title"
                        placeholder="请输入报告标题"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">事件描述 *</Label>
                      <Textarea
                        id="description"
                        placeholder="详细描述事件经过"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>事件分类 *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({...formData, category: value as any})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="production">生产</SelectItem>
                            <SelectItem value="safety">安全</SelectItem>
                            <SelectItem value="quality">质量</SelectItem>
                            <SelectItem value="equipment">设备</SelectItem>
                            <SelectItem value="personnel">人员</SelectItem>
                            <SelectItem value="environment">环境</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>优先级 *</Label>
                        <Select
                          value={formData.priority}
                          onValueChange={(value) => setFormData({...formData, priority: value as any})}
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                      <Label htmlFor="location">事件地点 *</Label>
                      <Input
                        id="location"
                        placeholder="请输入事件发生地点"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>事件日期 *</Label>
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
                              setSelectedDate(date || new Date());
                              setFormData({...formData, incident_date: (date || new Date()).toISOString()});
                              setIsDatePickerOpen(false);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* 详细信息 */}
                  <div className="space-y-4">
                    <h3 className="font-medium">详细信息</h3>

                    <div className="space-y-2">
                      <Label htmlFor="immediate_actions">立即采取的行动</Label>
                      <Textarea
                        id="immediate_actions"
                        placeholder="描述事件发生后立即采取的应急措施"
                        rows={3}
                        value={formData.immediate_actions}
                        onChange={(e) => setFormData({...formData, immediate_actions: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="root_cause">根本原因分析</Label>
                      <Textarea
                        id="root_cause"
                        placeholder="分析事件发生的根本原因"
                        rows={3}
                        value={formData.root_cause}
                        onChange={(e) => setFormData({...formData, root_cause: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="corrective_actions">纠正措施</Label>
                      <Textarea
                        id="corrective_actions"
                        placeholder="描述已采取或计划采取的纠正措施"
                        rows={3}
                        value={formData.corrective_actions}
                        onChange={(e) => setFormData({...formData, corrective_actions: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preventive_measures">预防措施</Label>
                      <Textarea
                        id="preventive_measures"
                        placeholder="描述为防止类似事件再次发生而采取的预防措施"
                        rows={3}
                        value={formData.preventive_measures}
                        onChange={(e) => setFormData({...formData, preventive_measures: e.target.value})}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="follow_up_required"
                        checked={formData.follow_up_required}
                        onChange={(e) => setFormData({...formData, follow_up_required: e.target.checked})}
                        className="rounded"
                      />
                      <Label htmlFor="follow_up_required">需要后续跟进</Label>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    添加附件
                  </Button>
                  <Button variant="outline">
                    保存草稿
                  </Button>
                  <Button>
                    提交报告
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 统计分析标签页 */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 分类统计 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    分类统计
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['production', 'safety', 'quality', 'equipment', 'personnel', 'environment'].map((category) => {
                      const count = reports.filter(r => r.category === category).length;
                      const percentage = reports.length > 0 ? (count / reports.length) * 100 : 0;
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{getCategoryText(category)}</span>
                            <span className="text-sm text-muted-foreground">{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 状态分布 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    状态分布
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['draft', 'submitted', 'under_review', 'approved', 'rejected'].map((status) => {
                      const count = reports.filter(r => r.status === status).length;
                      const percentage = reports.length > 0 ? (count / reports.length) * 100 : 0;
                      return (
                        <div key={status} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{getStatusText(status)}</span>
                            <span className="text-sm text-muted-foreground">{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 优先级分析 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    优先级分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['urgent', 'high', 'medium', 'low'].map((priority) => {
                      const count = reports.filter(r => r.priority === priority).length;
                      const percentage = reports.length > 0 ? (count / reports.length) * 100 : 0;
                      return (
                        <div key={priority} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{getPriorityText(priority)}</span>
                            <span className="text-sm text-muted-foreground">{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 部门统计 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    部门统计
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from(new Set(reports.map(r => r.reporter_department))).map((department) => {
                      const count = reports.filter(r => r.reporter_department === department).length;
                      const percentage = reports.length > 0 ? (count / reports.length) * 100 : 0;
                      return (
                        <div key={department} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{department}</span>
                            <span className="text-sm text-muted-foreground">{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
