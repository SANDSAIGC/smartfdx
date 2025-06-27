/**
 * 统一路由配置管理系统
 * 
 * 功能：
 * 1. 集中管理所有页面路由配置
 * 2. 统一身份验证策略
 * 3. 智能重定向逻辑
 * 4. 路由权限控制
 */

// 身份验证策略枚举
export enum AuthStrategy {
  NONE = 'none',           // 无需认证
  SIMPLE = 'simple',       // 简化认证（直接数据库验证）
  SUPABASE = 'supabase',   // Supabase Auth认证
  ADMIN = 'admin'          // 管理员认证
}

// 页面类型枚举
export enum PageType {
  PUBLIC = 'public',       // 公共页面
  AUTH = 'auth',          // 认证页面
  WORKSPACE = 'workspace', // 工作页面
  ADMIN = 'admin',        // 管理页面
  SAMPLE = 'sample',      // 样本记录页面
  SYSTEM = 'system'       // 系统页面
}

// 路由配置接口
export interface RouteConfig {
  path: string;                    // 路由路径
  name: string;                    // 页面名称
  title: string;                   // 页面标题
  description?: string;            // 页面描述
  authStrategy: AuthStrategy;      // 身份验证策略
  pageType: PageType;             // 页面类型
  workspaceName?: string;         // 工作页面名称（用于用户工作页面匹配）
  requiredRole?: string[];        // 需要的角色权限
  redirectTo?: string;            // 重定向目标
  isActive: boolean;              // 是否启用
  metadata?: {                    // 元数据
    icon?: string;
    category?: string;
    order?: number;
    tags?: string[];
  };
}

// 完整的路由配置表
export const ROUTE_CONFIG: Record<string, RouteConfig> = {
  // 公共页面
  home: {
    path: '/',
    name: 'home',
    title: '首页',
    description: '智能FDX系统首页',
    authStrategy: AuthStrategy.NONE,
    pageType: PageType.PUBLIC,
    isActive: true,
    metadata: {
      icon: 'Home',
      category: 'public',
      order: 1
    }
  },

  // 认证相关页面
  login: {
    path: '/auth/login',
    name: 'login',
    title: '用户登录',
    description: '用户身份验证登录页面',
    authStrategy: AuthStrategy.NONE,
    pageType: PageType.AUTH,
    isActive: true,
    metadata: {
      icon: 'LogIn',
      category: 'auth',
      order: 1
    }
  },

  // 化验室系统（简化认证）
  lab: {
    path: '/lab',
    name: 'lab',
    title: '化验室',
    description: '化验室工作空间',
    authStrategy: AuthStrategy.SIMPLE,
    pageType: PageType.WORKSPACE,
    workspaceName: '化验室',
    isActive: true,
    metadata: {
      icon: 'FlaskConical',
      category: 'workspace',
      order: 1,
      tags: ['化验', '检测', '质量']
    }
  },

  // 样本记录页面（简化认证）
  shiftSample: {
    path: '/shift-sample',
    name: 'shift-sample',
    title: '班样记录',
    description: '生产班次样本记录页面',
    authStrategy: AuthStrategy.SIMPLE,
    pageType: PageType.SAMPLE,
    isActive: true,
    metadata: {
      icon: 'Clock',
      category: 'sample',
      order: 1,
      tags: ['班样', '生产', '记录']
    }
  },

  filterSample: {
    path: '/filter-sample',
    name: 'filter-sample',
    title: '压滤样记录',
    description: '压滤样化验记录页面',
    authStrategy: AuthStrategy.SIMPLE,
    pageType: PageType.SAMPLE,
    isActive: true,
    metadata: {
      icon: 'Filter',
      category: 'sample',
      order: 2,
      tags: ['压滤', '化验', '记录']
    }
  },

  incomingSample: {
    path: '/incoming-sample',
    name: 'incoming-sample',
    title: '进厂样记录',
    description: '进厂原矿样本记录页面',
    authStrategy: AuthStrategy.SIMPLE,
    pageType: PageType.SAMPLE,
    isActive: true,
    metadata: {
      icon: 'ArrowDown',
      category: 'sample',
      order: 3,
      tags: ['进厂', '原矿', '记录']
    }
  },

  outgoingSample: {
    path: '/outgoing-sample',
    name: 'outgoing-sample',
    title: '出厂样记录',
    description: '出厂精矿样本记录页面',
    authStrategy: AuthStrategy.SIMPLE,
    pageType: PageType.SAMPLE,
    isActive: true,
    metadata: {
      icon: 'ArrowUp',
      category: 'sample',
      order: 4,
      tags: ['出厂', '精矿', '记录']
    }
  },

  // 综合管理页面（Supabase认证）
  weighbridgeData: {
    path: '/weighbridge-data',
    name: 'weighbridge-data',
    title: '磅房数据',
    description: '车辆称重数据管理',
    authStrategy: AuthStrategy.SUPABASE,
    pageType: PageType.WORKSPACE,
    workspaceName: '磅房数据',
    isActive: true,
    metadata: {
      icon: 'Scale',
      category: 'data',
      order: 1,
      tags: ['称重', '车辆', '数据']
    }
  },

  concentrationFinenessMonitor: {
    path: '/concentration-fineness-monitor',
    name: 'concentration-fineness-monitor',
    title: '浓细度监控',
    description: '浓度和细度监控系统',
    authStrategy: AuthStrategy.SUPABASE,
    pageType: PageType.WORKSPACE,
    workspaceName: '浓细度监控',
    isActive: true,
    metadata: {
      icon: 'Activity',
      category: 'monitor',
      order: 1,
      tags: ['浓度', '细度', '监控']
    }
  },

  manager: {
    path: '/manager',
    name: 'manager',
    title: '经理页面',
    description: '管理层工作页面',
    authStrategy: AuthStrategy.SUPABASE,
    pageType: PageType.WORKSPACE,
    workspaceName: '经理页面',
    requiredRole: ['经理', '主管'],
    isActive: true,
    metadata: {
      icon: 'UserCheck',
      category: 'management',
      order: 1,
      tags: ['管理', '经理', '决策']
    }
  },

  // 生产管理页面
  ballMillWorkshop: {
    path: '/ball-mill-workshop',
    name: 'ball-mill-workshop',
    title: '球磨车间',
    description: '球磨车间生产管理',
    authStrategy: AuthStrategy.SUPABASE,
    pageType: PageType.WORKSPACE,
    workspaceName: '球磨车间',
    isActive: true,
    metadata: {
      icon: 'Cog',
      category: 'production',
      order: 1,
      tags: ['球磨', '车间', '生产']
    }
  },

  filterPressWorkshop: {
    path: '/filter-press-workshop',
    name: 'filter-press-workshop',
    title: '压滤车间',
    description: '压滤车间生产管理',
    authStrategy: AuthStrategy.SUPABASE,
    pageType: PageType.WORKSPACE,
    workspaceName: '压滤车间',
    isActive: true,
    metadata: {
      icon: 'Filter',
      category: 'production',
      order: 2,
      tags: ['压滤', '车间', '生产']
    }
  },

  productionControl: {
    path: '/production-control',
    name: 'production-control',
    title: '生产控制',
    description: '生产过程控制管理',
    authStrategy: AuthStrategy.SUPABASE,
    pageType: PageType.WORKSPACE,
    workspaceName: '生产控制',
    isActive: true,
    metadata: {
      icon: 'Settings',
      category: 'production',
      order: 3,
      tags: ['生产', '控制', '管理']
    }
  },

  processManagement: {
    path: '/process-management',
    name: 'process-management',
    title: '工艺管理',
    description: '生产工艺流程管理',
    authStrategy: AuthStrategy.SUPABASE,
    pageType: PageType.WORKSPACE,
    workspaceName: '工艺管理',
    isActive: true,
    metadata: {
      icon: 'GitBranch',
      category: 'production',
      order: 4,
      tags: ['工艺', '流程', '管理']
    }
  },

  // 数据管理页面
  dataTableCenter: {
    path: '/data-table-center',
    name: 'data-table-center',
    title: '数据表中心',
    description: '数据表管理中心',
    authStrategy: AuthStrategy.SUPABASE,
    pageType: PageType.WORKSPACE,
    workspaceName: '数据表中心',
    isActive: true,
    metadata: {
      icon: 'Database',
      category: 'data',
      order: 2,
      tags: ['数据', '表格', '管理']
    }
  },

  filterPressDataDetails: {
    path: '/filter-press-data-details',
    name: 'filter-press-data-details',
    title: '压滤数据详情',
    description: '压滤数据详细信息',
    authStrategy: AuthStrategy.SUPABASE,
    pageType: PageType.WORKSPACE,
    workspaceName: '压滤数据详情',
    isActive: true,
    metadata: {
      icon: 'FileText',
      category: 'data',
      order: 3,
      tags: ['压滤', '数据', '详情']
    }
  },

  incomingDataDetailsNew: {
    path: '/incoming-data-details-new',
    name: 'incoming-data-details-new',
    title: '进厂数据详情',
    description: '进厂数据详细信息',
    authStrategy: AuthStrategy.SUPABASE,
    pageType: PageType.WORKSPACE,
    workspaceName: '进厂数据详情',
    isActive: true,
    metadata: {
      icon: 'FileText',
      category: 'data',
      order: 4,
      tags: ['进厂', '数据', '详情']
    }
  },

  outgoingDataDetails: {
    path: '/outgoing-data-details',
    name: 'outgoing-data-details',
    title: '出厂数据详情',
    description: '出厂数据详细信息',
    authStrategy: AuthStrategy.SUPABASE,
    pageType: PageType.WORKSPACE,
    workspaceName: '出厂数据详情',
    isActive: true,
    metadata: {
      icon: 'FileText',
      category: 'data',
      order: 5,
      tags: ['出厂', '数据', '详情']
    }
  },

  machineRunningDetails: {
    path: '/machine-running-details',
    name: 'machine-running-details',
    title: '设备运行详情',
    description: '设备运行状态详情',
    authStrategy: AuthStrategy.SUPABASE,
    pageType: PageType.WORKSPACE,
    workspaceName: '设备运行详情',
    isActive: true,
    metadata: {
      icon: 'Cpu',
      category: 'equipment',
      order: 1,
      tags: ['设备', '运行', '详情']
    }
  },

  // 采购管理页面
  purchaseManagement: {
    path: '/purchase-management',
    name: 'purchase-management',
    title: '采购管理',
    description: '采购流程管理系统',
    authStrategy: AuthStrategy.SUPABASE,
    pageType: PageType.WORKSPACE,
    workspaceName: '采购管理',
    isActive: true,
    metadata: {
      icon: 'ShoppingCart',
      category: 'purchase',
      order: 1,
      tags: ['采购', '管理', '流程']
    }
  },

  purchaseRequest: {
    path: '/purchase-request',
    name: 'purchase-request',
    title: '采购申请',
    description: '采购申请提交系统',
    authStrategy: AuthStrategy.SUPABASE,
    pageType: PageType.WORKSPACE,
    workspaceName: '采购申请',
    isActive: true,
    metadata: {
      icon: 'FileText',
      category: 'purchase',
      order: 2,
      tags: ['采购', '申请', '提交']
    }
  },

  // 任务管理页面
  situationManagement: {
    path: '/situation-management',
    name: 'situation-management',
    title: '情况管理',
    description: '情况管理系统',
    authStrategy: AuthStrategy.SUPABASE,
    pageType: PageType.WORKSPACE,
    workspaceName: '情况管理',
    isActive: true,
    metadata: {
      icon: 'AlertCircle',
      category: 'task',
      order: 1,
      tags: ['情况', '管理', '监控']
    }
  },

  situationReport: {
    path: '/situation-report',
    name: 'situation-report',
    title: '情况报告',
    description: '情况报告系统',
    authStrategy: AuthStrategy.SUPABASE,
    pageType: PageType.WORKSPACE,
    workspaceName: '情况报告',
    isActive: true,
    metadata: {
      icon: 'FileText',
      category: 'task',
      order: 2,
      tags: ['情况', '报告', '汇报']
    }
  },

  taskAssignment: {
    path: '/task-assignment',
    name: 'task-assignment',
    title: '任务分配',
    description: '任务分配管理系统',
    authStrategy: AuthStrategy.SUPABASE,
    pageType: PageType.WORKSPACE,
    workspaceName: '任务分配',
    isActive: true,
    metadata: {
      icon: 'Users',
      category: 'task',
      order: 3,
      tags: ['任务', '分配', '管理']
    }
  },

  taskNotification: {
    path: '/task-notification',
    name: 'task-notification',
    title: '任务通知',
    description: '任务通知管理系统',
    authStrategy: AuthStrategy.SUPABASE,
    pageType: PageType.WORKSPACE,
    workspaceName: '任务通知',
    isActive: true,
    metadata: {
      icon: 'Bell',
      category: 'task',
      order: 4,
      tags: ['任务', '通知', '提醒']
    }
  },

  // 特殊页面
  boss: {
    path: '/boss',
    name: 'boss',
    title: '老板页面',
    description: '高级管理层页面',
    authStrategy: AuthStrategy.ADMIN,
    pageType: PageType.ADMIN,
    workspaceName: '老板页面',
    requiredRole: ['老板', '总经理'],
    isActive: true,
    metadata: {
      icon: 'Crown',
      category: 'admin',
      order: 1,
      tags: ['老板', '高管', '决策']
    }
  },

  cosplay: {
    path: '/cosplay',
    name: 'cosplay',
    title: 'CosPlay',
    description: 'CosPlay页面',
    authStrategy: AuthStrategy.SUPABASE,
    pageType: PageType.SYSTEM,
    workspaceName: 'CosPlay',
    isActive: true,
    metadata: {
      icon: 'Smile',
      category: 'special',
      order: 1,
      tags: ['cosplay', '特殊', '娱乐']
    }
  }
};

// 路由工具函数
export class RouteManager {
  /**
   * 根据路径获取路由配置
   */
  static getRouteByPath(path: string): RouteConfig | undefined {
    return Object.values(ROUTE_CONFIG).find(route => route.path === path);
  }

  /**
   * 根据工作页面名称获取路由配置
   */
  static getRouteByWorkspaceName(workspaceName: string): RouteConfig | undefined {
    return Object.values(ROUTE_CONFIG).find(route => route.workspaceName === workspaceName);
  }

  /**
   * 获取指定身份验证策略的所有路由
   */
  static getRoutesByAuthStrategy(authStrategy: AuthStrategy): RouteConfig[] {
    return Object.values(ROUTE_CONFIG).filter(route => route.authStrategy === authStrategy && route.isActive);
  }

  /**
   * 获取指定页面类型的所有路由
   */
  static getRoutesByPageType(pageType: PageType): RouteConfig[] {
    return Object.values(ROUTE_CONFIG).filter(route => route.pageType === pageType && route.isActive);
  }

  /**
   * 检查路径是否需要身份验证
   */
  static requiresAuth(path: string): boolean {
    const route = this.getRouteByPath(path);
    return route ? route.authStrategy !== AuthStrategy.NONE : true;
  }

  /**
   * 检查路径是否使用简化认证
   */
  static usesSimpleAuth(path: string): boolean {
    const route = this.getRouteByPath(path);
    return route ? route.authStrategy === AuthStrategy.SIMPLE : false;
  }

  /**
   * 检查路径是否使用Supabase认证
   */
  static usesSupabaseAuth(path: string): boolean {
    const route = this.getRouteByPath(path);
    return route ? route.authStrategy === AuthStrategy.SUPABASE : false;
  }

  /**
   * 获取中间件应该排除的路径列表
   */
  static getMiddlewareExcludedPaths(): string[] {
    const excludedRoutes = this.getRoutesByAuthStrategy(AuthStrategy.NONE)
      .concat(this.getRoutesByAuthStrategy(AuthStrategy.SIMPLE));

    return excludedRoutes.map(route => route.path.replace('/', ''));
  }

  /**
   * 根据用户工作页面获取重定向URL
   */
  static getRedirectUrlByWorkspace(workspaceName: string): string {
    const route = this.getRouteByWorkspaceName(workspaceName);
    return route ? route.path : '/lab'; // 默认重定向到化验室
  }

  /**
   * 获取导航菜单数据
   */
  static getNavigationMenu(): Record<string, RouteConfig[]> {
    const activeRoutes = Object.values(ROUTE_CONFIG).filter(route => route.isActive);
    const menuData: Record<string, RouteConfig[]> = {};

    activeRoutes.forEach(route => {
      const category = route.metadata?.category || 'other';
      if (!menuData[category]) {
        menuData[category] = [];
      }
      menuData[category].push(route);
    });

    // 按order排序
    Object.keys(menuData).forEach(category => {
      menuData[category].sort((a, b) => (a.metadata?.order || 999) - (b.metadata?.order || 999));
    });

    return menuData;
  }

  /**
   * 验证用户是否有权限访问指定路由
   */
  static hasPermission(path: string, userRole?: string): boolean {
    const route = this.getRouteByPath(path);
    if (!route) return false;

    // 如果路由没有角色要求，允许访问
    if (!route.requiredRole || route.requiredRole.length === 0) {
      return true;
    }

    // 如果用户没有角色信息，拒绝访问
    if (!userRole) {
      return false;
    }

    // 检查用户角色是否在允许的角色列表中
    return route.requiredRole.includes(userRole);
  }
}
