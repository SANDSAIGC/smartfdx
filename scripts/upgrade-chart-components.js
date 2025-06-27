#!/usr/bin/env node

/**
 * 趋势图类型数据图表组件统一升级脚本
 * 自动将所有页面的图表组件升级为统一的图表系统
 */

const fs = require('fs');
const path = require('path');

class ChartComponentUpgrader {
  constructor() {
    this.results = {
      totalPages: 0,
      upgradedPages: 0,
      skippedPages: 0,
      errors: 0,
      details: []
    };
    
    // 需要升级图表的页面
    this.targetPages = [
      'components/data-comparison-section.tsx',
      'components/production-quality-data-page.tsx',
      'components/outgoing-data-details-page.tsx',
      'components/incoming-data-details-new-page.tsx',
      'components/filter-press-data-details-page.tsx',
      'components/machine-running-details-page.tsx',
      'components/concentration-fineness-monitor-page.tsx',
      'components/process-management-page.tsx',
      'components/situation-report-page.tsx',
      'components/lab-page.tsx'
    ];
  }

  /**
   * 运行图表组件升级
   */
  async run() {
    console.log('📊 开始趋势图类型数据图表组件统一升级...\n');
    
    for (const pagePath of this.targetPages) {
      await this.upgradePageCharts(pagePath);
    }
    
    this.printResults();
  }

  /**
   * 升级单个页面的图表组件
   */
  async upgradePageCharts(pagePath) {
    this.results.totalPages++;
    
    try {
      if (!fs.existsSync(pagePath)) {
        this.results.skippedPages++;
        this.results.details.push(`⏭️ ${pagePath} - 文件不存在，跳过`);
        return;
      }

      const content = fs.readFileSync(pagePath, 'utf8');
      const pageName = path.basename(pagePath, '.tsx');
      
      // 检查是否已经使用统一图表组件
      if (this.hasUnifiedCharts(content)) {
        this.results.skippedPages++;
        this.results.details.push(`✅ ${pageName} - 统一图表组件已存在`);
        return;
      }

      // 检查是否有需要升级的图表
      if (!this.hasChartsToUpgrade(content)) {
        this.results.skippedPages++;
        this.results.details.push(`⏭️ ${pageName} - 无需要升级的图表`);
        return;
      }

      // 升级图表组件
      const upgradedContent = this.upgradeChartComponents(content, pageName);
      
      // 写入文件
      fs.writeFileSync(pagePath, upgradedContent, 'utf8');
      
      this.results.upgradedPages++;
      this.results.details.push(`📊 ${pageName} - 图表组件已升级`);
      
    } catch (error) {
      this.results.errors++;
      this.results.details.push(`❌ 错误: ${pagePath} - ${error.message}`);
    }
  }

  /**
   * 检查是否已有统一图表组件
   */
  hasUnifiedCharts(content) {
    return content.includes('UnifiedChart') ||
           content.includes('TrendLineChart') ||
           content.includes('ComparisonBarChart') ||
           content.includes('from "@/components/ui/unified-chart"');
  }

  /**
   * 检查是否有需要升级的图表
   */
  hasChartsToUpgrade(content) {
    return content.includes('LineChart') ||
           content.includes('BarChart') ||
           content.includes('PieChart') ||
           content.includes('AreaChart') ||
           content.includes('from \'recharts\'') ||
           content.includes('from "recharts"') ||
           content.includes('ResponsiveContainer');
  }

  /**
   * 升级图表组件
   */
  upgradeChartComponents(content, pageName) {
    let upgradedContent = content;

    // 1. 添加统一图表组件导入
    const unifiedChartImports = `import {
  UnifiedChart,
  TrendLineChart,
  ComparisonBarChart,
  UnifiedAreaChart,
  UnifiedPieChart,
  UnifiedComposedChart,
  createChartConfig,
  formatChartData,
  calculateTrend
} from "@/components/ui/unified-chart";`;

    // 查找现有图表导入的位置
    const chartImportRegex = /import.*from.*["']recharts["'];?\s*$/gm;
    const chartImportMatch = upgradedContent.match(chartImportRegex);
    
    if (chartImportMatch) {
      // 替换 recharts 导入为统一图表导入
      upgradedContent = upgradedContent.replace(chartImportMatch[0], unifiedChartImports);
    } else {
      // 在其他UI组件导入后添加
      const uiImportRegex = /import.*from.*["']@\/components\/ui\/.*["'];?\s*$/gm;
      const lastUiImportMatch = [...upgradedContent.matchAll(uiImportRegex)].pop();
      
      if (lastUiImportMatch) {
        const insertPosition = lastUiImportMatch.index + lastUiImportMatch[0].length;
        upgradedContent = upgradedContent.slice(0, insertPosition) + 
                        '\n' + unifiedChartImports + 
                        upgradedContent.slice(insertPosition);
      }
    }

    // 2. 升级图表组件使用
    upgradedContent = this.upgradeChartUsage(upgradedContent, pageName);

    return upgradedContent;
  }

  /**
   * 升级图表使用方式
   */
  upgradeChartUsage(content, pageName) {
    let upgradedContent = content;

    // 升级 LineChart 为 TrendLineChart
    upgradedContent = this.upgradeLineChart(upgradedContent);

    // 升级 BarChart 为 ComparisonBarChart
    upgradedContent = this.upgradeBarChart(upgradedContent);

    // 升级 PieChart 为 UnifiedPieChart
    upgradedContent = this.upgradePieChart(upgradedContent);

    // 升级 AreaChart 为 UnifiedAreaChart
    upgradedContent = this.upgradeAreaChart(upgradedContent);

    // 移除不需要的 ResponsiveContainer 包装
    upgradedContent = this.removeResponsiveContainer(upgradedContent);

    return upgradedContent;
  }

  /**
   * 升级 LineChart
   */
  upgradeLineChart(content) {
    // 查找 LineChart 使用模式并替换为 TrendLineChart
    const lineChartPattern = /<ChartContainer[^>]*>[\s\S]*?<ResponsiveContainer[^>]*>[\s\S]*?<LineChart[\s\S]*?<\/LineChart>[\s\S]*?<\/ResponsiveContainer>[\s\S]*?<\/ChartContainer>/g;
    
    return content.replace(lineChartPattern, (match) => {
      // 提取数据和配置
      const dataMatch = match.match(/data=\{([^}]+)\}/);
      const configMatch = match.match(/config=\{([^}]+)\}/);
      
      if (dataMatch && configMatch) {
        return `<TrendLineChart
          data={${dataMatch[1]}}
          config={${configMatch[1]}}
          title="趋势分析"
          description="数据变化趋势图表"
          height={400}
          showActions={true}
        />`;
      }
      
      return match;
    });
  }

  /**
   * 升级 BarChart
   */
  upgradeBarChart(content) {
    const barChartPattern = /<BarChart[\s\S]*?<\/BarChart>/g;
    
    return content.replace(barChartPattern, (match) => {
      return match.replace('<BarChart', '<ComparisonBarChart')
                  .replace('</BarChart>', '</ComparisonBarChart>');
    });
  }

  /**
   * 升级 PieChart
   */
  upgradePieChart(content) {
    const pieChartPattern = /<PieChart[\s\S]*?<\/PieChart>/g;
    
    return content.replace(pieChartPattern, (match) => {
      return match.replace('<PieChart', '<UnifiedPieChart')
                  .replace('</PieChart>', '</UnifiedPieChart>');
    });
  }

  /**
   * 升级 AreaChart
   */
  upgradeAreaChart(content) {
    const areaChartPattern = /<AreaChart[\s\S]*?<\/AreaChart>/g;
    
    return content.replace(areaChartPattern, (match) => {
      return match.replace('<AreaChart', '<UnifiedAreaChart')
                  .replace('</AreaChart>', '</UnifiedAreaChart>');
    });
  }

  /**
   * 移除不需要的 ResponsiveContainer
   */
  removeResponsiveContainer(content) {
    // 移除单独的 ResponsiveContainer 包装，因为统一图表组件内部已处理
    return content.replace(/<ResponsiveContainer[^>]*>[\s\S]*?<\/ResponsiveContainer>/g, (match) => {
      // 如果内部是统一图表组件，则移除 ResponsiveContainer
      if (match.includes('TrendLineChart') || 
          match.includes('ComparisonBarChart') ||
          match.includes('UnifiedPieChart') ||
          match.includes('UnifiedAreaChart')) {
        return match.replace(/<ResponsiveContainer[^>]*>/, '')
                   .replace(/<\/ResponsiveContainer>/, '');
      }
      return match;
    });
  }

  /**
   * 打印结果
   */
  printResults() {
    console.log('\n======================================================================');
    console.log('📊 趋势图类型数据图表组件统一升级报告');
    console.log('======================================================================\n');

    console.log('📈 处理统计:');
    console.log(`   总页面数: ${this.results.totalPages}`);
    console.log(`   升级页面: ${this.results.upgradedPages}`);
    console.log(`   跳过页面: ${this.results.skippedPages}`);
    console.log(`   错误数量: ${this.results.errors}`);
    console.log(`   成功率: ${((this.results.upgradedPages / this.results.totalPages) * 100).toFixed(1)}%\n`);

    console.log('📋 详细结果:');
    this.results.details.forEach(detail => {
      console.log(`   ${detail}`);
    });

    if (this.results.upgradedPages > 0) {
      console.log('\n🎉 图表组件统一升级完成！');
      console.log('\n✨ 升级效果:');
      console.log('   • 统一的图表组件系统');
      console.log('   • 一致的视觉设计和交互');
      console.log('   • 内置加载和错误状态');
      console.log('   • 响应式设计支持');
      console.log('   • 动画效果增强');
      console.log('   • 图表操作功能（刷新、导出、全屏）');
      console.log('   • 预设图表类型（趋势、对比、面积、饼图）');
      console.log('   • 图表配置和数据格式化工具');
    }

    if (this.results.errors > 0) {
      console.log('\n⚠️ 部分页面升级失败，请检查错误信息');
    }
  }
}

// 运行脚本
if (require.main === module) {
  const upgrader = new ChartComponentUpgrader();
  upgrader.run().catch(console.error);
}

module.exports = ChartComponentUpgrader;
