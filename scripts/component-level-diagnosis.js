#!/usr/bin/env node

/**
 * 组件级诊断脚本
 * 检查具体的组件配置和状态问题
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 组件级诊断系统');
console.log('==================');

// 1. 检查 lab-page.tsx 中的班样按钮配置
function checkLabPageConfiguration() {
  console.log('\n1. 检查 lab-page.tsx 班样按钮配置:');
  
  try {
    const labPagePath = path.join(process.cwd(), 'components', 'lab-page.tsx');
    const content = fs.readFileSync(labPagePath, 'utf8');
    
    // 检查班样按钮配置
    const shiftSampleConfig = {
      hasShiftSampleButton: content.includes('班样'),
      hasCorrectRoute: content.includes("route: '/shift-sample'"),
      hasNavigationFlag: content.includes('isNavigationButton: true'),
      hasClickHandler: content.includes('handleWorkAreaClick'),
      hasRouterPush: content.includes('router.push(area.route)'),
      hasConditionalCheck: content.includes('area.isNavigationButton && area.route')
    };
    
    console.log('   📋 班样按钮配置检查:');
    Object.entries(shiftSampleConfig).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
    });
    
    // 提取具体的班样按钮配置
    const shiftSampleMatch = content.match(/\{[^}]*label:\s*["']班样["'][^}]*\}/s);
    if (shiftSampleMatch) {
      console.log('\n   📝 班样按钮具体配置:');
      console.log('   ' + shiftSampleMatch[0].replace(/\n/g, '\n   '));
    }
    
    // 提取点击处理函数
    const clickHandlerMatch = content.match(/const handleWorkAreaClick[^}]+\}/s);
    if (clickHandlerMatch) {
      console.log('\n   📝 点击处理函数:');
      console.log('   ' + clickHandlerMatch[0].replace(/\n/g, '\n   '));
    }
    
    return { success: Object.values(shiftSampleConfig).every(v => v), config: shiftSampleConfig };
    
  } catch (error) {
    console.log('   ❌ 检查 lab-page.tsx 时出错:', error.message);
    return { success: false, error: error.message };
  }
}

// 2. 检查 shift-sample 页面配置
function checkShiftSamplePageConfiguration() {
  console.log('\n2. 检查 shift-sample 页面配置:');
  
  try {
    const pageFiles = [
      'app/shift-sample/page.tsx',
      'components/shift-sample-page.tsx'
    ];
    
    const results = {};
    
    pageFiles.forEach(filePath => {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        results[filePath] = {
          exists: true,
          hasAuthGuard: content.includes('AuthGuard'),
          hasRequireAuth: content.includes('requireAuth={true}') || content.includes('requireAuth: true'),
          hasShiftSamplePage: content.includes('ShiftSamplePage'),
          hasExportDefault: content.includes('export default'),
          contentLength: content.length
        };
        
        console.log(`   📁 ${filePath}:`);
        Object.entries(results[filePath]).forEach(([key, value]) => {
          if (key !== 'contentLength') {
            console.log(`      ${value ? '✅' : '❌'} ${key}: ${value}`);
          } else {
            console.log(`      📏 ${key}: ${value} 字符`);
          }
        });
      } else {
        results[filePath] = { exists: false };
        console.log(`   📁 ${filePath}: ❌ 文件不存在`);
      }
    });
    
    return { success: true, results };
    
  } catch (error) {
    console.log('   ❌ 检查 shift-sample 页面时出错:', error.message);
    return { success: false, error: error.message };
  }
}

// 3. 检查 AuthGuard 组件当前状态
function checkAuthGuardCurrentState() {
  console.log('\n3. 检查 AuthGuard 组件当前状态:');
  
  try {
    const authGuardPath = path.join(process.cwd(), 'components', 'auth-guard.tsx');
    const content = fs.readFileSync(authGuardPath, 'utf8');
    
    const authGuardState = {
      hasRedirectedState: content.includes('hasRedirected') && content.includes('useState(false)'),
      hasRedirectedCheck: content.includes('if (hasRedirected)'),
      hasRedirectedReset: content.includes('setHasRedirected(false)'),
      hasRedirectedSet: content.includes('setHasRedirected(true)'),
      hasDetailedLogging: content.includes('[AuthGuard]') && content.includes('console.log'),
      hasAuthPageCheck: content.includes("currentPath.startsWith('/auth/')"),
      singleRouterReplace: (content.match(/router\.replace/g) || []).length === 1,
      hasTimeoutWrapper: content.includes('setTimeout') && content.includes('router.replace')
    };
    
    console.log('   📋 AuthGuard 状态检查:');
    Object.entries(authGuardState).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
    });
    
    // 检查具体的重定向逻辑
    const redirectLogicMatch = content.match(/if \(isAuthenticated && user && session\)[^}]+\}/s);
    if (redirectLogicMatch) {
      console.log('\n   📝 认证通过逻辑:');
      console.log('   ' + redirectLogicMatch[0].replace(/\n/g, '\n   '));
    }
    
    return { success: Object.values(authGuardState).every(v => v), state: authGuardState };
    
  } catch (error) {
    console.log('   ❌ 检查 AuthGuard 时出错:', error.message);
    return { success: false, error: error.message };
  }
}

// 4. 检查 UserContext 状态管理
function checkUserContextConfiguration() {
  console.log('\n4. 检查 UserContext 状态管理:');
  
  try {
    const userContextPath = path.join(process.cwd(), 'lib', 'contexts', 'user-context.tsx');
    const content = fs.readFileSync(userContextPath, 'utf8');
    
    const contextState = {
      hasUserState: content.includes('useState') && content.includes('User'),
      hasSessionState: content.includes('useState') && content.includes('Session'),
      hasIsAuthenticatedState: content.includes('isAuthenticated'),
      hasIsLoadingState: content.includes('isLoading'),
      hasCheckAuthStatus: content.includes('checkAuthStatus'),
      hasLocalStorageHandling: content.includes('localStorage'),
      hasUseEffectInit: content.includes('useEffect') && content.includes('initializeAuth'),
      hasContextProvider: content.includes('UserProvider') && content.includes('UserContext.Provider')
    };
    
    console.log('   📋 UserContext 状态检查:');
    Object.entries(contextState).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
    });
    
    // 检查是否有自动重定向逻辑
    const autoRedirectMatch = content.match(/setTimeout[^}]+router\.(push|replace)[^}]+\}/s);
    if (autoRedirectMatch) {
      console.log('\n   ⚠️  发现 UserContext 中的自动重定向逻辑:');
      console.log('   ' + autoRedirectMatch[0].replace(/\n/g, '\n   '));
      console.log('   这可能与 AuthGuard 的重定向逻辑冲突！');
    }
    
    return { success: Object.values(contextState).every(v => v), state: contextState };
    
  } catch (error) {
    console.log('   ❌ 检查 UserContext 时出错:', error.message);
    return { success: false, error: error.message };
  }
}

// 5. 检查 Next.js 配置
function checkNextJSConfiguration() {
  console.log('\n5. 检查 Next.js 配置:');
  
  try {
    const configFiles = [
      'next.config.ts',
      'next.config.js',
      'next.config.mjs'
    ];
    
    let configFound = false;
    let configContent = '';
    
    for (const configFile of configFiles) {
      const configPath = path.join(process.cwd(), configFile);
      if (fs.existsSync(configPath)) {
        configContent = fs.readFileSync(configPath, 'utf8');
        configFound = true;
        console.log(`   📁 找到配置文件: ${configFile}`);
        break;
      }
    }
    
    if (!configFound) {
      console.log('   ❌ 未找到 Next.js 配置文件');
      return { success: false, error: 'No config file found' };
    }
    
    const configState = {
      hasDevIndicators: configContent.includes('devIndicators'),
      hasExperimentalFeatures: configContent.includes('experimental'),
      hasRedirectConfig: configContent.includes('redirects'),
      hasRewriteConfig: configContent.includes('rewrites'),
      hasMiddlewareConfig: configContent.includes('middleware')
    };
    
    console.log('   📋 Next.js 配置检查:');
    Object.entries(configState).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
    });
    
    return { success: true, state: configState, content: configContent };
    
  } catch (error) {
    console.log('   ❌ 检查 Next.js 配置时出错:', error.message);
    return { success: false, error: error.message };
  }
}

// 6. 生成修复建议
function generateFixSuggestions(results) {
  console.log('\n6. 修复建议生成:');
  console.log('================');
  
  const issues = [];
  const suggestions = [];
  
  // 分析各项检查结果
  if (!results.labPage.success) {
    issues.push('lab-page.tsx 班样按钮配置不完整');
    suggestions.push('修复 lab-page.tsx 中的班样按钮配置');
  }
  
  if (!results.shiftSamplePage.success) {
    issues.push('shift-sample 页面配置有问题');
    suggestions.push('检查并修复 shift-sample 页面文件');
  }
  
  if (!results.authGuard.success) {
    issues.push('AuthGuard 组件状态不正确');
    suggestions.push('完善 AuthGuard 组件的重定向逻辑');
  }
  
  if (!results.userContext.success) {
    issues.push('UserContext 状态管理有问题');
    suggestions.push('检查 UserContext 中的认证逻辑');
  }
  
  if (!results.nextConfig.success) {
    issues.push('Next.js 配置可能有问题');
    suggestions.push('检查 Next.js 配置文件');
  }
  
  if (issues.length === 0) {
    console.log('🎉 所有组件配置检查通过！');
    console.log('问题可能在运行时状态，建议使用深度诊断脚本进行实时分析。');
    
    console.log('\n🔍 深度分析建议:');
    console.log('1. 使用浏览器深度诊断脚本监控实时状态');
    console.log('2. 检查是否有缓存问题导致旧代码仍在运行');
    console.log('3. 验证开发服务器热重载是否正常');
    console.log('4. 检查是否有其他中间件或插件干扰路由');
    
  } else {
    console.log('❌ 发现以下问题:');
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
    
    console.log('\n🛠️  修复建议:');
    suggestions.forEach((suggestion, index) => {
      console.log(`   ${index + 1}. ${suggestion}`);
    });
  }
  
  return { issues, suggestions };
}

// 主函数
function main() {
  console.log('开始组件级诊断...\n');
  
  const results = {
    labPage: checkLabPageConfiguration(),
    shiftSamplePage: checkShiftSamplePageConfiguration(),
    authGuard: checkAuthGuardCurrentState(),
    userContext: checkUserContextConfiguration(),
    nextConfig: checkNextJSConfiguration()
  };
  
  const fixSuggestions = generateFixSuggestions(results);
  
  console.log('\n📊 诊断总结:');
  console.log('============');
  Object.entries(results).forEach(([key, result]) => {
    console.log(`${result.success ? '✅' : '❌'} ${key}: ${result.success ? '通过' : '失败'}`);
  });
  
  const allPassed = Object.values(results).every(result => result.success);
  
  if (allPassed) {
    console.log('\n🎯 组件级配置全部正确！');
    console.log('问题可能在运行时，请使用深度诊断脚本进行实时分析。');
  } else {
    console.log('\n⚠️  发现组件级配置问题，请按修复建议进行处理。');
  }
  
  return { results, fixSuggestions, allPassed };
}

// 运行诊断
const diagnosis = main();

// 输出详细的下一步指导
console.log('\n🚀 下一步行动计划:');
console.log('==================');

if (diagnosis.allPassed) {
  console.log('1. 启动开发服务器: npm run dev');
  console.log('2. 在浏览器中执行深度诊断脚本');
  console.log('3. 点击班样按钮并观察实时诊断结果');
  console.log('4. 根据实时诊断结果进行针对性修复');
} else {
  console.log('1. 按照修复建议解决组件配置问题');
  console.log('2. 重新运行此诊断脚本验证修复效果');
  console.log('3. 配置问题解决后，再进行运行时诊断');
}

console.log('\n📞 如需进一步支持，请提供:');
console.log('- 此诊断脚本的完整输出');
console.log('- 深度诊断脚本的运行结果');
console.log('- 浏览器控制台的错误日志');
console.log('- 具体的用户操作步骤和观察到的现象');
