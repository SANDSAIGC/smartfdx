/**
 * 工作区导航菜单重构测试脚本
 * 
 * 功能：
 * - 验证WorkspaceNavigation组件的重构效果
 * - 检查导入语句和依赖项
 * - 验证导航配置和功能
 * - 测试组件结构和样式
 */

const fs = require('fs');
const path = require('path');

class WorkspaceNavigationTester {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      details: []
    };
  }

  /**
   * 测试WorkspaceNavigation组件文件
   */
  testWorkspaceNavigationComponent() {
    const filePath = 'components/workspace-navigation.tsx';
    
    try {
      console.log('📄 测试WorkspaceNavigation组件...');

      if (!fs.existsSync(filePath)) {
        throw new Error('WorkspaceNavigation组件文件不存在');
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const tests = [];

      // 测试1: 检查新增的导入语句
      const requiredImports = [
        'usePathname',
        'DropdownMenuGroup',
        'DropdownMenuSub',
        'DropdownMenuSubContent',
        'DropdownMenuSubTrigger',
        'Badge',
        'RouteManager',
        'NavigationUtils',
        'Home',
        'FlaskConical',
        'Factory',
        'BarChart3',
        'ChevronRight',
        'MapPin'
      ];

      requiredImports.forEach(importItem => {
        if (content.includes(importItem)) {
          tests.push(`✅ 导入语句包含: ${importItem}`);
        } else {
          tests.push(`❌ 缺少导入语句: ${importItem}`);
        }
      });

      // 测试2: 检查新增的状态和变量
      const requiredVariables = [
        'pathname',
        'currentRoute',
        'currentPageTitle',
        'workspaceShortcuts',
        'sampleShortcuts'
      ];

      requiredVariables.forEach(variable => {
        if (content.includes(variable)) {
          tests.push(`✅ 包含变量: ${variable}`);
        } else {
          tests.push(`❌ 缺少变量: ${variable}`);
        }
      });

      // 测试3: 检查新增的函数
      const requiredFunctions = [
        'handleNavigation',
        'NavigationUtils.navigateTo',
        'RouteManager.getRouteByPath'
      ];

      requiredFunctions.forEach(func => {
        if (content.includes(func)) {
          tests.push(`✅ 包含函数: ${func}`);
        } else {
          tests.push(`❌ 缺少函数: ${func}`);
        }
      });

      // 测试4: 检查UI组件结构
      const requiredUIElements = [
        'DropdownMenuGroup',
        'DropdownMenuSub',
        'DropdownMenuSubTrigger',
        'DropdownMenuSubContent',
        'Badge',
        'currentPageTitle',
        '工作区导航',
        '样本记录',
        '用户功能'
      ];

      requiredUIElements.forEach(element => {
        if (content.includes(element)) {
          tests.push(`✅ UI元素存在: ${element}`);
        } else {
          tests.push(`❌ UI元素缺失: ${element}`);
        }
      });

      // 测试5: 检查导航配置
      const navigationConfigs = [
        '"首页"',
        '"化验室"',
        '"生产车间"',
        '"数据中心"',
        '"班样记录"',
        '"压滤样记录"',
        '"进厂样记录"',
        '"出厂样记录"'
      ];

      navigationConfigs.forEach(config => {
        if (content.includes(config)) {
          tests.push(`✅ 导航配置存在: ${config}`);
        } else {
          tests.push(`❌ 导航配置缺失: ${config}`);
        }
      });

      // 统计测试结果
      const passedTests = tests.filter(test => test.startsWith('✅')).length;
      const failedTests = tests.filter(test => test.startsWith('❌')).length;

      return {
        passed: failedTests === 0,
        passedCount: passedTests,
        failedCount: failedTests,
        totalCount: tests.length,
        details: tests
      };

    } catch (error) {
      return {
        passed: false,
        passedCount: 0,
        failedCount: 1,
        totalCount: 1,
        details: [`❌ 测试异常: ${error.message}`]
      };
    }
  }

  /**
   * 测试依赖文件
   */
  testDependencies() {
    const dependencies = [
      'lib/route-config.ts',
      'lib/navigation-utils.ts',
      'components/ui/badge.tsx'
    ];

    const tests = [];

    dependencies.forEach(dep => {
      if (fs.existsSync(dep)) {
        tests.push(`✅ 依赖文件存在: ${dep}`);
      } else {
        tests.push(`❌ 依赖文件缺失: ${dep}`);
      }
    });

    const passedTests = tests.filter(test => test.startsWith('✅')).length;
    const failedTests = tests.filter(test => test.startsWith('❌')).length;

    return {
      passed: failedTests === 0,
      passedCount: passedTests,
      failedCount: failedTests,
      totalCount: tests.length,
      details: tests
    };
  }

  /**
   * 执行所有测试
   */
  async execute() {
    console.log('🎯 开始工作区导航菜单重构测试...\n');

    // 测试1: WorkspaceNavigation组件
    console.log('📋 测试1: WorkspaceNavigation组件重构');
    const componentTest = this.testWorkspaceNavigationComponent();
    this.results.total += componentTest.totalCount;
    this.results.passed += componentTest.passedCount;
    this.results.failed += componentTest.failedCount;
    this.results.details.push(`组件测试: ${componentTest.passedCount}/${componentTest.totalCount} 通过`);
    
    componentTest.details.forEach(detail => {
      console.log(`  ${detail}`);
    });

    console.log('');

    // 测试2: 依赖文件
    console.log('📋 测试2: 依赖文件检查');
    const dependencyTest = this.testDependencies();
    this.results.total += dependencyTest.totalCount;
    this.results.passed += dependencyTest.passedCount;
    this.results.failed += dependencyTest.failedCount;
    this.results.details.push(`依赖测试: ${dependencyTest.passedCount}/${dependencyTest.totalCount} 通过`);
    
    dependencyTest.details.forEach(detail => {
      console.log(`  ${detail}`);
    });

    console.log('');

    // 输出结果
    this.printResults();
  }

  /**
   * 打印测试结果
   */
  printResults() {
    console.log('='.repeat(60));
    console.log('📊 工作区导航菜单重构测试结果');
    console.log('='.repeat(60));
    console.log(`总测试数: ${this.results.total}`);
    console.log(`测试通过: ${this.results.passed} ✅`);
    console.log(`测试失败: ${this.results.failed} ❌`);
    console.log(`通过率: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);

    if (this.results.details.length > 0) {
      console.log('\n📋 测试摘要:');
      this.results.details.forEach(detail => {
        console.log(`  ${detail}`);
      });
    }

    if (this.results.passed === this.results.total) {
      console.log('\n🎉 工作区导航菜单重构测试全部通过!');
    } else {
      console.log('\n⚠️ 部分测试未通过，请检查相关问题');
    }

    console.log('\n🎯 测试完成!');
  }
}

// 执行脚本
if (require.main === module) {
  const tester = new WorkspaceNavigationTester();
  tester.execute().catch(console.error);
}

module.exports = WorkspaceNavigationTester;
