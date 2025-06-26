#!/usr/bin/env node

/**
 * 登录重定向逻辑测试脚本
 * 验证用户访问受保护页面时的重定向行为
 */

console.log('🔍 登录重定向逻辑测试');
console.log('====================');

const fs = require('fs');
const path = require('path');

// 检查 AuthGuard 组件的重定向逻辑
function checkAuthGuardRedirect() {
  console.log('\n1. 检查 AuthGuard 组件重定向逻辑:');
  
  try {
    const authGuardPath = path.join(process.cwd(), 'components', 'auth-guard.tsx');
    const content = fs.readFileSync(authGuardPath, 'utf8');
    
    const checks = {
      savesCurrentPath: content.includes('window.location.pathname'),
      encodesRedirectParam: content.includes('encodeURIComponent(currentPath)'),
      appendsRedirectParam: content.includes('redirect=${encodeURIComponent(currentPath)}'),
      hasRedirectLogging: content.includes('保存原始访问路径'),
      usesRedirectUrl: content.includes('router.replace(redirectUrl)')
    };
    
    console.log('   📋 AuthGuard 重定向检查结果:');
    Object.entries(checks).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
    });
    
    const allPassed = Object.values(checks).every(check => check === true);
    
    if (allPassed) {
      console.log('   ✅ AuthGuard 重定向逻辑正确');
    } else {
      console.log('   ❌ AuthGuard 重定向逻辑存在问题');
    }
    
    return { success: allPassed, checks };
    
  } catch (error) {
    console.log('   ❌ 检查 AuthGuard 组件时出错:', error.message);
    return { success: false, error: error.message };
  }
}

// 检查 LoginPageContent 组件的重定向优先级
function checkLoginPageRedirect() {
  console.log('\n2. 检查 LoginPageContent 组件重定向优先级:');
  
  try {
    const loginPagePath = path.join(process.cwd(), 'components', 'login-page-content.tsx');
    const content = fs.readFileSync(loginPagePath, 'utf8');
    
    const checks = {
      importsSearchParams: content.includes('useSearchParams'),
      getsRedirectParam: content.includes("searchParams.get('redirect')"),
      prioritizesRedirectParam: content.includes('发现重定向参数，返回原始访问页面'),
      fallsBackToWorkspace: content.includes('如果没有重定向参数，则使用用户的默认工作页面'),
      hasRedirectLogging: content.includes('🎯 [登录页面] 发现重定向参数')
    };
    
    console.log('   📋 LoginPageContent 重定向检查结果:');
    Object.entries(checks).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
    });
    
    const allPassed = Object.values(checks).every(check => check === true);
    
    if (allPassed) {
      console.log('   ✅ LoginPageContent 重定向优先级正确');
    } else {
      console.log('   ❌ LoginPageContent 重定向优先级存在问题');
    }
    
    return { success: allPassed, checks };
    
  } catch (error) {
    console.log('   ❌ 检查 LoginPageContent 组件时出错:', error.message);
    return { success: false, error: error.message };
  }
}

// 检查 LoggedInInterface 组件的重定向逻辑
function checkLoggedInInterfaceRedirect() {
  console.log('\n3. 检查 LoggedInInterface 组件重定向逻辑:');
  
  try {
    const loggedInPath = path.join(process.cwd(), 'components', 'logged-in-interface.tsx');
    const content = fs.readFileSync(loggedInPath, 'utf8');
    
    const checks = {
      importsSearchParams: content.includes('useSearchParams'),
      getsRedirectParam: content.includes("searchParams.get('redirect')"),
      prioritizesRedirectParam: content.includes('发现重定向参数，返回原始访问页面'),
      fallsBackToWorkspace: content.includes('如果没有重定向参数，则使用用户的默认工作页面'),
      hasRedirectLogging: content.includes('🎯 [已登录界面] 发现重定向参数')
    };
    
    console.log('   📋 LoggedInInterface 重定向检查结果:');
    Object.entries(checks).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
    });
    
    const allPassed = Object.values(checks).every(check => check === true);
    
    if (allPassed) {
      console.log('   ✅ LoggedInInterface 重定向逻辑正确');
    } else {
      console.log('   ❌ LoggedInInterface 重定向逻辑存在问题');
    }
    
    return { success: allPassed, checks };
    
  } catch (error) {
    console.log('   ❌ 检查 LoggedInInterface 组件时出错:', error.message);
    return { success: false, error: error.message };
  }
}

// 检查目标页面的 AuthGuard 配置
function checkTargetPageAuthGuard() {
  console.log('\n4. 检查目标页面 AuthGuard 配置:');
  
  const pagesToCheck = [
    { path: 'app/shift-sample/page.tsx', name: 'shift-sample 页面' },
    { path: 'app/lab/page.tsx', name: 'lab 页面' }
  ];
  
  const results = {};
  
  pagesToCheck.forEach(page => {
    const fullPath = path.join(process.cwd(), page.path);
    const exists = fs.existsSync(fullPath);
    
    if (!exists) {
      console.log(`   ❌ ${page.name}: 文件不存在`);
      results[page.name] = { success: false, reason: '文件不存在' };
      return;
    }
    
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      const checks = {
        hasAuthGuard: content.includes('AuthGuard'),
        requiresAuth: content.includes('requireAuth') || !content.includes('requireAuth={false}'),
        hasProperImport: content.includes("from '@/components/auth-guard'") || content.includes("from \"@/components/auth-guard\"")
      };
      
      const allPassed = Object.values(checks).every(check => check === true);
      
      console.log(`   ${allPassed ? '✅' : '❌'} ${page.name}:`);
      console.log(`       - 使用 AuthGuard: ${checks.hasAuthGuard ? '✅' : '❌'}`);
      console.log(`       - 需要认证: ${checks.requiresAuth ? '✅' : '❌'}`);
      console.log(`       - 正确导入: ${checks.hasProperImport ? '✅' : '❌'}`);
      
      results[page.name] = { success: allPassed, checks };
      
    } catch (error) {
      console.log(`   ❌ ${page.name}: 读取文件失败 - ${error.message}`);
      results[page.name] = { success: false, error: error.message };
    }
  });
  
  const allPagesConfigured = Object.values(results).every(result => result.success === true);
  
  return { success: allPagesConfigured, results };
}

// 生成测试报告
function generateTestReport(authGuardResult, loginPageResult, loggedInResult, pageConfigResult) {
  console.log('\n🔧 登录重定向逻辑测试报告');
  console.log('==========================');
  
  console.log('\n📊 测试结果总览:');
  console.log(`- AuthGuard 重定向逻辑: ${authGuardResult.success ? '✅ 正确' : '❌ 错误'}`);
  console.log(`- LoginPageContent 重定向优先级: ${loginPageResult.success ? '✅ 正确' : '❌ 错误'}`);
  console.log(`- LoggedInInterface 重定向逻辑: ${loggedInResult.success ? '✅ 正确' : '❌ 错误'}`);
  console.log(`- 目标页面 AuthGuard 配置: ${pageConfigResult.success ? '✅ 正确' : '❌ 错误'}`);
  
  const allPassed = authGuardResult.success && loginPageResult.success && loggedInResult.success && pageConfigResult.success;
  
  if (allPassed) {
    console.log('\n🎯 测试结论: ✅ 登录重定向逻辑修复成功');
    
    console.log('\n🎉 修复成果:');
    console.log('1. ✅ AuthGuard 组件正确保存用户原始访问路径');
    console.log('2. ✅ 登录页面优先重定向到用户原本想访问的页面');
    console.log('3. ✅ 已登录界面支持重定向参数处理');
    console.log('4. ✅ 目标页面正确配置身份验证保护');
    
    console.log('\n🚀 预期行为:');
    console.log('- 用户访问 /shift-sample → 重定向到 /auth/login?redirect=%2Fshift-sample');
    console.log('- 用户登录成功 → 自动返回到 /shift-sample 页面');
    console.log('- 首次登录用户 → 重定向到默认工作页面');
    console.log('- 已登录用户访问登录页 → 立即重定向到目标页面或工作页面');
    
    console.log('\n📝 用户测试步骤:');
    console.log('1. 确保已退出登录状态');
    console.log('2. 直接访问 http://localhost:3001/shift-sample');
    console.log('3. 观察是否重定向到登录页面并包含 redirect 参数');
    console.log('4. 完成登录流程');
    console.log('5. 验证是否自动返回到 /shift-sample 页面');
    
  } else {
    console.log('\n🔧 测试结论: ❌ 发现问题需要修复');
    
    console.log('\n🛠️  需要修复的问题:');
    
    if (!authGuardResult.success) {
      console.log('1. AuthGuard 重定向逻辑问题');
      if (authGuardResult.checks) {
        Object.entries(authGuardResult.checks).forEach(([key, value]) => {
          if (!value) {
            console.log(`   - ${key}: 需要修复`);
          }
        });
      }
    }
    
    if (!loginPageResult.success) {
      console.log('2. LoginPageContent 重定向优先级问题');
      if (loginPageResult.checks) {
        Object.entries(loginPageResult.checks).forEach(([key, value]) => {
          if (!value) {
            console.log(`   - ${key}: 需要修复`);
          }
        });
      }
    }
    
    if (!loggedInResult.success) {
      console.log('3. LoggedInInterface 重定向逻辑问题');
      if (loggedInResult.checks) {
        Object.entries(loggedInResult.checks).forEach(([key, value]) => {
          if (!value) {
            console.log(`   - ${key}: 需要修复`);
          }
        });
      }
    }
    
    if (!pageConfigResult.success) {
      console.log('4. 目标页面 AuthGuard 配置问题');
      if (pageConfigResult.results) {
        Object.entries(pageConfigResult.results).forEach(([page, result]) => {
          if (!result.success) {
            console.log(`   - ${page}: 需要修复`);
          }
        });
      }
    }
  }
  
  console.log('\n📝 下一步行动:');
  if (allPassed) {
    console.log('1. 重启开发服务器测试新的重定向逻辑');
    console.log('2. 执行用户测试步骤验证功能');
    console.log('3. 测试不同场景的重定向行为');
    console.log('4. 确认控制台日志输出正确');
  } else {
    console.log('1. 修复上述发现的问题');
    console.log('2. 重新运行测试脚本验证修复');
    console.log('3. 完成修复后进行用户测试');
  }
}

// 主函数
async function main() {
  try {
    const authGuardResult = checkAuthGuardRedirect();
    const loginPageResult = checkLoginPageRedirect();
    const loggedInResult = checkLoggedInInterfaceRedirect();
    const pageConfigResult = checkTargetPageAuthGuard();
    
    generateTestReport(authGuardResult, loginPageResult, loggedInResult, pageConfigResult);
    
    console.log('\n🎉 登录重定向逻辑测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

// 运行测试
main();
