# 持久化登录状态管理系统

## 🎯 系统概述

本系统实现了完整的持久化登录状态管理，确保用户在整个应用会话期间保持登录状态，支持页面刷新、标签页关闭重开等场景下的状态恢复。系统包含登录状态检测、自动重定向、会话管理和登出功能。

## 🏗️ 系统架构

### 核心组件

1. **用户Context (`lib/contexts/user-context.tsx`)**
   - 全局用户状态管理
   - 会话信息存储和验证
   - 自动活动时间更新
   - 定期会话检查

2. **认证守卫 (`components/auth-guard.tsx`)**
   - 页面级别的认证保护
   - 自动重定向未认证用户
   - 支持可选认证和强制认证

3. **自动登录Hook (`lib/hooks/use-auto-login.ts`)**
   - 页面加载时自动验证登录状态
   - 定期检查会话有效性
   - 静默认证检查

4. **会话状态组件 (`components/session-status.tsx`)**
   - 显示当前登录状态
   - 会话信息展示
   - 快速操作按钮

5. **登录页面内容组件 (`components/login-page-content.tsx`)**
   - 智能检测登录状态
   - 动态显示登录表单或已登录界面
   - 自动状态初始化

6. **已登录界面组件 (`components/logged-in-interface.tsx`)**
   - 显示用户信息和会话详情
   - 提供继续工作和登出选项
   - 会话时间显示和管理

## 🔐 认证流程

### 登录流程
1. 用户提交登录表单
2. API验证用户凭据
3. 生成会话令牌和过期时间
4. 保存用户信息和会话到localStorage
5. 重定向到目标页面

### 状态恢复流程
1. 页面加载时从localStorage读取用户数据
2. 验证会话是否有效（未过期、活动时间检查）
3. 如果有效，恢复用户状态
4. 如果无效，清除存储数据

### 登录状态保持流程
1. **页面访问检测**: 用户访问登录页面时自动检测当前登录状态
2. **状态判断**:
   - 如果未登录：显示登录表单
   - 如果已登录：显示已登录界面
3. **已登录界面功能**:
   - 显示用户基本信息（姓名、部门、职称等）
   - 显示会话信息（登录时间、剩余时间、记住状态）
   - 提供"继续到工作区"按钮，根据用户工作页面智能重定向
   - 提供"登出"按钮，清除登录状态
4. **智能重定向**: 根据用户的工作页面配置自动跳转到对应页面

### 会话管理
- **会话时长**: 默认8小时，"记住我"30天
- **活动超时**: 30分钟无活动自动超时
- **定期检查**: 每5分钟检查一次会话状态
- **活动监听**: 监听用户交互更新活动时间

## 📦 数据结构

### 用户信息 (UserProfile)
```typescript
interface UserProfile {
  id: number;
  账号: string;
  姓名: string;
  部门: string;
  电话: string;
  工作页面?: string;
  职称?: string;
  状态?: string;
}
```

### 会话信息 (SessionInfo)
```typescript
interface SessionInfo {
  token: string;           // 会话令牌
  expiresAt: number;       // 过期时间戳
  refreshToken?: string;   // 刷新令牌
  loginTime: number;       // 登录时间戳
  lastActivity: number;    // 最后活动时间戳
}
```

## 🛡️ 安全特性

### 会话安全
- 唯一会话令牌生成
- 时间戳验证防止重放攻击
- 活动超时自动登出
- 敏感信息不存储（如密码）

### 存储安全
- 使用localStorage进行本地存储
- 数据结构化存储，便于管理
- 自动清理过期数据
- 向后兼容旧版本存储格式

## 🔧 使用方法

### 1. 基础用法 - 使用Context
```typescript
import { useUser } from '@/lib/contexts/user-context';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useUser();
  
  if (!isAuthenticated) {
    return <div>请先登录</div>;
  }
  
  return <div>欢迎, {user?.姓名}</div>;
}
```

### 2. 页面保护 - 使用AuthGuard
```typescript
import { AuthGuard } from '@/components/auth-guard';

export default function ProtectedPage() {
  return (
    <AuthGuard requireAuth={true}>
      <MyProtectedContent />
    </AuthGuard>
  );
}
```

### 3. 自动登录检查 - 使用Hook
```typescript
import { usePageAuth } from '@/lib/hooks/use-auto-login';

function MyPage() {
  const { isLoading, isAuthenticated, user } = usePageAuth(true);
  
  if (isLoading) return <div>加载中...</div>;
  if (!isAuthenticated) return <div>未认证</div>;
  
  return <div>页面内容</div>;
}
```

### 4. 会话状态显示
```typescript
import { SessionBadge, SessionDetails } from '@/components/session-status';

// 简洁版本
<SessionBadge />

// 详细版本
<SessionDetails />
```

### 5. 登录页面状态保持
```typescript
import { LoginPageContent } from '@/components/login-page-content';

// 在登录页面中使用，自动检测登录状态
export default function LoginPage() {
  return (
    <div className="login-container">
      <LoginPageContent />
    </div>
  );
}
```

### 6. 已登录界面组件
```typescript
import { LoggedInInterface } from '@/components/logged-in-interface';

// 显示已登录用户信息和操作选项
<LoggedInInterface />
```

## 🎛️ 配置选项

### 会话时长配置
```typescript
const SESSION_DURATION = {
  DEFAULT: 8 * 60 * 60 * 1000,        // 8小时
  REMEMBER_ME: 30 * 24 * 60 * 60 * 1000, // 30天
  ACTIVITY_TIMEOUT: 30 * 60 * 1000     // 30分钟
};
```

### 存储键配置
```typescript
const STORAGE_KEYS = {
  USER_DATA: 'fdx_user_data',
  SESSION_DATA: 'fdx_session_data',
  REMEMBER_ME: 'fdx_remember_me'
};
```

## 🧪 测试和调试

### 测试页面
访问 `/auth-test` 页面可以：
- 查看当前认证状态
- 运行功能测试
- 检查localStorage数据
- 测试会话刷新

### 调试信息
系统在控制台输出详细的调试信息：
- `🔐 [Auth]` - 认证相关操作
- `🔍 [AutoLogin]` - 自动登录检查
- `🔒 [AuthGuard]` - 认证守卫操作
- `🔍 [登录页面]` - 登录页面状态检测
- `🎯 [已登录界面]` - 已登录界面操作

## 🔄 与现有系统集成

### 登录表单集成
- 自动使用新的`login`函数
- 支持"记住我"功能
- 保持原有的重定向逻辑

### 页面路由集成
- lab页面：可选认证（不强制登录）
- shift-sample页面：强制认证
- 其他受保护页面：使用AuthGuard包装

### API集成
- 保持现有的API认证逻辑
- 会话令牌可用于API请求验证
- 支持会话刷新机制

## 📈 性能优化

### 存储优化
- 最小化localStorage读写
- 批量更新会话信息
- 智能缓存用户数据

### 检查优化
- 防抖活动时间更新
- 智能会话检查间隔
- 条件性认证验证

## 🚀 部署注意事项

1. **环境变量**: 确保所有Supabase配置正确
2. **HTTPS**: 生产环境建议使用HTTPS
3. **会话安全**: 考虑添加CSRF保护
4. **监控**: 添加认证失败监控和告警

## 🆕 登录状态保持功能详解

### 功能特性
1. **智能状态检测**: 自动检测用户是否已登录
2. **动态界面切换**: 根据登录状态显示不同界面
3. **用户信息展示**: 显示完整的用户资料和会话信息
4. **智能重定向**: 根据用户工作页面配置自动跳转
5. **优雅登出**: 提供清晰的登出流程和状态清理

### 技术实现
- **LoginPageContent组件**: 负责状态检测和界面切换逻辑
- **LoggedInInterface组件**: 提供已登录用户的完整界面
- **状态管理**: 与现有UserContext完全集成
- **加载状态**: 提供骨架屏加载效果
- **错误处理**: 完善的错误处理和用户反馈

### 用户体验优化
- **无缝体验**: 已登录用户无需重复登录
- **信息透明**: 清晰显示会话状态和剩余时间
- **操作便捷**: 一键继续工作或登出
- **视觉一致**: 与整体设计风格保持一致

## 🔮 未来扩展

1. **多设备登录管理**
2. **单点登录(SSO)支持**
3. **生物识别认证**
4. **会话共享机制**
5. **高级安全策略**
6. **登录历史记录**
7. **设备信任管理**
