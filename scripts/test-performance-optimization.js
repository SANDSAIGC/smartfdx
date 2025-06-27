#!/usr/bin/env node

/**
 * 项目页面加载性能全面优化验证测试脚本
 * 
 * 功能：
 * 1. 验证性能优化组件集成
 * 2. 检查性能监控hooks使用
 * 3. 测试PerformanceWrapper包装
 * 4. 验证性能优化配置
 */

const fs = require('fs');
const path = require('path');

class PerformanceOptimizationTester {
  constructor() {
    this.results = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      details: []
    };
    
    // 测试目标组件
    this.testComponents = [
      'components/manager-page.tsx',
      'components/boss-page.tsx',
      'components/lab-page.tsx',
      'components/auth-guard.tsx',
      'components/shift-sample-page.tsx',
      'components/filter-sample-page.tsx',
      'components/incoming-sample-page.tsx',
      'components/outgoing-sample-page.tsx',
      'components/production-control-page.tsx',
      'components/task-notification-page.tsx'
    ];

    // 性能优化基础设施文件
    this.infrastructureFiles = [
      'lib/performance-optimizer.ts',
      'hooks/use-performance-optimization.ts',
      'components/performance-wrapper.tsx',
      'lib/data-cache.ts',
      'components/loading-transition.tsx'
    ];
  }

  /**
   * 执行性能优化验证测试
   */
  async runTests() {
    console.log('🚀 开始项目页面加载性能全面优化验证测试...\n');

    // 测试1: 基础设施文件检查
    await this.testInfrastructureFiles();

    // 测试2: 组件性能优化集成检查
    await this.testComponentIntegration();

    // 测试3: 性能监控hooks使用检查
    await this.testPerformanceHooks();

    // 测试4: PerformanceWrapper包装检查
    await this.testPerformanceWrapper();

    // 测试5: 加载组件优化检查
    await this.testLoadingComponents();

    this.generateReport();
  }

  /**
   * 测试基础设施文件
   */
  async testInfrastructureFiles() {
    console.log('📋 测试1: 性能优化基础设施文件检查\n');

    for (const filePath of this.infrastructureFiles) {
      this.results.totalTests++;
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);
        
        // 检查文件内容完整性
        let isComplete = false;
        
        switch (fileName) {
          case 'performance-optimizer.ts':
            isComplete = content.includes('PerformanceOptimizer') && 
                        content.includes('preloadCriticalComponents') &&
                        content.includes('getPerformanceReport');
            break;
          case 'use-performance-optimization.ts':
            isComplete = content.includes('useRenderPerformance') && 
                        content.includes('useMemoryLeak') &&
                        content.includes('usePerformanceOptimization');
            break;
          case 'performance-wrapper.tsx':
            isComplete = content.includes('PerformanceWrapper') && 
                        content.includes('withPerformanceOptimization') &&
                        content.includes('PerformanceMonitorWrapper');
            break;
          case 'data-cache.ts':
            isComplete = content.includes('DataCache') && 
                        content.includes('withCache') &&
                        content.includes('dataCache');
            break;
          case 'loading-transition.tsx':
            isComplete = content.includes('LoadingTransition') && 
                        content.includes('SkeletonLoading') &&
                        content.includes('useLoadingTransition');
            break;
        }
        
        if (isComplete) {
          this.results.passedTests++;
          this.results.details.push(`✅ ${fileName} - 基础设施文件完整`);
        } else {
          this.results.failedTests++;
          this.results.details.push(`❌ ${fileName} - 基础设施文件不完整`);
        }
      } else {
        this.results.failedTests++;
        this.results.details.push(`❌ ${filePath} - 文件不存在`);
      }
    }
  }

  /**
   * 测试组件性能优化集成
   */
  async testComponentIntegration() {
    console.log('\n📋 测试2: 组件性能优化集成检查\n');

    for (const componentPath of this.testComponents) {
      this.results.totalTests++;
      
      if (fs.existsSync(componentPath)) {
        const content = fs.readFileSync(componentPath, 'utf8');
        const componentName = path.basename(componentPath, '.tsx');
        
        // 检查性能优化导入
        const hasPerformanceImports = content.includes('PerformanceWrapper') ||
                                     content.includes('useRenderPerformance') ||
                                     content.includes('usePerformanceOptimization');
        
        if (hasPerformanceImports) {
          this.results.passedTests++;
          this.results.details.push(`✅ ${componentName} - 性能优化已集成`);
        } else {
          this.results.failedTests++;
          this.results.details.push(`❌ ${componentName} - 性能优化未集成`);
        }
      } else {
        this.results.failedTests++;
        this.results.details.push(`❌ ${componentPath} - 文件不存在`);
      }
    }
  }

  /**
   * 测试性能监控hooks使用
   */
  async testPerformanceHooks() {
    console.log('\n📋 测试3: 性能监控hooks使用检查\n');

    for (const componentPath of this.testComponents) {
      this.results.totalTests++;
      
      if (fs.existsSync(componentPath)) {
        const content = fs.readFileSync(componentPath, 'utf8');
        const componentName = path.basename(componentPath, '.tsx');
        
        // 检查hooks使用
        const hasRenderPerformance = content.includes('useRenderPerformance');
        const hasMemoryLeak = content.includes('useMemoryLeak');
        const hasPerformanceOptimization = content.includes('usePerformanceOptimization');
        
        const hookCount = [hasRenderPerformance, hasMemoryLeak, hasPerformanceOptimization].filter(Boolean).length;
        
        if (hookCount >= 2) {
          this.results.passedTests++;
          this.results.details.push(`✅ ${componentName} - 性能监控hooks使用充分 (${hookCount}/3)`);
        } else if (hookCount >= 1) {
          this.results.passedTests++;
          this.results.details.push(`⚠️ ${componentName} - 性能监控hooks使用部分 (${hookCount}/3)`);
        } else {
          this.results.failedTests++;
          this.results.details.push(`❌ ${componentName} - 性能监控hooks未使用`);
        }
      } else {
        this.results.failedTests++;
        this.results.details.push(`❌ ${componentPath} - 文件不存在`);
      }
    }
  }

  /**
   * 测试PerformanceWrapper包装
   */
  async testPerformanceWrapper() {
    console.log('\n📋 测试4: PerformanceWrapper包装检查\n');

    for (const componentPath of this.testComponents) {
      this.results.totalTests++;
      
      if (fs.existsSync(componentPath)) {
        const content = fs.readFileSync(componentPath, 'utf8');
        const componentName = path.basename(componentPath, '.tsx');
        
        // 检查PerformanceWrapper使用
        const hasPerformanceWrapper = content.includes('<PerformanceWrapper') ||
                                     content.includes('withPerformanceOptimization');
        
        if (hasPerformanceWrapper) {
          this.results.passedTests++;
          this.results.details.push(`✅ ${componentName} - PerformanceWrapper已包装`);
        } else {
          this.results.failedTests++;
          this.results.details.push(`❌ ${componentName} - PerformanceWrapper未包装`);
        }
      } else {
        this.results.failedTests++;
        this.results.details.push(`❌ ${componentPath} - 文件不存在`);
      }
    }
  }

  /**
   * 测试加载组件优化
   */
  async testLoadingComponents() {
    console.log('\n📋 测试5: 加载组件优化检查\n');

    for (const componentPath of this.testComponents) {
      this.results.totalTests++;
      
      if (fs.existsSync(componentPath)) {
        const content = fs.readFileSync(componentPath, 'utf8');
        const componentName = path.basename(componentPath, '.tsx');
        
        // 检查加载组件使用
        const hasLoadingTransition = content.includes('LoadingTransition') ||
                                    content.includes('SkeletonLoading') ||
                                    content.includes('AuthLoading') ||
                                    content.includes('DataLoading');
        
        if (hasLoadingTransition) {
          this.results.passedTests++;
          this.results.details.push(`✅ ${componentName} - 统一加载组件已使用`);
        } else {
          this.results.failedTests++;
          this.results.details.push(`❌ ${componentName} - 统一加载组件未使用`);
        }
      } else {
        this.results.failedTests++;
        this.results.details.push(`❌ ${componentPath} - 文件不存在`);
      }
    }
  }

  /**
   * 生成测试报告
   */
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 项目页面加载性能全面优化验证测试报告');
    console.log('='.repeat(80));
    
    console.log(`\n📈 总体统计:`);
    console.log(`   总测试数: ${this.results.totalTests}`);
    console.log(`   通过测试: ${this.results.passedTests}`);
    console.log(`   失败测试: ${this.results.failedTests}`);
    console.log(`   成功率: ${((this.results.passedTests / this.results.totalTests) * 100).toFixed(1)}%`);

    console.log(`\n📋 详细结果:`);
    this.results.details.forEach(detail => {
      console.log(`   ${detail}`);
    });

    // 保存详细报告
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.results.totalTests,
        passedTests: this.results.passedTests,
        failedTests: this.results.failedTests,
        successRate: ((this.results.passedTests / this.results.totalTests) * 100).toFixed(1)
      },
      details: this.results.details
    };

    if (!fs.existsSync('./test-results')) {
      fs.mkdirSync('./test-results');
    }

    fs.writeFileSync(
      './test-results/performance-optimization-test-report.json',
      JSON.stringify(reportData, null, 2)
    );

    console.log(`\n📄 详细测试报告已保存到: ./test-results/performance-optimization-test-report.json`);
    
    if (this.results.failedTests === 0) {
      console.log('\n🎉 所有测试通过！性能优化已成功集成！');
      console.log('✨ 项目现在具备全面的页面加载性能优化能力');
    } else {
      console.log('\n⚠️ 部分测试失败，请检查详细报告并修复问题。');
    }
  }
}

// 执行测试
const tester = new PerformanceOptimizationTester();
tester.runTests().catch(console.error);
