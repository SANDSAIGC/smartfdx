/**
 * 路由系统架构重构测试脚本
 * 
 * 功能：
 * 1. 验证统一路由配置系统
 * 2. 测试智能重定向管理器
 * 3. 检查导航工具函数
 * 4. 验证中间件配置优化
 */

import { RouteManager, AuthStrategy, PageType, ROUTE_CONFIG } from '../lib/route-config';
import { RedirectManager, RedirectType } from '../lib/redirect-manager';
import { NavigationUtils } from '../lib/navigation-utils';

// 测试结果接口
interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  error?: string;
}

class RouteSystemTester {
  private results: TestResult[] = [];

  /**
   * 运行所有测试
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 [路由系统测试] 开始全面测试...\n');

    // 1. 测试路由配置系统
    await this.testRouteConfiguration();
    
    // 2. 测试路由管理器
    await this.testRouteManager();
    
    // 3. 测试重定向管理器
    await this.testRedirectManager();
    
    // 4. 测试导航工具
    await this.testNavigationUtils();
    
    // 5. 测试中间件配置
    await this.testMiddlewareConfig();

    // 输出测试结果
    this.printResults();
  }

  /**
   * 测试路由配置系统
   */
  private async testRouteConfiguration(): Promise<void> {
    console.log('📋 [测试] 路由配置系统...');

    try {
      // 测试1: 验证所有路由配置完整性
      const allRoutes = Object.values(ROUTE_CONFIG);
      const requiredFields = ['path', 'name', 'title', 'authStrategy', 'pageType', 'isActive'];
      
      let configValid = true;
      let invalidRoutes: string[] = [];

      allRoutes.forEach(route => {
        requiredFields.forEach(field => {
          if (!(field in route)) {
            configValid = false;
            invalidRoutes.push(`${route.name} 缺少字段: ${field}`);
          }
        });
      });

      this.addResult({
        testName: '路由配置完整性检查',
        passed: configValid,
        details: configValid ? `所有 ${allRoutes.length} 个路由配置完整` : `发现问题: ${invalidRoutes.join(', ')}`,
        error: configValid ? undefined : invalidRoutes.join('; ')
      });

      // 测试2: 验证路径唯一性
      const paths = allRoutes.map(route => route.path);
      const uniquePaths = new Set(paths);
      const pathsUnique = paths.length === uniquePaths.size;

      this.addResult({
        testName: '路由路径唯一性检查',
        passed: pathsUnique,
        details: pathsUnique ? '所有路由路径唯一' : '发现重复路径',
        error: pathsUnique ? undefined : '存在重复的路由路径'
      });

      // 测试3: 验证认证策略分布
      const authStrategies = Object.values(AuthStrategy);
      const strategyCount: Record<string, number> = {};
      
      authStrategies.forEach(strategy => {
        strategyCount[strategy] = allRoutes.filter(route => route.authStrategy === strategy).length;
      });

      this.addResult({
        testName: '认证策略分布检查',
        passed: true,
        details: `认证策略分布: ${Object.entries(strategyCount).map(([k, v]) => `${k}(${v})`).join(', ')}`
      });

    } catch (error) {
      this.addResult({
        testName: '路由配置系统测试',
        passed: false,
        details: '测试执行失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 测试路由管理器
   */
  private async testRouteManager(): Promise<void> {
    console.log('🔧 [测试] 路由管理器...');

    try {
      // 测试1: 根据路径获取路由
      const labRoute = RouteManager.getRouteByPath('/lab');
      this.addResult({
        testName: '根据路径获取路由',
        passed: !!labRoute && labRoute.name === 'lab',
        details: labRoute ? `成功获取化验室路由: ${labRoute.title}` : '未找到化验室路由'
      });

      // 测试2: 根据工作页面名称获取路由
      const workspaceRoute = RouteManager.getRouteByWorkspaceName('化验室');
      this.addResult({
        testName: '根据工作页面名称获取路由',
        passed: !!workspaceRoute && workspaceRoute.path === '/lab',
        details: workspaceRoute ? `成功获取工作页面路由: ${workspaceRoute.path}` : '未找到工作页面路由'
      });

      // 测试3: 获取简化认证路由
      const simpleAuthRoutes = RouteManager.getRoutesByAuthStrategy(AuthStrategy.SIMPLE);
      this.addResult({
        testName: '获取简化认证路由',
        passed: simpleAuthRoutes.length > 0,
        details: `找到 ${simpleAuthRoutes.length} 个简化认证路由: ${simpleAuthRoutes.map(r => r.name).join(', ')}`
      });

      // 测试4: 检查认证需求
      const labRequiresAuth = RouteManager.requiresAuth('/lab');
      const homeRequiresAuth = RouteManager.requiresAuth('/');
      
      this.addResult({
        testName: '认证需求检查',
        passed: labRequiresAuth && !homeRequiresAuth,
        details: `化验室需要认证: ${labRequiresAuth}, 首页需要认证: ${homeRequiresAuth}`
      });

      // 测试5: 中间件排除路径
      const excludedPaths = RouteManager.getMiddlewareExcludedPaths();
      this.addResult({
        testName: '中间件排除路径生成',
        passed: excludedPaths.length > 0 && excludedPaths.includes('lab'),
        details: `生成 ${excludedPaths.length} 个排除路径: ${excludedPaths.join(', ')}`
      });

    } catch (error) {
      this.addResult({
        testName: '路由管理器测试',
        passed: false,
        details: '测试执行失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 测试重定向管理器
   */
  private async testRedirectManager(): Promise<void> {
    console.log('🎯 [测试] 重定向管理器...');

    try {
      // 模拟用户数据
      const mockUser = {
        id: 1,
        账号: 'test001',
        姓名: '测试用户',
        部门: '化验室',
        工作页面: '化验室',
        职称: '化验员',
        状态: '正常'
      };

      // 测试1: 登录成功重定向（无重定向参数）
      const loginResult1 = RedirectManager.handleLoginSuccess(mockUser);
      this.addResult({
        testName: '登录成功重定向（默认工作页面）',
        passed: loginResult1.shouldRedirect && loginResult1.targetUrl === '/lab',
        details: `重定向到: ${loginResult1.targetUrl}, 原因: ${loginResult1.reason}`
      });

      // 测试2: 登录成功重定向（有重定向参数）
      const loginResult2 = RedirectManager.handleLoginSuccess(mockUser, '/shift-sample');
      this.addResult({
        testName: '登录成功重定向（返回原始页面）',
        passed: loginResult2.shouldRedirect && loginResult2.targetUrl === '/shift-sample',
        details: `重定向到: ${loginResult2.targetUrl}, 原因: ${loginResult2.reason}`
      });

      // 测试3: 需要认证的页面访问
      const authResult1 = RedirectManager.handleAuthRequired('/lab', false);
      this.addResult({
        testName: '未认证用户访问需要认证的页面',
        passed: authResult1.shouldRedirect && authResult1.targetUrl.includes('/auth/login'),
        details: `重定向到: ${authResult1.targetUrl}, 类型: ${authResult1.type}`
      });

      // 测试4: 已认证用户访问
      const authResult2 = RedirectManager.handleAuthRequired('/lab', true);
      this.addResult({
        testName: '已认证用户访问页面',
        passed: !authResult2.shouldRedirect,
        details: `允许访问, 原因: ${authResult2.reason}`
      });

      // 测试5: 权限不足处理
      const permissionResult = RedirectManager.handlePermissionDenied('/boss', mockUser);
      this.addResult({
        testName: '权限不足处理',
        passed: permissionResult.shouldRedirect && permissionResult.type === RedirectType.PERMISSION_DENIED,
        details: `重定向到: ${permissionResult.targetUrl}, 原因: ${permissionResult.reason}`
      });

    } catch (error) {
      this.addResult({
        testName: '重定向管理器测试',
        passed: false,
        details: '测试执行失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 测试导航工具
   */
  private async testNavigationUtils(): Promise<void> {
    console.log('🧭 [测试] 导航工具...');

    try {
      // 测试1: 路径验证
      const canNavigateToLab = NavigationUtils.canNavigateTo('/lab');
      const canNavigateToInvalid = NavigationUtils.canNavigateTo('/invalid-path');
      
      this.addResult({
        testName: '路径导航验证',
        passed: canNavigateToLab && !canNavigateToInvalid,
        details: `化验室路径可导航: ${canNavigateToLab}, 无效路径可导航: ${canNavigateToInvalid}`
      });

      // 测试2: URL构建
      const builtUrl = NavigationUtils.buildUrl('/lab', { date: '2024-01-01', type: 'sample' });
      const expectedUrl = '/lab?date=2024-01-01&type=sample';
      
      this.addResult({
        testName: 'URL构建功能',
        passed: builtUrl === expectedUrl,
        details: `构建的URL: ${builtUrl}, 期望的URL: ${expectedUrl}`
      });

      // 测试3: 查询参数解析
      const params = NavigationUtils.parseQuery('?redirect=%2Fshift-sample&date=2024-01-01');
      const hasRedirect = 'redirect' in params && params.redirect === '/shift-sample';
      const hasDate = 'date' in params && params.date === '2024-01-01';
      
      this.addResult({
        testName: '查询参数解析',
        passed: hasRedirect && hasDate,
        details: `解析的参数: ${JSON.stringify(params)}`
      });

      // 测试4: 面包屑生成
      const breadcrumbs = NavigationUtils.getBreadcrumbs('/lab');
      this.addResult({
        testName: '面包屑导航生成',
        passed: breadcrumbs.length > 0,
        details: `生成 ${breadcrumbs.length} 个面包屑: ${breadcrumbs.map(b => b.title).join(' > ')}`
      });

    } catch (error) {
      this.addResult({
        testName: '导航工具测试',
        passed: false,
        details: '测试执行失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 测试中间件配置
   */
  private async testMiddlewareConfig(): Promise<void> {
    console.log('⚙️ [测试] 中间件配置...');

    try {
      // 测试1: 验证排除路径配置
      const excludedPaths = RouteManager.getMiddlewareExcludedPaths();
      const expectedPaths = ['lab', 'shift-sample', 'filter-sample', 'incoming-sample', 'outgoing-sample'];
      const allExpectedIncluded = expectedPaths.every(path => excludedPaths.includes(path));
      
      this.addResult({
        testName: '中间件排除路径配置',
        passed: allExpectedIncluded,
        details: `排除路径: ${excludedPaths.join(', ')}, 期望包含: ${expectedPaths.join(', ')}`
      });

      // 测试2: 验证认证策略映射
      const simpleAuthRoutes = RouteManager.getRoutesByAuthStrategy(AuthStrategy.SIMPLE);
      const supabaseAuthRoutes = RouteManager.getRoutesByAuthStrategy(AuthStrategy.SUPABASE);
      
      this.addResult({
        testName: '认证策略映射',
        passed: simpleAuthRoutes.length > 0 && supabaseAuthRoutes.length > 0,
        details: `简化认证路由: ${simpleAuthRoutes.length}个, Supabase认证路由: ${supabaseAuthRoutes.length}个`
      });

    } catch (error) {
      this.addResult({
        testName: '中间件配置测试',
        passed: false,
        details: '测试执行失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 添加测试结果
   */
  private addResult(result: TestResult): void {
    this.results.push(result);
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.testName}: ${result.details}`);
    if (result.error) {
      console.log(`   错误: ${result.error}`);
    }
  }

  /**
   * 打印测试结果摘要
   */
  private printResults(): void {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log('\n' + '='.repeat(60));
    console.log('🧪 路由系统架构重构测试结果摘要');
    console.log('='.repeat(60));
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过: ${passedTests} ✅`);
    console.log(`失败: ${failedTests} ❌`);
    console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests > 0) {
      console.log('\n❌ 失败的测试:');
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`  - ${result.testName}: ${result.error || result.details}`);
      });
    }

    console.log('\n🎯 路由系统架构重构' + (failedTests === 0 ? '完全成功!' : '需要修复失败的测试项'));
    console.log('='.repeat(60));
  }
}

// 执行测试
const tester = new RouteSystemTester();
tester.runAllTests().catch(console.error);
