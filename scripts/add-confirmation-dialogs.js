#!/usr/bin/env node

/**
 * 为项目中所有数据提交按钮添加确认对话框
 */

const fs = require('fs');
const path = require('path');

class ConfirmationDialogIntegrator {
  constructor() {
    // 需要添加确认对话框的页面和按钮类型
    this.targetPages = [
      {
        path: 'components/shift-sample-page.tsx',
        buttons: [
          { type: 'submit', pattern: 'handleSubmit', config: 'SUBMIT_SAMPLE_DATA' },
          { type: 'reset', pattern: '重置', config: 'RESET_FORM' }
        ]
      },
      {
        path: 'components/filter-sample-page.tsx',
        buttons: [
          { type: 'submit', pattern: 'handleSubmit', config: 'SUBMIT_SAMPLE_DATA' }
        ]
      },
      {
        path: 'components/incoming-sample-page.tsx',
        buttons: [
          { type: 'submit', pattern: 'handleSubmit', config: 'SUBMIT_SAMPLE_DATA' }
        ]
      },
      {
        path: 'components/outgoing-sample-page.tsx',
        buttons: [
          { type: 'submit', pattern: 'handleSubmit', config: 'SUBMIT_SAMPLE_DATA' }
        ]
      },
      {
        path: 'components/weighbridge-data-page.tsx',
        buttons: [
          { type: 'submit', pattern: 'handleSubmit', config: 'SUBMIT_FORM' }
        ]
      },
      {
        path: 'components/filter-press-workshop-page.tsx',
        buttons: [
          { type: 'submit', pattern: 'handleSubmitRecord', config: 'SUBMIT_FORM' }
        ]
      },
      {
        path: 'components/purchase-request-page.tsx',
        buttons: [
          { type: 'submit', pattern: 'submitRequest', config: 'SUBMIT_FORM' },
          { type: 'save', pattern: 'saveDraft', config: 'SAVE_DRAFT' },
          { type: 'delete', pattern: 'removeItem', config: 'DELETE_ITEM' }
        ]
      },
      {
        path: 'components/production-quality-data-page.tsx',
        buttons: [
          { type: 'export', pattern: 'handleExportData', config: 'EXPORT_DATA' }
        ]
      }
    ];

    this.results = {
      processed: 0,
      success: 0,
      errors: 0,
      details: []
    };
  }

  async integrate() {
    console.log('🚀 开始为数据提交按钮添加确认对话框...\n');

    for (const pageConfig of this.targetPages) {
      await this.integratePage(pageConfig);
    }

    this.generateReport();
  }

  async integratePage(pageConfig) {
    this.results.processed++;
    
    try {
      if (!fs.existsSync(pageConfig.path)) {
        this.results.errors++;
        this.results.details.push(`❌ 文件不存在: ${pageConfig.path}`);
        return;
      }

      const content = fs.readFileSync(pageConfig.path, 'utf8');
      const pageName = path.basename(pageConfig.path, '.tsx');
      
      // 检查是否已经集成确认对话框
      if (content.includes('useConfirmationDialog')) {
        this.results.details.push(`⚠️ 跳过: ${pageName} (已集成确认对话框)`);
        return;
      }

      // 执行集成
      const integratedContent = this.addConfirmationDialogs(content, pageConfig);
      
      // 写入文件
      fs.writeFileSync(pageConfig.path, integratedContent, 'utf8');
      
      this.results.success++;
      this.results.details.push(`✅ 集成完成: ${pageName} (${pageConfig.buttons.length}个按钮)`);
      
    } catch (error) {
      this.results.errors++;
      this.results.details.push(`❌ 集成失败: ${pageConfig.path} - ${error.message}`);
    }
  }

  addConfirmationDialogs(content, pageConfig) {
    let modifiedContent = content;

    // 1. 添加确认对话框导入
    const confirmationImports = `import { useConfirmationDialog, CONFIRMATION_CONFIGS } from "@/components/ui/confirmation-dialog";`;

    // 在FooterSignature导入后添加确认对话框导入
    const footerImportRegex = /import { FooterSignature } from "@\/components\/ui\/footer-signature";/;
    if (footerImportRegex.test(modifiedContent)) {
      modifiedContent = modifiedContent.replace(
        footerImportRegex,
        `import { FooterSignature } from "@/components/ui/footer-signature";
${confirmationImports}`
      );
    } else {
      // 如果没有FooterSignature导入，在最后一个导入后添加
      const lastImportRegex = /import.*from.*["'];(\s*\n)/;
      modifiedContent = modifiedContent.replace(
        lastImportRegex,
        `$&${confirmationImports}$1`
      );
    }

    // 2. 添加确认对话框hook
    const hookCode = `
  // 确认对话框
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();
`;

    // 在性能监控hooks后添加确认对话框hook
    const performanceHookRegex = /(\s+)\/\/ 性能监控[\s\S]*?const { metrics } = usePerformanceOptimization\(\);/;
    if (performanceHookRegex.test(modifiedContent)) {
      modifiedContent = modifiedContent.replace(
        performanceHookRegex,
        `$&${hookCode}`
      );
    } else {
      // 如果没有性能监控hooks，在状态管理前添加
      const stateManagementRegex = /(\s+)\/\/ 状态管理/;
      if (stateManagementRegex.test(modifiedContent)) {
        modifiedContent = modifiedContent.replace(
          stateManagementRegex,
          `${hookCode}
$1// 状态管理`
        );
      }
    }

    // 3. 为每个按钮添加确认对话框包装
    pageConfig.buttons.forEach(button => {
      modifiedContent = this.wrapButtonWithConfirmation(modifiedContent, button);
    });

    // 4. 在组件末尾添加确认对话框组件
    const componentEndRegex = /(\s+)<\/PerformanceWrapper>\s*\n(\s+)\);\s*\n(\s*}\);)/;
    if (componentEndRegex.test(modifiedContent)) {
      modifiedContent = modifiedContent.replace(
        componentEndRegex,
        `$1  {/* 确认对话框 */}
$1  <ConfirmationDialog />
$1</PerformanceWrapper>
$2);
$3`
      );
    }

    return modifiedContent;
  }

  wrapButtonWithConfirmation(content, button) {
    let modifiedContent = content;

    // 根据按钮类型创建包装函数
    const wrapperFunctionName = `handle${button.type.charAt(0).toUpperCase() + button.type.slice(1)}WithConfirmation`;
    
    // 创建包装函数
    const wrapperFunction = `
  // ${button.type}操作确认包装
  const ${wrapperFunctionName} = useCallback(() => {
    showConfirmation(
      CONFIRMATION_CONFIGS.${button.config},
      ${button.pattern}
    );
  }, [showConfirmation, ${button.pattern}]);
`;

    // 在原始函数定义后添加包装函数
    const originalFunctionRegex = new RegExp(`(\\s+const ${button.pattern} = useCallback\\([\\s\\S]*?\\}, \\[[\\s\\S]*?\\]\\);)`);
    if (originalFunctionRegex.test(modifiedContent)) {
      modifiedContent = modifiedContent.replace(
        originalFunctionRegex,
        `$1${wrapperFunction}`
      );
    }

    // 替换按钮的onClick处理器
    const buttonClickRegex = new RegExp(`onClick={${button.pattern}}`, 'g');
    modifiedContent = modifiedContent.replace(
      buttonClickRegex,
      `onClick={${wrapperFunctionName}}`
    );

    return modifiedContent;
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 数据提交按钮确认机制强化报告');
    console.log('='.repeat(60));
    
    console.log(`\n📈 统计结果:`);
    console.log(`   处理页面: ${this.results.processed}`);
    console.log(`   成功集成: ${this.results.success}`);
    console.log(`   错误数量: ${this.results.errors}`);
    console.log(`   成功率: ${((this.results.success / this.results.processed) * 100).toFixed(1)}%`);

    console.log(`\n📋 详细结果:`);
    this.results.details.forEach(detail => {
      console.log(`   ${detail}`);
    });

    if (this.results.errors === 0) {
      console.log('\n🎉 所有数据提交按钮确认机制强化完成！');
      console.log('✨ 现在所有数据提交操作都需要用户确认');
    } else {
      console.log('\n⚠️ 部分页面集成失败，请检查错误信息。');
    }
  }
}

// 执行集成
const integrator = new ConfirmationDialogIntegrator();
integrator.integrate().catch(console.error);
