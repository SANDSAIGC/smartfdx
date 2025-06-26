// 用户资料表类型定义
export interface UserProfile {
  id: number;
  账号: string;
  姓名: string;
  部门: string;
  电话: string;
  微信?: string;
  密码: string;
  工作页面?: string;
  职称?: string;
  状态?: string;
  created_at?: string;
  updated_at?: string;
}

// 工作页面表类型定义
export interface WorkPage {
  id: number;
  页面名称: string;
  页面路由: string;
  created_at?: string;
  updated_at?: string;
}

// 登录请求类型
export interface LoginRequest {
  email: string;
  password: string;
}

// 登录响应类型
export interface LoginResponse {
  success: boolean;
  message?: string;
  redirectUrl?: string;
  user?: {
    id: number;
    账号: string;
    姓名: string;
    部门: string;
    工作页面?: string;
    职称?: string;
  };
}

// API错误响应类型
export interface ApiError {
  success: false;
  message: string;
  code?: string;
}

// API成功响应类型
export interface ApiSuccess<T = any> {
  success: true;
  data?: T;
  message?: string;
}

// 通用API响应类型
export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

// 身份验证状态类型
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user?: UserProfile;
  error?: string;
}

// 会话信息类型
export interface SessionInfo {
  token: string;
  expiresAt: number;
  refreshToken?: string;
  loginTime: number;
  lastActivity: number;
}

// 持久化用户数据类型
export interface PersistentUserData {
  user: UserProfile;
  session: SessionInfo;
  preferences?: {
    rememberMe: boolean;
    autoLogin: boolean;
  };
}

// 路由重定向结果类型
export interface RedirectResult {
  shouldRedirect: boolean;
  redirectUrl: string;
  reason: 'user_page' | 'default' | 'error';
}
