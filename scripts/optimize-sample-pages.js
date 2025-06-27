#!/usr/bin/env node

/**
 * 批量为样本记录页面添加性能优化
 */

const fs = require('fs');
const path = require('path');

class SamplePageOptimizer {
  constructor() {
    this.targetPages = [
      'components/incoming-sample-page.tsx',
      'components/outgoing-sample-page.tsx'
    ];
    
    this.results = {
      processed: 0,
      success: 0,
      errors: 0,
      details: []
    };
  }

  async optimize() {
    console.log('🚀 开始批量优化样本记录页面性能...\n');

    for (const pagePath of this.targetPages) {
      await this.optimizePage(pagePath);
    }

    this.generateReport();
  }

  async optimizePage(pagePath) {
    this.results.processed++;
    
    try {
      if (!fs.existsSync(pagePath)) {
        this.results.errors++;
        this.results.details.push(`❌ 文件不存在: ${pagePath}`);
        return;
      }

      const content = fs.readFileSync(pagePath, 'utf8');
      const pageName = path.basename(pagePath, '.tsx');
      
      // 检查是否已经优化
      if (content.includes('PerformanceWrapper')) {
        this.results.details.push(`⚠️ 跳过: ${pageName} (已优化)`);
        return;
      }

      // 执行优化
      const optimizedContent = this.addPerformanceOptimization(content, pageName);
      
      // 写入文件
      fs.writeFileSync(pagePath, optimizedContent, 'utf8');
      
      this.results.success++;
      this.results.details.push(`✅ 优化完成: ${pageName}`);
      
    } catch (error) {
      this.results.errors++;
      this.results.details.push(`❌ 优化失败: ${pagePath} - ${error.message}`);
    }
  }

  addPerformanceOptimization(content, pageName) {
    let optimizedContent = content;

    // 1. 添加性能优化导入
    const performanceImports = `import { PerformanceWrapper, withPerformanceOptimization } from "@/components/performance-wrapper";
import { useRenderPerformance, useMemoryLeak, usePerformanceOptimization } from "@/hooks/use-performance-optimization";
import { LoadingTransition, SkeletonLoading } from "@/components/loading-transition";`;

    // 在FooterSignature导入后添加性能优化导入
    const footerImportRegex = /import { FooterSignature } from "@\/components\/ui\/footer-signature";/;
    if (footerImportRegex.test(optimizedContent)) {
      optimizedContent = optimizedContent.replace(
        footerImportRegex,
        `import { FooterSignature } from "@/components/ui/footer-signature";
${performanceImports}`
      );
    }

    // 2. 添加性能监控hooks
    const componentName = pageName.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');

    const hookCode = `
  // 性能监控
  const { renderCount } = useRenderPerformance('${componentName}');
  const { addTimer, addListener } = useMemoryLeak('${componentName}');
  const { metrics } = usePerformanceOptimization();
`;

    // 在状态管理注释前添加性能监控hooks
    const stateManagementRegex = /(\s+)\/\/ 状态管理/;
    if (stateManagementRegex.test(optimizedContent)) {
      optimizedContent = optimizedContent.replace(
        stateManagementRegex,
        `${hookCode}
$1// 状态管理`
      );
    }

    // 3. 添加PerformanceWrapper包装
    const returnRegex = /(\s+)return \(\s*\n(\s+)<div className="min-h-screen bg-background">/;
    if (returnRegex.test(optimizedContent)) {
      optimizedContent = optimizedContent.replace(
        returnRegex,
        `$1return (
$1  <PerformanceWrapper
$1    componentName="${componentName}"
$1    enableMonitoring={process.env.NODE_ENV === 'development'}
$1    enableMemoryTracking={true}
$1  >
$2  <div className="min-h-screen bg-background">`
      );
    }

    // 4. 添加闭合标签
    const endDivRegex = /(\s+)<\/div>\s*\n(\s+)\);\s*\n(\s*}\);)/;
    if (endDivRegex.test(optimizedContent)) {
      optimizedContent = optimizedContent.replace(
        endDivRegex,
        `$1  </div>
$1</PerformanceWrapper>
$2);
$3`
      );
    }

    return optimizedContent;
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 样本记录页面性能优化报告');
    console.log('='.repeat(60));
    
    console.log(`\n📈 统计结果:`);
    console.log(`   处理页面: ${this.results.processed}`);
    console.log(`   成功优化: ${this.results.success}`);
    console.log(`   错误数量: ${this.results.errors}`);
    console.log(`   成功率: ${((this.results.success / this.results.processed) * 100).toFixed(1)}%`);

    console.log(`\n📋 详细结果:`);
    this.results.details.forEach(detail => {
      console.log(`   ${detail}`);
    });

    if (this.results.errors === 0) {
      console.log('\n🎉 所有样本记录页面性能优化完成！');
    } else {
      console.log('\n⚠️ 部分页面优化失败，请检查错误信息。');
    }
  }
}

// 执行优化
const optimizer = new SamplePageOptimizer();
optimizer.optimize().catch(console.error);
