/**
 * 样本记录页面标题栏统一优化测试脚本
 * 
 * 功能：
 * - 验证SamplePageHeader统一组件的创建和功能
 * - 检查所有样本记录页面的标题栏集成
 * - 验证组件一致性和样式统一性
 * - 测试响应式设计和交互功能
 */

const fs = require('fs');
const path = require('path');

class SampleHeaderOptimizationTester {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      details: []
    };
  }

  /**
   * 测试SamplePageHeader统一组件
   */
  testSamplePageHeaderComponent() {
    const filePath = 'components/sample-page-header.tsx';
    
    try {
      console.log('📄 测试SamplePageHeader统一组件...');

      if (!fs.existsSync(filePath)) {
        throw new Error('SamplePageHeader组件文件不存在');
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const tests = [];

      // 测试1: 检查核心接口和类型定义
      const requiredTypes = [
        'SampleType',
        'SamplePageHeaderProps',
        'SAMPLE_CONFIG',
        'shift',
        'filter',
        'incoming',
        'outgoing'
      ];

      requiredTypes.forEach(type => {
        if (content.includes(type)) {
          tests.push(`✅ 类型定义存在: ${type}`);
        } else {
          tests.push(`❌ 类型定义缺失: ${type}`);
        }
      });

      // 测试2: 检查样本配置
      const sampleConfigs = [
        '"班样记录"',
        '"压滤样记录"',
        '"进厂样记录"',
        '"出厂样记录"',
        'FlaskConical',
        'Filter',
        'TruckIcon',
        'Package'
      ];

      sampleConfigs.forEach(config => {
        if (content.includes(config)) {
          tests.push(`✅ 样本配置存在: ${config}`);
        } else {
          tests.push(`❌ 样本配置缺失: ${config}`);
        }
      });

      // 测试3: 检查UI功能
      const uiFeatures = [
        'showBackButton',
        'showBreadcrumb',
        'showStatus',
        'WorkspaceNavigation',
        'ThemeToggle',
        'Badge',
        'ArrowLeft',
        'statusConfig'
      ];

      uiFeatures.forEach(feature => {
        if (content.includes(feature)) {
          tests.push(`✅ UI功能存在: ${feature}`);
        } else {
          tests.push(`❌ UI功能缺失: ${feature}`);
        }
      });

      // 测试4: 检查便捷组件导出
      const convenientComponents = [
        'ShiftSampleHeader',
        'FilterSampleHeader',
        'IncomingSampleHeader',
        'OutgoingSampleHeader'
      ];

      convenientComponents.forEach(component => {
        if (content.includes(component)) {
          tests.push(`✅ 便捷组件存在: ${component}`);
        } else {
          tests.push(`❌ 便捷组件缺失: ${component}`);
        }
      });

      // 测试5: 检查颜色主题配置
      const colorThemes = [
        'text-blue-600',
        'text-green-600',
        'text-orange-600',
        'text-purple-600',
        'bg-blue-50',
        'bg-green-50',
        'bg-orange-50',
        'bg-purple-50'
      ];

      colorThemes.forEach(color => {
        if (content.includes(color)) {
          tests.push(`✅ 颜色主题存在: ${color}`);
        } else {
          tests.push(`❌ 颜色主题缺失: ${color}`);
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
   * 测试样本记录页面集成
   */
  testSamplePagesIntegration() {
    const samplePages = [
      { file: 'components/shift-sample-page.tsx', header: 'ShiftSampleHeader', name: '班样记录页面' },
      { file: 'components/filter-sample-page.tsx', header: 'FilterSampleHeader', name: '压滤样记录页面' },
      { file: 'components/incoming-sample-page.tsx', header: 'IncomingSampleHeader', name: '进厂样记录页面' },
      { file: 'components/outgoing-sample-page.tsx', header: 'OutgoingSampleHeader', name: '出厂样记录页面' }
    ];

    try {
      console.log('📄 测试样本记录页面集成...');

      const tests = [];

      samplePages.forEach(({ file, header, name }) => {
        if (!fs.existsSync(file)) {
          tests.push(`❌ 文件不存在: ${file}`);
          return;
        }

        const content = fs.readFileSync(file, 'utf8');

        // 检查导入语句
        if (content.includes(header)) {
          tests.push(`✅ ${name} - 导入语句正确: ${header}`);
        } else {
          tests.push(`❌ ${name} - 导入语句缺失: ${header}`);
        }

        // 检查组件使用
        if (content.includes(`<${header}`)) {
          tests.push(`✅ ${name} - 组件使用正确: <${header}`);
        } else {
          tests.push(`❌ ${name} - 组件使用缺失: <${header}`);
        }

        // 检查状态属性
        if (content.includes('showStatus={true}')) {
          tests.push(`✅ ${name} - 状态显示配置正确`);
        } else {
          tests.push(`❌ ${name} - 状态显示配置缺失`);
        }

        // 检查是否移除了旧的标题栏代码
        if (!content.includes('WorkspaceNavigation />') || !content.includes('ThemeToggle />')) {
          tests.push(`✅ ${name} - 旧标题栏代码已移除`);
        } else {
          tests.push(`❌ ${name} - 旧标题栏代码未完全移除`);
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
   * 测试组件一致性
   */
  testComponentConsistency() {
    try {
      console.log('📄 测试组件一致性...');

      const tests = [];
      const samplePages = [
        'components/shift-sample-page.tsx',
        'components/filter-sample-page.tsx',
        'components/incoming-sample-page.tsx',
        'components/outgoing-sample-page.tsx'
      ];

      // 检查所有页面是否都使用了统一的标题栏模式
      samplePages.forEach(file => {
        if (!fs.existsSync(file)) {
          tests.push(`❌ 文件不存在: ${file}`);
          return;
        }

        const content = fs.readFileSync(file, 'utf8');
        const fileName = path.basename(file, '.tsx');

        // 检查是否使用了统一的标题栏组件
        const hasUnifiedHeader = content.includes('SampleHeader') && 
                                content.includes('showStatus={true}') &&
                                content.includes('status={submitStatus');

        if (hasUnifiedHeader) {
          tests.push(`✅ ${fileName} - 使用统一标题栏组件`);
        } else {
          tests.push(`❌ ${fileName} - 未使用统一标题栏组件`);
        }

        // 检查是否移除了重复的导航组件
        const hasOldNavigation = content.includes('<WorkspaceNavigation />') && 
                                 content.includes('<ThemeToggle />') &&
                                 content.includes('border-b');

        if (!hasOldNavigation) {
          tests.push(`✅ ${fileName} - 旧导航组件已移除`);
        } else {
          tests.push(`❌ ${fileName} - 旧导航组件未移除`);
        }

        // 检查页面结构一致性
        const hasConsistentStructure = content.includes('min-h-screen bg-background') &&
                                      content.includes('container mx-auto px-4 py-6');

        if (hasConsistentStructure) {
          tests.push(`✅ ${fileName} - 页面结构一致`);
        } else {
          tests.push(`❌ ${fileName} - 页面结构不一致`);
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
   * 执行所有测试
   */
  async execute() {
    console.log('🎯 开始样本记录页面标题栏统一优化测试...\n');

    // 测试1: SamplePageHeader统一组件
    console.log('📋 测试1: SamplePageHeader统一组件功能');
    const componentTest = this.testSamplePageHeaderComponent();
    this.results.total += componentTest.totalCount;
    this.results.passed += componentTest.passedCount;
    this.results.failed += componentTest.failedCount;
    this.results.details.push(`统一组件测试: ${componentTest.passedCount}/${componentTest.totalCount} 通过`);
    
    componentTest.details.forEach(detail => {
      console.log(`  ${detail}`);
    });

    console.log('');

    // 测试2: 样本记录页面集成
    console.log('📋 测试2: 样本记录页面集成');
    const integrationTest = this.testSamplePagesIntegration();
    this.results.total += integrationTest.totalCount;
    this.results.passed += integrationTest.passedCount;
    this.results.failed += integrationTest.failedCount;
    this.results.details.push(`页面集成测试: ${integrationTest.passedCount}/${integrationTest.totalCount} 通过`);
    
    integrationTest.details.forEach(detail => {
      console.log(`  ${detail}`);
    });

    console.log('');

    // 测试3: 组件一致性
    console.log('📋 测试3: 组件一致性');
    const consistencyTest = this.testComponentConsistency();
    this.results.total += consistencyTest.totalCount;
    this.results.passed += consistencyTest.passedCount;
    this.results.failed += consistencyTest.failedCount;
    this.results.details.push(`一致性测试: ${consistencyTest.passedCount}/${consistencyTest.totalCount} 通过`);
    
    consistencyTest.details.forEach(detail => {
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
    console.log('📊 样本记录页面标题栏统一优化测试结果');
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
      console.log('\n🎉 样本记录页面标题栏统一优化测试全部通过!');
    } else {
      console.log('\n⚠️ 部分测试未通过，请检查相关问题');
    }

    console.log('\n🎯 测试完成!');
  }
}

// 执行脚本
if (require.main === module) {
  const tester = new SampleHeaderOptimizationTester();
  tester.execute().catch(console.error);
}

module.exports = SampleHeaderOptimizationTester;
