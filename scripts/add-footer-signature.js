/**
 * 全站页面底部签名统一添加脚本
 * 
 * 功能：
 * - 自动检测所有页面组件
 * - 在每个页面组件底部添加统一的FooterSignature组件
 * - 确保导入语句正确添加
 * - 验证添加结果
 */

const fs = require('fs');
const path = require('path');

class FooterSignatureAdder {
  constructor() {
    this.results = {
      total: 0,
      processed: 0,
      skipped: 0,
      errors: 0,
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
   * 检查文件是否已经包含FooterSignature
   */
  hasFooterSignature(content) {
    return content.includes('FooterSignature') || 
           content.includes('footer-signature') ||
           content.includes('FDX@2025');
  }

  /**
   * 检查文件是否已经导入FooterSignature
   */
  hasFooterSignatureImport(content) {
    return content.includes('from "@/components/ui/footer-signature"') ||
           content.includes("from '@/components/ui/footer-signature'");
  }

  /**
   * 添加FooterSignature导入语句
   */
  addFooterSignatureImport(content) {
    // 查找最后一个import语句的位置
    const lines = content.split('\n');
    let lastImportIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ') && !lines[i].includes('//')) {
        lastImportIndex = i;
      }
    }

    if (lastImportIndex !== -1) {
      // 在最后一个import语句后添加FooterSignature导入
      lines.splice(lastImportIndex + 1, 0, 'import { FooterSignature } from "@/components/ui/footer-signature";');
      return lines.join('\n');
    } else {
      // 如果没有找到import语句，在文件开头添加
      return 'import { FooterSignature } from "@/components/ui/footer-signature";\n' + content;
    }
  }

  /**
   * 在页面组件底部添加FooterSignature
   */
  addFooterSignatureToComponent(content) {
    // 查找最后一个return语句中的JSX结构
    const lines = content.split('\n');
    let returnStartIndex = -1;
    let returnEndIndex = -1;
    let braceCount = 0;
    let inReturn = false;

    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      
      if (line.includes('return (') || line.includes('return(')) {
        returnStartIndex = i;
        inReturn = true;
        braceCount = 1;
        continue;
      }

      if (inReturn) {
        // 计算括号数量
        const openParens = (line.match(/\(/g) || []).length;
        const closeParens = (line.match(/\)/g) || []).length;
        braceCount += openParens - closeParens;

        if (braceCount === 0) {
          returnEndIndex = i;
          break;
        }
      }
    }

    if (returnStartIndex !== -1 && returnEndIndex !== -1) {
      // 在return语句的最后一个JSX元素前添加FooterSignature
      // 查找最后一个</div>或类似的结束标签
      for (let i = returnEndIndex - 1; i > returnStartIndex; i--) {
        const line = lines[i].trim();
        if (line.includes('</div>') || line.includes('</main>') || line.includes('</section>')) {
          // 在这个结束标签前添加FooterSignature
          const indent = lines[i].match(/^\s*/)[0]; // 获取缩进
          lines.splice(i, 0, `${indent}      {/* 统一底部签名 */}`);
          lines.splice(i + 1, 0, `${indent}      <FooterSignature variant="default" />`);
          break;
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * 处理单个页面组件文件
   */
  processPageComponent(filePath) {
    try {
      console.log(`\n📄 处理文件: ${filePath}`);

      if (!fs.existsSync(filePath)) {
        this.results.skipped++;
        this.results.details.push(`❌ 文件不存在: ${filePath}`);
        return false;
      }

      let content = fs.readFileSync(filePath, 'utf8');

      // 检查是否已经包含FooterSignature
      if (this.hasFooterSignature(content)) {
        this.results.skipped++;
        this.results.details.push(`⏭️ 已包含FooterSignature: ${filePath}`);
        console.log(`⏭️ 已包含FooterSignature，跳过`);
        return true;
      }

      // 添加导入语句（如果需要）
      if (!this.hasFooterSignatureImport(content)) {
        content = this.addFooterSignatureImport(content);
        console.log(`✅ 添加导入语句`);
      }

      // 添加FooterSignature组件
      content = this.addFooterSignatureToComponent(content);

      // 写回文件
      fs.writeFileSync(filePath, content, 'utf8');

      this.results.processed++;
      this.results.details.push(`✅ 成功处理: ${filePath}`);
      console.log(`✅ 成功添加FooterSignature`);

      return true;

    } catch (error) {
      this.results.errors++;
      this.results.details.push(`❌ 处理失败: ${filePath} - ${error.message}`);
      console.error(`❌ 处理失败:`, error.message);
      return false;
    }
  }

  /**
   * 执行全站底部签名添加
   */
  async execute() {
    console.log('🎯 开始全站页面底部签名统一添加...\n');

    // 获取所有页面组件
    const pageComponents = this.getPageComponents();
    this.results.total = pageComponents.length;

    console.log(`📋 发现 ${pageComponents.length} 个页面组件:`);
    pageComponents.forEach(component => {
      console.log(`  - ${component}`);
    });

    // 处理每个页面组件
    for (const component of pageComponents) {
      this.processPageComponent(component);
    }

    // 输出结果
    this.printResults();
  }

  /**
   * 打印处理结果
   */
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 全站页面底部签名添加结果');
    console.log('='.repeat(60));
    console.log(`总文件数: ${this.results.total}`);
    console.log(`成功处理: ${this.results.processed} ✅`);
    console.log(`跳过文件: ${this.results.skipped} ⏭️`);
    console.log(`处理失败: ${this.results.errors} ❌`);
    console.log(`成功率: ${((this.results.processed / this.results.total) * 100).toFixed(1)}%`);

    if (this.results.details.length > 0) {
      console.log('\n📋 详细结果:');
      this.results.details.forEach(detail => {
        console.log(`  ${detail}`);
      });
    }

    console.log('\n🎯 全站页面底部签名添加完成!');
  }
}

// 执行脚本
if (require.main === module) {
  const adder = new FooterSignatureAdder();
  adder.execute().catch(console.error);
}

module.exports = FooterSignatureAdder;
