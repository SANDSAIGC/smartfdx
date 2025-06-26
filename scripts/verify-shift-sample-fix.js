#!/usr/bin/env node

/**
 * 班样按钮修复验证脚本
 * 验证 AuthGuard 修复后班样按钮是否能正常工作
 */

console.log('🔧 班样按钮修复验证');
console.log('==================');

const fs = require('fs');
const path = require('path');

// 检查 AuthGuard 修复
function checkAuthGuardFix() {
  console.log('\n1. 检查 AuthGuard 组件修复:');
  
  try {
    const authGuardPath = path.join(process.cwd(), 'components', 'auth-guard.tsx');
    const content = fs.readFileSync(authGuardPath, 'utf8');
    
    const fixes = {
      hasRedirectedState: content.includes('hasRedirected') && content.includes('useState(false)'),
      hasRedirectedCheck: content.includes('if (hasRedirected)') && content.includes('跳过重复重定向'),
      hasRedirectedReset: content.includes('setHasRedirected(false)') && content.includes('重置重定向标志'),
      hasRedirectedSet: content.includes('setHasRedirected(true)') && content.includes('防止重复重定向'),
      hasRedirectedDependency: content.includes('hasRedirected]') && content.includes('useEffect'),
      reducedRouterReplaceCalls: (content.match(/router\.replace/g) || []).length === 1
    };
    
    console.log('   📋 AuthGuard 修复检查:');
    Object.entries(fixes).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
    });
    
    const allFixed = Object.values(fixes).every(fix => fix === true);
    
    if (allFixed) {
      console.log('   ✅ AuthGuard 组件修复完成');
    } else {
      console.log('   ❌ AuthGuard 组件修复不完整');
    }
    
    return { success: allFixed, fixes };
    
  } catch (error) {
    console.log('   ❌ 检查 AuthGuard 修复时出错:', error.message);
    return { success: false, error: error.message };
  }
}

// 检查路由配置完整性
function checkRouteConfiguration() {
  console.log('\n2. 检查路由配置完整性:');
  
  const checks = {
    labPageExists: false,
    shiftSamplePageExists: false,
    labPageHasShiftSampleButton: false,
    shiftSamplePageHasAuthGuard: false
  };
  
  try {
    // 检查 lab 页面
    const labPagePath = path.join(process.cwd(), 'components', 'lab-page.tsx');
    if (fs.existsSync(labPagePath)) {
      checks.labPageExists = true;
      const labContent = fs.readFileSync(labPagePath, 'utf8');
      checks.labPageHasShiftSampleButton = labContent.includes('班样') && 
                                           labContent.includes("route: '/shift-sample'") &&
                                           labContent.includes('isNavigationButton: true');
    }
    
    // 检查 shift-sample 页面
    const shiftSamplePagePath = path.join(process.cwd(), 'app', 'shift-sample', 'page.tsx');
    if (fs.existsSync(shiftSamplePagePath)) {
      checks.shiftSamplePageExists = true;
      const shiftSampleContent = fs.readFileSync(shiftSamplePagePath, 'utf8');
      checks.shiftSamplePageHasAuthGuard = shiftSampleContent.includes('<AuthGuard') &&
                                           shiftSampleContent.includes('requireAuth={true}');
    }
    
    console.log('   📋 路由配置检查:');
    Object.entries(checks).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
    });
    
    const allConfigured = Object.values(checks).every(check => check === true);
    
    if (allConfigured) {
      console.log('   ✅ 路由配置完整');
    } else {
      console.log('   ❌ 路由配置不完整');
    }
    
    return { success: allConfigured, checks };
    
  } catch (error) {
    console.log('   ❌ 检查路由配置时出错:', error.message);
    return { success: false, error: error.message };
  }
}

// 生成测试指南
function generateTestGuide() {
  console.log('\n3. 生成测试指南:');
  
  const testSteps = [
    '🚀 启动开发服务器: npm run dev',
    '🌐 在浏览器中访问: http://localhost:3002/lab',
    '🔐 如果需要登录，使用测试账号: test001 / password123',
    '🔍 找到"班样"按钮（在专项作业区部分）',
    '🖱️  点击"班样"按钮',
    '✅ 验证页面是否跳转到 /shift-sample',
    '📝 检查 shift-sample 页面是否正确加载',
    '🔄 尝试多次点击验证稳定性'
  ];
  
  console.log('   📋 手动测试步骤:');
  testSteps.forEach((step, index) => {
    console.log(`   ${index + 1}. ${step}`);
  });
  
  console.log('\n   🎯 预期结果:');
  console.log('   - 点击班样按钮后，URL 应该变为 http://localhost:3002/shift-sample');
  console.log('   - 页面应该显示班样记录表单');
  console.log('   - 不应该出现重定向循环或跳回 lab 页面的情况');
  
  console.log('\n   🔍 故障排除:');
  console.log('   - 如果仍然跳回 lab 页面，检查浏览器控制台的 AuthGuard 日志');
  console.log('   - 如果出现认证错误，清除浏览器 localStorage 并重新登录');
  console.log('   - 如果页面无响应，检查开发服务器是否正常运行');
}

// 生成浏览器调试代码
function generateBrowserDebugCode() {
  console.log('\n4. 生成浏览器调试代码:');
  
  const debugCode = `
// 班样按钮修复验证调试器
console.log('🔧 [修复验证] 班样按钮修复验证调试器启动');

// 监控 AuthGuard 状态变化
let authGuardLogs = [];
const originalConsoleLog = console.log;
console.log = function(...args) {
  const message = args.join(' ');
  if (message.includes('[AuthGuard]')) {
    authGuardLogs.push({
      timestamp: new Date().toISOString(),
      message: message
    });
    
    // 检查是否有重复重定向
    const redirectLogs = authGuardLogs.filter(log => log.message.includes('重定向'));
    if (redirectLogs.length > 1) {
      console.warn('⚠️ [修复验证] 检测到多次重定向，可能存在循环:', redirectLogs);
    }
  }
  return originalConsoleLog.apply(this, args);
};

// 监控路由变化
let routeChanges = [];
let lastPath = window.location.pathname;

setInterval(() => {
  const currentPath = window.location.pathname;
  if (currentPath !== lastPath) {
    routeChanges.push({
      timestamp: new Date().toISOString(),
      from: lastPath,
      to: currentPath
    });
    
    console.log('🔄 [修复验证] 路由变化:', {
      from: lastPath,
      to: currentPath,
      totalChanges: routeChanges.length
    });
    
    lastPath = currentPath;
  }
}, 100);

// 班样按钮点击监控
document.addEventListener('click', function(event) {
  const target = event.target;
  const button = target.closest('button');
  
  if (button && button.textContent?.includes('班样')) {
    console.log('🎯 [修复验证] 班样按钮被点击');
    console.log('📍 [修复验证] 点击时路径:', window.location.pathname);
    
    // 记录点击时的 AuthGuard 状态
    const userData = localStorage.getItem('fdx_user_data');
    const sessionData = localStorage.getItem('fdx_session_data');
    
    console.log('🔐 [修复验证] 点击时认证状态:', {
      hasUserData: !!userData,
      hasSessionData: !!sessionData,
      userDataValid: userData ? JSON.parse(userData).id : null,
      sessionDataValid: sessionData ? JSON.parse(sessionData).token : null
    });
    
    // 设置延迟检查
    setTimeout(() => {
      const newPath = window.location.pathname;
      console.log('⏰ [修复验证] 500ms 后路径:', newPath);
      
      if (newPath === '/shift-sample') {
        console.log('✅ [修复验证] 成功跳转到 shift-sample 页面');
      } else if (newPath === '/lab') {
        console.log('❌ [修复验证] 仍在 lab 页面，跳转失败');
      } else {
        console.log('⚠️ [修复验证] 跳转到意外页面:', newPath);
      }
    }, 500);
  }
});

// 提供手动检查函数
window.checkAuthGuardLogs = function() {
  console.log('📊 [修复验证] AuthGuard 日志记录:', authGuardLogs);
  return authGuardLogs;
};

window.checkRouteChanges = function() {
  console.log('📊 [修复验证] 路由变化记录:', routeChanges);
  return routeChanges;
};

console.log('✅ [修复验证] 调试器设置完成');
console.log('📝 [修复验证] 可用命令:');
console.log('   - checkAuthGuardLogs(): 查看 AuthGuard 日志');
console.log('   - checkRouteChanges(): 查看路由变化记录');
`;

  console.log('   📋 复制以下代码到浏览器控制台:');
  console.log('   ================================');
  console.log(debugCode);
  console.log('   ================================');
}

// 主函数
function main() {
  console.log('开始班样按钮修复验证...\n');
  
  const authGuardResult = checkAuthGuardFix();
  const routeConfigResult = checkRouteConfiguration();
  
  console.log('\n📊 修复验证总结:');
  console.log(`- AuthGuard 组件修复: ${authGuardResult.success ? '✅ 完成' : '❌ 未完成'}`);
  console.log(`- 路由配置检查: ${routeConfigResult.success ? '✅ 正确' : '❌ 错误'}`);
  
  const allFixed = authGuardResult.success && routeConfigResult.success;
  
  if (allFixed) {
    console.log('\n🎉 修复验证通过！');
    console.log('班样按钮导航问题应该已经解决。');
    
    generateTestGuide();
    generateBrowserDebugCode();
    
    console.log('\n🚀 下一步:');
    console.log('1. 按照测试指南进行手动测试');
    console.log('2. 如果需要详细调试，使用浏览器调试代码');
    console.log('3. 验证修复效果并反馈结果');
    
  } else {
    console.log('\n⚠️  修复验证未通过');
    console.log('需要解决以下问题:');
    
    if (!authGuardResult.success) {
      console.log('- AuthGuard 组件修复不完整');
      if (authGuardResult.fixes) {
        Object.entries(authGuardResult.fixes).forEach(([key, value]) => {
          if (!value) {
            console.log(`  * ${key}: 需要修复`);
          }
        });
      }
    }
    
    if (!routeConfigResult.success) {
      console.log('- 路由配置存在问题');
      if (routeConfigResult.checks) {
        Object.entries(routeConfigResult.checks).forEach(([key, value]) => {
          if (!value) {
            console.log(`  * ${key}: 需要修复`);
          }
        });
      }
    }
  }
}

// 运行验证
main();
