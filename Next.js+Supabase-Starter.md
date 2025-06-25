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

## 🎉 总结

这份指南基于真实项目经验，提供了构建 Next.js + Supabase 应用的完整解决方案。关键要点：

1. **使用 API 路由作为数据代理**，避免浏览器 CORS 限制
2. **完善的错误处理和日志记录**，便于问题诊断
3. **类型安全的 TypeScript 实现**，提高代码质量
4. **模块化的组件设计**，便于维护和扩展

按照这个指南，您可以快速构建一个功能完整、性能优秀的 Next.js + Supabase 应用！

---

**🔗 相关资源**

- [Next.js 官方文档](https://nextjs.org/docs)
- [Supabase 官方文档](https://supabase.com/docs)
- [shadcn/ui 组件库](https://ui.shadcn.com/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
