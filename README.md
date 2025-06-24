# FDX Smart Workshop 2.0

<h1 align="center">富鼎翔工业智能车间系统</h1>

<p align="center">
 基于 Next.js 和 Supabase 构建的现代化工业管理平台
</p>

<p align="center">
  <a href="#features"><strong>功能特性</strong></a> ·
  <a href="#tech-stack"><strong>技术栈</strong></a> ·
  <a href="#installation"><strong>安装部署</strong></a> ·
  <a href="#usage"><strong>使用说明</strong></a> ·
  <a href="#contributing"><strong>贡献指南</strong></a>
</p>
<br/>

## 功能特性

- 🏭 **智能车间管理** - 现代化的工业车间管理系统
- 🔐 **安全认证系统** - 基于 Supabase Auth 的用户认证
- 🌓 **深色/浅色主题** - 支持主题切换，适应不同工作环境
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🎨 **现代化UI** - 使用 shadcn/ui 组件库构建
- ⚡ **高性能** - 基于 Next.js 15 和 React 19
- 🔧 **TypeScript** - 完整的类型安全支持
- 🚀 **快速部署** - 支持 Vercel 一键部署

## 技术栈

- **前端框架**: [Next.js 15](https://nextjs.org) (App Router)
- **UI 组件**: [shadcn/ui](https://ui.shadcn.com/)
- **样式**: [Tailwind CSS](https://tailwindcss.com)
- **后端服务**: [Supabase](https://supabase.com)
- **认证**: Supabase Auth (Cookie-based)
- **数据库**: PostgreSQL (Supabase)
- **开发语言**: TypeScript
- **主题管理**: next-themes

## 项目截图

### 登录页面
- 左上角显示 "FDX SMART WORKSHOP 2.0" 标题
- 右上角主题切换按钮
- 中文界面，包含"记住账号"功能
- 底部版权信息

### 主要功能
- 用户认证（登录/注册/忘记密码）
- 主题切换（深色/浅色模式）
- 响应式设计
- 受保护的页面路由

## 快速部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSANDSAIGC%2Fsmartfdx&project-name=smartfdx&repository-name=smartfdx)

## 安装部署

### 前置要求

- Node.js 18+
- npm/yarn/pnpm
- Supabase 账号

### 本地开发

1. **克隆项目**

   ```bash
   git clone https://github.com/SANDSAIGC/smartfdx.git
   cd smartfdx
   ```

2. **安装依赖**

   ```bash
   npm install
   # 或
   yarn install
   # 或
   pnpm install
   ```

3. **配置环境变量**

   复制 `.env.example` 为 `.env.local` 并配置以下变量：

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   在 [Supabase Dashboard](https://supabase.com/dashboard) 中获取这些值。

4. **启动开发服务器**

   ```bash
   npm run dev
   ```

   访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### Supabase 配置

1. 在 [Supabase](https://database.new) 创建新项目
2. 在项目设置中获取 URL 和 anon key
3. 配置认证提供商（如需要）
4. 设置数据库表结构（如需要）

## 使用说明

### 主要页面

- `/` - 主页
- `/auth/login` - 登录页面
- `/auth/sign-up` - 注册页面
- `/auth/forgot-password` - 忘记密码页面
- `/protected` - 受保护的页面（需要登录）

### 主要功能

1. **用户认证**
   - 邮箱密码登录
   - 用户注册
   - 忘记密码重置
   - 记住账号功能

2. **主题切换**
   - 支持浅色/深色主题
   - 系统主题自动检测
   - 主题状态持久化

3. **响应式设计**
   - 移动端适配
   - 桌面端优化

## 项目结构

```
smartfdx/
├── app/                    # Next.js App Router
│   ├── auth/              # 认证相关页面
│   ├── protected/         # 受保护页面
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 组件
│   └── ...               # 自定义组件
├── lib/                  # 工具库
│   └── supabase/         # Supabase 配置
└── ...
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

- 项目链接: [https://github.com/SANDSAIGC/smartfdx](https://github.com/SANDSAIGC/smartfdx)
- 问题反馈: [Issues](https://github.com/SANDSAIGC/smartfdx/issues)

---

**FDX@2025 滇ICP备2025058380号**
