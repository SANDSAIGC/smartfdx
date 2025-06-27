/**
 * 统一认证系统
 * 
 * 功能：
 * 1. 移除Supabase Auth依赖，使用纯数据库认证
 * 2. 统一认证状态管理
 * 3. 智能路由和权限控制
 * 4. 简化的会话管理
 */

import { RouteManager, AuthStrategy } from './route-config';
import { RedirectManager, RedirectType } from './redirect-manager';

// 用户信息接口
export interface UserProfile {
  id: number;
  账号: string;
  姓名: string;
  部门: string;
  工作页面?: string;
  职称?: string;
  状态: string;
  密码?: string; // 仅用于登录验证，不存储在客户端
}

// 会话信息接口
export interface SessionInfo {
  token: string;
  expiresAt: number;
  loginTime: number;
  lastActivity: number;
  userId: number;
  username: string;
}

// 认证结果接口
export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  session?: SessionInfo;
  redirectUrl?: string;
  message?: string;
  error?: string;
}

// 认证状态接口
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  session: SessionInfo | null;
  error: string | null;
}

// 存储键常量
const STORAGE_KEYS = {
  USER_DATA: 'smartfdx_user_data',
  SESSION_DATA: 'smartfdx_session_data',
  REMEMBER_ME: 'smartfdx_remember_me'
} as const;

// 会话持续时间常量
const SESSION_DURATION = {
  DEFAULT: 8 * 60 * 60 * 1000,      // 8小时
  REMEMBER_ME: 30 * 24 * 60 * 60 * 1000, // 30天
  ACTIVITY_TIMEOUT: 30 * 60 * 1000   // 30分钟无活动超时
} as const;

export class AuthSystem {
  private static instance: AuthSystem;
  private authState: AuthState = {
    isAuthenticated: false,
    isLoading: true,
    user: null,
    session: null,
    error: null
  };
  private listeners: Array<(state: AuthState) => void> = [];

  private constructor() {
    this.initializeAuth();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): AuthSystem {
    if (!AuthSystem.instance) {
      AuthSystem.instance = new AuthSystem();
    }
    return AuthSystem.instance;
  }

  /**
   * 初始化认证系统
   */
  private async initializeAuth(): Promise<void> {
    console.log('🔐 [认证系统] 初始化开始...');
    
    try {
      // 从本地存储恢复认证状态
      const storedUser = this.getStoredUser();
      const storedSession = this.getStoredSession();

      if (storedUser && storedSession && this.isSessionValid(storedSession)) {
        console.log('✅ [认证系统] 恢复已保存的认证状态');
        this.updateAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: storedUser,
          session: storedSession,
          error: null
        });
        
        // 更新最后活动时间
        this.updateLastActivity();
      } else {
        console.log('❌ [认证系统] 无有效的认证状态');
        this.clearAuthState();
      }
    } catch (error) {
      console.error('❌ [认证系统] 初始化失败:', error);
      this.clearAuthState();
    }
  }

  /**
   * 用户登录
   */
  async login(credentials: { email: string; password: string; rememberMe?: boolean }): Promise<AuthResult> {
    console.log('🔐 [认证系统] 开始登录流程');
    
    this.updateAuthState({ ...this.authState, isLoading: true, error: null });

    try {
      // 调用登录API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const result = await response.json();

      if (result.success && result.user) {
        // 创建会话
        const session = this.createSession(result.user, credentials.rememberMe || false);
        
        // 保存认证状态
        this.saveAuthState(result.user, session, credentials.rememberMe || false);
        
        // 更新内存状态
        this.updateAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: result.user,
          session: session,
          error: null
        });

        console.log('✅ [认证系统] 登录成功');
        
        return {
          success: true,
          user: result.user,
          session: session,
          redirectUrl: result.redirectUrl,
          message: result.message
        };
      } else {
        console.log('❌ [认证系统] 登录失败:', result.message);
        
        this.updateAuthState({
          ...this.authState,
          isLoading: false,
          error: result.message
        });

        return {
          success: false,
          message: result.message,
          error: result.error
        };
      }
    } catch (error) {
      console.error('❌ [认证系统] 登录异常:', error);
      
      const errorMessage = '网络错误，请稍后重试';
      this.updateAuthState({
        ...this.authState,
        isLoading: false,
        error: errorMessage
      });

      return {
        success: false,
        message: errorMessage,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 用户登出
   */
  logout(): void {
    console.log('🚪 [认证系统] 执行登出');
    
    this.clearStoredAuth();
    this.clearAuthState();
    
    // 重定向到登录页面
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }

  /**
   * 检查认证状态
   */
  checkAuthStatus(): boolean {
    const { user, session } = this.authState;
    
    if (!user || !session) {
      return false;
    }

    if (!this.isSessionValid(session)) {
      console.log('⏰ [认证系统] 会话已过期');
      this.clearAuthState();
      return false;
    }

    // 更新最后活动时间
    this.updateLastActivity();
    return true;
  }

  /**
   * 获取当前认证状态
   */
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  /**
   * 订阅认证状态变化
   */
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    
    // 立即调用一次以获取当前状态
    listener(this.getAuthState());
    
    // 返回取消订阅函数
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 检查用户是否有权限访问指定路径
   */
  hasPermission(path: string): boolean {
    const { user } = this.authState;
    return RouteManager.hasPermission(path, user?.职称);
  }

  /**
   * 获取用户工作页面URL
   */
  getUserWorkspaceUrl(): string {
    const { user } = this.authState;
    if (user?.工作页面) {
      return RouteManager.getRedirectUrlByWorkspace(user.工作页面);
    }
    return '/lab'; // 默认页面
  }

  /**
   * 创建会话
   */
  private createSession(user: UserProfile, rememberMe: boolean): SessionInfo {
    const now = Date.now();
    const duration = rememberMe ? SESSION_DURATION.REMEMBER_ME : SESSION_DURATION.DEFAULT;
    
    return {
      token: this.generateSessionToken(),
      expiresAt: now + duration,
      loginTime: now,
      lastActivity: now,
      userId: user.id,
      username: user.账号
    };
  }

  /**
   * 生成会话令牌
   */
  private generateSessionToken(): string {
    return `smartfdx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 验证会话有效性
   */
  private isSessionValid(session: SessionInfo): boolean {
    const now = Date.now();
    
    // 检查是否过期
    if (now > session.expiresAt) {
      return false;
    }
    
    // 检查活动超时
    if (now - session.lastActivity > SESSION_DURATION.ACTIVITY_TIMEOUT) {
      return false;
    }
    
    return true;
  }

  /**
   * 更新最后活动时间
   */
  private updateLastActivity(): void {
    if (this.authState.session) {
      const updatedSession = {
        ...this.authState.session,
        lastActivity: Date.now()
      };
      
      this.updateAuthState({
        ...this.authState,
        session: updatedSession
      });
      
      // 保存到本地存储
      this.saveSessionToStorage(updatedSession);
    }
  }

  /**
   * 更新认证状态
   */
  private updateAuthState(newState: AuthState): void {
    this.authState = { ...newState };
    
    // 通知所有监听器
    this.listeners.forEach(listener => {
      try {
        listener(this.getAuthState());
      } catch (error) {
        console.error('❌ [认证系统] 监听器回调失败:', error);
      }
    });
  }

  /**
   * 清除认证状态
   */
  private clearAuthState(): void {
    this.updateAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      session: null,
      error: null
    });
  }

  /**
   * 保存认证状态到本地存储
   */
  private saveAuthState(user: UserProfile, session: SessionInfo, rememberMe: boolean): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.SESSION_DATA, JSON.stringify(session));
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, JSON.stringify(rememberMe));
      }
    } catch (error) {
      console.error('❌ [认证系统] 保存认证状态失败:', error);
    }
  }

  /**
   * 保存会话到本地存储
   */
  private saveSessionToStorage(session: SessionInfo): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.SESSION_DATA, JSON.stringify(session));
      }
    } catch (error) {
      console.error('❌ [认证系统] 保存会话失败:', error);
    }
  }

  /**
   * 从本地存储获取用户数据
   */
  private getStoredUser(): UserProfile | null {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        return stored ? JSON.parse(stored) : null;
      }
    } catch (error) {
      console.error('❌ [认证系统] 读取用户数据失败:', error);
    }
    return null;
  }

  /**
   * 从本地存储获取会话数据
   */
  private getStoredSession(): SessionInfo | null {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEYS.SESSION_DATA);
        return stored ? JSON.parse(stored) : null;
      }
    } catch (error) {
      console.error('❌ [认证系统] 读取会话数据失败:', error);
    }
    return null;
  }

  /**
   * 清除本地存储的认证数据
   */
  private clearStoredAuth(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(STORAGE_KEYS.SESSION_DATA);
        localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      }
    } catch (error) {
      console.error('❌ [认证系统] 清除认证数据失败:', error);
    }
  }
}

// React Hook for using the auth system
import { useState, useEffect } from 'react';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    session: null,
    error: null
  });

  useEffect(() => {
    const authSystem = AuthSystem.getInstance();

    // 订阅认证状态变化
    const unsubscribe = authSystem.subscribe(setAuthState);

    // 清理函数
    return unsubscribe;
  }, []);

  const authSystem = AuthSystem.getInstance();

  return {
    // 状态
    ...authState,

    // 方法
    login: authSystem.login.bind(authSystem),
    logout: authSystem.logout.bind(authSystem),
    checkAuthStatus: authSystem.checkAuthStatus.bind(authSystem),
    hasPermission: authSystem.hasPermission.bind(authSystem),
    getUserWorkspaceUrl: authSystem.getUserWorkspaceUrl.bind(authSystem)
  };
}
