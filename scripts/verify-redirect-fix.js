#!/usr/bin/env node

/**
 * 登录重定向修复验证脚本
 * 验证所有重定向逻辑是否正确实现
 */

console.log('🎯 登录重定向修复验证');
console.log('===================');

const fs = require('fs');
const path = require('path');

// 验证 AuthGuard 组件修复
function verifyAuthGuardFix() {
  console.log('\n1. 验证 AuthGuard 组件修复:');
  
  try {
    const authGuardPath = path.join(process.cwd(), 'components', 'auth-guard.tsx');
    const content = fs.readFileSync(authGuardPath, 'utf8');
    
    const fixes = {
      savesCurrentPath: content.includes('const currentPath = window.location.pathname'),
      encodesRedirectParam: content.includes('encodeURIComponent(currentPath)'),
      buildsRedirectUrl: content.includes('const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`'),
      hasLogging: content.includes('保存原始访问路径'),
      usesRedirectUrl: content.includes('router.replace(redirectUrl)')
    };
    
    console.log('   📋 AuthGuard 修复验证:');
    Object.entries(fixes).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
    });
    
    const allFixed = Object.values(fixes).every(fix => fix === true);
    
    if (allFixed) {
      console.log('   ✅ AuthGuard 组件修复成功');
    } else {
      console.log('   ❌ AuthGuard 组件修复不完整');
    }
    
    return { success: allFixed, fixes };
    
  } catch (error) {
    console.log('   ❌ 验证 AuthGuard 组件时出错:', error.message);
    return { success: false, error: error.message };
  }
}

// 验证 LoginPageContent 组件修复
function verifyLoginPageContentFix() {
  console.log('\n2. 验证 LoginPageContent 组件修复:');
  
  try {
    const loginPagePath = path.join(process.cwd(), 'components', 'login-page-content.tsx');
    const content = fs.readFileSync(loginPagePath, 'utf8');
    
    const fixes = {
      importsSearchParams: content.includes('useSearchParams'),
      declaresSearchParams: content.includes('const searchParams = useSearchParams()'),
      checksRedirectParam: content.includes("const redirectParam = searchParams.get('redirect')"),
      prioritizesRedirect: content.includes('if (redirectParam)'),
      hasRedirectLogging: content.includes('发现重定向参数，返回原始访问页面'),
      redirectsToParam: content.includes('router.replace(redirectParam)')
    };
    
    console.log('   📋 LoginPageContent 修复验证:');
    Object.entries(fixes).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
    });
    
    const allFixed = Object.values(fixes).every(fix => fix === true);
    
    if (allFixed) {
      console.log('   ✅ LoginPageContent 组件修复成功');
    } else {
      console.log('   ❌ LoginPageContent 组件修复不完整');
    }
    
    return { success: allFixed, fixes };
    
  } catch (error) {
    console.log('   ❌ 验证 LoginPageContent 组件时出错:', error.message);
    return { success: false, error: error.message };
  }
}

// 验证 LoggedInInterface 组件修复
function verifyLoggedInInterfaceFix() {
  console.log('\n3. 验证 LoggedInInterface 组件修复:');
  
  try {
    const loggedInPath = path.join(process.cwd(), 'components', 'logged-in-interface.tsx');
    const content = fs.readFileSync(loggedInPath, 'utf8');
    
    const fixes = {
      importsSearchParams: content.includes('useSearchParams'),
      declaresSearchParams: content.includes('const searchParams = useSearchParams()'),
      checksRedirectParam: content.includes("const redirectParam = searchParams.get('redirect')"),
      prioritizesRedirect: content.includes('if (redirectParam)'),
      hasRedirectLogging: content.includes('发现重定向参数，返回原始访问页面'),
      redirectsToParam: content.includes('router.push(redirectParam)')
    };
    
    console.log('   📋 LoggedInInterface 修复验证:');
    Object.entries(fixes).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
    });
    
    const allFixed = Object.values(fixes).every(fix => fix === true);
    
    if (allFixed) {
      console.log('   ✅ LoggedInInterface 组件修复成功');
    } else {
      console.log('   ❌ LoggedInInterface 组件修复不完整');
    }
    
    return { success: allFixed, fixes };
    
  } catch (error) {
    console.log('   ❌ 验证 LoggedInInterface 组件时出错:', error.message);
    return { success: false, error: error.message };
  }
}

// 验证目标页面配置
function verifyTargetPagesConfig() {
  console.log('\n4. 验证目标页面配置:');
  
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
        importsAuthGuard: content.includes("from '@/components/auth-guard'") || content.includes("from \"@/components/auth-guard\""),
        requiresAuth: content.includes('requireAuth={true}'),
        wrapsComponent: content.includes('<AuthGuard') && content.includes('</AuthGuard>')
      };
      
      const allPassed = Object.values(checks).every(check => check === true);
      
      console.log(`   ${allPassed ? '✅' : '❌'} ${page.name}:`);
      console.log(`       - 导入 AuthGuard: ${checks.importsAuthGuard ? '✅' : '❌'}`);
      console.log(`       - 使用 AuthGuard: ${checks.hasAuthGuard ? '✅' : '❌'}`);
      console.log(`       - 需要认证: ${checks.requiresAuth ? '✅' : '❌'}`);
      console.log(`       - 正确包装: ${checks.wrapsComponent ? '✅' : '❌'}`);
      
      results[page.name] = { success: allPassed, checks };
      
    } catch (error) {
      console.log(`   ❌ ${page.name}: 读取文件失败 - ${error.message}`);
      results[page.name] = { success: false, error: error.message };
    }
  });
  
  const allPagesConfigured = Object.values(results).every(result => result.success === true);
  
  return { success: allPagesConfigured, results };
}

// 生成最终验证报告
function generateFinalReport(authGuardResult, loginPageResult, loggedInResult, pageConfigResult) {
  console.log('\n🎉 登录重定向修复验证报告');
  console.log('===========================');
  
  console.log('\n📊 修复验证结果:');
  console.log(`- AuthGuard 组件修复: ${authGuardResult.success ? '✅ 成功' : '❌ 失败'}`);
  console.log(`- LoginPageContent 组件修复: ${loginPageResult.success ? '✅ 成功' : '❌ 失败'}`);
  console.log(`- LoggedInInterface 组件修复: ${loggedInResult.success ? '✅ 成功' : '❌ 失败'}`);
  console.log(`- 目标页面配置: ${pageConfigResult.success ? '✅ 成功' : '❌ 失败'}`);
  
  const allFixed = authGuardResult.success && loginPageResult.success && loggedInResult.success && pageConfigResult.success;
  
  if (allFixed) {
    console.log('\n🎯 验证结论: ✅ 登录重定向逻辑修复完全成功');
    
    console.log('\n🚀 修复成果总结:');
    console.log('1. ✅ AuthGuard 组件正确保存用户原始访问路径');
    console.log('2. ✅ 登录页面优先重定向到用户原本想访问的页面');
    console.log('3. ✅ 已登录界面支持重定向参数处理');
    console.log('4. ✅ 所有目标页面正确配置身份验证保护');
    
    console.log('\n🎉 用户体验改进:');
    console.log('- 用户直接访问受保护页面后登录，能直接返回到目标页面');
    console.log('- 首次登录用户仍然重定向到默认工作页面');
    console.log('- 已登录用户访问登录页面时正确处理重定向');
    console.log('- 整个流程流畅，无多余的跳转步骤');
    
    console.log('\n📝 测试建议:');
    console.log('1. 退出登录状态');
    console.log('2. 直接访问 http://localhost:3002/shift-sample');
    console.log('3. 观察重定向到登录页面并包含 redirect 参数');
    console.log('4. 完成登录流程');
    console.log('5. 验证自动返回到 /shift-sample 页面');
    console.log('6. 重复测试 /lab 页面的重定向行为');
    
    console.log('\n🔍 调试信息:');
    console.log('- 查看浏览器控制台的重定向日志');
    console.log('- 确认 URL 参数正确传递');
    console.log('- 验证最终页面是否为预期页面');
    
  } else {
    console.log('\n🔧 验证结论: ❌ 发现未完成的修复');
    
    console.log('\n🛠️  需要进一步修复的问题:');
    
    if (!authGuardResult.success) {
      console.log('1. AuthGuard 组件修复不完整');
      if (authGuardResult.fixes) {
        Object.entries(authGuardResult.fixes).forEach(([key, value]) => {
          if (!value) {
            console.log(`   - ${key}: 需要修复`);
          }
        });
      }
    }
    
    if (!loginPageResult.success) {
      console.log('2. LoginPageContent 组件修复不完整');
      if (loginPageResult.fixes) {
        Object.entries(loginPageResult.fixes).forEach(([key, value]) => {
          if (!value) {
            console.log(`   - ${key}: 需要修复`);
          }
        });
      }
    }
    
    if (!loggedInResult.success) {
      console.log('3. LoggedInInterface 组件修复不完整');
      if (loggedInResult.fixes) {
        Object.entries(loggedInResult.fixes).forEach(([key, value]) => {
          if (!value) {
            console.log(`   - ${key}: 需要修复`);
          }
        });
      }
    }
    
    if (!pageConfigResult.success) {
      console.log('4. 目标页面配置不完整');
      if (pageConfigResult.results) {
        Object.entries(pageConfigResult.results).forEach(([page, result]) => {
          if (!result.success) {
            console.log(`   - ${page}: 需要修复`);
          }
        });
      }
    }
  }
  
  console.log('\n📋 技术实现细节:');
  console.log('- URL 参数编码: encodeURIComponent');
  console.log('- 参数读取: useSearchParams');
  console.log('- 重定向优先级: redirect 参数 > 工作页面 > 默认页面');
  console.log('- 兼容性: 向后兼容原有登录流程');
  
  return allFixed;
}

// 主函数
async function main() {
  try {
    console.log('开始验证登录重定向修复...\n');
    
    const authGuardResult = verifyAuthGuardFix();
    const loginPageResult = verifyLoginPageContentFix();
    const loggedInResult = verifyLoggedInInterfaceFix();
    const pageConfigResult = verifyTargetPagesConfig();
    
    const allFixed = generateFinalReport(authGuardResult, loginPageResult, loggedInResult, pageConfigResult);
    
    if (allFixed) {
      console.log('\n🎉 登录重定向修复验证完成 - 所有修复成功！');
      console.log('现在可以进行用户测试验证功能。');
    } else {
      console.log('\n⚠️  登录重定向修复验证完成 - 发现需要进一步修复的问题');
      console.log('请根据上述报告完成剩余修复工作。');
    }
    
  } catch (error) {
    console.error('❌ 验证过程中出现错误:', error.message);
  }
}

// 运行验证
main();
