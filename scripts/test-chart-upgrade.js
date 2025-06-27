#!/usr/bin/env node

/**
 * 趋势图类型数据图表组件统一升级测试脚本
 * 验证所有页面的图表组件升级效果
 */

const fs = require('fs');
const path = require('path');

class ChartUpgradeTester {
  constructor() {
    this.results = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      details: []
    };
    
    // 测试目标页面
    this.testPages = [
      'components/data-comparison-section.tsx',
      'components/production-quality-data-page.tsx',
      'components/outgoing-data-details-page.tsx',
      'components/filter-press-data-details-page.tsx',
      'components/machine-running-details-page.tsx',
      'components/concentration-fineness-monitor-page.tsx',
      'components/process-management-page.tsx',
      'components/situation-report-page.tsx'
    ];
  }

  /**
   * 运行所有测试
   */
  async run() {
    console.log('🧪 开始测试图表组件升级效果...\n');
    
    await this.testUnifiedChartComponent();
    await this.testChartUpgradeIntegration();
    await this.testChartFeatures();
    await this.testChartConfiguration();
    
    this.printResults();
  }

  /**
   * 测试统一图表组件
   */
  async testUnifiedChartComponent() {
    console.log('📋 测试1: 统一图表组件基础设施检查\n');

    const requiredFiles = [
      'components/ui/unified-chart.tsx'
    ];

    for (const filePath of requiredFiles) {
      this.results.totalTests++;
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // 检查核心组件
        const hasUnifiedChart = content.includes('export function UnifiedChart');
        const hasTrendLineChart = content.includes('export function TrendLineChart');
        const hasComparisonBarChart = content.includes('export function ComparisonBarChart');
        const hasAreaChart = content.includes('export function UnifiedAreaChart');
        const hasPieChart = content.includes('export function UnifiedPieChart');
        const hasComposedChart = content.includes('export function UnifiedComposedChart');
        
        // 检查工具函数
        const hasCreateChartConfig = content.includes('export function createChartConfig');
        const hasFormatChartData = content.includes('export function formatChartData');
        const hasCalculateTrend = content.includes('export function calculateTrend');
        
        const componentScore = [
          hasUnifiedChart, hasTrendLineChart, hasComparisonBarChart,
          hasAreaChart, hasPieChart, hasComposedChart,
          hasCreateChartConfig, hasFormatChartData, hasCalculateTrend
        ].filter(Boolean).length;
        
        if (componentScore >= 8) {
          this.results.passedTests++;
          this.results.details.push(`✅ 统一图表组件 - 组件完整 (${componentScore}/9)`);
        } else {
          this.results.failedTests++;
          this.results.details.push(`❌ 统一图表组件 - 组件不完整 (${componentScore}/9)`);
        }
      } else {
        this.results.failedTests++;
        this.results.details.push(`❌ ${filePath} - 文件不存在`);
      }
    }
  }

  /**
   * 测试图表升级集成
   */
  async testChartUpgradeIntegration() {
    console.log('\n📋 测试2: 页面图表升级集成检查\n');

    for (const pagePath of this.testPages) {
      this.results.totalTests++;
      
      if (fs.existsSync(pagePath)) {
        const content = fs.readFileSync(pagePath, 'utf8');
        const pageName = path.basename(pagePath, '.tsx');
        
        // 检查统一图表组件导入
        const hasUnifiedChartImport = content.includes('from "@/components/ui/unified-chart"');
        
        // 检查统一图表组件使用
        const hasUnifiedChartUsage = content.includes('UnifiedChart') ||
                                   content.includes('TrendLineChart') ||
                                   content.includes('ComparisonBarChart') ||
                                   content.includes('UnifiedAreaChart') ||
                                   content.includes('UnifiedPieChart');
        
        // 检查是否移除了旧的 recharts 导入
        const hasOldRechartsImport = content.includes('from \'recharts\'') || 
                                   content.includes('from "recharts"');
        
        const integrationScore = [hasUnifiedChartImport, hasUnifiedChartUsage, !hasOldRechartsImport].filter(Boolean).length;
        
        if (integrationScore >= 2) {
          this.results.passedTests++;
          this.results.details.push(`✅ ${pageName} - 图表升级集成完成 (${integrationScore}/3)`);
        } else {
          this.results.failedTests++;
          this.results.details.push(`❌ ${pageName} - 图表升级集成不完整 (${integrationScore}/3)`);
        }
      } else {
        this.results.failedTests++;
        this.results.details.push(`❌ ${pagePath} - 文件不存在`);
      }
    }
  }

  /**
   * 测试图表功能特性
   */
  async testChartFeatures() {
    console.log('\n📋 测试3: 图表功能特性检查\n');

    const unifiedChartPath = 'components/ui/unified-chart.tsx';
    
    if (fs.existsSync(unifiedChartPath)) {
      const content = fs.readFileSync(unifiedChartPath, 'utf8');
      
      const features = [
        { name: '图表类型支持', check: 'ChartType' },
        { name: '图表配置接口', check: 'ChartConfig' },
        { name: '数据点接口', check: 'DataPoint' },
        { name: '图表属性接口', check: 'UnifiedChartProps' },
        { name: '加载状态处理', check: 'isLoading' },
        { name: '错误状态处理', check: 'error' },
        { name: '响应式支持', check: 'ResponsiveContainer' },
        { name: '动画支持', check: 'animationDuration' },
        { name: '图表操作功能', check: 'showActions' },
        { name: '主题支持', check: 'theme' },
        { name: '图标映射', check: 'chartIcons' },
        { name: '默认颜色调色板', check: 'defaultColors' }
      ];

      for (const feature of features) {
        this.results.totalTests++;
        
        if (content.includes(feature.check)) {
          this.results.passedTests++;
          this.results.details.push(`✅ ${feature.name} - 功能完整`);
        } else {
          this.results.failedTests++;
          this.results.details.push(`❌ ${feature.name} - 功能缺失`);
        }
      }
    } else {
      this.results.failedTests++;
      this.results.details.push(`❌ ${unifiedChartPath} - 统一图表组件文件不存在`);
    }
  }

  /**
   * 测试图表配置功能
   */
  async testChartConfiguration() {
    console.log('\n📋 测试4: 图表配置功能检查\n');

    const unifiedChartPath = 'components/ui/unified-chart.tsx';
    
    if (fs.existsSync(unifiedChartPath)) {
      const content = fs.readFileSync(unifiedChartPath, 'utf8');
      
      const configFeatures = [
        { name: '图表配置生成', check: 'createChartConfig' },
        { name: '数据格式化', check: 'formatChartData' },
        { name: '趋势计算', check: 'calculateTrend' },
        { name: '预设图表组件', check: 'TrendLineChart' },
        { name: '对比图表组件', check: 'ComparisonBarChart' },
        { name: '面积图表组件', check: 'AreaChart' },
        { name: '饼图组件', check: 'PieChart' },
        { name: '组合图表组件', check: 'ComposedChart' }
      ];

      for (const feature of configFeatures) {
        this.results.totalTests++;
        
        if (content.includes(feature.check)) {
          this.results.passedTests++;
          this.results.details.push(`✅ ${feature.name} - 配置完整`);
        } else {
          this.results.failedTests++;
          this.results.details.push(`❌ ${feature.name} - 配置缺失`);
        }
      }
    }
  }

  /**
   * 打印测试结果
   */
  printResults() {
    console.log('\n======================================================================');
    console.log('📊 图表组件升级测试报告');
    console.log('======================================================================\n');

    console.log('📈 测试统计:');
    console.log(`   总测试数: ${this.results.totalTests}`);
    console.log(`   通过测试: ${this.results.passedTests}`);
    console.log(`   失败测试: ${this.results.failedTests}`);
    console.log(`   成功率: ${((this.results.passedTests / this.results.totalTests) * 100).toFixed(1)}%\n`);

    console.log('📋 详细测试结果:');
    this.results.details.forEach(detail => {
      console.log(`   ${detail}`);
    });

    if (this.results.passedTests === this.results.totalTests) {
      console.log('\n🎉 图表组件升级测试全部通过！');
      console.log('\n✨ 升级成果:');
      console.log('   • 统一的图表组件系统');
      console.log('   • 一致的视觉设计和交互体验');
      console.log('   • 内置加载和错误状态处理');
      console.log('   • 响应式设计和动画效果');
      console.log('   • 图表操作功能（刷新、导出、全屏）');
      console.log('   • 预设图表类型和配置工具');
      console.log('   • 趋势分析和数据格式化功能');
      console.log('   • 主题支持和颜色管理');
    } else {
      console.log('\n⚠️ 部分测试失败，请检查图表升级实现');
    }

    console.log('\n📚 使用指南:');
    console.log('   • 使用 TrendLineChart 显示趋势数据');
    console.log('   • 使用 ComparisonBarChart 进行数据对比');
    console.log('   • 使用 AreaChart 显示累积数据');
    console.log('   • 使用 PieChart 显示比例分布');
    console.log('   • 使用 ComposedChart 组合多种图表类型');
    console.log('   • 使用 createChartConfig 生成图表配置');
    console.log('   • 使用 formatChartData 格式化数据');
    console.log('   • 使用 calculateTrend 计算趋势指标');
  }
}

// 运行测试
if (require.main === module) {
  const tester = new ChartUpgradeTester();
  tester.run().catch(console.error);
}

module.exports = ChartUpgradeTester;
