#!/usr/bin/env node

/**
 * 诊断班样按钮路由跳转问题
 */

console.log('🔍 班样按钮路由跳转问题诊断');
console.log('==============================');

const fs = require('fs');
const path = require('path');

// 检查化验室页面班样按钮配置
function checkLabPageShiftSampleConfig() {
  console.log('\n1. 检查化验室页面班样按钮配置:');
  
  try {
    const labPagePath = path.join(process.cwd(), 'components', 'lab-page.tsx');
    if (!fs.existsSync(labPagePath)) {
      console.log('   ❌ 化验室页面组件文件不存在');
      return { success: false };
    }
    
    const content = fs.readFileSync(labPagePath, 'utf8');
    
    // 检查班样按钮配置
    const checks = {
      hasShiftSampleArea: content.includes('"班样"') && content.includes('isNavigationButton: true'),
      hasCorrectRoute: content.includes("route: '/shift-sample'"),
      hasHandleWorkAreaClick: content.includes('handleWorkAreaClick'),
      hasRouterPush: content.includes('router.push(area.route)'),
      hasProperLogging: content.includes('🚀 [化验室] 导航按钮点击'),
      hasButtonOnClick: content.includes('onClick={() => handleWorkAreaClick(area)}'),
      hasNavigationCheck: content.includes('if (area.isNavigationButton && area.route)'),
      hasRouterImport: content.includes('useRouter')
    };
    
    console.log('   📋 班样按钮配置检查结果:');
    Object.entries(checks).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
    });
    
    const allPassed = Object.values(checks).every(check => check === true);
    
    if (allPassed) {
      console.log('   ✅ 班样按钮配置完全正确');
    } else {
      console.log('   ❌ 班样按钮配置存在问题');
    }
    
    return { success: allPassed, checks };
    
  } catch (error) {
    console.log('   ❌ 检查化验室页面时出错:', error.message);
    return { success: false, error: error.message };
  }
}

// 检查班样页面文件结构
function checkShiftSamplePageFiles() {
  console.log('\n2. 检查班样页面文件结构:');
  
  const files = [
    { path: 'app/shift-sample/page.tsx', description: '班样页面路由文件' },
    { path: 'components/shift-sample-page.tsx', description: '班样页面组件文件' },
    { path: 'components/auth-guard.tsx', description: 'AuthGuard组件文件' }
  ];
  
  const results = {};
  
  files.forEach(file => {
    const fullPath = path.join(process.cwd(), file.path);
    const exists = fs.existsSync(fullPath);
    results[file.path] = exists;
    console.log(`   ${exists ? '✅' : '❌'} ${file.description}: ${exists ? '存在' : '不存在'}`);
    
    if (exists && file.path === 'app/shift-sample/page.tsx') {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const hasAuthGuard = content.includes('AuthGuard');
        const hasShiftSamplePage = content.includes('ShiftSamplePage');
        console.log(`       - 使用AuthGuard: ${hasAuthGuard ? '✅' : '❌'}`);
        console.log(`       - 导入ShiftSamplePage: ${hasShiftSamplePage ? '✅' : '❌'}`);
      } catch (err) {
        console.log(`       - 读取文件内容失败: ${err.message}`);
      }
    }
  });
  
  const allFilesExist = Object.values(results).every(exists => exists === true);
  
  if (allFilesExist) {
    console.log('   ✅ 所有必需文件都存在');
  } else {
    console.log('   ❌ 部分必需文件缺失');
  }
  
  return { success: allFilesExist, files: results };
}

// 检查路由配置
function checkRouteConfiguration() {
  console.log('\n3. 检查路由配置:');
  
  try {
    // 检查 Next.js 应用结构
    const appDir = path.join(process.cwd(), 'app');
    const shiftSampleDir = path.join(appDir, 'shift-sample');
    
    const checks = {
      appDirExists: fs.existsSync(appDir),
      shiftSampleDirExists: fs.existsSync(shiftSampleDir),
      pageFileExists: fs.existsSync(path.join(shiftSampleDir, 'page.tsx'))
    };
    
    console.log('   📋 路由配置检查:');
    Object.entries(checks).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
    });
    
    // 检查是否有路由冲突
    const potentialConflicts = [
      'app/shift-sample.tsx',
      'pages/shift-sample.tsx',
      'pages/shift-sample/index.tsx'
    ];
    
    console.log('   📋 检查潜在路由冲突:');
    potentialConflicts.forEach(conflictPath => {
      const fullPath = path.join(process.cwd(), conflictPath);
      const exists = fs.existsSync(fullPath);
      if (exists) {
        console.log(`   ⚠️  发现潜在冲突文件: ${conflictPath}`);
      }
    });
    
    const allPassed = Object.values(checks).every(check => check === true);
    
    if (allPassed) {
      console.log('   ✅ 路由配置正确');
    } else {
      console.log('   ❌ 路由配置存在问题');
    }
    
    return { success: allPassed, checks };
    
  } catch (error) {
    console.log('   ❌ 检查路由配置时出错:', error.message);
    return { success: false, error: error.message };
  }
}

// 检查AuthGuard组件
function checkAuthGuardComponent() {
  console.log('\n4. 检查AuthGuard组件:');
  
  try {
    const authGuardPath = path.join(process.cwd(), 'components', 'auth-guard.tsx');
    if (!fs.existsSync(authGuardPath)) {
      console.log('   ❌ AuthGuard组件文件不存在');
      return { success: false };
    }
    
    const content = fs.readFileSync(authGuardPath, 'utf8');
    
    const checks = {
      hasOptimizedLoading: !content.includes('isChecking'),
      hasMinimalLoadingIndicator: content.includes('h-6 w-6'),
      hasTimeoutRedirect: content.includes('setTimeout(() => {') && content.includes('router.replace'),
      hasDirectRendering: content.includes('return <>{children}</>')
    };
    
    console.log('   📋 AuthGuard组件检查:');
    Object.entries(checks).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
    });
    
    const allPassed = Object.values(checks).every(check => check === true);
    
    if (allPassed) {
      console.log('   ✅ AuthGuard组件已优化');
    } else {
      console.log('   ❌ AuthGuard组件需要进一步优化');
    }
    
    return { success: allPassed, checks };
    
  } catch (error) {
    console.log('   ❌ 检查AuthGuard组件时出错:', error.message);
    return { success: false, error: error.message };
  }
}

// 生成诊断报告
function generateDiagnosticReport(labResult, filesResult, routeResult, authResult) {
  console.log('\n🔧 班样按钮路由跳转诊断报告');
  console.log('================================');
  
  console.log('\n📊 诊断结果总览:');
  console.log(`- 化验室页面班样按钮配置: ${labResult.success ? '✅ 正常' : '❌ 异常'}`);
  console.log(`- 班样页面文件结构: ${filesResult.success ? '✅ 完整' : '❌ 缺失'}`);
  console.log(`- 路由配置: ${routeResult.success ? '✅ 正确' : '❌ 错误'}`);
  console.log(`- AuthGuard组件: ${authResult.success ? '✅ 已优化' : '❌ 需优化'}`);
  
  const allPassed = labResult.success && filesResult.success && routeResult.success && authResult.success;
  
  if (allPassed) {
    console.log('\n🎯 诊断结论: ✅ 配置完全正确');
    console.log('\n💡 可能的问题原因:');
    console.log('1. 浏览器缓存问题 - 尝试硬刷新 (Ctrl+Shift+R)');
    console.log('2. 开发服务器需要重启 - 重启 npm run dev');
    console.log('3. JavaScript 执行被阻止 - 检查浏览器控制台错误');
    console.log('4. 网络请求被拦截 - 检查网络面板');
    
    console.log('\n🔍 建议的调试步骤:');
    console.log('1. 打开浏览器开发者工具 (F12)');
    console.log('2. 切换到 Console 面板');
    console.log('3. 访问化验室页面 (/lab)');
    console.log('4. 点击班样按钮');
    console.log('5. 观察控制台日志输出:');
    console.log('   - 应该看到: "🎯 [化验室] 专项作业区点击: 班样"');
    console.log('   - 应该看到: "🚀 [化验室] 导航按钮点击，跳转到: /shift-sample"');
    console.log('   - 应该看到: "🔄 [化验室] 执行路由跳转..."');
    console.log('   - 应该看到: "✅ [化验室] 路由跳转命令已发送"');
    console.log('6. 检查 Network 面板是否有路由请求');
    console.log('7. 检查 Elements 面板确认按钮点击事件绑定');
    
  } else {
    console.log('\n🔧 诊断结论: ❌ 发现配置问题');
    console.log('\n🛠️  需要修复的问题:');
    
    if (!labResult.success) {
      console.log('1. 化验室页面班样按钮配置问题');
      if (labResult.checks) {
        Object.entries(labResult.checks).forEach(([key, value]) => {
          if (!value) {
            console.log(`   - ${key}: 需要修复`);
          }
        });
      }
    }
    
    if (!filesResult.success) {
      console.log('2. 班样页面文件结构问题');
      if (filesResult.files) {
        Object.entries(filesResult.files).forEach(([file, exists]) => {
          if (!exists) {
            console.log(`   - 缺失文件: ${file}`);
          }
        });
      }
    }
    
    if (!routeResult.success) {
      console.log('3. 路由配置问题');
      if (routeResult.checks) {
        Object.entries(routeResult.checks).forEach(([key, value]) => {
          if (!value) {
            console.log(`   - ${key}: 需要修复`);
          }
        });
      }
    }
    
    if (!authResult.success) {
      console.log('4. AuthGuard组件问题');
      if (authResult.checks) {
        Object.entries(authResult.checks).forEach(([key, value]) => {
          if (!value) {
            console.log(`   - ${key}: 需要优化`);
          }
        });
      }
    }
  }
  
  console.log('\n📝 下一步行动计划:');
  if (allPassed) {
    console.log('1. 重启开发服务器');
    console.log('2. 清除浏览器缓存');
    console.log('3. 使用浏览器开发者工具调试');
    console.log('4. 检查控制台日志输出');
  } else {
    console.log('1. 修复上述发现的配置问题');
    console.log('2. 重新运行诊断脚本验证修复');
    console.log('3. 测试班样按钮跳转功能');
  }
}

// 主函数
async function main() {
  try {
    const labResult = checkLabPageShiftSampleConfig();
    const filesResult = checkShiftSamplePageFiles();
    const routeResult = checkRouteConfiguration();
    const authResult = checkAuthGuardComponent();
    
    generateDiagnosticReport(labResult, filesResult, routeResult, authResult);
    
    console.log('\n🎉 班样按钮路由跳转诊断完成！');
    
  } catch (error) {
    console.error('❌ 诊断过程中出现错误:', error.message);
  }
}

// 运行诊断
main();
