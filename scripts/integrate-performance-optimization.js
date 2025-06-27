#!/usr/bin/env node

/**
 * 项目页面加载性能全面优化集成脚本
 * 
 * 功能：
 * 1. 扫描所有页面组件
 * 2. 自动集成PerformanceWrapper
 * 3. 添加性能优化hooks
 * 4. 验证集成效果
 */

const fs = require('fs');
const path = require('path');

class PerformanceIntegrator {
  constructor() {
    this.results = {
      scanned: 0,
      integrated: 0,
      skipped: 0,
      errors: 0,
      details: []
    };
    
    // 需要集成性能优化的页面组件
    this.targetComponents = [
      'components/manager-page.tsx',
      'components/boss-page.tsx',
      'components/cosplay-page.tsx',
      'components/data-table-center-page.tsx',
      'components/ball-mill-workshop-page.tsx',
      'components/filter-press-workshop-page.tsx',
      'components/weighbridge-data-page.tsx',
      'components/concentration-fineness-monitor-page.tsx',
      'components/filter-press-data-details-page.tsx',
      'components/incoming-data-details-new-page.tsx',
      'components/outgoing-data-details-page.tsx',
      'components/machine-running-details-page.tsx',
      'components/process-management-page.tsx',
      'components/production-control-page.tsx',
      'components/production-quality-data-page.tsx',
      'components/purchase-management-page.tsx',
      'components/purchase-request-page.tsx',
      'components/situation-management-page.tsx',
      'components/situation-report-page.tsx',
      'components/task-assignment-page.tsx',
      'components/task-notification-page.tsx'
    ];
  }

  /**
   * 执行性能优化集成
   */
  async integrate() {
    console.log('🚀 开始项目页面加载性能全面优化集成...\n');

    for (const componentPath of this.targetComponents) {
      await this.integrateComponent(componentPath);
    }

    this.generateReport();
  }

  /**
   * 集成单个组件的性能优化
   */
  async integrateComponent(componentPath) {
    this.results.scanned++;
    
    try {
      if (!fs.existsSync(componentPath)) {
        this.results.skipped++;
        this.results.details.push(`⚠️ 跳过: ${componentPath} (文件不存在)`);
        return;
      }

      const content = fs.readFileSync(componentPath, 'utf8');
      const componentName = path.basename(componentPath, '.tsx');
      
      // 检查是否已经集成了性能优化
      if (this.hasPerformanceOptimization(content)) {
        this.results.skipped++;
        this.results.details.push(`✅ 跳过: ${componentName} (已集成性能优化)`);
        return;
      }

      // 执行性能优化集成
      const optimizedContent = this.addPerformanceOptimization(content, componentName);
      
      // 写入优化后的内容
      fs.writeFileSync(componentPath, optimizedContent, 'utf8');
      
      this.results.integrated++;
      this.results.details.push(`🎯 集成: ${componentName} (性能优化已添加)`);
      
    } catch (error) {
      this.results.errors++;
      this.results.details.push(`❌ 错误: ${componentPath} - ${error.message}`);
    }
  }

  /**
   * 检查组件是否已经集成了性能优化
   */
  hasPerformanceOptimization(content) {
    return content.includes('PerformanceWrapper') ||
           content.includes('usePerformanceOptimization') ||
           content.includes('useRenderPerformance') ||
           content.includes('withPerformanceOptimization');
  }

  /**
   * 为组件添加性能优化
   */
  addPerformanceOptimization(content, componentName) {
    let optimizedContent = content;

    // 1. 添加性能优化相关的导入
    const performanceImports = `import { PerformanceWrapper, withPerformanceOptimization } from "@/components/performance-wrapper";
import { useRenderPerformance, useMemoryLeak, usePerformanceOptimization } from "@/hooks/use-performance-optimization";`;

    // 查找现有的导入语句位置
    const importRegex = /import.*from.*['"];?\s*$/gm;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 0) {
      // 在最后一个导入语句后添加性能优化导入
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertPosition = lastImportIndex + lastImport.length;
      
      optimizedContent = content.slice(0, insertPosition) + 
                        '\n' + performanceImports + 
                        content.slice(insertPosition);
    }

    // 2. 在组件内部添加性能监控hooks
    const hookCode = `
  // 性能监控
  const { renderCount } = useRenderPerformance('${componentName}');
  const { addTimer, addListener } = useMemoryLeak('${componentName}');
  const { metrics } = usePerformanceOptimization();`;

    // 查找组件函数的开始位置
    const componentFunctionRegex = /export\s+(default\s+)?function\s+\w+|export\s+const\s+\w+\s*=.*=>\s*{|function\s+\w+\s*\(/;
    const match = optimizedContent.match(componentFunctionRegex);
    
    if (match) {
      // 在组件函数内部的开始位置添加hooks
      const functionStart = optimizedContent.indexOf(match[0]);
      const openBraceIndex = optimizedContent.indexOf('{', functionStart);
      
      if (openBraceIndex !== -1) {
        optimizedContent = optimizedContent.slice(0, openBraceIndex + 1) +
                          hookCode +
                          optimizedContent.slice(openBraceIndex + 1);
      }
    }

    // 3. 用PerformanceWrapper包装返回的JSX
    const returnRegex = /return\s*\(/;
    const returnMatch = optimizedContent.match(returnRegex);
    
    if (returnMatch) {
      const returnIndex = optimizedContent.indexOf(returnMatch[0]);
      const openParenIndex = optimizedContent.indexOf('(', returnIndex);
      
      // 找到对应的闭合括号
      let parenCount = 1;
      let closeParenIndex = openParenIndex + 1;
      
      while (parenCount > 0 && closeParenIndex < optimizedContent.length) {
        if (optimizedContent[closeParenIndex] === '(') parenCount++;
        if (optimizedContent[closeParenIndex] === ')') parenCount--;
        closeParenIndex++;
      }
      
      if (parenCount === 0) {
        // 用PerformanceWrapper包装JSX内容
        const jsxContent = optimizedContent.slice(openParenIndex + 1, closeParenIndex - 1);
        const wrappedJsx = `(
    <PerformanceWrapper
      componentName="${componentName}"
      enableMonitoring={process.env.NODE_ENV === 'development'}
      enableMemoryTracking={true}
    >
      ${jsxContent.trim()}
    </PerformanceWrapper>
  )`;
        
        optimizedContent = optimizedContent.slice(0, openParenIndex) +
                          wrappedJsx +
                          optimizedContent.slice(closeParenIndex);
      }
    }

    return optimizedContent;
  }

  /**
   * 生成集成报告
   */
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 项目页面加载性能全面优化集成报告');
    console.log('='.repeat(80));
    
    console.log(`\n📈 总体统计:`);
    console.log(`   扫描组件: ${this.results.scanned}`);
    console.log(`   成功集成: ${this.results.integrated}`);
    console.log(`   跳过组件: ${this.results.skipped}`);
    console.log(`   错误数量: ${this.results.errors}`);
    console.log(`   成功率: ${((this.results.integrated / this.results.scanned) * 100).toFixed(1)}%`);

    console.log(`\n📋 详细结果:`);
    this.results.details.forEach(detail => {
      console.log(`   ${detail}`);
    });

    // 保存详细报告
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        scanned: this.results.scanned,
        integrated: this.results.integrated,
        skipped: this.results.skipped,
        errors: this.results.errors,
        successRate: ((this.results.integrated / this.results.scanned) * 100).toFixed(1)
      },
      details: this.results.details
    };

    if (!fs.existsSync('./test-results')) {
      fs.mkdirSync('./test-results');
    }

    fs.writeFileSync(
      './test-results/performance-integration-report.json',
      JSON.stringify(reportData, null, 2)
    );

    console.log(`\n📄 详细报告已保存到: ./test-results/performance-integration-report.json`);
    
    if (this.results.errors === 0) {
      console.log('\n🎉 性能优化集成完成！所有组件已成功优化！');
    } else {
      console.log('\n⚠️ 性能优化集成完成，但存在一些错误，请检查详细报告。');
    }
  }
}

// 执行集成
const integrator = new PerformanceIntegrator();
integrator.integrate().catch(console.error);
