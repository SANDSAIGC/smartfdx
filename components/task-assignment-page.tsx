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
  Users,
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  Flag,
  MessageSquare,
  Settings,
  RefreshCw,
  Loader2,
  Bell,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  Building,
  MapPin,
  Zap,
  FileText,
  Send,
  UserCheck,
  UserX,
  Timer,
  Award,
  Briefcase
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
interface TaskAssignment {
  id: string;
  task_number: string;
  title: string;
  description: string;
  category: 'production' | 'maintenance' | 'quality' | 'safety' | 'training' | 'administrative';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  assignor: string;
  assignor_department: string;
  assignee?: string;
  assignee_department?: string;
  created_date: string;
  due_date: string;
  start_date?: string;
  completion_date?: string;
  estimated_hours: number;
  actual_hours?: number;
  location?: string;
  requirements?: string;
  resources_needed?: string[];
  skills_required?: string[];
  completion_notes?: string;
  approval_required: boolean;
  approver?: string;
  approval_date?: string;
  follow_up_tasks?: string[];
}

interface AssignmentStats {
  total_tasks: number;
  pending_tasks: number;
  assigned_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
}

export function TaskAssignmentPage() {
  // 性能监控
  const { renderCount } = useRenderPerformance('task-assignment-page');
  const { addTimer, addListener } = useMemoryLeak('task-assignment-page');
  const { metrics } = usePerformanceOptimization();
  const router = useRouter();
  
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [assignmentStats, setAssignmentStats] = useState<AssignmentStats | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState<Partial<TaskAssignment>>({
    title: '',
    description: '',
    category: 'production',
    priority: 'medium',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 8,
    location: '',
    requirements: '',
    approval_required: false
  });

  // 模拟数据生成
  const generateMockData = () => {
    const mockAssignments: TaskAssignment[] = [
      {
        id: '1',
        task_number: 'TASK-2024-001',
        title: '球磨机定期维护检查',
        description: '对1号球磨机进行月度定期维护检查，包括轴承润滑、皮带张紧度检查等',
        category: 'maintenance',
        priority: 'high',
        status: 'assigned',
        assignor: '设备主管',
        assignor_department: '设备部',
        assignee: '张维修工',
        assignee_department: '设备部',
        created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_hours: 6,
        location: '球磨车间',
        requirements: '需要停机维护，准备相关工具和备件',
        resources_needed: ['润滑油', '皮带', '工具箱'],
        skills_required: ['机械维修', '设备操作'],
        approval_required: true,
        approver: '车间主任'
      },
      {
        id: '2',
        task_number: 'TASK-2024-002',
        title: '新员工安全培训',
        description: '为本月新入职员工进行安全操作规程培训',
        category: 'training',
        priority: 'medium',
        status: 'in_progress',
        assignor: '人事经理',
        assignor_department: '人事部',
        assignee: '安全员',
        assignee_department: '安全部',
        created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        start_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        estimated_hours: 16,
        actual_hours: 8,
        location: '培训中心',
        requirements: '准备培训材料和考核试卷',
        resources_needed: ['培训教材', '投影设备', '考试用品'],
        skills_required: ['培训授课', '安全知识'],
        approval_required: false
      },
      {
        id: '3',
        task_number: 'TASK-2024-003',
        title: '产品质量检测报告',
        description: '完成本周出厂产品的质量检测并出具检测报告',
        category: 'quality',
        priority: 'urgent',
        status: 'pending',
        assignor: '质检主管',
        assignor_department: '质检部',
        created_date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        estimated_hours: 4,
        location: '化验室',
        requirements: '按照标准检测流程进行，确保数据准确',
        resources_needed: ['检测设备', '试剂', '记录表格'],
        skills_required: ['化验分析', '数据处理'],
        approval_required: true,
        approver: '技术总监'
      },
      {
        id: '4',
        task_number: 'TASK-2024-004',
        title: '生产计划制定',
        description: '制定下月生产计划，包括产量目标和资源配置',
        category: 'production',
        priority: 'high',
        status: 'completed',
        assignor: '生产经理',
        assignor_department: '生产部',
        assignee: '计划员',
        assignee_department: '生产部',
        created_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        start_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        completion_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_hours: 12,
        actual_hours: 10,
        location: '生产办公室',
        completion_notes: '已完成下月生产计划制定，已提交审批',
        approval_required: true,
        approver: '副总经理',
        approval_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        task_number: 'TASK-2024-005',
        title: '环保设施检查',
        description: '对废水处理设施进行月度检查，确保正常运行',
        category: 'safety',
        priority: 'medium',
        status: 'overdue',
        assignor: '环保专员',
        assignor_department: '安全环保部',
        assignee: '环保技术员',
        assignee_department: '安全环保部',
        created_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_hours: 8,
        location: '废水处理站',
        requirements: '检查设备运行状态，记录相关数据',
        resources_needed: ['检测仪器', '记录表', '防护用品'],
        skills_required: ['环保知识', '设备操作'],
        approval_required: false
      }
    ];

    const mockStats: AssignmentStats = {
      total_tasks: mockAssignments.length,
      pending_tasks: mockAssignments.filter(t => t.status === 'pending').length,
      assigned_tasks: mockAssignments.filter(t => t.status === 'assigned').length,
      in_progress_tasks: mockAssignments.filter(t => t.status === 'in_progress').length,
      completed_tasks: mockAssignments.filter(t => t.status === 'completed').length,
      overdue_tasks: mockAssignments.filter(t => t.status === 'overdue').length
    };

    return { mockAssignments, mockStats };
  };

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { mockAssignments, mockStats } = generateMockData();
      setAssignments(mockAssignments);
      setAssignmentStats(mockStats);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载任务数据，请稍后重试",
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

  // 筛选任务
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.assignor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (assignment.assignee && assignment.assignee.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || assignment.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || assignment.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || assignment.assignee === assigneeFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority && matchesAssignee;
  });

  const handleBack = () => {
    router.back();
  };

  // 获取分类颜色
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'production': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'quality': return 'bg-green-100 text-green-800';
      case 'safety': return 'bg-red-100 text-red-800';
      case 'training': return 'bg-purple-100 text-purple-800';
      case 'administrative': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取分类文本
  const getCategoryText = (category: string) => {
    switch (category) {
      case 'production': return '生产';
      case 'maintenance': return '维护';
      case 'quality': return '质量';
      case 'safety': return '安全';
      case 'training': return '培训';
      case 'administrative': return '行政';
      default: return '其他';
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待分配';
      case 'assigned': return '已分配';
      case 'in_progress': return '进行中';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      case 'overdue': return '已逾期';
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
      componentName="task-assignment-page"
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
          <h1 className="text-xl md:text-2xl font-semibold">任务分配</h1>
        </div>
        <ThemeToggle />
      </div>

      <AnimatedListItem index={0} className="p-6 space-y-6">
        {/* 欢迎面板 */}
        <AnimatedCard delay={0}>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-medium mb-2">任务分配管理</h2>
              <p className="text-sm text-muted-foreground">
                创建、分配和跟踪各类工作任务
              </p>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* 统计面板 */}
        {loading ? (
          <CardSkeletonLoading cards={6} />
        ) : assignmentStats && (
          <AnimatedListItem index={0} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <AnimatedCard delay={0.1}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Briefcase className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm text-muted-foreground">总数</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{assignmentStats.total_tasks}</div>
                <p className="text-xs text-muted-foreground">全部任务</p>
              </CardContent>
            </AnimatedCard>

            <AnimatedCard delay={0.2}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-4 w-4 text-gray-600 mr-1" />
                  <span className="text-sm text-muted-foreground">待分配</span>
                </div>
                <div className="text-2xl font-bold text-gray-600">{assignmentStats.pending_tasks}</div>
                <p className="text-xs text-muted-foreground">等待分配</p>
              </CardContent>
            </AnimatedCard>

            <AnimatedCard delay={0.30000000000000004}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <UserCheck className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm text-muted-foreground">已分配</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{assignmentStats.assigned_tasks}</div>
                <p className="text-xs text-muted-foreground">已安排人员</p>
              </CardContent>
            </AnimatedCard>

            <AnimatedCard delay={0.4}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="h-4 w-4 text-yellow-600 mr-1" />
                  <span className="text-sm text-muted-foreground">进行中</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600">{assignmentStats.in_progress_tasks}</div>
                <p className="text-xs text-muted-foreground">正在执行</p>
              </CardContent>
            </AnimatedCard>

            <AnimatedCard delay={0.5}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-muted-foreground">已完成</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{assignmentStats.completed_tasks}</div>
                <p className="text-xs text-muted-foreground">任务完成</p>
              </CardContent>
            </AnimatedCard>

            <AnimatedCard delay={0.6000000000000001}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-sm text-muted-foreground">已逾期</span>
                </div>
                <div className="text-2xl font-bold text-red-600">{assignmentStats.overdue_tasks}</div>
                <p className="text-xs text-muted-foreground">需要关注</p>
              </CardContent>
            </AnimatedCard>
          </div>
        )}

        {/* 主要内容区域 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="tasks">任务列表</TabsTrigger>
            <TabsTrigger value="create">创建任务</TabsTrigger>
            <TabsTrigger value="analytics">统计分析</TabsTrigger>
          </TabsList>

          {/* 概览标签页 */}
          <TabsContent value="overview" className="space-y-6">
            <AnimatedListItem index={1} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 最新任务 */}
              <AnimatedCard delay={0.7000000000000001}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    最新任务
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <SkeletonLoading rows={5} />
                  ) : (
                    <AnimatedListItem index={1} className="space-y-3">
                      {assignments.slice(0, 5).map((assignment) => (
                        <div key={assignment.id} className="p-3 border rounded hover:bg-muted/50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm">{assignment.title}</h4>
                            <Badge className={getPriorityColor(assignment.priority)} variant="outline">
                              {getPriorityText(assignment.priority)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {assignment.description}
                          </p>
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center space-x-2">
                              <Badge className={getCategoryColor(assignment.category)} variant="outline">
                                {getCategoryText(assignment.category)}
                              </Badge>
                              <Badge className={getStatusColor(assignment.status)} variant="outline">
                                {getStatusText(assignment.status)}
                              </Badge>
                            </div>
                            <span className="text-muted-foreground">
                              {format(new Date(assignment.due_date), 'MM-dd')}
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
                  <AnimatedButton
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setActiveTab('create')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    创建新任务
                  </Button>
                  <AnimatedButton className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    批量分配任务
                  </Button>
                  <AnimatedButton className="w-full justify-start" variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    搜索历史任务
                  </Button>
                  <AnimatedButton className="w-full justify-start" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    生成工作报告
                  </Button>
                  <AnimatedButton className="w-full justify-start" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    任务模板管理
                  </Button>
                </CardContent>
              </AnimatedCard>
            </div>
          </TabsContent>

          {/* 任务列表标签页 */}
          <TabsContent value="tasks" className="space-y-6">
            {/* 搜索和筛选 */}
            <AnimatedCard delay={0.9}>
              <CardContent className="pt-6">
                <AnimatedListItem index={2} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <AnimatedListItem index={2} className="space-y-2">
                    <Label htmlFor="search">搜索</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="搜索任务..."
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
                        <SelectItem value="maintenance">维护</SelectItem>
                        <SelectItem value="quality">质量</SelectItem>
                        <SelectItem value="safety">安全</SelectItem>
                        <SelectItem value="training">培训</SelectItem>
                        <SelectItem value="administrative">行政</SelectItem>
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
                        <SelectItem value="pending">待分配</SelectItem>
                        <SelectItem value="assigned">已分配</SelectItem>
                        <SelectItem value="in_progress">进行中</SelectItem>
                        <SelectItem value="completed">已完成</SelectItem>
                        <SelectItem value="overdue">已逾期</SelectItem>
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
                    <Label>执行人</Label>
                    <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择执行人" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部人员</SelectItem>
                        {Array.from(new Set(assignments.map(a => a.assignee).filter(Boolean))).map((assignee) => (
                          <SelectItem key={assignee} value={assignee!}>{assignee}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <AnimatedListItem index={7} className="space-y-2">
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

            {/* 任务列表 */}
            <AnimatedCard delay={1}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>任务列表 ({filteredAssignments.length})</span>
                  <Button size="sm" onClick={() => setActiveTab('create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    新建任务
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <SkeletonLoading rows={5} />
                ) : filteredAssignments.length > 0 ? (
                  <AnimatedListItem index={8} className="space-y-4">
                    {filteredAssignments.map((assignment) => (
                      <div key={assignment.id} className="p-4 border rounded hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium">{assignment.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {assignment.task_number}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {assignment.description}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span>分配人: {assignment.assignor}</span>
                              {assignment.assignee && (
                                <>
                                  <span>•</span>
                                  <span>执行人: {assignment.assignee}</span>
                                </>
                              )}
                              <span>•</span>
                              <span>预计: {assignment.estimated_hours}小时</span>
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
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Badge className={getCategoryColor(assignment.category)} variant="outline">
                              {getCategoryText(assignment.category)}
                            </Badge>
                            <Badge className={getStatusColor(assignment.status)} variant="outline">
                              {getStatusText(assignment.status)}
                            </Badge>
                            <Badge className={getPriorityColor(assignment.priority)} variant="outline">
                              {getPriorityText(assignment.priority)}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span>创建: {format(new Date(assignment.created_date), 'MM-dd')}</span>
                            <span className="mx-2">•</span>
                            <span>截止: {format(new Date(assignment.due_date), 'MM-dd')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">没有找到符合条件的任务</p>
                  </div>
                )}
              </CardContent>
            </AnimatedCard>
          </TabsContent>

          {/* 创建任务标签页 */}
          <TabsContent value="create" className="space-y-6">
            <AnimatedCard delay={1.1}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  创建新任务
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <AnimatedListItem index={3} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 基本信息 */}
                  <AnimatedListItem index={9} className="space-y-4">
                    <h3 className="font-medium">基本信息</h3>

                    <AnimatedListItem index={10} className="space-y-2">
                      <Label htmlFor="title">任务标题 *</Label>
                      <Input
                        id="title"
                        placeholder="请输入任务标题"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                      />
                    </div>

                    <AnimatedListItem index={11} className="space-y-2">
                      <Label htmlFor="description">任务描述 *</Label>
                      <Textarea
                        id="description"
                        placeholder="详细描述任务内容和要求"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                    </div>

                    <AnimatedListItem index={4} className="grid grid-cols-2 gap-4">
                      <AnimatedListItem index={12} className="space-y-2">
                        <Label>任务分类 *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({...formData, category: value as any})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="production">生产</SelectItem>
                            <SelectItem value="maintenance">维护</SelectItem>
                            <SelectItem value="quality">质量</SelectItem>
                            <SelectItem value="safety">安全</SelectItem>
                            <SelectItem value="training">培训</SelectItem>
                            <SelectItem value="administrative">行政</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <AnimatedListItem index={13} className="space-y-2">
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

                    <AnimatedListItem index={5} className="grid grid-cols-2 gap-4">
                      <AnimatedListItem index={14} className="space-y-2">
                        <Label htmlFor="estimated_hours">预计工时 *</Label>
                        <Input
                          id="estimated_hours"
                          type="number"
                          placeholder="小时"
                          value={formData.estimated_hours}
                          onChange={(e) => setFormData({...formData, estimated_hours: Number(e.target.value)})}
                        />
                      </div>

                      <AnimatedListItem index={15} className="space-y-2">
                        <Label htmlFor="location">工作地点</Label>
                        <Input
                          id="location"
                          placeholder="请输入工作地点"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                        />
                      </div>
                    </div>

                    <AnimatedListItem index={16} className="space-y-2">
                      <Label>截止日期 *</Label>
                      <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <AnimatedButton
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
                              setFormData({...formData, due_date: (date || new Date()).toISOString()});
                              setIsDatePickerOpen(false);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* 详细信息 */}
                  <AnimatedListItem index={17} className="space-y-4">
                    <h3 className="font-medium">详细信息</h3>

                    <AnimatedListItem index={18} className="space-y-2">
                      <Label htmlFor="requirements">任务要求</Label>
                      <Textarea
                        id="requirements"
                        placeholder="描述任务的具体要求和标准"
                        rows={3}
                        value={formData.requirements}
                        onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                      />
                    </div>

                    <AnimatedListItem index={19} className="space-y-2">
                      <Label>执行人员</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="选择执行人员" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user1">张工程师</SelectItem>
                          <SelectItem value="user2">李技术员</SelectItem>
                          <SelectItem value="user3">王操作员</SelectItem>
                          <SelectItem value="user4">赵维修工</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <AnimatedListItem index={20} className="space-y-2">
                      <Label>所需技能</Label>
                      <Input placeholder="例如：机械维修、电气操作" />
                    </div>

                    <AnimatedListItem index={21} className="space-y-2">
                      <Label>所需资源</Label>
                      <Input placeholder="例如：工具、材料、设备" />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="approval_required"
                        checked={formData.approval_required}
                        onChange={(e) => setFormData({...formData, approval_required: e.target.checked})}
                        className="rounded"
                      />
                      <Label htmlFor="approval_required">需要审批</Label>
                    </div>

                    {formData.approval_required && (
                      <AnimatedListItem index={22} className="space-y-2">
                        <Label>审批人</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="选择审批人" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manager1">车间主任</SelectItem>
                            <SelectItem value="manager2">部门经理</SelectItem>
                            <SelectItem value="manager3">技术总监</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <AnimatedButton variant="outline">
                    保存草稿
                  </Button>
                  <AnimatedButton variant="outline">
                    <Send className="h-4 w-4 mr-2" />
                    分配任务
                  </Button>
                  <AnimatedButton>
                    创建任务
                  </Button>
                </div>
              </CardContent>
            </AnimatedCard>
          </TabsContent>

          {/* 统计分析标签页 */}
          <TabsContent value="analytics" className="space-y-6">
            <AnimatedListItem index={6} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 分类统计 */}
              <AnimatedCard delay={1.2000000000000002}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    分类统计
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatedListItem index={23} className="space-y-4">
                    {['production', 'maintenance', 'quality', 'safety', 'training', 'administrative'].map((category) => {
                      const count = assignments.filter(a => a.category === category).length;
                      const percentage = assignments.length > 0 ? (count / assignments.length) * 100 : 0;
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
              <AnimatedCard delay={1.3}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    状态分布
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatedListItem index={24} className="space-y-4">
                    {['pending', 'assigned', 'in_progress', 'completed', 'overdue'].map((status) => {
                      const count = assignments.filter(a => a.status === status).length;
                      const percentage = assignments.length > 0 ? (count / assignments.length) * 100 : 0;
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
              <AnimatedCard delay={1.4000000000000001}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    优先级分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatedListItem index={25} className="space-y-4">
                    {['urgent', 'high', 'medium', 'low'].map((priority) => {
                      const count = assignments.filter(a => a.priority === priority).length;
                      const percentage = assignments.length > 0 ? (count / assignments.length) * 100 : 0;
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

              {/* 人员工作量 */}
              <AnimatedCard delay={1.5}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    人员工作量
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatedListItem index={26} className="space-y-4">
                    {Array.from(new Set(assignments.map(a => a.assignee).filter(Boolean))).map((assignee) => {
                      const userTasks = assignments.filter(a => a.assignee === assignee);
                      const totalHours = userTasks.reduce((sum, task) => sum + task.estimated_hours, 0);
                      const maxHours = Math.max(...Array.from(new Set(assignments.map(a => a.assignee).filter(Boolean))).map(person =>
                        assignments.filter(a => a.assignee === person).reduce((sum, task) => sum + task.estimated_hours, 0)
                      ));
                      const percentage = maxHours > 0 ? (totalHours / maxHours) * 100 : 0;
                      return (
                        <div key={assignee} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{assignee}</span>
                            <span className="text-sm text-muted-foreground">{userTasks.length}个任务 ({totalHours}小时)</span>
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
        </Tabs>
      </div>
    </AnimatedPage>
    </PerformanceWrapper>
  );
}
