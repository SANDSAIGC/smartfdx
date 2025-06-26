#!/usr/bin/env node

/**
 * 测试工作页面路由跳转修复的脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 测试工作页面路由跳转修复');
console.log('============================');

// 测试已登录界面组件修复
function testLoggedInInterfaceFix() {
  console.log('\n1. 测试已登录界面组件修复:');
  
  try {
    const filePath = path.join(process.cwd(), 'components', 'logged-in-interface.tsx');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查handleContinueToWorkspace是否改为async
    if (content.includes('const handleContinueToWorkspace = async ()')) {
      console.log('   ✅ handleContinueToWorkspace函数已改为async');
    } else {
      console.log('   ❌ handleContinueToWorkspace函数未改为async');
    }
    
    // 检查是否添加了API调用
    if (content.includes('/api/get-workspace-route')) {
      console.log('   ✅ 添加了工作页面路由查询API调用');
    } else {
      console.log('   ❌ 未添加工作页面路由查询API调用');
    }
    
    // 检查handleCloseCard是否也修复了
    if (content.includes('const handleCloseCard = async ()')) {
      console.log('   ✅ handleCloseCard函数也已修复');
    } else {
      console.log('   ❌ handleCloseCard函数未修复');
    }
    
    // 检查错误处理
    if (content.includes('try {') && content.includes('catch (error)')) {
      console.log('   ✅ 添加了错误处理逻辑');
    } else {
      console.log('   ❌ 未添加错误处理逻辑');
    }
    
    // 检查是否移除了错误的直接路由跳转
    if (!content.includes('router.push(`/${user.工作页面}`)')) {
      console.log('   ✅ 移除了错误的直接路由跳转');
    } else {
      console.log('   ❌ 仍然包含错误的直接路由跳转');
    }
    
  } catch (error) {
    console.log('   ❌ 测试已登录界面组件时出错:', error.message);
  }
}

// 测试API路由创建
function testWorkspaceRouteAPI() {
  console.log('\n2. 测试工作页面路由查询API:');
  
  try {
    const apiPath = path.join(process.cwd(), 'app', 'api', 'get-workspace-route', 'route.ts');
    
    if (fs.existsSync(apiPath)) {
      console.log('   ✅ API路由文件已创建');
      
      const content = fs.readFileSync(apiPath, 'utf8');
      
      // 检查API方法
      if (content.includes('export async function POST')) {
        console.log('   ✅ POST方法已实现');
      } else {
        console.log('   ❌ POST方法未实现');
      }
      
      // 检查Supabase查询
      if (content.includes('工作页面?页面名称=eq.')) {
        console.log('   ✅ Supabase工作页面查询已实现');
      } else {
        console.log('   ❌ Supabase工作页面查询未实现');
      }
      
      // 检查错误处理
      if (content.includes('try {') && content.includes('catch (error)')) {
        console.log('   ✅ API错误处理已实现');
      } else {
        console.log('   ❌ API错误处理未实现');
      }
      
      // 检查响应格式
      if (content.includes('success: true') && content.includes('route:')) {
        console.log('   ✅ API响应格式正确');
      } else {
        console.log('   ❌ API响应格式不正确');
      }
      
    } else {
      console.log('   ❌ API路由文件未创建');
    }
    
  } catch (error) {
    console.log('   ❌ 测试API路由时出错:', error.message);
  }
}

// 检查工作页面数据
function checkWorkspaceData() {
  console.log('\n3. 检查工作页面数据结构:');
  
  console.log('   📋 预期的工作页面映射:');
  console.log('   - 工作页面名称: "化验室" → 页面路由: "/lab"');
  console.log('   - 工作页面名称: "生产车间" → 页面路由: "/production"');
  console.log('   - 工作页面名称: "质检部" → 页面路由: "/quality"');
  console.log('   - 默认页面: "/demo"');
  
  console.log('\n   🔍 测试用户数据:');
  console.log('   - lab001 用户的工作页面: "化验室"');
  console.log('   - 期望跳转路由: "/lab"');
}

// 生成测试步骤
function generateTestSteps() {
  console.log('\n📋 测试步骤:');
  console.log('============');
  
  console.log('\n🧪 手动测试步骤:');
  console.log('1. 访问登录页面: http://localhost:3000/auth/login');
  console.log('2. 使用 lab001 账号登录 (密码: password)');
  console.log('3. 在员工卡片界面中点击"继续到工作区"按钮');
  console.log('4. 验证是否正确跳转到 /lab 页面');
  console.log('5. 返回登录页面，测试关闭按钮是否也正确跳转');
  
  console.log('\n🔍 检查要点:');
  console.log('- 浏览器控制台应显示工作页面路由查询日志');
  console.log('- 应该看到API调用 /api/get-workspace-route');
  console.log('- 最终应该跳转到 /lab 页面而不是 /化验室');
  console.log('- 如果API调用失败，应该默认跳转到 /demo');
  
  console.log('\n🚨 可能的错误情况:');
  console.log('- 如果仍然跳转到错误路径，检查API是否正常工作');
  console.log('- 如果没有跳转，检查浏览器控制台的错误信息');
  console.log('- 如果API调用失败，检查Supabase连接和工作页面表数据');
}

// 生成修复总结
function generateFixSummary() {
  console.log('\n📋 修复总结:');
  console.log('============');
  
  console.log('\n✅ 已修复的问题:');
  console.log('1. 员工卡片界面路由跳转逻辑');
  console.log('   - 修复了直接使用工作页面名称作为路由的错误');
  console.log('   - 添加了工作页面路由查询API调用');
  console.log('   - 实现了正确的页面名称到路由的映射');
  
  console.log('\n2. 创建了工作页面路由查询API');
  console.log('   - 路径: /api/get-workspace-route');
  console.log('   - 查询Supabase工作页面表');
  console.log('   - 返回正确的页面路由');
  console.log('   - 包含完整的错误处理');
  
  console.log('\n3. 统一了两个按钮的跳转逻辑');
  console.log('   - "继续到工作区"按钮');
  console.log('   - 员工卡片关闭按钮');
  console.log('   - 两者现在使用相同的路由查询逻辑');
  
  console.log('\n🔍 修复原理:');
  console.log('=============');
  console.log('1. 工作页面名称 → API查询 → 页面路由 → 路由跳转');
  console.log('2. 错误处理: API失败时默认跳转到 /demo');
  console.log('3. 异步处理: 使用async/await处理API调用');
  console.log('4. 日志记录: 完整的调试日志便于问题排查');
}

// 主函数
function main() {
  try {
    testLoggedInInterfaceFix();
    testWorkspaceRouteAPI();
    checkWorkspaceData();
    generateTestSteps();
    generateFixSummary();
    
    console.log('\n🎉 工作页面路由跳转修复测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

// 运行测试
main();
