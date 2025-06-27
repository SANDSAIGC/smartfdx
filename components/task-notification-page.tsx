"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Bell,
  BellRing,
  Search,
  Filter,
  MoreHorizontal,
  Check,
  X,
  Eye,
  EyeOff,
  Clock,
  Calendar,
  User,
  Users,
  AlertTriangle,
  CheckCircle,
  Info,
  MessageSquare,
  Settings,
  RefreshCw,
  Loader2,
  Archive,
  Trash2,
  Star,
  StarOff,
  Send,
  Reply,
  Forward,
  Download,
  Share,
  Flag,
  Bookmark,
  BookmarkCheck,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  Building,
  MapPin,
  Zap,
  FileText,
  Target,
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';
import { ThemeToggle } from "@/components/theme-toggle";

// 定义数据类型
interface TaskNotification {
  id: string;
  notification_id: string;
  title: string;
  content: string;
  type: 'task_assigned' | 'task_updated' | 'task_completed' | 'task_overdue' | 'reminder' | 'system' | 'announcement';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived' | 'starred';
  sender: string;
  sender_department: string;
  recipient: string;
  recipient_department: string;
  created_date: string;
  read_date?: string;
  related_task_id?: string;
  related_task_title?: string;
  action_required: boolean;
  action_deadline?: string;
  action_url?: string;
  attachments?: string[];
  tags?: string[];
}

interface NotificationStats {
  total_notifications: number;
  unread_notifications: number;
  read_notifications: number;
  starred_notifications: number;
  archived_notifications: number;
  urgent_notifications: number;
}

export function TaskNotificationPage() {
  const router = useRouter();
  
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<TaskNotification[]>([]);
  const [notificationStats, setNotificationStats] = useState<NotificationStats | null>(null);
  const [activeTab, setActiveTab] = useState('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [senderFilter, setSenderFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // 模拟数据生成
  const generateMockData = () => {
    const mockNotifications: TaskNotification[] = [
      {
        id: '1',
        notification_id: 'NOTIF-2024-001',
        title: '新任务分配：球磨机维护检查',
        content: '您被分配了一个新的维护任务：对1号球磨机进行月度定期维护检查。请在3天内完成，包括轴承润滑、皮带张紧度检查等工作。',
        type: 'task_assigned',
        priority: 'high',
        status: 'unread',
        sender: '设备主管',
        sender_department: '设备部',
        recipient: '张维修工',
        recipient_department: '设备部',
        created_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        related_task_id: 'TASK-2024-001',
        related_task_title: '球磨机定期维护检查',
        action_required: true,
        action_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        action_url: '/task-assignment',
        tags: ['维护', '紧急']
      },
      {
        id: '2',
        notification_id: 'NOTIF-2024-002',
        title: '任务状态更新：安全培训进度',
        content: '您负责的新员工安全培训任务已更新。当前进度：已完成理论培训，待进行实操演练。请安排后续培训计划。',
        type: 'task_updated',
        priority: 'medium',
        status: 'read',
        sender: '人事经理',
        sender_department: '人事部',
        recipient: '安全员',
        recipient_department: '安全部',
        created_date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        read_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        related_task_id: 'TASK-2024-002',
        related_task_title: '新员工安全培训',
        action_required: true,
        action_deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['培训', '进度更新']
      },
      {
        id: '3',
        notification_id: 'NOTIF-2024-003',
        title: '紧急：质量检测任务逾期提醒',
        content: '您的产品质量检测任务已逾期1天。请立即完成本周出厂产品的质量检测并提交检测报告。如有困难请及时联系质检主管。',
        type: 'task_overdue',
        priority: 'urgent',
        status: 'unread',
        sender: '系统自动',
        sender_department: '系统',
        recipient: '化验员',
        recipient_department: '质检部',
        created_date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        related_task_id: 'TASK-2024-003',
        related_task_title: '产品质量检测报告',
        action_required: true,
        action_deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        tags: ['逾期', '紧急', '质检']
      },
      {
        id: '4',
        notification_id: 'NOTIF-2024-004',
        title: '任务完成确认：生产计划制定',
        content: '恭喜！您提交的下月生产计划已通过审批。计划员出色完成了生产计划制定工作，计划已正式生效。感谢您的辛勤工作！',
        type: 'task_completed',
        priority: 'low',
        status: 'starred',
        sender: '生产经理',
        sender_department: '生产部',
        recipient: '计划员',
        recipient_department: '生产部',
        created_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read_date: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        related_task_id: 'TASK-2024-004',
        related_task_title: '生产计划制定',
        action_required: false,
        tags: ['完成', '表扬']
      },
      {
        id: '5',
        notification_id: 'NOTIF-2024-005',
        title: '系统公告：月度安全检查安排',
        content: '各部门注意：本月安全检查将于下周一开始，为期3天。请各部门做好准备工作，确保设备运行正常，安全设施完备。检查重点包括消防设施、应急预案、人员培训记录等。',
        type: 'announcement',
        priority: 'medium',
        status: 'read',
        sender: '安全部',
        sender_department: '安全部',
        recipient: '全体员工',
        recipient_department: '全公司',
        created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        read_date: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        action_required: true,
        action_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['公告', '安全检查']
      },
      {
        id: '6',
        notification_id: 'NOTIF-2024-006',
        title: '提醒：环保设施检查即将到期',
        content: '友情提醒：您负责的废水处理设施月度检查将在明天到期。请及时安排检查工作，确保环保设施正常运行，避免任务逾期。',
        type: 'reminder',
        priority: 'medium',
        status: 'unread',
        sender: '系统自动',
        sender_department: '系统',
        recipient: '环保技术员',
        recipient_department: '安全环保部',
        created_date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        related_task_id: 'TASK-2024-005',
        related_task_title: '环保设施检查',
        action_required: true,
        action_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        tags: ['提醒', '环保']
      }
    ];

    const mockStats: NotificationStats = {
      total_notifications: mockNotifications.length,
      unread_notifications: mockNotifications.filter(n => n.status === 'unread').length,
      read_notifications: mockNotifications.filter(n => n.status === 'read').length,
      starred_notifications: mockNotifications.filter(n => n.status === 'starred').length,
      archived_notifications: mockNotifications.filter(n => n.status === 'archived').length,
      urgent_notifications: mockNotifications.filter(n => n.priority === 'urgent').length
    };

    return { mockNotifications, mockStats };
  };

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { mockNotifications, mockStats } = generateMockData();
      setNotifications(mockNotifications);
      setNotificationStats(mockStats);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载通知数据，请稍后重试",
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

  // 筛选通知
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.sender.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
    const matchesSender = senderFilter === 'all' || notification.sender === senderFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesSender;
  });

  const handleBack = () => {
    router.back();
  };

  // 获取通知类型颜色
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task_assigned': return 'bg-blue-100 text-blue-800';
      case 'task_updated': return 'bg-yellow-100 text-yellow-800';
      case 'task_completed': return 'bg-green-100 text-green-800';
      case 'task_overdue': return 'bg-red-100 text-red-800';
      case 'reminder': return 'bg-orange-100 text-orange-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      case 'announcement': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取通知类型文本
  const getTypeText = (type: string) => {
    switch (type) {
      case 'task_assigned': return '任务分配';
      case 'task_updated': return '任务更新';
      case 'task_completed': return '任务完成';
      case 'task_overdue': return '任务逾期';
      case 'reminder': return '提醒';
      case 'system': return '系统';
      case 'announcement': return '公告';
      default: return '其他';
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

  // 获取通知图标
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned': return <Briefcase className="h-4 w-4" />;
      case 'task_updated': return <Activity className="h-4 w-4" />;
      case 'task_completed': return <CheckCircle className="h-4 w-4" />;
      case 'task_overdue': return <AlertTriangle className="h-4 w-4" />;
      case 'reminder': return <Clock className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      case 'announcement': return <BellRing className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  // 标记为已读
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === notificationId
        ? { ...n, status: 'read', read_date: new Date().toISOString() }
        : n
    ));
  };

  // 切换星标
  const toggleStar = (notificationId: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === notificationId
        ? { ...n, status: n.status === 'starred' ? 'read' : 'starred' }
        : n
    ));
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
          <h1 className="text-xl md:text-2xl font-semibold">任务通知</h1>
        </div>
        <ThemeToggle />
      </div>

      <div className="p-6 space-y-6">
        {/* 欢迎面板 */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-medium mb-2">通知中心</h2>
              <p className="text-sm text-muted-foreground">
                查看和管理您的任务通知消息
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
        ) : notificationStats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Bell className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm text-muted-foreground">总数</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{notificationStats.total_notifications}</div>
                <p className="text-xs text-muted-foreground">全部通知</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <BellRing className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-sm text-muted-foreground">未读</span>
                </div>
                <div className="text-2xl font-bold text-red-600">{notificationStats.unread_notifications}</div>
                <p className="text-xs text-muted-foreground">待处理</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Eye className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-muted-foreground">已读</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{notificationStats.read_notifications}</div>
                <p className="text-xs text-muted-foreground">已查看</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-4 w-4 text-yellow-600 mr-1" />
                  <span className="text-sm text-muted-foreground">星标</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600">{notificationStats.starred_notifications}</div>
                <p className="text-xs text-muted-foreground">重要消息</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Archive className="h-4 w-4 text-gray-600 mr-1" />
                  <span className="text-sm text-muted-foreground">归档</span>
                </div>
                <div className="text-2xl font-bold text-gray-600">{notificationStats.archived_notifications}</div>
                <p className="text-xs text-muted-foreground">已归档</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-sm text-muted-foreground">紧急</span>
                </div>
                <div className="text-2xl font-bold text-red-600">{notificationStats.urgent_notifications}</div>
                <p className="text-xs text-muted-foreground">需立即处理</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 主要内容区域 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inbox">收件箱</TabsTrigger>
            <TabsTrigger value="starred">星标</TabsTrigger>
            <TabsTrigger value="archived">归档</TabsTrigger>
            <TabsTrigger value="analytics">统计分析</TabsTrigger>
          </TabsList>

          {/* 收件箱标签页 */}
          <TabsContent value="inbox" className="space-y-6">
            {/* 搜索和筛选 */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">搜索</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="搜索通知..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>类型</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部类型</SelectItem>
                        <SelectItem value="task_assigned">任务分配</SelectItem>
                        <SelectItem value="task_updated">任务更新</SelectItem>
                        <SelectItem value="task_completed">任务完成</SelectItem>
                        <SelectItem value="task_overdue">任务逾期</SelectItem>
                        <SelectItem value="reminder">提醒</SelectItem>
                        <SelectItem value="system">系统</SelectItem>
                        <SelectItem value="announcement">公告</SelectItem>
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
                        <SelectItem value="unread">未读</SelectItem>
                        <SelectItem value="read">已读</SelectItem>
                        <SelectItem value="starred">星标</SelectItem>
                        <SelectItem value="archived">归档</SelectItem>
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
                    <Label>发送人</Label>
                    <Select value={senderFilter} onValueChange={setSenderFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择发送人" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部发送人</SelectItem>
                        {Array.from(new Set(notifications.map(n => n.sender))).map((sender) => (
                          <SelectItem key={sender} value={sender}>{sender}</SelectItem>
                        ))}
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

            {/* 通知列表 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>通知列表 ({filteredNotifications.length})</span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Check className="h-4 w-4 mr-2" />
                      全部标记已读
                    </Button>
                    <Button variant="outline" size="sm">
                      <Archive className="h-4 w-4 mr-2" />
                      批量归档
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="p-4 border rounded">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <Skeleton className="h-5 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                          <Skeleton className="h-6 w-16 ml-4" />
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredNotifications.length > 0 ? (
                  <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-4 border rounded hover:bg-muted/50 transition-colors cursor-pointer",
                          notification.status === 'unread' && "bg-blue-50/50 border-blue-200"
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex items-center space-x-1">
                                {getNotificationIcon(notification.type)}
                                <h3 className={cn(
                                  "font-medium",
                                  notification.status === 'unread' && "font-semibold"
                                )}>
                                  {notification.title}
                                </h3>
                              </div>
                              {notification.status === 'unread' && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {notification.content}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span>发送人: {notification.sender}</span>
                              <span>•</span>
                              <span>部门: {notification.sender_department}</span>
                              {notification.related_task_title && (
                                <>
                                  <span>•</span>
                                  <span>相关任务: {notification.related_task_title}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStar(notification.id);
                              }}
                            >
                              {notification.status === 'starred' ? (
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ) : (
                                <StarOff className="h-4 w-4" />
                              )}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Badge className={getTypeColor(notification.type)} variant="outline">
                              {getTypeText(notification.type)}
                            </Badge>
                            <Badge className={getPriorityColor(notification.priority)} variant="outline">
                              {getPriorityText(notification.priority)}
                            </Badge>
                            {notification.action_required && (
                              <Badge variant="outline" className="bg-orange-100 text-orange-800">
                                需要操作
                              </Badge>
                            )}
                            {notification.tags && notification.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span>{format(new Date(notification.created_date), 'MM-dd HH:mm')}</span>
                            {notification.action_deadline && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="text-red-600">
                                  截止: {format(new Date(notification.action_deadline), 'MM-dd HH:mm')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {notification.action_required && notification.action_url && (
                          <div className="mt-3 pt-3 border-t">
                            <Button size="sm" variant="outline">
                              <Target className="h-4 w-4 mr-2" />
                              查看任务
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">没有找到符合条件的通知</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 星标标签页 */}
          <TabsContent value="starred" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-600" />
                  星标通知
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="p-4 border rounded">
                        <Skeleton className="h-5 w-3/4 mb-3" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.filter(n => n.status === 'starred').length > 0 ? (
                  <div className="space-y-4">
                    {notifications.filter(n => n.status === 'starred').map((notification) => (
                      <div key={notification.id} className="p-4 border rounded hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getNotificationIcon(notification.type)}
                              <h3 className="font-medium">{notification.title}</h3>
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {notification.content}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span>发送人: {notification.sender}</span>
                              <span>•</span>
                              <span>部门: {notification.sender_department}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStar(notification.id)}
                          >
                            <StarOff className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Badge className={getTypeColor(notification.type)} variant="outline">
                              {getTypeText(notification.type)}
                            </Badge>
                            <Badge className={getPriorityColor(notification.priority)} variant="outline">
                              {getPriorityText(notification.priority)}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(notification.created_date), 'MM-dd HH:mm')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">暂无星标通知</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 归档标签页 */}
          <TabsContent value="archived" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Archive className="h-5 w-5 mr-2 text-gray-600" />
                  归档通知
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">暂无归档通知</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    您可以将不需要的通知归档以保持收件箱整洁
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 统计分析标签页 */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 通知类型统计 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    通知类型统计
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['task_assigned', 'task_updated', 'task_completed', 'task_overdue', 'reminder', 'system', 'announcement'].map((type) => {
                      const count = notifications.filter(n => n.type === type).length;
                      const percentage = notifications.length > 0 ? (count / notifications.length) * 100 : 0;
                      return (
                        <div key={type} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{getTypeText(type)}</span>
                            <span className="text-sm text-muted-foreground">{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 优先级分布 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    优先级分布
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['urgent', 'high', 'medium', 'low'].map((priority) => {
                      const count = notifications.filter(n => n.priority === priority).length;
                      const percentage = notifications.length > 0 ? (count / notifications.length) * 100 : 0;
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

              {/* 发送人统计 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    发送人统计
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from(new Set(notifications.map(n => n.sender))).map((sender) => {
                      const count = notifications.filter(n => n.sender === sender).length;
                      const percentage = notifications.length > 0 ? (count / notifications.length) * 100 : 0;
                      return (
                        <div key={sender} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{sender}</span>
                            <span className="text-sm text-muted-foreground">{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 处理状态统计 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    处理状态统计
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">需要操作的通知</span>
                        <span className="text-sm text-muted-foreground">
                          {notifications.filter(n => n.action_required).length} 条
                        </span>
                      </div>
                      <Progress
                        value={notifications.length > 0 ? (notifications.filter(n => n.action_required).length / notifications.length) * 100 : 0}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">已逾期通知</span>
                        <span className="text-sm text-muted-foreground">
                          {notifications.filter(n => n.action_deadline && new Date(n.action_deadline) < new Date()).length} 条
                        </span>
                      </div>
                      <Progress
                        value={notifications.length > 0 ? (notifications.filter(n => n.action_deadline && new Date(n.action_deadline) < new Date()).length / notifications.length) * 100 : 0}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">今日通知</span>
                        <span className="text-sm text-muted-foreground">
                          {notifications.filter(n => {
                            const today = new Date();
                            const notifDate = new Date(n.created_date);
                            return notifDate.toDateString() === today.toDateString();
                          }).length} 条
                        </span>
                      </div>
                      <Progress
                        value={notifications.length > 0 ? (notifications.filter(n => {
                          const today = new Date();
                          const notifDate = new Date(n.created_date);
                          return notifDate.toDateString() === today.toDateString();
                        }).length / notifications.length) * 100 : 0}
                        className="h-2"
                      />
                    </div>
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
