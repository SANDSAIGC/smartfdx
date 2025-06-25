# Next.js + Supabase Starter 最佳实践指南

## 🎯 项目概述

本指南基于真实项目经验，提供了从零开始构建 Next.js + 自部署 Supabase 应用的完整流程，包含所有关键配置和常见问题的解决方案。

## 📋 技术栈

- **前端**: Next.js 15.3.4 + TypeScript + Tailwind CSS
- **UI组件**: shadcn/ui
- **后端**: 自部署 Supabase 实例
- **数据库**: PostgreSQL
- **认证**: Supabase Auth
- **部署**: 本地开发 + 生产环境

## 🚀 快速开始

### **第一步：项目初始化**

```bash
# 创建 Next.js 项目
npx create-next-app@latest smartfdx --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 进入项目目录
cd smartfdx

# 安装必要依赖
npm install @supabase/supabase-js
npm install lucide-react date-fns
npm install class-variance-authority clsx tailwind-merge
```

### **第二步：配置 shadcn/ui**

```bash
# 初始化 shadcn/ui
npx shadcn@latest init

# 安装常用组件
npx shadcn@latest add button card input label
npx shadcn@latest add table skeleton
npx shadcn@latest add calendar popover
npx shadcn@latest add dropdown-menu
```

### **第三步：环境变量配置**

创建 `.env.local` 文件：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=http://your-supabase-url:28000
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT 密钥（用于认证）
SUPABASE_JWT_SECRET=your-jwt-secret
```

## 🏗️ 项目结构

```
smartfdx/
├── app/
│   ├── api/                    # API 路由
│   │   ├── get-data/          # 数据读取 API
│   │   └── submit-data/       # 数据提交 API
│   ├── demo/                  # Demo 页面
│   ├── globals.css            # 全局样式
│   ├── layout.tsx             # 根布局
│   └── page.tsx               # 首页
├── components/
│   ├── ui/                    # shadcn/ui 组件
│   ├── data-entry-card.tsx    # 数据录入组件
│   ├── data-display-card.tsx  # 数据显示组件
│   ├── demo-page.tsx          # Demo 页面组件
│   └── theme-toggle.tsx       # 主题切换组件
├── lib/
│   ├── supabase/
│   │   └── client.ts          # Supabase 客户端配置
│   └── utils.ts               # 工具函数
└── .env.local                 # 环境变量
```

## 🔧 核心配置

### **1. Supabase 客户端配置**

创建 `lib/supabase/client.ts`：

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 匿名客户端（用于前端）
export const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// 服务端客户端（用于 API 路由）
export const createServiceClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey)
}
```

### **2. API 路由架构（推荐方案）**

#### **数据提交 API** (`app/api/submit-data/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ 
        success: false,
        error: 'Environment variables missing' 
      }, { status: 500 });
    }

    // 接收前端数据
    const requestData = await request.json();
    
    // 数据验证
    const requiredFields = ['日期', '进厂数据', '生产数据', '出厂数据'];
    const missingFields = requiredFields.filter(field => !requestData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        missingFields
      }, { status: 400 });
    }

    // 数据转换
    const dataToInsert = {
      '日期': requestData['日期'],
      '进厂数据': parseInt(requestData['进厂数据']) || 0,
      '生产数据': parseInt(requestData['生产数据']) || 0,
      '出厂数据': parseInt(requestData['出厂数据']) || 0
    };

    // 提交到 Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/demo`, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(dataToInsert)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        error: 'Supabase request failed',
        details: errorText
      }, { status: response.status });
    }

    const responseData = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Data submitted successfully',
      data: responseData
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

#### **数据读取 API** (`app/api/get-data/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({
        success: false,
        error: 'Environment variables missing'
      }, { status: 500 });
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const limit = searchParams.get('limit') || '50';

    // 构建查询 URL
    let queryUrl = `${supabaseUrl}/rest/v1/demo?select=*&order=created_at.desc&limit=${limit}`;

    if (date) {
      queryUrl += `&日期=eq.${date}`;
    }

    // 查询数据
    const response = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        error: 'Supabase query failed',
        details: errorText
      }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data,
      count: Array.isArray(data) ? data.length : 0
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

## 🗄️ 数据库设置

### **创建数据表**

```sql
-- 创建 demo 表
CREATE TABLE demo (
  id BIGSERIAL PRIMARY KEY,
  日期 DATE NOT NULL,
  进厂数据 INTEGER DEFAULT 0,
  生产数据 INTEGER DEFAULT 0,
  出厂数据 INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 设置 RLS (Row Level Security)
ALTER TABLE demo ENABLE ROW LEVEL SECURITY;

-- 创建允许所有操作的策略（开发环境）
CREATE POLICY "Allow all operations" ON demo
  FOR ALL USING (true) WITH CHECK (true);

-- 创建索引
CREATE INDEX idx_demo_date ON demo(日期);
CREATE INDEX idx_demo_created_at ON demo(created_at);
```

## 🔐 自部署 Supabase 配置

### **Kong 网关配置**

如果使用自部署 Supabase，需要配置 Kong 网关的 CORS：

```yaml
# kong.yml
_format_version: "3.0"

services:
  - name: auth-v1-open
    url: http://auth:9999/verify
    plugins:
      - name: cors
        config:
          origins:
            - "http://localhost:3000"
            - "http://localhost:3002"
          methods:
            - GET
            - POST
            - PUT
            - DELETE
            - OPTIONS
          headers:
            - Accept
            - Authorization
            - Content-Type
            - apikey
          credentials: true

  - name: rest-v1
    url: http://rest:3000/
    plugins:
      - name: cors
        config:
          origins:
            - "http://localhost:3000"
            - "http://localhost:3002"
          methods:
            - GET
            - POST
            - PUT
            - DELETE
            - OPTIONS
          headers:
            - Accept
            - Authorization
            - Content-Type
            - apikey
          credentials: true
```

## 🚨 常见问题与解决方案

### **1. CORS 错误**

**问题**: 浏览器阻止跨域请求

**解决方案**: 使用 API 路由作为代理，避免直接从浏览器调用 Supabase

### **2. 认证失败**

**问题**: JWT 密钥不匹配

**解决方案**:
- 确保 `.env.local` 中的密钥正确
- 重新生成并更新 Kong 配置中的密钥

### **3. 数据类型错误**

**问题**: 前端数据类型与数据库不匹配

**解决方案**: 在 API 路由中进行数据验证和类型转换

### **4. 网络连接问题**

**问题**: 无法连接到自部署 Supabase

**解决方案**:
- 检查 Supabase 服务状态
- 验证网络配置和端口
- 使用 API 路由绕过浏览器限制

## 🎯 最佳实践

### **1. 架构设计**

- ✅ **使用 API 路由作为数据层代理**
- ✅ **前端组件只负责 UI 逻辑**
- ✅ **服务端处理所有数据库操作**
- ✅ **统一的错误处理和日志记录**

### **2. 安全性**

- ✅ **API 密钥不暴露给前端**
- ✅ **使用环境变量管理敏感信息**
- ✅ **实施适当的数据验证**
- ✅ **配置 RLS 策略**

### **3. 性能优化**

- ✅ **合理的数据分页**
- ✅ **适当的缓存策略**
- ✅ **数据库索引优化**
- ✅ **组件懒加载**

### **4. 开发体验**

- ✅ **详细的错误日志**
- ✅ **类型安全的 TypeScript**
- ✅ **一致的代码风格**
- ✅ **完整的测试覆盖**

## 🚀 部署指南

### **开发环境**

```bash
# 启动开发服务器
npm run dev

# 访问应用
http://localhost:3000
```

### **生产环境**

```bash
# 构建应用
npm run build

# 启动生产服务器
npm start
```

## �️ 完整技术方案总结

### **连接架构模式对比**

| 方案 | 优势 | 劣势 | 适用场景 |
|------|------|------|----------|
| **API路由代理** | ✅ 绕过CORS<br>✅ 密钥安全<br>✅ 统一错误处理 | ⚠️ 增加服务端负载 | **推荐用于生产环境** |
| **直接客户端连接** | ✅ 减少网络跳转<br>✅ 实时订阅简单 | ❌ CORS限制<br>❌ 密钥暴露 | 仅适用于官方Supabase云服务 |

### **数据操作标准模式**

#### **API路由标准结构**

```typescript
// 通用API路由模板
export async function POST(request: NextRequest) {
  console.log('=== API操作开始 ===');

  try {
    // 1. 环境变量验证
    const { supabaseUrl, anonKey } = validateEnvironment();

    // 2. 请求数据解析和验证
    const requestData = await request.json();
    const validation = validateRequiredFields(requestData);

    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        missingFields: validation.missing
      }, { status: 400 });
    }

    // 3. 数据类型转换
    const dataToInsert = transformData(requestData);

    // 4. Supabase操作
    const response = await fetch(`${supabaseUrl}/rest/v1/table_name`, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(dataToInsert)
    });

    // 5. 响应处理
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        error: 'Database operation failed',
        details: errorText
      }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API操作失败:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

#### **前端组件标准模式**

```typescript
// 数据操作组件模板
"use client";

import { useState, useEffect } from 'react';

interface DataOperationProps {
  onSuccess?: (data: any) => void;
  refreshTrigger?: number;
}

export function DataOperationComponent({ onSuccess, refreshTrigger }: DataOperationProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 标准数据获取模式
  const fetchData = async (filters?: any) => {
    setLoading(true);
    setError(null);

    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/get-data?${queryString}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      setData(result.data);

    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
      console.error('数据获取失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 标准数据提交模式
  const submitData = async (formData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/submit-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      onSuccess?.(result.data);
      await fetchData(); // 自动刷新数据

    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败');
      console.error('数据提交失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 响应式数据刷新
  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  return (
    <div>
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-indicator">加载中...</div>}
      {/* 组件内容 */}
    </div>
  );
}
```

### **数据库交互规范**

#### **中文字段名处理**

```typescript
// ✅ 正确的中文字段名处理
const dataToInsert = {
  '日期': formatDate(date),           // 使用引号包围
  '进厂数据': parseInt(incoming),     // 数据类型转换
  '生产数据': parseInt(production),   // 确保类型匹配
  '出厂数据': parseInt(outgoing)      // 数据库字段对应
};

// 查询时的字段处理
const queryUrl = `${supabaseUrl}/rest/v1/demo?select=*&日期=eq.${date}`;

// ❌ 避免的错误写法
// const data = { 日期: date }; // 不使用引号可能导致解析错误
```

#### **日期格式化和时区处理**

```typescript
// 标准日期格式化函数
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 时区安全处理
const formatDateSafe = (date: Date): string => {
  // 避免时区偏移影响
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split('T')[0];
};

// 日期范围查询
const buildDateRangeQuery = (startDate: Date, endDate: Date) => {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  return `日期=gte.${start}&日期=lte.${end}`;
};
```

#### **RLS策略最佳实践**

```sql
-- 开发环境：宽松策略
CREATE POLICY "dev_allow_all" ON demo
  FOR ALL USING (true) WITH CHECK (true);

-- 生产环境：严格权限控制
CREATE POLICY "users_own_data" ON demo
  FOR ALL USING (auth.uid() = user_id);

-- 只读数据策略
CREATE POLICY "public_read_only" ON demo
  FOR SELECT USING (is_public = true);

-- 管理员策略
CREATE POLICY "admin_full_access" ON demo
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );
```

### **安全配置要点**

#### **环境变量分层管理**

```env
# .env.local (本地开发)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:28000
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=dev-service-key

# .env.production (生产环境)
NEXT_PUBLIC_SUPABASE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=prod-service-key

# 安全原则
# 1. 生产环境密钥定期轮换
# 2. 开发和生产环境完全隔离
# 3. 敏感密钥只在服务端使用
# 4. 使用环境变量验证函数
```

#### **API密钥安全管理**

```typescript
// 服务端密钥验证
const validateEnvironment = () => {
  const requiredVars = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  };

  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key, _]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  return requiredVars;
};

// 密钥使用原则
// ✅ API路由中使用：安全
// ❌ 前端组件中使用：不安全
// ✅ 服务端组件中使用：安全
// ❌ 客户端状态中存储：不安全
```

### **调试和监控最佳实践**

#### **统一日志记录模式**

```typescript
// 操作日志记录器
const logger = {
  operation: (name: string, data: any, result?: any) => {
    console.log(`🔄 ${name}`, {
      input: data,
      output: result,
      timestamp: new Date().toISOString()
    });
  },

  error: (context: string, error: any, metadata?: any) => {
    console.error(`❌ ${context}`, {
      error: error.message || error,
      stack: error.stack,
      metadata,
      timestamp: new Date().toISOString()
    });
  },

  performance: {
    start: (operation: string) => {
      console.time(`⏱️ ${operation}`);
      console.log(`🚀 开始${operation}`);
    },

    end: (operation: string, result?: any) => {
      console.timeEnd(`⏱️ ${operation}`);
      console.log(`✅ 完成${operation}`, result ? { result } : '');
    }
  }
};

// 使用示例
logger.performance.start('数据查询');
const data = await fetchData();
logger.operation('数据查询', { filters }, data);
logger.performance.end('数据查询', { count: data.length });
```

#### **错误边界和恢复策略**

```typescript
// API错误处理策略
const handleApiError = (error: any, context: string) => {
  // 1. 记录错误
  logger.error(context, error);

  // 2. 用户友好的错误消息
  const userMessage = getUserFriendlyMessage(error);

  // 3. 错误恢复建议
  const recovery = getRecoveryActions(error);

  return {
    message: userMessage,
    recovery,
    technical: error.message,
    timestamp: new Date().toISOString()
  };
};

// 网络重试机制
const fetchWithRetry = async (url: string, options: any, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;

      if (i === maxRetries - 1) throw new Error(`请求失败: ${response.status}`);

      // 指数退避重试
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));

    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};
```

## 🎯 架构一致性指导原则

### **新功能开发标准流程**

1. **📋 需求分析**
   - 确定数据模型和字段结构
   - 设计API接口规范
   - 规划用户交互流程

2. **🗄️ 数据库设计**
   - 创建表结构（支持中文字段名）
   - 配置RLS策略和权限
   - 建立必要的索引

3. **📡 API路由开发**
   - 复用标准API路由模板
   - 实现数据验证和转换
   - 添加完整的错误处理

4. **🎨 前端组件开发**
   - 使用标准组件模板
   - 实现响应式数据刷新
   - 添加加载状态和错误显示

5. **🧪 测试和调试**
   - 使用调试工具页面
   - 验证数据完整性
   - 测试错误场景

6. **📚 文档更新**
   - 记录新API接口
   - 更新组件使用说明
   - 补充常见问题解决方案

### **代码复用策略**

```typescript
// 1. API路由工具函数库
export const apiUtils = {
  validateEnvironment,
  validateRequiredFields,
  transformData,
  handleSupabaseResponse,
  buildQueryUrl,
  formatErrorResponse,
  formatSuccessResponse
};

// 2. 前端数据操作Hooks
export const useDataOperation = (apiEndpoint: string) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (filters) => {
    // 标准数据获取逻辑
  }, [apiEndpoint]);

  const submitData = useCallback(async (formData) => {
    // 标准数据提交逻辑
  }, [apiEndpoint]);

  return { data, loading, error, fetchData, submitData };
};

// 3. 通用UI组件
export const DataTable = ({ data, columns, loading, error }) => {
  // 标准数据表格组件
};

export const DataForm = ({ fields, onSubmit, loading }) => {
  // 标准数据表单组件
};
```

## 🎉 总结

这份指南基于真实项目经验，提供了构建 Next.js + 自部署 Supabase 应用的完整解决方案。核心要点：

1. **🏗️ API路由代理架构** - 解决CORS限制，确保密钥安全
2. **📡 标准化数据操作** - 统一的读写模式，完善的错误处理
3. **🔐 安全配置管理** - 环境变量分层，密钥安全使用
4. **🗄️ 数据库交互规范** - 中文字段支持，RLS策略配置
5. **🔧 可复用代码模板** - 提高开发效率，确保架构一致性
6. **🧪 调试监控体系** - 完整的日志记录，错误追踪机制

按照这个指南，您可以快速构建功能完整、架构清晰、易于维护的 Next.js + Supabase 应用！

---

**🔗 相关资源**

- [Next.js 官方文档](https://nextjs.org/docs)
- [Supabase 官方文档](https://supabase.com/docs)
- [shadcn/ui 组件库](https://ui.shadcn.com/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
