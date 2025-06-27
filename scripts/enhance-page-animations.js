#!/usr/bin/env node

/**
 * 页面交互动效全面强化脚本
 * 自动为所有页面组件添加动画增强
 */

const fs = require('fs');
const path = require('path');

class PageAnimationEnhancer {
  constructor() {
    this.results = {
      totalPages: 0,
      enhancedPages: 0,
      skippedPages: 0,
      errors: 0,
      details: []
    };
    
    // 目标页面组件
    this.targetPages = [
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
   * 运行动画增强
   */
  async run() {
    console.log('🎬 开始页面交互动效全面强化...\n');
    
    for (const pagePath of this.targetPages) {
      await this.enhancePageAnimations(pagePath);
    }
    
    this.printResults();
  }

  /**
   * 增强单个页面的动画效果
   */
  async enhancePageAnimations(pagePath) {
    this.results.totalPages++;
    
    try {
      if (!fs.existsSync(pagePath)) {
        this.results.skippedPages++;
        this.results.details.push(`⏭️ ${pagePath} - 文件不存在，跳过`);
        return;
      }

      const content = fs.readFileSync(pagePath, 'utf8');
      const pageName = path.basename(pagePath, '.tsx');
      
      // 检查是否已经有动画增强
      if (this.hasAnimationEnhancement(content)) {
        this.results.skippedPages++;
        this.results.details.push(`✅ ${pageName} - 动画增强已存在`);
        return;
      }

      // 添加动画增强
      const enhancedContent = this.addAnimationEnhancement(content, pageName);
      
      // 写入文件
      fs.writeFileSync(pagePath, enhancedContent, 'utf8');
      
      this.results.enhancedPages++;
      this.results.details.push(`🎬 ${pageName} - 动画增强已添加`);
      
    } catch (error) {
      this.results.errors++;
      this.results.details.push(`❌ 错误: ${pagePath} - ${error.message}`);
    }
  }

  /**
   * 检查是否已有动画增强
   */
  hasAnimationEnhancement(content) {
    return content.includes('AnimatedPage') ||
           content.includes('AnimatedCard') ||
           content.includes('AnimatedContainer') ||
           content.includes('from "@/components/ui/animated-components"');
  }

  /**
   * 添加动画增强
   */
  addAnimationEnhancement(content, pageName) {
    let enhancedContent = content;

    // 1. 添加动画组件导入
    const animationImports = `import { 
  AnimatedPage, 
  AnimatedCard, 
  AnimatedContainer, 
  AnimatedButton,
  AnimatedListItem,
  AnimatedCounter,
  AnimatedProgress,
  AnimatedBadge
} from "@/components/ui/animated-components";`;

    // 查找现有导入的位置
    const importRegex = /import.*from.*["']@\/components\/ui\/.*["'];?\s*$/gm;
    const lastImportMatch = [...enhancedContent.matchAll(importRegex)].pop();
    
    if (lastImportMatch) {
      const insertPosition = lastImportMatch.index + lastImportMatch[0].length;
      enhancedContent = enhancedContent.slice(0, insertPosition) + 
                      '\n' + animationImports + 
                      enhancedContent.slice(insertPosition);
    } else {
      // 如果没有找到UI组件导入，在第一个导入后添加
      const firstImportRegex = /import.*from.*["'].*["'];?\s*$/m;
      const firstImportMatch = enhancedContent.match(firstImportRegex);
      if (firstImportMatch) {
        const insertPosition = firstImportMatch.index + firstImportMatch[0].length;
        enhancedContent = enhancedContent.slice(0, insertPosition) + 
                        '\n' + animationImports + 
                        enhancedContent.slice(insertPosition);
      }
    }

    // 2. 包装主要内容区域为AnimatedPage
    enhancedContent = this.wrapWithAnimatedPage(enhancedContent);

    // 3. 增强卡片组件
    enhancedContent = this.enhanceCards(enhancedContent);

    // 4. 增强按钮组件
    enhancedContent = this.enhanceButtons(enhancedContent);

    // 5. 增强列表项
    enhancedContent = this.enhanceListItems(enhancedContent);

    return enhancedContent;
  }

  /**
   * 包装主要内容为AnimatedPage
   */
  wrapWithAnimatedPage(content) {
    // 查找主要的div容器（通常是min-h-screen的容器）
    const mainContainerRegex = /<div className="min-h-screen[^"]*">/;
    const match = content.match(mainContainerRegex);
    
    if (match) {
      const replacement = match[0].replace('<div', '<AnimatedPage');
      content = content.replace(match[0], replacement);
      
      // 找到对应的结束标签并替换
      const closingDivRegex = /<\/div>\s*<\/PerformanceWrapper>/;
      content = content.replace(closingDivRegex, '</AnimatedPage>\n    </PerformanceWrapper>');
    }
    
    return content;
  }

  /**
   * 增强卡片组件
   */
  enhanceCards(content) {
    // 查找Card组件并包装为AnimatedCard
    const cardRegex = /<Card(\s+[^>]*)?>[\s\S]*?<\/Card>/g;
    let cardIndex = 0;
    
    return content.replace(cardRegex, (match) => {
      if (match.includes('AnimatedCard')) {
        return match; // 已经是动画卡片
      }
      
      const delay = cardIndex * 0.1;
      cardIndex++;
      
      return match
        .replace('<Card', `<AnimatedCard delay={${delay}}`)
        .replace('</Card>', '</AnimatedCard>');
    });
  }

  /**
   * 增强按钮组件
   */
  enhanceButtons(content) {
    // 查找重要的按钮并包装为AnimatedButton
    const buttonRegex = /<Button(\s+[^>]*)?>/g;
    
    return content.replace(buttonRegex, (match) => {
      if (match.includes('AnimatedButton') || 
          match.includes('variant="ghost"') ||
          match.includes('size="sm"')) {
        return match; // 跳过小按钮和已经是动画按钮的
      }
      
      return match.replace('<Button', '<AnimatedButton');
    });
  }

  /**
   * 增强列表项
   */
  enhanceListItems(content) {
    // 查找列表项模式并包装为AnimatedListItem
    const listItemPatterns = [
      /<div className="[^"]*grid[^"]*">/g,
      /<div className="[^"]*space-y[^"]*">/g
    ];
    
    listItemPatterns.forEach(pattern => {
      let itemIndex = 0;
      content = content.replace(pattern, (match) => {
        if (match.includes('AnimatedListItem')) {
          return match;
        }
        
        const index = itemIndex++;
        return match.replace('<div', `<AnimatedListItem index={${index}}`);
      });
    });
    
    return content;
  }

  /**
   * 打印结果
   */
  printResults() {
    console.log('\n======================================================================');
    console.log('📊 页面交互动效强化报告');
    console.log('======================================================================\n');

    console.log('📈 处理统计:');
    console.log(`   总页面数: ${this.results.totalPages}`);
    console.log(`   增强页面: ${this.results.enhancedPages}`);
    console.log(`   跳过页面: ${this.results.skippedPages}`);
    console.log(`   错误数量: ${this.results.errors}`);
    console.log(`   成功率: ${((this.results.enhancedPages / this.results.totalPages) * 100).toFixed(1)}%\n`);

    console.log('📋 详细结果:');
    this.results.details.forEach(detail => {
      console.log(`   ${detail}`);
    });

    if (this.results.enhancedPages > 0) {
      console.log('\n🎉 页面交互动效强化完成！');
      console.log('\n✨ 增强效果:');
      console.log('   • 页面进入/退出动画');
      console.log('   • 卡片悬停和点击动画');
      console.log('   • 按钮交互动画');
      console.log('   • 列表项渐入动画');
      console.log('   • 响应式动画适配');
      console.log('   • 性能优化和减少动画支持');
    }

    if (this.results.errors > 0) {
      console.log('\n⚠️ 部分页面处理失败，请检查错误信息');
    }
  }
}

// 运行脚本
if (require.main === module) {
  const enhancer = new PageAnimationEnhancer();
  enhancer.run().catch(console.error);
}

module.exports = PageAnimationEnhancer;
