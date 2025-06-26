#!/usr/bin/env node

/**
 * 班样按钮路由问题诊断脚本
 * 专门诊断从 lab 页面点击"班样"按钮无法正确跳转到 shift-sample 页面的问题
 */

console.log('🔍 班样按钮路由问题诊断');
console.log('========================');

const fs = require('fs');
const path = require('path');

// 检查 lab-page.tsx 中的班样按钮配置
function checkLabPageShiftSampleButton() {
  console.log('\n1. 检查 lab-page.tsx 中的班样按钮配置:');
  
  try {
    const labPagePath = path.join(process.cwd(), 'components', 'lab-page.tsx');
    const content = fs.readFileSync(labPagePath, 'utf8');
    
    // 检查班样按钮配置
    const shiftSampleConfig = content.match(/{\s*icon:\s*Clock,[\s\S]*?route:\s*['"`]([^'"`]+)['"`][\s\S]*?}/);
    const isNavigationButton = content.includes('isNavigationButton: true');
    const hasRoute = content.includes("route: '/shift-sample'");
    const hasHandleWorkAreaClick = content.includes('handleWorkAreaClick');
    const hasRouterPush = content.includes('router.push(area.route)');
    
    console.log('   📋 班样按钮配置检查:');
    console.log(`   ${hasRoute ? '✅' : '❌'} 路由配置: ${hasRoute ? "'/shift-sample'" : '未找到'}`);
    console.log(`   ${isNavigationButton ? '✅' : '❌'} 导航按钮标识: ${isNavigationButton}`);
    console.log(`   ${hasHandleWorkAreaClick ? '✅' : '❌'} 点击处理函数: ${hasHandleWorkAreaClick}`);
    console.log(`   ${hasRouterPush ? '✅' : '❌'} 路由跳转逻辑: ${hasRouterPush}`);
    
    // 提取具体的路由配置
    if (shiftSampleConfig) {
      console.log('   📍 发现班样按钮配置:');
      console.log('   ', shiftSampleConfig[0].replace(/\s+/g, ' ').trim());
    }
    
    const allConfigured = hasRoute && isNavigationButton && hasHandleWorkAreaClick && hasRouterPush;
    
    if (allConfigured) {
      console.log('   ✅ lab-page.tsx 中班样按钮配置正确');
    } else {
      console.log('   ❌ lab-page.tsx 中班样按钮配置存在问题');
    }
    
    return { success: allConfigured, hasRoute, isNavigationButton, hasHandleWorkAreaClick, hasRouterPush };
    
  } catch (error) {
    console.log('   ❌ 检查 lab-page.tsx 时出错:', error.message);
    return { success: false, error: error.message };
  }
}

// 检查 shift-sample 页面的 AuthGuard 配置
function checkShiftSampleAuthGuard() {
  console.log('\n2. 检查 shift-sample 页面的 AuthGuard 配置:');
  
  try {
    const shiftSamplePagePath = path.join(process.cwd(), 'app', 'shift-sample', 'page.tsx');
    const content = fs.readFileSync(shiftSamplePagePath, 'utf8');
    
    const checks = {
      hasAuthGuardImport: content.includes("import { AuthGuard }"),
      hasAuthGuardWrapper: content.includes('<AuthGuard') && content.includes('</AuthGuard>'),
      hasRequireAuth: content.includes('requireAuth={true}'),
      hasShiftSamplePageImport: content.includes("import { ShiftSamplePage }"),
      hasShiftSamplePageComponent: content.includes('<ShiftSamplePage')
    };
    
    console.log('   📋 shift-sample 页面配置检查:');
    Object.entries(checks).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
    });
    
    const allConfigured = Object.values(checks).every(check => check === true);
    
    if (allConfigured) {
      console.log('   ✅ shift-sample 页面 AuthGuard 配置正确');
    } else {
      console.log('   ❌ shift-sample 页面 AuthGuard 配置存在问题');
    }
    
    return { success: allConfigured, checks };
    
  } catch (error) {
    console.log('   ❌ 检查 shift-sample 页面时出错:', error.message);
    return { success: false, error: error.message };
  }
}

// 检查 AuthGuard 组件的重定向逻辑
function checkAuthGuardRedirectLogic() {
  console.log('\n3. 检查 AuthGuard 组件的重定向逻辑:');
  
  try {
    const authGuardPath = path.join(process.cwd(), 'components', 'auth-guard.tsx');
    const content = fs.readFileSync(authGuardPath, 'utf8');
    
    const checks = {
      hasUseRouter: content.includes('useRouter'),
      hasRedirectLogic: content.includes('router.replace'),
      hasCurrentPathSave: content.includes('window.location.pathname'),
      hasRedirectParam: content.includes('redirect=${encodeURIComponent(currentPath)}'),
      hasAuthenticatedCheck: content.includes('isAuthenticated && user && session'),
      hasTimeoutWrapper: content.includes('setTimeout(() => {') && content.includes('router.replace'),
      hasProperDependencies: content.includes('[user, session, isAuthenticated, isLoading')
    };
    
    console.log('   📋 AuthGuard 重定向逻辑检查:');
    Object.entries(checks).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
    });
    
    // 检查是否有可能导致循环重定向的问题
    const hasMultipleRedirects = (content.match(/router\.replace/g) || []).length > 1;
    const hasConditionalRedirect = content.includes('if (') && content.includes('router.replace');
    
    console.log(`   ${!hasMultipleRedirects ? '✅' : '⚠️'} 重定向调用次数: ${(content.match(/router\.replace/g) || []).length}`);
    console.log(`   ${hasConditionalRedirect ? '✅' : '❌'} 条件重定向: ${hasConditionalRedirect}`);
    
    const allGood = Object.values(checks).every(check => check === true) && !hasMultipleRedirects;
    
    if (allGood) {
      console.log('   ✅ AuthGuard 重定向逻辑正常');
    } else {
      console.log('   ❌ AuthGuard 重定向逻辑可能存在问题');
    }
    
    return { success: allGood, checks, hasMultipleRedirects };
    
  } catch (error) {
    console.log('   ❌ 检查 AuthGuard 时出错:', error.message);
    return { success: false, error: error.message };
  }
}

// 检查路由文件结构
function checkRouteFileStructure() {
  console.log('\n4. 检查路由文件结构:');
  
  const routesToCheck = [
    { path: 'app/shift-sample/page.tsx', name: 'shift-sample 页面' },
    { path: 'app/lab/page.tsx', name: 'lab 页面' },
    { path: 'app/auth/login/page.tsx', name: '登录页面' }
  ];
  
  const results = {};
  
  routesToCheck.forEach(route => {
    const fullPath = path.join(process.cwd(), route.path);
    const exists = fs.existsSync(fullPath);
    
    console.log(`   ${exists ? '✅' : '❌'} ${route.name}: ${exists ? '存在' : '不存在'}`);
    
    if (exists) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const hasDefaultExport = content.includes('export default');
        const hasPageComponent = content.includes('Page') || content.includes('function');
        
        console.log(`       - 默认导出: ${hasDefaultExport ? '✅' : '❌'}`);
        console.log(`       - 页面组件: ${hasPageComponent ? '✅' : '❌'}`);
        
        results[route.name] = { exists: true, hasDefaultExport, hasPageComponent };
      } catch (error) {
        console.log(`       - 读取失败: ❌ ${error.message}`);
        results[route.name] = { exists: true, error: error.message };
      }
    } else {
      results[route.name] = { exists: false };
    }
  });
  
  const allRoutesExist = Object.values(results).every(result => result.exists === true);
  
  return { success: allRoutesExist, results };
}

// 检查可能的路由冲突
function checkRouteConflicts() {
  console.log('\n5. 检查可能的路由冲突:');
  
  try {
    // 检查是否有重复的路由定义
    const appDir = path.join(process.cwd(), 'app');
    
    function findPageFiles(dir, basePath = '') {
      const files = [];
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...findPageFiles(fullPath, path.join(basePath, item)));
        } else if (item === 'page.tsx' || item === 'page.js') {
          files.push(basePath || '/');
        }
      }
      
      return files;
    }
    
    const routes = findPageFiles(appDir);
    console.log('   📋 发现的路由:');
    routes.forEach(route => {
      console.log(`   - ${route}`);
    });
    
    // 检查是否有重复路由
    const duplicates = routes.filter((route, index) => routes.indexOf(route) !== index);
    
    if (duplicates.length === 0) {
      console.log('   ✅ 没有发现路由冲突');
    } else {
      console.log('   ❌ 发现重复路由:', duplicates);
    }
    
    // 检查 shift-sample 路由是否存在
    const hasShiftSampleRoute = routes.includes('/shift-sample');
    console.log(`   ${hasShiftSampleRoute ? '✅' : '❌'} shift-sample 路由: ${hasShiftSampleRoute ? '存在' : '不存在'}`);
    
    return { success: duplicates.length === 0 && hasShiftSampleRoute, routes, duplicates };
    
  } catch (error) {
    console.log('   ❌ 检查路由冲突时出错:', error.message);
    return { success: false, error: error.message };
  }
}

// 生成诊断报告
function generateDiagnosisReport(labPageResult, authGuardPageResult, authGuardLogicResult, routeStructureResult, routeConflictResult) {
  console.log('\n🔍 班样按钮路由问题诊断报告');
  console.log('==============================');
  
  console.log('\n📊 诊断结果总览:');
  console.log(`- lab-page.tsx 班样按钮配置: ${labPageResult.success ? '✅ 正确' : '❌ 错误'}`);
  console.log(`- shift-sample 页面 AuthGuard: ${authGuardPageResult.success ? '✅ 正确' : '❌ 错误'}`);
  console.log(`- AuthGuard 重定向逻辑: ${authGuardLogicResult.success ? '✅ 正常' : '❌ 异常'}`);
  console.log(`- 路由文件结构: ${routeStructureResult.success ? '✅ 完整' : '❌ 不完整'}`);
  console.log(`- 路由冲突检查: ${routeConflictResult.success ? '✅ 无冲突' : '❌ 有冲突'}`);
  
  const allSystemsWorking = labPageResult.success && authGuardPageResult.success && authGuardLogicResult.success && routeStructureResult.success && routeConflictResult.success;
  
  if (allSystemsWorking) {
    console.log('\n🎯 诊断结论: ✅ 路由系统配置正确，问题可能在运行时');
    
    console.log('\n🔍 可能的运行时问题:');
    console.log('1. 🔄 AuthGuard 重定向循环');
    console.log('   - 用户已登录但 AuthGuard 仍然触发重定向');
    console.log('   - 登录状态检查逻辑存在时序问题');
    
    console.log('\n2. 🚀 路由跳转被拦截');
    console.log('   - router.push() 被 AuthGuard 的 useEffect 拦截');
    console.log('   - 页面渲染过程中发生状态变化');
    
    console.log('\n3. 🔐 认证状态不稳定');
    console.log('   - isAuthenticated 状态在页面切换时变化');
    console.log('   - UserContext 状态管理存在竞态条件');
    
    console.log('\n🛠️  建议的解决方案:');
    console.log('1. 在 AuthGuard 中添加路由跳转检测');
    console.log('2. 优化认证状态检查的时序');
    console.log('3. 添加详细的运行时日志');
    console.log('4. 检查 UserContext 的状态管理逻辑');
    
  } else {
    console.log('\n🔧 诊断结论: ❌ 发现配置问题');
    
    console.log('\n🛠️  需要修复的问题:');
    
    if (!labPageResult.success) {
      console.log('1. lab-page.tsx 班样按钮配置问题');
      if (labPageResult.hasRoute === false) {
        console.log('   - 缺少路由配置: route: \'/shift-sample\'');
      }
      if (labPageResult.isNavigationButton === false) {
        console.log('   - 缺少导航标识: isNavigationButton: true');
      }
      if (labPageResult.hasHandleWorkAreaClick === false) {
        console.log('   - 缺少点击处理函数: handleWorkAreaClick');
      }
      if (labPageResult.hasRouterPush === false) {
        console.log('   - 缺少路由跳转逻辑: router.push(area.route)');
      }
    }
    
    if (!authGuardPageResult.success) {
      console.log('2. shift-sample 页面 AuthGuard 配置问题');
      if (authGuardPageResult.checks) {
        Object.entries(authGuardPageResult.checks).forEach(([key, value]) => {
          if (!value) {
            console.log(`   - ${key}: 需要修复`);
          }
        });
      }
    }
    
    if (!authGuardLogicResult.success) {
      console.log('3. AuthGuard 重定向逻辑问题');
      if (authGuardLogicResult.hasMultipleRedirects) {
        console.log('   - 存在多个重定向调用，可能导致循环');
      }
      if (authGuardLogicResult.checks) {
        Object.entries(authGuardLogicResult.checks).forEach(([key, value]) => {
          if (!value) {
            console.log(`   - ${key}: 需要实现`);
          }
        });
      }
    }
    
    if (!routeStructureResult.success) {
      console.log('4. 路由文件结构问题');
      if (routeStructureResult.results) {
        Object.entries(routeStructureResult.results).forEach(([route, result]) => {
          if (!result.exists) {
            console.log(`   - ${route}: 文件不存在`);
          }
        });
      }
    }
    
    if (!routeConflictResult.success) {
      console.log('5. 路由冲突问题');
      if (routeConflictResult.duplicates && routeConflictResult.duplicates.length > 0) {
        console.log(`   - 重复路由: ${routeConflictResult.duplicates.join(', ')}`);
      }
    }
  }
  
  console.log('\n📝 下一步行动:');
  if (allSystemsWorking) {
    console.log('1. 运行运行时诊断脚本');
    console.log('2. 检查浏览器控制台日志');
    console.log('3. 测试用户认证状态');
    console.log('4. 验证路由跳转时序');
  } else {
    console.log('1. 根据上述问题列表修复配置');
    console.log('2. 重新运行诊断脚本验证');
    console.log('3. 进行功能测试');
  }
  
  return allSystemsWorking;
}

// 主函数
async function main() {
  try {
    console.log('开始班样按钮路由问题诊断...\n');
    
    const labPageResult = checkLabPageShiftSampleButton();
    const authGuardPageResult = checkShiftSampleAuthGuard();
    const authGuardLogicResult = checkAuthGuardRedirectLogic();
    const routeStructureResult = checkRouteFileStructure();
    const routeConflictResult = checkRouteConflicts();
    
    const systemWorking = generateDiagnosisReport(
      labPageResult,
      authGuardPageResult,
      authGuardLogicResult,
      routeStructureResult,
      routeConflictResult
    );
    
    if (systemWorking) {
      console.log('\n🎉 配置诊断完成 - 系统配置正确！');
      console.log('问题可能在运行时，建议进行实时调试。');
    } else {
      console.log('\n⚠️  配置诊断完成 - 发现需要修复的配置问题');
      console.log('请根据上述报告完成相关修复工作。');
    }
    
  } catch (error) {
    console.error('❌ 诊断过程中出现错误:', error.message);
  }
}

// 运行诊断
main();
