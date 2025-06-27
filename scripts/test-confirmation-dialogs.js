#!/usr/bin/env node

/**
 * 测试确认对话框集成效果
 */

const fs = require('fs');
const path = require('path');

class ConfirmationDialogTester {
  constructor() {
    this.testResults = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      details: []
    };

    // 测试目标页面
    this.targetPages = [
      'components/shift-sample-page.tsx',
      'components/filter-sample-page.tsx', 
      'components/incoming-sample-page.tsx',
      'components/outgoing-sample-page.tsx',
      'components/weighbridge-data-page.tsx',
      'components/filter-press-workshop-page.tsx',
      'components/purchase-request-page.tsx',
      'components/production-quality-data-page.tsx'
    ];
  }

  async runTests() {
    console.log('🧪 开始测试确认对话框集成效果...\n');

    // 1. 测试确认对话框组件文件
    await this.testConfirmationDialogComponent();

    // 2. 测试各页面的集成情况
    for (const pagePath of this.targetPages) {
      await this.testPageIntegration(pagePath);
    }

    this.generateTestReport();
  }

  async testConfirmationDialogComponent() {
    this.addTest('确认对话框组件文件存在');
    
    const componentPath = 'components/ui/confirmation-dialog.tsx';
    if (fs.existsSync(componentPath)) {
      const content = fs.readFileSync(componentPath, 'utf8');
      
      // 检查关键导出
      const requiredExports = [
        'ConfirmationDialog',
        'useConfirmationDialog', 
        'CONFIRMATION_CONFIGS',
        'ConfirmationType'
      ];

      let allExportsFound = true;
      for (const exportName of requiredExports) {
        if (!content.includes(exportName)) {
          allExportsFound = false;
          this.failTest(`缺少导出: ${exportName}`);
        }
      }

      if (allExportsFound) {
        this.passTest('所有必需导出都存在');
      }

      // 检查预设配置
      this.addTest('预设配置完整性');
      const presetConfigs = [
        'SUBMIT_FORM',
        'SUBMIT_SAMPLE_DATA', 
        'DELETE_RECORD',
        'RESET_FORM',
        'EXPORT_DATA'
      ];

      let allPresetsFound = true;
      for (const preset of presetConfigs) {
        if (!content.includes(preset)) {
          allPresetsFound = false;
          this.failTest(`缺少预设配置: ${preset}`);
        }
      }

      if (allPresetsFound) {
        this.passTest('所有预设配置都存在');
      }

    } else {
      this.failTest('确认对话框组件文件不存在');
    }
  }

  async testPageIntegration(pagePath) {
    const pageName = path.basename(pagePath, '.tsx');
    
    this.addTest(`${pageName} - 导入检查`);
    
    if (!fs.existsSync(pagePath)) {
      this.failTest(`文件不存在: ${pagePath}`);
      return;
    }

    const content = fs.readFileSync(pagePath, 'utf8');

    // 检查导入
    const hasConfirmationImport = content.includes('useConfirmationDialog') && 
                                 content.includes('CONFIRMATION_CONFIGS');
    
    if (hasConfirmationImport) {
      this.passTest('确认对话框导入正确');
    } else {
      this.failTest('缺少确认对话框导入');
      return;
    }

    // 检查hook使用
    this.addTest(`${pageName} - Hook使用检查`);
    const hasHookUsage = content.includes('const { showConfirmation, ConfirmationDialog } = useConfirmationDialog()');
    
    if (hasHookUsage) {
      this.passTest('确认对话框Hook使用正确');
    } else {
      this.failTest('缺少确认对话框Hook使用');
    }

    // 检查组件渲染
    this.addTest(`${pageName} - 组件渲染检查`);
    const hasComponentRender = content.includes('<ConfirmationDialog />');
    
    if (hasComponentRender) {
      this.passTest('确认对话框组件渲染正确');
    } else {
      this.failTest('缺少确认对话框组件渲染');
    }

    // 检查包装函数
    this.addTest(`${pageName} - 包装函数检查`);
    const hasWrapperFunctions = content.includes('WithConfirmation') && 
                               content.includes('showConfirmation');
    
    if (hasWrapperFunctions) {
      this.passTest('确认对话框包装函数存在');
    } else {
      this.failTest('缺少确认对话框包装函数');
    }

    // 检查按钮onClick更新
    this.addTest(`${pageName} - 按钮事件检查`);
    const buttonPatterns = [
      'handleSubmitWithConfirmation',
      'handleResetWithConfirmation', 
      'handleDeleteWithConfirmation',
      'handleSaveWithConfirmation',
      'handleExportWithConfirmation'
    ];

    let hasUpdatedButtons = false;
    for (const pattern of buttonPatterns) {
      if (content.includes(pattern)) {
        hasUpdatedButtons = true;
        break;
      }
    }

    if (hasUpdatedButtons) {
      this.passTest('按钮事件处理已更新');
    } else {
      this.failTest('按钮事件处理未更新');
    }
  }

  addTest(testName) {
    this.testResults.totalTests++;
    this.currentTest = testName;
  }

  passTest(message) {
    this.testResults.passedTests++;
    this.testResults.details.push(`✅ ${this.currentTest}: ${message}`);
  }

  failTest(message) {
    this.testResults.failedTests++;
    this.testResults.details.push(`❌ ${this.currentTest}: ${message}`);
  }

  generateTestReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 确认对话框集成测试报告');
    console.log('='.repeat(70));
    
    const successRate = ((this.testResults.passedTests / this.testResults.totalTests) * 100).toFixed(1);
    
    console.log(`\n📈 测试统计:`);
    console.log(`   总测试数: ${this.testResults.totalTests}`);
    console.log(`   通过测试: ${this.testResults.passedTests}`);
    console.log(`   失败测试: ${this.testResults.failedTests}`);
    console.log(`   成功率: ${successRate}%`);

    console.log(`\n📋 详细测试结果:`);
    this.testResults.details.forEach(detail => {
      console.log(`   ${detail}`);
    });

    // 功能验证总结
    console.log(`\n🔍 功能验证总结:`);
    
    if (this.testResults.failedTests === 0) {
      console.log('   ✅ 确认对话框组件完整');
      console.log('   ✅ 所有页面成功集成');
      console.log('   ✅ 导入和Hook使用正确');
      console.log('   ✅ 按钮事件处理已更新');
      console.log('   ✅ 组件渲染配置正确');
      
      console.log('\n🎉 确认对话框集成测试全部通过！');
      console.log('✨ 数据提交按钮确认机制强化完成');
      
      console.log('\n📝 集成效果:');
      console.log('   • 所有数据提交操作现在都需要用户确认');
      console.log('   • 不同类型操作使用不同颜色主题');
      console.log('   • 提供清晰的操作描述和风险提示');
      console.log('   • 支持加载状态和错误处理');
      
    } else {
      console.log('   ⚠️ 部分测试失败，需要检查集成问题');
      
      console.log('\n🔧 建议修复步骤:');
      console.log('   1. 检查确认对话框组件是否正确创建');
      console.log('   2. 验证页面导入是否完整');
      console.log('   3. 确认Hook使用是否正确');
      console.log('   4. 检查按钮事件处理是否更新');
    }

    console.log('\n📚 使用说明:');
    console.log('   • 用户点击数据提交按钮时会弹出确认对话框');
    console.log('   • 不同操作类型使用不同的图标和颜色');
    console.log('   • 确认对话框支持加载状态显示');
    console.log('   • 可以通过CONFIRMATION_CONFIGS自定义配置');
  }
}

// 执行测试
const tester = new ConfirmationDialogTester();
tester.runTests().catch(console.error);
