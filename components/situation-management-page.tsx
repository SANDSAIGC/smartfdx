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
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Calendar,
  TrendingUp,
  BarChart3,
  Activity,
  Target,
  Zap,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Loader2,
  Bell,
  Flag,
  MessageSquare
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
import { CardSkeletonLoading, SkeletonLoading } from "@/components/loading-transition";
import { cn } from '@/lib/utils';
import { ThemeToggle } from "@/components/theme-toggle";
import { FooterSignature } from "@/components/ui/footer-signature";

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
// 定义数据类型
interface Situation {
  id: string;
  title: string;
  description: string;
  category: 'production' | 'safety' | 'quality' | 'equipment' | 'personnel' | 'environment';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  reporter: string;
  assignee?: string;
  department: string;
  created_date: string;
  updated_date: string;
  due_date?: string;
  resolution?: string;
  attachments?: string[];
  comments?: SituationComment[];
}

interface SituationComment {
  id: string;
  author: string;
  content: string;
  created_date: string;
}

interface SituationStats {
  total_situations: number;
  open_situations: number;
  in_progress_situations: number;
  resolved_situations: number;
  urgent_situations: number;
  overdue_situations: number;
}

export function SituationManagementPage() {
  // 性能监控
  const { renderCount } = useRenderPerformance('situation-management-page');
  const { addTimer, addListener } = useMemoryLeak('situation-management-page');
  const { metrics } = usePerformanceOptimization();
  const router = useRouter();
  
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [situations, setSituations] = useState<Situation[]>([]);
  const [situationStats, setSituationStats] = useState<SituationStats | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // 模拟数据生成
  const generateMockData = () => {
    const mockSituations: Situation[] = [
      {
        id: '1',
        title: '球磨机异常振动',
        description: '1号球磨机在运行过程中出现异常振动，需要立即检查',
        category: 'equipment',
        priority: 'high',
        status: 'open',
        reporter: '张工程师',
        assignee: '李维修',
        department: '设备部',
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        comments: [
          {
            id: '1',
            author: '张工程师',
            content: '发现振动频率异常，建议立即停机检查',
            created_date: new Date().toISOString()
          }
        ]
      },
      {
        id: '2',
        title: '化验室试剂短缺',
        description: '硫酸试剂库存不足，影响日常检测工作',
        category: 'production',
        priority: 'medium',
        status: 'in_progress',
        reporter: '王化验员',
        assignee: '采购部',
        department: '化验室',
        created_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updated_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        comments: [
          {
            id: '2',
            author: '采购部',
            content: '已联系供应商，预计明天到货',
            created_date: new Date().toISOString()
          }
        ]
      },
      {
        id: '3',
        title: '安全防护设备检查',
        description: '定期安全防护设备检查发现部分设备需要更换',
        category: 'safety',
        priority: 'high',
        status: 'resolved',
        reporter: '安全员',
        assignee: '安全部',
        department: '安全部',
        created_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_date: new Date().toISOString(),
        resolution: '已更换所有需要更换的防护设备',
        comments: []
      },
      {
        id: '4',
        title: '产品质量异常',
        description: '出厂产品锌品位检测结果异常，需要调查原因',
        category: 'quality',
        priority: 'urgent',
        status: 'open',
        reporter: '质检员',
        department: '质检部',
        created_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        comments: []
      },
      {
        id: '5',
        title: '员工培训计划',
        description: '新员工安全培训计划需要制定和实施',
        category: 'personnel',
        priority: 'medium',
        status: 'in_progress',
        reporter: '人事部',
        assignee: '培训专员',
        department: '人事部',
        created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        comments: []
      }
    ];

    const mockStats: SituationStats = {
      total_situations: mockSituations.length,
      open_situations: mockSituations.filter(s => s.status === 'open').length,
      in_progress_situations: mockSituations.filter(s => s.status === 'in_progress').length,
      resolved_situations: mockSituations.filter(s => s.status === 'resolved').length,
      urgent_situations: mockSituations.filter(s => s.priority === 'urgent').length,
      overdue_situations: mockSituations.filter(s => 
        s.due_date && new Date(s.due_date) < new Date() && s.status !== 'resolved' && s.status !== 'closed'
      ).length
    };

    return { mockSituations, mockStats };
  };

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { mockSituations, mockStats } = generateMockData();
      setSituations(mockSituations);
      setSituationStats(mockStats);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载情况数据，请稍后重试",
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

  // 筛选情况
  const filteredSituations = situations.filter(situation => {
    const matchesSearch = situation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         situation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         situation.reporter.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || situation.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || situation.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || situation.priority === priorityFilter;
    
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
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return '待处理';
      case 'in_progress': return '处理中';
      case 'resolved': return '已解决';
      case 'closed': return '已关闭';
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
    <PerformanceWrapper
      componentName="situation-management-page"
      enableMonitoring={process.env.NODE_ENV === 'development'}
      enableMemoryTracking={true}
    >
      <AnimatedPage className="min-h-screen bg-background">
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
          <h1 className="text-xl md:text-2xl font-semibold">情况管理</h1>
        </div>
        <ThemeToggle />
      </div>

      <AnimatedListItem index={0} className="p-6 space-y-6">
        {/* 欢迎面板 */}
        <AnimatedCard delay={0}>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-medium mb-2">情况管理中心</h2>
              <p className="text-sm text-muted-foreground">
                统一管理生产、安全、质量等各类情况
              </p>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* 统计面板 */}
        {loading ? (
          <CardSkeletonLoading cards={6} />
        ) : situationStats && (
          <AnimatedListItem index={0} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <AnimatedCard delay={0.1}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <FileText className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm text-muted-foreground">总数</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{situationStats.total_situations}</div>
                <p className="text-xs text-muted-foreground">全部情况</p>
              </CardContent>
            </AnimatedCard>

            <AnimatedCard delay={0.2}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-sm text-muted-foreground">待处理</span>
                </div>
                <div className="text-2xl font-bold text-red-600">{situationStats.open_situations}</div>
                <p className="text-xs text-muted-foreground">需要处理</p>
              </CardContent>
            </AnimatedCard>

            <AnimatedCard delay={0.30000000000000004}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-4 w-4 text-yellow-600 mr-1" />
                  <span className="text-sm text-muted-foreground">处理中</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600">{situationStats.in_progress_situations}</div>
                <p className="text-xs text-muted-foreground">正在处理</p>
              </CardContent>
            </AnimatedCard>

            <AnimatedCard delay={0.4}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-muted-foreground">已解决</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{situationStats.resolved_situations}</div>
                <p className="text-xs text-muted-foreground">处理完成</p>
              </CardContent>
            </AnimatedCard>

            <AnimatedCard delay={0.5}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-sm text-muted-foreground">紧急</span>
                </div>
                <div className="text-2xl font-bold text-red-600">{situationStats.urgent_situations}</div>
                <p className="text-xs text-muted-foreground">紧急情况</p>
              </CardContent>
            </AnimatedCard>

            <AnimatedCard delay={0.6000000000000001}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Flag className="h-4 w-4 text-orange-600 mr-1" />
                  <span className="text-sm text-muted-foreground">逾期</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">{situationStats.overdue_situations}</div>
                <p className="text-xs text-muted-foreground">超期未处理</p>
              </CardContent>
            </AnimatedCard>
          </div>
        )}

        {/* 主要内容区域 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="situations">情况列表</TabsTrigger>
            <TabsTrigger value="analytics">分析报告</TabsTrigger>
            <TabsTrigger value="settings">设置</TabsTrigger>
          </TabsList>

          {/* 概览标签页 */}
          <TabsContent value="overview" className="space-y-6">
            <AnimatedListItem index={1} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 最新情况 */}
              <AnimatedCard delay={0.7000000000000001}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    最新情况
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <SkeletonLoading rows={3} />
                  ) : (
                    <AnimatedListItem index={1} className="space-y-3">
                      {situations.slice(0, 5).map((situation) => (
                        <div key={situation.id} className="p-3 border rounded hover:bg-muted/50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm">{situation.title}</h4>
                            <Badge className={getPriorityColor(situation.priority)} variant="outline">
                              {getPriorityText(situation.priority)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {situation.description}
                          </p>
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center space-x-2">
                              <Badge className={getCategoryColor(situation.category)} variant="outline">
                                {getCategoryText(situation.category)}
                              </Badge>
                              <Badge className={getStatusColor(situation.status)} variant="outline">
                                {getStatusText(situation.status)}
                              </Badge>
                            </div>
                            <span className="text-muted-foreground">
                              {format(new Date(situation.created_date), 'MM-dd HH:mm')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </AnimatedCard>

              {/* 快速操作 */}
              <AnimatedCard delay={0.8}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    快速操作
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <AnimatedButton className="w-full justify-start" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    新建情况报告
                  </Button>
                  <AnimatedButton className="w-full justify-start" variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    搜索历史情况
                  </Button>
                  <AnimatedButton className="w-full justify-start" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    生成分析报告
                  </Button>
                  <AnimatedButton className="w-full justify-start" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    导出数据
                  </Button>
                  <AnimatedButton className="w-full justify-start" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    系统设置
                  </Button>
                </CardContent>
              </AnimatedCard>
            </div>
          </TabsContent>

          {/* 情况列表标签页 */}
          <TabsContent value="situations" className="space-y-6">
            {/* 搜索和筛选 */}
            <AnimatedCard delay={0.9}>
              <CardContent className="pt-6">
                <AnimatedListItem index={2} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <AnimatedListItem index={2} className="space-y-2">
                    <Label htmlFor="search">搜索</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="搜索情况..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <AnimatedListItem index={3} className="space-y-2">
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

                  <AnimatedListItem index={4} className="space-y-2">
                    <Label>状态</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        <SelectItem value="open">待处理</SelectItem>
                        <SelectItem value="in_progress">处理中</SelectItem>
                        <SelectItem value="resolved">已解决</SelectItem>
                        <SelectItem value="closed">已关闭</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <AnimatedListItem index={5} className="space-y-2">
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

                  <AnimatedListItem index={6} className="space-y-2">
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
            </AnimatedCard>

            {/* 情况列表 */}
            <AnimatedCard delay={1}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>情况列表 ({filteredSituations.length})</span>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    新建情况
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <SkeletonLoading rows={5} />
                ) : filteredSituations.length > 0 ? (
                  <AnimatedListItem index={7} className="space-y-4">
                    {filteredSituations.map((situation) => (
                      <div key={situation.id} className="p-4 border rounded hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">{situation.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {situation.description}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span>报告人: {situation.reporter}</span>
                              {situation.assignee && (
                                <>
                                  <span>•</span>
                                  <span>负责人: {situation.assignee}</span>
                                </>
                              )}
                              <span>•</span>
                              <span>部门: {situation.department}</span>
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
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Badge className={getCategoryColor(situation.category)} variant="outline">
                              {getCategoryText(situation.category)}
                            </Badge>
                            <Badge className={getStatusColor(situation.status)} variant="outline">
                              {getStatusText(situation.status)}
                            </Badge>
                            <Badge className={getPriorityColor(situation.priority)} variant="outline">
                              {getPriorityText(situation.priority)}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span>创建: {format(new Date(situation.created_date), 'yyyy-MM-dd HH:mm')}</span>
                            {situation.due_date && (
                              <>
                                <span className="mx-2">•</span>
                                <span>截止: {format(new Date(situation.due_date), 'yyyy-MM-dd')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">没有找到符合条件的情况</p>
                  </div>
                )}
              </CardContent>
            </AnimatedCard>
          </TabsContent>

          {/* 分析报告标签页 */}
          <TabsContent value="analytics" className="space-y-6">
            <AnimatedListItem index={3} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 分类统计 */}
              <AnimatedCard delay={1.1}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    分类统计
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatedListItem index={8} className="space-y-4">
                    {['production', 'safety', 'quality', 'equipment', 'personnel', 'environment'].map((category) => {
                      const count = situations.filter(s => s.category === category).length;
                      const percentage = situations.length > 0 ? (count / situations.length) * 100 : 0;
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
              </AnimatedCard>

              {/* 状态分布 */}
              <AnimatedCard delay={1.2000000000000002}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    状态分布
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatedListItem index={9} className="space-y-4">
                    {['open', 'in_progress', 'resolved', 'closed'].map((status) => {
                      const count = situations.filter(s => s.status === status).length;
                      const percentage = situations.length > 0 ? (count / situations.length) * 100 : 0;
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
              </AnimatedCard>

              {/* 优先级分析 */}
              <AnimatedCard delay={1.3}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    优先级分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatedListItem index={10} className="space-y-4">
                    {['urgent', 'high', 'medium', 'low'].map((priority) => {
                      const count = situations.filter(s => s.priority === priority).length;
                      const percentage = situations.length > 0 ? (count / situations.length) * 100 : 0;
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
              </AnimatedCard>

              {/* 部门统计 */}
              <AnimatedCard delay={1.4000000000000001}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    部门统计
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatedListItem index={11} className="space-y-4">
                    {Array.from(new Set(situations.map(s => s.department))).map((department) => {
                      const count = situations.filter(s => s.department === department).length;
                      const percentage = situations.length > 0 ? (count / situations.length) * 100 : 0;
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
              </AnimatedCard>
            </div>
          </TabsContent>

          {/* 设置标签页 */}
          <TabsContent value="settings" className="space-y-6">
            <AnimatedListItem index={4} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 通知设置 */}
              <AnimatedCard delay={1.5}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    通知设置
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">新情况通知</p>
                      <p className="text-sm text-muted-foreground">有新情况时发送通知</p>
                    </div>
                    <Button variant="outline" size="sm">开启</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">逾期提醒</p>
                      <p className="text-sm text-muted-foreground">情况逾期时发送提醒</p>
                    </div>
                    <Button variant="outline" size="sm">开启</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">状态更新</p>
                      <p className="text-sm text-muted-foreground">情况状态变更时通知</p>
                    </div>
                    <Button variant="outline" size="sm">开启</Button>
                  </div>
                </CardContent>
              </AnimatedCard>

              {/* 系统设置 */}
              <AnimatedCard delay={1.6}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    系统设置
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AnimatedListItem index={12} className="space-y-2">
                    <Label>默认优先级</Label>
                    <Select defaultValue="medium">
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
                  <AnimatedListItem index={13} className="space-y-2">
                    <Label>自动分配规则</Label>
                    <Select defaultValue="department">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="department">按部门分配</SelectItem>
                        <SelectItem value="category">按分类分配</SelectItem>
                        <SelectItem value="manual">手动分配</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <AnimatedListItem index={14} className="space-y-2">
                    <Label>数据保留期限</Label>
                    <Select defaultValue="365">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="90">90天</SelectItem>
                        <SelectItem value="180">180天</SelectItem>
                        <SelectItem value="365">1年</SelectItem>
                        <SelectItem value="730">2年</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </AnimatedCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AnimatedPage>
    </PerformanceWrapper>
  );
}
