"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, SessionInfo, PersistentUserData } from '@/lib/types/auth';

interface UserContextType {
  user: UserProfile | null;
  session: SessionInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserProfile | null, session?: SessionInfo | null) => void;
  login: (user: UserProfile, rememberMe?: boolean) => void;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 常量定义
  const STORAGE_KEYS = {
    USER_DATA: 'fdx_user_data',
    SESSION_DATA: 'fdx_session_data',
    REMEMBER_ME: 'fdx_remember_me'
  };

  const SESSION_DURATION = {
    DEFAULT: 8 * 60 * 60 * 1000, // 8小时
    REMEMBER_ME: 30 * 24 * 60 * 60 * 1000, // 30天
    ACTIVITY_TIMEOUT: 30 * 60 * 1000 // 30分钟无活动超时
  };

  // 生成会话令牌
  const generateSessionToken = (): string => {
    return `fdx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // 检查会话是否有效
  const isSessionValid = (sessionInfo: SessionInfo): boolean => {
    const now = Date.now();

    // 检查是否过期
    if (now > sessionInfo.expiresAt) {
      console.log('🔒 [Auth] 会话已过期');
      return false;
    }

    // 检查活动超时
    if (now - sessionInfo.lastActivity > SESSION_DURATION.ACTIVITY_TIMEOUT) {
      console.log('🔒 [Auth] 会话因无活动而超时');
      return false;
    }

    return true;
  };

  // 更新最后活动时间
  const updateLastActivity = () => {
    if (session) {
      const updatedSession = {
        ...session,
        lastActivity: Date.now()
      };
      setSession(updatedSession);

      try {
        localStorage.setItem(STORAGE_KEYS.SESSION_DATA, JSON.stringify(updatedSession));
      } catch (error) {
        console.error('更新活动时间失败:', error);
      }
    }
  };

  // 从localStorage恢复用户信息和会话
  const restoreUserSession = async (): Promise<boolean> => {
    try {
      console.log('🔄 [Auth] 开始恢复用户会话...');

      const savedUserData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      const savedSessionData = localStorage.getItem(STORAGE_KEYS.SESSION_DATA);

      if (!savedUserData || !savedSessionData) {
        console.log('📝 [Auth] 没有保存的用户数据或会话数据');
        return false;
      }

      const userData: UserProfile = JSON.parse(savedUserData);
      const sessionData: SessionInfo = JSON.parse(savedSessionData);

      // 验证会话是否有效
      if (!isSessionValid(sessionData)) {
        console.log('❌ [Auth] 保存的会话无效，清除数据');
        clearStoredAuth();
        return false;
      }

      console.log('✅ [Auth] 会话有效，恢复用户状态');
      setUser(userData);
      setSession(sessionData);

      // 更新最后活动时间
      const updatedSession = {
        ...sessionData,
        lastActivity: Date.now()
      };
      setSession(updatedSession);
      localStorage.setItem(STORAGE_KEYS.SESSION_DATA, JSON.stringify(updatedSession));

      return true;
    } catch (error) {
      console.error('❌ [Auth] 恢复用户会话失败:', error);
      clearStoredAuth();
      return false;
    }
  };

  // 清除存储的认证信息
  const clearStoredAuth = () => {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.SESSION_DATA);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    // 保持向后兼容
    localStorage.removeItem('lab_user');
    localStorage.removeItem('lab_session');
  };

  // 登录函数
  const login = (userData: UserProfile, rememberMe: boolean = false) => {
    console.log('🔐 [Auth] 执行登录，记住我:', rememberMe);

    const now = Date.now();
    const sessionDuration = rememberMe ? SESSION_DURATION.REMEMBER_ME : SESSION_DURATION.DEFAULT;

    const sessionInfo: SessionInfo = {
      token: generateSessionToken(),
      expiresAt: now + sessionDuration,
      loginTime: now,
      lastActivity: now
    };

    setUser(userData);
    setSession(sessionInfo);

    try {
      // 保存用户数据
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      localStorage.setItem(STORAGE_KEYS.SESSION_DATA, JSON.stringify(sessionInfo));
      localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, JSON.stringify(rememberMe));

      console.log('✅ [Auth] 用户数据和会话已保存');

      // 注意：重定向逻辑由 LoginPageContent 组件统一处理
      // 移除这里的自动重定向，避免双重重定向问题
      console.log('🎯 [Auth] 登录完成，等待组件处理重定向...');
    } catch (error) {
      console.error('❌ [Auth] 保存用户数据失败:', error);
    }
  };

  // 退出登录
  const logout = () => {
    console.log('🚪 [Auth] 执行登出');

    setUser(null);
    setSession(null);
    clearStoredAuth();

    // 重定向到登录页面
    window.location.href = '/auth/login';
  };

  // 检查认证状态
  const checkAuthStatus = async (): Promise<boolean> => {
    if (!user || !session) {
      return false;
    }

    if (!isSessionValid(session)) {
      console.log('🔒 [Auth] 会话无效，执行登出');
      logout();
      return false;
    }

    // 更新活动时间
    updateLastActivity();
    return true;
  };

  // 刷新会话
  const refreshSession = async (): Promise<boolean> => {
    if (!user || !session) {
      return false;
    }

    try {
      // 这里可以调用API验证会话并刷新
      // 目前只是延长会话时间
      const rememberMe = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
      const sessionDuration = rememberMe ? SESSION_DURATION.REMEMBER_ME : SESSION_DURATION.DEFAULT;

      const updatedSession: SessionInfo = {
        ...session,
        expiresAt: Date.now() + sessionDuration,
        lastActivity: Date.now()
      };

      setSession(updatedSession);
      localStorage.setItem(STORAGE_KEYS.SESSION_DATA, JSON.stringify(updatedSession));

      console.log('🔄 [Auth] 会话已刷新');
      return true;
    } catch (error) {
      console.error('❌ [Auth] 刷新会话失败:', error);
      return false;
    }
  };

  // 初始化用户会话
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🚀 [Auth] 初始化认证系统...');
      setIsLoading(true);

      try {
        const restored = await restoreUserSession();
        if (restored) {
          console.log('✅ [Auth] 用户会话恢复成功');
        } else {
          console.log('📝 [Auth] 没有有效的用户会话');
        }
      } catch (error) {
        console.error('❌ [Auth] 初始化认证失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 定期检查会话状态
  useEffect(() => {
    if (!user || !session) return;

    const checkInterval = setInterval(() => {
      checkAuthStatus();
    }, 5 * 60 * 1000); // 每5分钟检查一次

    return () => clearInterval(checkInterval);
  }, [user, session]);

  // 监听页面活动，更新最后活动时间
  useEffect(() => {
    if (!user || !session) return;

    const handleActivity = () => {
      updateLastActivity();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user, session]);

  // 向后兼容的setUser函数
  const handleSetUser = (userData: UserProfile | null, sessionData?: SessionInfo | null) => {
    if (userData && !sessionData) {
      // 如果没有提供会话数据，创建一个默认会话
      login(userData, false);
    } else if (userData && sessionData) {
      setUser(userData);
      setSession(sessionData);
    } else {
      logout();
    }
  };

  const value: UserContextType = {
    user,
    session,
    isAuthenticated: !!user && !!session && (session ? isSessionValid(session) : false),
    isLoading,
    setUser: handleSetUser,
    login,
    logout,
    checkAuthStatus,
    refreshSession
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// 用户信息工具函数
export function getUserDisplayName(user: UserProfile | null): string {
  if (!user) return '用户';
  
  const name = user.姓名 || user.账号;
  const title = user.职称 || '';
  
  return title ? `${name}${title}` : name;
}

export function getTimeGreeting(): string {
  const currentHour = new Date().getHours();
  
  if (currentHour >= 6 && currentHour < 12) {
    return "早上好";
  } else if (currentHour >= 12 && currentHour < 18) {
    return "下午好";
  } else {
    return "晚上好";
  }
}
