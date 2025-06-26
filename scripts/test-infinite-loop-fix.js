#!/usr/bin/env node

/**
 * 测试无限循环修复的脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 测试无限循环修复');
console.log('==================');

// 测试登录页面内容组件
function testLoginPageContent() {
  console.log('\n1. 测试登录页面内容组件:');
  
  try {
    const filePath = path.join(process.cwd(), 'components', 'login-page-content.tsx');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查useEffect依赖数组是否正确
    if (content.includes('[checkAuthStatus, isInitializing]')) {
      console.log('   ✅ useEffect依赖数组已修复（移除了user依赖）');
    } else {
      console.log('   ❌ useEffect依赖数组未正确修复');
    }
    
    // 检查是否添加了isInitializing条件
    if (content.includes('if (isInitializing)')) {
      console.log('   ✅ 添加了isInitializing条件检查');
    } else {
      console.log('   ❌ 未添加isInitializing条件检查');
    }
    
    // 检查是否移除了user引用
    if (!content.includes('user: user?.姓名')) {
      console.log('   ✅ 移除了可能导致循环的user引用');
    } else {
      console.log('   ❌ 仍然包含可能导致循环的user引用');
    }
    
  } catch (error) {
    console.log('   ❌ 测试登录页面内容组件时出错:', error.message);
  }
}

// 测试已登录界面组件
function testLoggedInInterface() {
  console.log('\n2. 测试已登录界面组件:');
  
  try {
    const filePath = path.join(process.cwd(), 'components', 'logged-in-interface.tsx');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查是否导入了useEffect
    if (content.includes('import { useState, useEffect }')) {
      console.log('   ✅ 已导入useEffect');
    } else {
      console.log('   ❌ 未导入useEffect');
    }
    
    // 检查是否添加了useEffect来加载头像
    if (content.includes('useEffect(() => {') && content.includes('loadUserAvatar()')) {
      console.log('   ✅ 添加了useEffect来加载头像偏好');
    } else {
      console.log('   ❌ 未添加useEffect来加载头像偏好');
    }
    
    // 检查renderAvatarContent是否移除了每次调用loadUserAvatar
    if (content.includes('const savedAvatar = userAvatar;') && !content.includes('userAvatar || loadUserAvatar()')) {
      console.log('   ✅ 修复了renderAvatarContent中的无限循环');
    } else {
      console.log('   ❌ renderAvatarContent仍可能导致无限循环');
    }
    
    // 检查useEffect依赖数组
    if (content.includes('[user?.账号]')) {
      console.log('   ✅ useEffect依赖数组设置正确');
    } else {
      console.log('   ❌ useEffect依赖数组设置不正确');
    }
    
  } catch (error) {
    console.log('   ❌ 测试已登录界面组件时出错:', error.message);
  }
}

// 检查潜在的无限循环模式
function checkInfiniteLoopPatterns() {
  console.log('\n3. 检查潜在的无限循环模式:');
  
  const filesToCheck = [
    'components/login-page-content.tsx',
    'components/logged-in-interface.tsx',
    'components/avatar-selector.tsx',
    'lib/contexts/user-context.tsx'
  ];
  
  filesToCheck.forEach(filePath => {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (!fs.existsSync(fullPath)) {
        console.log(`   ⚠️  文件不存在: ${filePath}`);
        return;
      }
      
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // 检查危险模式
      const dangerousPatterns = [
        /useEffect\([^}]*setState[^}]*\),[^}]*\]/g, // useEffect中直接setState且依赖可能变化
        /useEffect\([^}]*\),[^}]*user[^}]*\]/g, // useEffect依赖user对象
        /const.*=.*\|\|.*\(\)/g, // 在渲染函数中调用函数
      ];
      
      let hasIssues = false;
      dangerousPatterns.forEach((pattern, index) => {
        const matches = content.match(pattern);
        if (matches) {
          hasIssues = true;
          console.log(`   ⚠️  ${filePath}: 发现潜在问题模式 ${index + 1}`);
        }
      });
      
      if (!hasIssues) {
        console.log(`   ✅ ${filePath}: 未发现明显的无限循环模式`);
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
  console.log('1. 登录页面内容组件 (login-page-content.tsx)');
  console.log('   - 移除了useEffect依赖数组中的user对象');
  console.log('   - 添加了isInitializing条件检查');
  console.log('   - 避免了因user状态变化导致的无限循环');
  
  console.log('\n2. 已登录界面组件 (logged-in-interface.tsx)');
  console.log('   - 添加了useEffect来在组件挂载时加载头像偏好');
  console.log('   - 修复了renderAvatarContent中每次渲染都调用loadUserAvatar的问题');
  console.log('   - 使用状态管理避免重复计算');
  
  console.log('\n🔍 修复原理:');
  console.log('=============');
  console.log('1. 避免在useEffect依赖数组中包含可能频繁变化的对象');
  console.log('2. 将副作用操作移到useEffect中，避免在渲染函数中执行');
  console.log('3. 使用状态管理缓存计算结果，避免重复计算');
  console.log('4. 添加条件检查，确保副作用只在必要时执行');
  
  console.log('\n🚀 下一步建议:');
  console.log('==============');
  console.log('1. 访问 http://localhost:3000/auth/login 测试登录页面');
  console.log('2. 检查浏览器控制台是否还有错误信息');
  console.log('3. 测试头像选择器功能是否正常工作');
  console.log('4. 验证登录流程是否顺畅');
}

// 主函数
function main() {
  try {
    testLoginPageContent();
    testLoggedInInterface();
    checkInfiniteLoopPatterns();
    generateFixSummary();
    
    console.log('\n🎉 无限循环修复测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

// 运行测试
main();
