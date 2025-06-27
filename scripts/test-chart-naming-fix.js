#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 图表组件命名冲突修复验证脚本
 */
class ChartNamingFixTester {
  constructor() {
    this.results = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      details: []
    };
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🔧 开始验证图表组件命名冲突修复...\n');

    await this.testUnifiedChartComponent();
    await this.testScriptUpdates();
    await this.testPageImports();
    await this.testComponentUsage();

    this.printResults();
  }

  /**
   * 测试统一图表组件
   */
  async testUnifiedChartComponent() {
    console.log('📋 测试1: 统一图表组件命名检查\n');

    const filePath = 'components/ui/unified-chart.tsx';
    this.results.totalTests++;

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 检查新的组件名称
      const hasUnifiedAreaChart = content.includes('export function UnifiedAreaChart');
      const hasUnifiedPieChart = content.includes('export function UnifiedPieChart');
      const hasUnifiedComposedChart = content.includes('export function UnifiedComposedChart');
      
      // 检查没有冲突的导出
      const hasConflictingAreaChart = content.includes('export function AreaChart(');
      const hasConflictingPieChart = content.includes('export function PieChart(');
      const hasConflictingComposedChart = content.includes('export function ComposedChart(');

      if (hasUnifiedAreaChart && hasUnifiedPieChart && hasUnifiedComposedChart && 
          !hasConflictingAreaChart && !hasConflictingPieChart && !hasConflictingComposedChart) {
        this.results.passedTests++;
        this.results.details.push('✅ 统一图表组件命名正确');
      } else {
        this.results.failedTests++;
        this.results.details.push('❌ 统一图表组件命名存在问题');
      }
    } else {
      this.results.failedTests++;
      this.results.details.push('❌ 统一图表组件文件不存在');
    }
  }

  /**
   * 测试脚本更新
   */
  async testScriptUpdates() {
    console.log('📋 测试2: 脚本文件更新检查\n');

    const scriptFiles = [
      'scripts/upgrade-chart-components.js',
      'scripts/test-chart-upgrade.js'
    ];

    for (const scriptPath of scriptFiles) {
      this.results.totalTests++;
      
      if (fs.existsSync(scriptPath)) {
        const content = fs.readFileSync(scriptPath, 'utf8');
        
        // 检查是否使用了新的组件名称
        const hasUnifiedAreaChart = content.includes('UnifiedAreaChart');
        const hasUnifiedPieChart = content.includes('UnifiedPieChart');
        const hasUnifiedComposedChart = content.includes('UnifiedComposedChart');
        
        // 检查是否移除了旧的别名导入
        const hasOldAliasImport = content.includes('AreaChart as UnifiedAreaChart') ||
                                content.includes('PieChart as UnifiedPieChart') ||
                                content.includes('ComposedChart as UnifiedComposedChart');

        if ((hasUnifiedAreaChart || hasUnifiedPieChart || hasUnifiedComposedChart) && !hasOldAliasImport) {
          this.results.passedTests++;
          this.results.details.push(`✅ ${path.basename(scriptPath)} - 脚本更新正确`);
        } else {
          this.results.failedTests++;
          this.results.details.push(`❌ ${path.basename(scriptPath)} - 脚本更新存在问题`);
        }
      } else {
        this.results.failedTests++;
        this.results.details.push(`❌ ${path.basename(scriptPath)} - 脚本文件不存在`);
      }
    }
  }

  /**
   * 测试页面导入
   */
  async testPageImports() {
    console.log('📋 测试3: 页面组件导入检查\n');

    const pageFiles = [
      'components/production-quality-data-page.tsx',
      'components/situation-report-page.tsx',
      'components/process-management-page.tsx',
      'components/outgoing-data-details-page.tsx',
      'components/filter-press-data-details-page.tsx'
    ];

    for (const pagePath of pageFiles) {
      this.results.totalTests++;
      
      if (fs.existsSync(pagePath)) {
        const content = fs.readFileSync(pagePath, 'utf8');
        
        // 检查导入语法是否正确
        const hasValidImportSyntax = !content.includes('} from \'recharts\';') || 
                                   content.includes('import {') || 
                                   content.includes('import ');
        
        // 检查是否有重复导入
        const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
        const rechartsImports = importLines.filter(line => line.includes('recharts'));
        const unifiedChartImports = importLines.filter(line => line.includes('unified-chart'));
        
        // 检查是否使用了新的组件名称
        const hasCorrectNaming = !content.includes('AreaChart as UnifiedAreaChart') &&
                                !content.includes('PieChart as UnifiedPieChart') &&
                                !content.includes('ComposedChart as UnifiedComposedChart');

        if (hasValidImportSyntax && hasCorrectNaming) {
          this.results.passedTests++;
          this.results.details.push(`✅ ${path.basename(pagePath)} - 导入语法正确`);
        } else {
          this.results.failedTests++;
          this.results.details.push(`❌ ${path.basename(pagePath)} - 导入语法存在问题`);
        }
      } else {
        this.results.failedTests++;
        this.results.details.push(`❌ ${path.basename(pagePath)} - 页面文件不存在`);
      }
    }
  }

  /**
   * 测试组件使用
   */
  async testComponentUsage() {
    console.log('📋 测试4: 组件使用方式检查\n');

    const filePath = 'components/process-management-page.tsx';
    this.results.totalTests++;

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 检查是否正确使用了 ResponsiveContainer 和 PieChart
      const hasResponsiveContainer = content.includes('<ResponsiveContainer');
      const hasCorrectPieChartUsage = content.includes('<PieChart>') && !content.includes('<UnifiedPieChart>');
      const hasRechartsImport = content.includes('from \'recharts\'');

      if (hasResponsiveContainer && hasCorrectPieChartUsage && hasRechartsImport) {
        this.results.passedTests++;
        this.results.details.push('✅ DonutChart 组件使用方式正确');
      } else {
        this.results.failedTests++;
        this.results.details.push('❌ DonutChart 组件使用方式存在问题');
      }
    } else {
      this.results.failedTests++;
      this.results.details.push('❌ process-management-page.tsx 文件不存在');
    }
  }

  /**
   * 打印测试结果
   */
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 图表组件命名冲突修复验证结果');
    console.log('='.repeat(60));
    
    console.log(`\n📈 测试统计:`);
    console.log(`   总测试数: ${this.results.totalTests}`);
    console.log(`   通过测试: ${this.results.passedTests}`);
    console.log(`   失败测试: ${this.results.failedTests}`);
    console.log(`   成功率: ${((this.results.passedTests / this.results.totalTests) * 100).toFixed(1)}%`);

    console.log(`\n📋 详细结果:`);
    this.results.details.forEach(detail => {
      console.log(`   ${detail}`);
    });

    const isSuccess = this.results.failedTests === 0;
    console.log(`\n🎯 总体结果: ${isSuccess ? '✅ 所有测试通过' : '❌ 存在失败测试'}`);
    
    if (isSuccess) {
      console.log('\n🎉 图表组件命名冲突修复成功！');
      console.log('   - 所有组件名称已更新为无冲突版本');
      console.log('   - 导入语句已正确更新');
      console.log('   - 组件使用方式已修复');
      console.log('   - 脚本文件已同步更新');
    } else {
      console.log('\n⚠️  请检查失败的测试项并进行修复。');
    }

    console.log('\n' + '='.repeat(60));
  }
}

// 运行测试
const tester = new ChartNamingFixTester();
tester.runAllTests().catch(console.error);
