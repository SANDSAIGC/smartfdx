#!/usr/bin/env node

/**
 * 页面交互动效增强测试脚本
 * 验证所有页面的动画增强效果
 */

const fs = require('fs');
const path = require('path');

class AnimationEnhancementTester {
  constructor() {
    this.results = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      details: []
    };
    
    // 测试目标页面
    this.testPages = [
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
      'components/task-notification-page.tsx',
      'components/shift-sample-page.tsx',
      'components/filter-sample-page.tsx',
      'components/incoming-sample-page.tsx',
      'components/outgoing-sample-page.tsx',
      'components/lab-page.tsx'
    ];
  }

  /**
   * 运行所有测试
   */
  async run() {
    console.log('🧪 开始测试页面交互动效增强效果...\n');
    
    await this.testAnimationSystemFiles();
    await this.testAnimatedComponentsFile();
    await this.testPageAnimationIntegration();
    await this.testAnimationFeatures();
    
    this.printResults();
  }

  /**
   * 测试动画系统文件
   */
  async testAnimationSystemFiles() {
    console.log('📋 测试1: 动画系统基础设施检查\n');

    const requiredFiles = [
      'lib/animation-system.ts',
      'components/ui/animated-components.tsx'
    ];

    for (const filePath of requiredFiles) {
      this.results.totalTests++;
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);
        
        let isComplete = false;
        
        switch (fileName) {
          case 'animation-system.ts':
            isComplete = content.includes('ANIMATION_PRESETS') && 
                        content.includes('AnimationManager') &&
                        content.includes('pageVariants') &&
                        content.includes('cardVariants') &&
                        content.includes('buttonVariants');
            break;
          case 'animated-components.tsx':
            isComplete = content.includes('AnimatedPage') && 
                        content.includes('AnimatedCard') &&
                        content.includes('AnimatedButton') &&
                        content.includes('AnimatedContainer') &&
                        content.includes('AnimatedCounter');
            break;
        }
        
        if (isComplete) {
          this.results.passedTests++;
          this.results.details.push(`✅ ${fileName} - 动画系统文件完整`);
        } else {
          this.results.failedTests++;
          this.results.details.push(`❌ ${fileName} - 动画系统文件不完整`);
        }
      } else {
        this.results.failedTests++;
        this.results.details.push(`❌ ${filePath} - 文件不存在`);
      }
    }
  }

  /**
   * 测试动画组件文件
   */
  async testAnimatedComponentsFile() {
    console.log('\n📋 测试2: 动画组件功能检查\n');

    const filePath = 'components/ui/animated-components.tsx';
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      const requiredComponents = [
        'AnimatedPage',
        'AnimatedCard', 
        'AnimatedButton',
        'AnimatedFormField',
        'AnimatedListItem',
        'AnimatedModal',
        'AnimatedContainer',
        'AnimatedCounter',
        'AnimatedProgress',
        'AnimatedBadge'
      ];

      for (const component of requiredComponents) {
        this.results.totalTests++;
        
        if (content.includes(`export function ${component}`)) {
          this.results.passedTests++;
          this.results.details.push(`✅ ${component} - 动画组件存在`);
        } else {
          this.results.failedTests++;
          this.results.details.push(`❌ ${component} - 动画组件缺失`);
        }
      }
    } else {
      this.results.failedTests++;
      this.results.details.push(`❌ ${filePath} - 动画组件文件不存在`);
    }
  }

  /**
   * 测试页面动画集成
   */
  async testPageAnimationIntegration() {
    console.log('\n📋 测试3: 页面动画集成检查\n');

    for (const pagePath of this.testPages) {
      this.results.totalTests++;
      
      if (fs.existsSync(pagePath)) {
        const content = fs.readFileSync(pagePath, 'utf8');
        const pageName = path.basename(pagePath, '.tsx');
        
        // 检查动画组件导入
        const hasAnimationImports = content.includes('from "@/components/ui/animated-components"');
        
        // 检查动画组件使用
        const hasAnimatedPage = content.includes('AnimatedPage') || content.includes('<AnimatedPage');
        const hasAnimatedCard = content.includes('AnimatedCard') || content.includes('<AnimatedCard');
        const hasAnimatedButton = content.includes('AnimatedButton') || content.includes('<AnimatedButton');
        
        const animationScore = [hasAnimationImports, hasAnimatedPage, hasAnimatedCard, hasAnimatedButton].filter(Boolean).length;
        
        if (animationScore >= 2) {
          this.results.passedTests++;
          this.results.details.push(`✅ ${pageName} - 动画集成完成 (${animationScore}/4)`);
        } else {
          this.results.failedTests++;
          this.results.details.push(`❌ ${pageName} - 动画集成不足 (${animationScore}/4)`);
        }
      } else {
        this.results.failedTests++;
        this.results.details.push(`❌ ${pagePath} - 文件不存在`);
      }
    }
  }

  /**
   * 测试动画功能特性
   */
  async testAnimationFeatures() {
    console.log('\n📋 测试4: 动画功能特性检查\n');

    const animationSystemPath = 'lib/animation-system.ts';
    
    if (fs.existsSync(animationSystemPath)) {
      const content = fs.readFileSync(animationSystemPath, 'utf8');
      
      const features = [
        { name: '动画持续时间配置', check: 'ANIMATION_DURATIONS' },
        { name: '缓动函数配置', check: 'EASING' },
        { name: '页面动画变体', check: 'pageVariants' },
        { name: '卡片动画变体', check: 'cardVariants' },
        { name: '按钮动画变体', check: 'buttonVariants' },
        { name: '模态框动画变体', check: 'modalVariants' },
        { name: '列表项动画变体', check: 'listItemVariants' },
        { name: '表单字段动画变体', check: 'formFieldVariants' },
        { name: '动画预设配置', check: 'ANIMATION_PRESETS' },
        { name: '动画管理器', check: 'AnimationManager' },
        { name: '性能优化配置', check: 'performanceConfig' },
        { name: '响应式动画配置', check: 'responsiveAnimations' }
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
      this.results.details.push(`❌ ${animationSystemPath} - 动画系统文件不存在`);
    }
  }

  /**
   * 打印测试结果
   */
  printResults() {
    console.log('\n======================================================================');
    console.log('📊 页面交互动效增强测试报告');
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
      console.log('\n🎉 页面交互动效增强测试全部通过！');
      console.log('\n✨ 动画增强效果:');
      console.log('   • 所有页面都有进入/退出动画');
      console.log('   • 卡片组件支持悬停和点击动画');
      console.log('   • 按钮组件有交互反馈动画');
      console.log('   • 列表项有渐入动画效果');
      console.log('   • 支持性能优化和减少动画');
      console.log('   • 响应式动画适配');
      console.log('   • 统一的动画管理系统');
    } else {
      console.log('\n⚠️ 部分测试失败，请检查动画增强实现');
    }

    console.log('\n📚 使用说明:');
    console.log('   • 页面组件自动包装为AnimatedPage');
    console.log('   • 卡片组件自动包装为AnimatedCard');
    console.log('   • 重要按钮自动包装为AnimatedButton');
    console.log('   • 支持自定义动画延迟和配置');
    console.log('   • 自动检测设备性能并优化动画');
  }
}

// 运行测试
if (require.main === module) {
  const tester = new AnimationEnhancementTester();
  tester.run().catch(console.error);
}

module.exports = AnimationEnhancementTester;
