/**
 * Lab页面数据对比区域日期组件独立化测试脚本
 * 
 * 功能：
 * - 验证LabDateSelector组件的创建和功能
 * - 检查Lab页面的日期组件集成
 * - 验证DataComparisonSection的独立日期选择器
 * - 测试组件接口和类型定义
 */

const fs = require('fs');
const path = require('path');

class LabDateComponentTester {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      details: []
    };
  }

  /**
   * 测试LabDateSelector组件
   */
  testLabDateSelectorComponent() {
    const filePath = 'components/lab-date-selector.tsx';
    
    try {
      console.log('📄 测试LabDateSelector组件...');

      if (!fs.existsSync(filePath)) {
        throw new Error('LabDateSelector组件文件不存在');
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const tests = [];

      // 测试1: 检查核心接口定义
      const requiredInterfaces = [
        'LabDateRange',
        'LabDateSelectorProps',
        'DATE_PRESETS'
      ];

      requiredInterfaces.forEach(interfaceItem => {
        if (content.includes(interfaceItem)) {
          tests.push(`✅ 接口定义存在: ${interfaceItem}`);
        } else {
          tests.push(`❌ 接口定义缺失: ${interfaceItem}`);
        }
      });

      // 测试2: 检查核心功能
      const requiredFeatures = [
        'handlePresetClick',
        'handleDateRangeChange',
        'handleRefresh',
        'dateRangeStats',
        'DateRangePicker',
        'showPresets',
        'showRefreshButton',
        'showStatistics',
        'compact'
      ];

      requiredFeatures.forEach(feature => {
        if (content.includes(feature)) {
          tests.push(`✅ 功能存在: ${feature}`);
        } else {
          tests.push(`❌ 功能缺失: ${feature}`);
        }
      });

      // 测试3: 检查UI组件
      const requiredUIComponents = [
        'Card',
        'CardContent',
        'CardHeader',
        'CardTitle',
        'Badge',
        'Button',
        'Calendar',
        'RefreshCw',
        'ChevronDown',
        'ChevronUp'
      ];

      requiredUIComponents.forEach(component => {
        if (content.includes(component)) {
          tests.push(`✅ UI组件存在: ${component}`);
        } else {
          tests.push(`❌ UI组件缺失: ${component}`);
        }
      });

      // 测试4: 检查预设日期范围
      const presetLabels = [
        '"最近7天"',
        '"最近15天"',
        '"最近30天"',
        '"最近60天"',
        '"最近90天"'
      ];

      presetLabels.forEach(label => {
        if (content.includes(label)) {
          tests.push(`✅ 预设日期存在: ${label}`);
        } else {
          tests.push(`❌ 预设日期缺失: ${label}`);
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
   * 测试Lab页面集成
   */
  testLabPageIntegration() {
    const filePath = 'components/lab-page.tsx';
    
    try {
      console.log('📄 测试Lab页面集成...');

      if (!fs.existsSync(filePath)) {
        throw new Error('Lab页面文件不存在');
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const tests = [];

      // 测试1: 检查导入语句
      const requiredImports = [
        'LabDateSelector',
        'LabDateRange'
      ];

      requiredImports.forEach(importItem => {
        if (content.includes(importItem)) {
          tests.push(`✅ 导入语句存在: ${importItem}`);
        } else {
          tests.push(`❌ 导入语句缺失: ${importItem}`);
        }
      });

      // 测试2: 检查组件使用
      const componentUsage = [
        '<LabDateSelector',
        'onDateRangeChange={setDateRange}',
        'onRefresh={fetchData}',
        'isLoading={isLoading}',
        'showPresets={true}',
        'showRefreshButton={true}',
        'showStatistics={true}'
      ];

      componentUsage.forEach(usage => {
        if (content.includes(usage)) {
          tests.push(`✅ 组件使用正确: ${usage}`);
        } else {
          tests.push(`❌ 组件使用缺失: ${usage}`);
        }
      });

      // 测试3: 检查类型定义
      if (content.includes('useState<LabDateRange>')) {
        tests.push('✅ 类型定义正确: useState<LabDateRange>');
      } else {
        tests.push('❌ 类型定义错误: 应使用LabDateRange类型');
      }

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
   * 测试DataComparisonSection集成
   */
  testDataComparisonIntegration() {
    const filePath = 'components/data-comparison-section.tsx';
    
    try {
      console.log('📄 测试DataComparisonSection集成...');

      if (!fs.existsSync(filePath)) {
        throw new Error('DataComparisonSection文件不存在');
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const tests = [];

      // 测试1: 检查导入和类型
      const requiredItems = [
        'LabDateSelector',
        'LabDateRange',
        'localDateRange',
        'setLocalDateRange'
      ];

      requiredItems.forEach(item => {
        if (content.includes(item)) {
          tests.push(`✅ 项目存在: ${item}`);
        } else {
          tests.push(`❌ 项目缺失: ${item}`);
        }
      });

      // 测试2: 检查独立日期选择器使用
      const selectorUsage = [
        '<LabDateSelector',
        'dateRange={localDateRange}',
        'onDateRangeChange={setLocalDateRange}',
        'compact={true}'
      ];

      selectorUsage.forEach(usage => {
        if (content.includes(usage)) {
          tests.push(`✅ 选择器使用正确: ${usage}`);
        } else {
          tests.push(`❌ 选择器使用缺失: ${usage}`);
        }
      });

      // 测试3: 检查useEffect依赖
      if (content.includes('localDateRange.from?.getTime()')) {
        tests.push('✅ useEffect依赖正确: localDateRange.from?.getTime()');
      } else {
        tests.push('❌ useEffect依赖缺失: localDateRange.from?.getTime()');
      }

      if (content.includes('localDateRange.to?.getTime()')) {
        tests.push('✅ useEffect依赖正确: localDateRange.to?.getTime()');
      } else {
        tests.push('❌ useEffect依赖缺失: localDateRange.to?.getTime()');
      }

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
    console.log('🎯 开始Lab页面日期组件独立化测试...\n');

    // 测试1: LabDateSelector组件
    console.log('📋 测试1: LabDateSelector组件功能');
    const componentTest = this.testLabDateSelectorComponent();
    this.results.total += componentTest.totalCount;
    this.results.passed += componentTest.passedCount;
    this.results.failed += componentTest.failedCount;
    this.results.details.push(`组件测试: ${componentTest.passedCount}/${componentTest.totalCount} 通过`);
    
    componentTest.details.forEach(detail => {
      console.log(`  ${detail}`);
    });

    console.log('');

    // 测试2: Lab页面集成
    console.log('📋 测试2: Lab页面集成');
    const labPageTest = this.testLabPageIntegration();
    this.results.total += labPageTest.totalCount;
    this.results.passed += labPageTest.passedCount;
    this.results.failed += labPageTest.failedCount;
    this.results.details.push(`Lab页面测试: ${labPageTest.passedCount}/${labPageTest.totalCount} 通过`);
    
    labPageTest.details.forEach(detail => {
      console.log(`  ${detail}`);
    });

    console.log('');

    // 测试3: DataComparisonSection集成
    console.log('📋 测试3: DataComparisonSection集成');
    const comparisonTest = this.testDataComparisonIntegration();
    this.results.total += comparisonTest.totalCount;
    this.results.passed += comparisonTest.passedCount;
    this.results.failed += comparisonTest.failedCount;
    this.results.details.push(`数据对比测试: ${comparisonTest.passedCount}/${comparisonTest.totalCount} 通过`);
    
    comparisonTest.details.forEach(detail => {
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
    console.log('📊 Lab页面日期组件独立化测试结果');
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
      console.log('\n🎉 Lab页面日期组件独立化测试全部通过!');
    } else {
      console.log('\n⚠️ 部分测试未通过，请检查相关问题');
    }

    console.log('\n🎯 测试完成!');
  }
}

// 执行脚本
if (require.main === module) {
  const tester = new LabDateComponentTester();
  tester.execute().catch(console.error);
}

module.exports = LabDateComponentTester;
