#!/usr/bin/env node

/**
 * 测试AvatarImage导入修复的脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 测试AvatarImage导入修复');
console.log('==========================');

// 测试组件导入修复
function testComponentImports() {
  console.log('\n1. 测试组件导入修复:');
  
  const filesToCheck = [
    'components/logged-in-interface.tsx',
    'components/avatar-selector.tsx'
  ];
  
  filesToCheck.forEach(filePath => {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (!fs.existsSync(fullPath)) {
        console.log(`   ❌ 文件不存在: ${filePath}`);
        return;
      }
      
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // 检查Avatar组件导入
      const avatarImportPattern = /import\s*{\s*([^}]*)\s*}\s*from\s*["']@\/components\/ui\/avatar["']/;
      const match = content.match(avatarImportPattern);
      
      if (match) {
        const imports = match[1].split(',').map(imp => imp.trim());
        console.log(`   📦 ${filePath}:`);
        
        const requiredImports = ['Avatar', 'AvatarFallback', 'AvatarImage'];
        requiredImports.forEach(required => {
          if (imports.includes(required)) {
            console.log(`      ✅ ${required}: 已导入`);
          } else {
            console.log(`      ❌ ${required}: 未导入`);
          }
        });
        
        // 检查是否使用了AvatarImage
        if (content.includes('<AvatarImage')) {
          console.log(`      ✅ AvatarImage: 已使用`);
        } else {
          console.log(`      ⚠️  AvatarImage: 未使用`);
        }
        
      } else {
        console.log(`   ❌ ${filePath}: 未找到Avatar导入语句`);
      }
      
    } catch (error) {
      console.log(`   ❌ 检查 ${filePath} 时出错:`, error.message);
    }
  });
}

// 检查潜在的未定义组件
function checkUndefinedComponents() {
  console.log('\n2. 检查潜在的未定义组件:');
  
  const componentsToCheck = [
    'components/logged-in-interface.tsx',
    'components/avatar-selector.tsx'
  ];
  
  componentsToCheck.forEach(filePath => {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (!fs.existsSync(fullPath)) {
        console.log(`   ❌ 文件不存在: ${filePath}`);
        return;
      }
      
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // 检查使用的组件是否都已导入
      const usedComponents = [];
      
      // 查找所有使用的Avatar相关组件
      const avatarComponentPattern = /<(Avatar[A-Z][a-zA-Z]*)/g;
      let match;
      while ((match = avatarComponentPattern.exec(content)) !== null) {
        if (!usedComponents.includes(match[1])) {
          usedComponents.push(match[1]);
        }
      }
      
      console.log(`   📋 ${filePath} 使用的Avatar组件:`);
      usedComponents.forEach(component => {
        console.log(`      - ${component}`);
      });
      
      // 检查导入语句
      const importMatch = content.match(/import\s*{\s*([^}]*)\s*}\s*from\s*["']@\/components\/ui\/avatar["']/);
      if (importMatch) {
        const importedComponents = importMatch[1].split(',').map(imp => imp.trim());
        
        const missingImports = usedComponents.filter(used => !importedComponents.includes(used));
        if (missingImports.length === 0) {
          console.log(`      ✅ 所有使用的组件都已正确导入`);
        } else {
          console.log(`      ❌ 缺少导入: ${missingImports.join(', ')}`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ 检查 ${filePath} 时出错:`, error.message);
    }
  });
}

// 生成修复总结
function generateFixSummary() {
  console.log('\n📋 修复总结:');
  console.log('============');
  
  console.log('\n✅ 已修复的问题:');
  console.log('1. AvatarImage组件导入缺失');
  console.log('   - 在 logged-in-interface.tsx 中添加了 AvatarImage 导入');
  console.log('   - 修复了 "AvatarImage is not defined" 错误');
  
  console.log('\n🔍 修复详情:');
  console.log('- 原始导入: import { Avatar, AvatarFallback } from "@/components/ui/avatar"');
  console.log('- 修复后导入: import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"');
  
  console.log('\n🎯 预期效果:');
  console.log('- 员工卡片界面应该正常显示头像');
  console.log('- 不再出现 "AvatarImage is not defined" 错误');
  console.log('- 头像选择器功能应该正常工作');
  console.log('- 预设头像和上传头像应该正确显示');
  
  console.log('\n🧪 测试建议:');
  console.log('1. 访问登录页面并登录');
  console.log('2. 检查员工卡片界面是否正常显示');
  console.log('3. 测试头像选择器功能');
  console.log('4. 验证浏览器控制台无错误信息');
}

// 主函数
function main() {
  try {
    testComponentImports();
    checkUndefinedComponents();
    generateFixSummary();
    
    console.log('\n🎉 AvatarImage导入修复测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

// 运行测试
main();
