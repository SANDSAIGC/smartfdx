/**
 * 验证全站页面底部签名添加情况
 * 
 * 功能：
 * - 检查所有页面组件是否正确添加了FooterSignature
 * - 验证导入语句是否正确
 * - 检查组件使用是否正确
 * - 生成详细的验证报告
 */

const fs = require('fs');
const path = require('path');

class FooterSignatureVerifier {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      details: []
    };
  }

  /**
   * 获取所有页面组件文件
   */
  getPageComponents() {
    const componentsDir = 'components';
    const pageComponents = [];

    try {
      const files = fs.readdirSync(componentsDir);
      
      files.forEach(file => {
        if (file.endsWith('-page.tsx')) {
          pageComponents.push(path.join(componentsDir, file));
        }
      });

      // 添加特殊的页面组件
      const specialPages = [
        'components/lab-page.tsx',
        'app/page.tsx'
      ];

      specialPages.forEach(page => {
        if (fs.existsSync(page) && !pageComponents.includes(page)) {
          pageComponents.push(page);
        }
      });

    } catch (error) {
      console.error('❌ 获取页面组件失败:', error.message);
    }

    return pageComponents;
  }

  /**
   * 验证单个页面组件
   */
  verifyPageComponent(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return {
          passed: false,
          issues: ['文件不存在']
        };
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const issues = [];

      // 检查导入语句
      const hasImport = content.includes('from "@/components/ui/footer-signature"') ||
                       content.includes("from '@/components/ui/footer-signature'");
      
      if (!hasImport) {
        issues.push('缺少FooterSignature导入语句');
      }

      // 检查组件使用
      const hasUsage = content.includes('<FooterSignature') ||
                      content.includes('FooterSignature');
      
      if (!hasUsage) {
        issues.push('未使用FooterSignature组件');
      }

      // 检查签名内容（FooterSignature组件内部包含，不需要在页面中直接检查）
      // 签名内容在FooterSignature组件内部定义，页面只需要使用组件即可

      // 检查variant属性（可选，如果没有会使用默认值）
      const hasVariant = content.includes('variant="default"') ||
                        content.includes('variant="compact"') ||
                        content.includes('variant="minimal"') ||
                        content.includes('<FooterSignature />'); // 无属性使用默认值

      // variant属性是可选的，有默认值，所以不强制要求

      return {
        passed: issues.length === 0,
        issues: issues
      };

    } catch (error) {
      return {
        passed: false,
        issues: [`读取文件失败: ${error.message}`]
      };
    }
  }

  /**
   * 执行验证
   */
  async execute() {
    console.log('🎯 开始验证全站页面底部签名添加情况...\n');

    // 获取所有页面组件
    const pageComponents = this.getPageComponents();
    this.results.total = pageComponents.length;

    console.log(`📋 检查 ${pageComponents.length} 个页面组件:\n`);

    // 验证每个页面组件
    for (const component of pageComponents) {
      console.log(`📄 验证: ${component}`);
      
      const verification = this.verifyPageComponent(component);
      
      if (verification.passed) {
        this.results.passed++;
        this.results.details.push(`✅ ${component}: 通过验证`);
        console.log(`  ✅ 通过验证`);
      } else {
        this.results.failed++;
        this.results.details.push(`❌ ${component}: ${verification.issues.join(', ')}`);
        console.log(`  ❌ 验证失败: ${verification.issues.join(', ')}`);
      }
      
      console.log('');
    }

    // 输出结果
    this.printResults();
  }

  /**
   * 打印验证结果
   */
  printResults() {
    console.log('='.repeat(60));
    console.log('📊 全站页面底部签名验证结果');
    console.log('='.repeat(60));
    console.log(`总页面数: ${this.results.total}`);
    console.log(`验证通过: ${this.results.passed} ✅`);
    console.log(`验证失败: ${this.results.failed} ❌`);
    console.log(`通过率: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);

    if (this.results.details.length > 0) {
      console.log('\n📋 详细结果:');
      this.results.details.forEach(detail => {
        console.log(`  ${detail}`);
      });
    }

    if (this.results.passed === this.results.total) {
      console.log('\n🎉 所有页面都已成功添加底部签名!');
    } else {
      console.log('\n⚠️ 部分页面需要修复底部签名问题');
    }

    console.log('\n🎯 验证完成!');
  }
}

// 执行脚本
if (require.main === module) {
  const verifier = new FooterSignatureVerifier();
  verifier.execute().catch(console.error);
}

module.exports = FooterSignatureVerifier;
