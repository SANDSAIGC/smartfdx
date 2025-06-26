#!/usr/bin/env node

/**
 * 缓存清理和开发服务器重启脚本
 * 解决可能的缓存和热重载问题
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 缓存清理和开发服务器重启');
console.log('============================');

// 1. 清理 Next.js 缓存
function clearNextJSCache() {
  console.log('\n1. 清理 Next.js 缓存:');
  
  const cacheDirectories = [
    '.next',
    'node_modules/.cache',
    '.next/cache',
    '.next/static',
    '.next/server'
  ];
  
  cacheDirectories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      try {
        console.log(`   🗑️  删除: ${dir}`);
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`   ✅ 已删除: ${dir}`);
      } catch (error) {
        console.log(`   ❌ 删除失败 ${dir}:`, error.message);
      }
    } else {
      console.log(`   ⏭️  跳过 (不存在): ${dir}`);
    }
  });
}

// 2. 清理浏览器缓存指导
function generateBrowserCacheClearGuide() {
  console.log('\n2. 浏览器缓存清理指导:');
  console.log('   📋 请手动执行以下步骤:');
  console.log('   1. 打开浏览器开发者工具 (F12)');
  console.log('   2. 右键点击刷新按钮');
  console.log('   3. 选择"清空缓存并硬性重新加载"');
  console.log('   4. 或者使用快捷键: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)');
  console.log('   5. 清理 localStorage: 在控制台执行 localStorage.clear()');
  console.log('   6. 清理 sessionStorage: 在控制台执行 sessionStorage.clear()');
}

// 3. 重新安装依赖 (可选)
function reinstallDependencies() {
  console.log('\n3. 重新安装依赖 (可选):');
  
  try {
    console.log('   🔄 删除 node_modules...');
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      fs.rmSync(nodeModulesPath, { recursive: true, force: true });
      console.log('   ✅ node_modules 已删除');
    }
    
    console.log('   📦 重新安装依赖...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('   ✅ 依赖重新安装完成');
    
  } catch (error) {
    console.log('   ❌ 重新安装依赖失败:', error.message);
    console.log('   💡 请手动执行: rm -rf node_modules && npm install');
  }
}

// 4. 生成开发服务器启动脚本
function generateDevServerScript() {
  console.log('\n4. 生成开发服务器启动脚本:');
  
  const startScript = `#!/usr/bin/env node

/**
 * 开发服务器启动脚本
 * 确保干净的启动环境
 */

const { spawn } = require('child_process');

console.log('🚀 启动 Next.js 开发服务器');
console.log('========================');

// 设置环境变量
process.env.NODE_ENV = 'development';
process.env.NEXT_TELEMETRY_DISABLED = '1';

// 启动开发服务器
const devServer = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

devServer.on('error', (error) => {
  console.error('❌ 启动开发服务器失败:', error);
});

devServer.on('close', (code) => {
  console.log(\`🔚 开发服务器已关闭，退出码: \${code}\`);
});

// 处理进程退出
process.on('SIGINT', () => {
  console.log('\\n🛑 正在关闭开发服务器...');
  devServer.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\\n🛑 正在关闭开发服务器...');
  devServer.kill('SIGTERM');
});

console.log('💡 提示:');
console.log('- 服务器启动后，访问 http://localhost:3002');
console.log('- 使用 Ctrl+C 停止服务器');
console.log('- 如果端口被占用，服务器会自动选择其他端口');
`;

  const scriptPath = path.join(process.cwd(), 'scripts', 'start-dev-clean.js');
  fs.writeFileSync(scriptPath, startScript);
  console.log(`   ✅ 启动脚本已生成: ${scriptPath}`);
  
  return scriptPath;
}

// 5. 生成完整的测试流程
function generateTestProcedure() {
  console.log('\n5. 完整测试流程:');
  console.log('================');
  
  const steps = [
    '🧹 清理所有缓存 (已完成)',
    '🔄 重启开发服务器',
    '🌐 在新的浏览器标签页中访问应用',
    '🔐 重新登录 (使用 test001 / password123)',
    '📍 导航到 lab 页面',
    '🎯 点击班样按钮',
    '✅ 验证是否成功跳转到 shift-sample 页面'
  ];
  
  steps.forEach((step, index) => {
    console.log(`   ${index + 1}. ${step}`);
  });
  
  console.log('\n   🔍 关键检查点:');
  console.log('   - 确保使用的是清理缓存后的新页面');
  console.log('   - 确保认证状态是重新建立的');
  console.log('   - 确保没有旧的 localStorage 数据干扰');
  console.log('   - 观察浏览器控制台是否有新的错误信息');
}

// 6. 生成浏览器调试增强版
function generateEnhancedBrowserDebug() {
  console.log('\n6. 生成增强版浏览器调试代码:');
  
  const debugCode = `
// ===== 增强版班样按钮调试器 =====
console.log('🔬 [增强调试] 班样按钮增强调试器启动');

// 清理之前的调试数据
if (window.routingDiagnosis) {
  console.log('🧹 [增强调试] 清理之前的调试数据');
  delete window.routingDiagnosis;
}

// 初始化调试状态
window.routingDiagnosis = {
  logs: [],
  clicks: [],
  routes: [],
  auth: [],
  errors: [],
  startTime: Date.now()
};

// 记录初始状态
const initialState = {
  path: window.location.pathname,
  userAgent: navigator.userAgent,
  timestamp: Date.now(),
  localStorage: {
    userData: localStorage.getItem('fdx_user_data'),
    sessionData: localStorage.getItem('fdx_session_data')
  }
};

window.routingDiagnosis.logs.push({
  type: 'initial',
  data: initialState
});

console.log('📊 [增强调试] 初始状态:', initialState);

// 专门监控班样按钮
let shiftSampleButtonFound = false;

function findShiftSampleButton() {
  const buttons = Array.from(document.querySelectorAll('button'));
  const shiftButton = buttons.find(btn => btn.textContent?.includes('班样'));
  
  if (shiftButton && !shiftSampleButtonFound) {
    shiftSampleButtonFound = true;
    console.log('🎯 [增强调试] 找到班样按钮:', {
      element: shiftButton,
      text: shiftButton.textContent,
      className: shiftButton.className,
      disabled: shiftButton.disabled,
      onclick: shiftButton.onclick,
      eventListeners: getEventListeners ? getEventListeners(shiftButton) : '需要在 Sources 面板中查看'
    });
    
    // 添加专门的点击监听器
    shiftButton.addEventListener('click', function(e) {
      const clickData = {
        timestamp: Date.now(),
        target: e.target,
        currentTarget: e.currentTarget,
        path: window.location.pathname,
        authState: {
          userData: localStorage.getItem('fdx_user_data'),
          sessionData: localStorage.getItem('fdx_session_data')
        },
        preventDefault: e.defaultPrevented,
        propagationStopped: e.cancelBubble
      };
      
      window.routingDiagnosis.clicks.push(clickData);
      console.log('🖱️ [增强调试] 班样按钮点击详情:', clickData);
      
      // 跟踪后续路径变化
      let pathCheckCount = 0;
      const pathChecker = setInterval(() => {
        pathCheckCount++;
        const currentPath = window.location.pathname;
        
        window.routingDiagnosis.routes.push({
          timestamp: Date.now(),
          path: currentPath,
          checkNumber: pathCheckCount
        });
        
        console.log(\`🔄 [\${pathCheckCount * 100}ms] 路径检查:\`, currentPath);
        
        if (pathCheckCount >= 20) {
          clearInterval(pathChecker);
          
          const finalPath = window.location.pathname;
          const success = finalPath === '/shift-sample';
          
          console.log('📊 [增强调试] 最终结果:', {
            success,
            finalPath,
            expectedPath: '/shift-sample',
            totalChecks: pathCheckCount,
            routeHistory: window.routingDiagnosis.routes.slice(-20)
          });
        }
      }, 100);
    }, true); // 使用捕获阶段
  }
}

// 定期查找按钮
const buttonFinder = setInterval(() => {
  if (!shiftSampleButtonFound) {
    findShiftSampleButton();
  } else {
    clearInterval(buttonFinder);
  }
}, 500);

// 监控所有路由变化
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function(...args) {
  console.log('🚀 [增强调试] history.pushState:', args);
  window.routingDiagnosis.routes.push({
    type: 'pushState',
    timestamp: Date.now(),
    args,
    stackTrace: new Error().stack
  });
  return originalPushState.apply(this, args);
};

history.replaceState = function(...args) {
  console.log('🔄 [增强调试] history.replaceState:', args);
  window.routingDiagnosis.routes.push({
    type: 'replaceState',
    timestamp: Date.now(),
    args,
    stackTrace: new Error().stack
  });
  return originalReplaceState.apply(this, args);
};

// 提供调试报告函数
window.getEnhancedDiagnosisReport = function() {
  const report = {
    summary: {
      totalLogs: window.routingDiagnosis.logs.length,
      totalClicks: window.routingDiagnosis.clicks.length,
      totalRoutes: window.routingDiagnosis.routes.length,
      totalErrors: window.routingDiagnosis.errors.length,
      duration: Date.now() - window.routingDiagnosis.startTime,
      buttonFound: shiftSampleButtonFound
    },
    data: window.routingDiagnosis
  };
  
  console.log('📋 [增强调试] 完整诊断报告:', report);
  return report;
};

console.log('✅ [增强调试] 增强版调试器设置完成');
console.log('📝 [增强调试] 使用 getEnhancedDiagnosisReport() 获取报告');
`;

  console.log('   📋 增强版调试代码:');
  console.log('   ================================');
  console.log(debugCode);
  console.log('   ================================');
}

// 主函数
function main() {
  console.log('开始缓存清理和重启流程...\n');
  
  // 执行清理步骤
  clearNextJSCache();
  generateBrowserCacheClearGuide();
  
  // 询问是否重新安装依赖
  console.log('\n❓ 是否需要重新安装依赖？');
  console.log('   如果问题持续存在，建议重新安装依赖');
  console.log('   手动执行: rm -rf node_modules && npm install');
  
  // 生成启动脚本
  const startScriptPath = generateDevServerScript();
  
  // 生成测试流程
  generateTestProcedure();
  
  // 生成增强调试代码
  generateEnhancedBrowserDebug();
  
  console.log('\n🎯 总结:');
  console.log('========');
  console.log('1. ✅ Next.js 缓存已清理');
  console.log('2. 📋 浏览器缓存清理指导已提供');
  console.log('3. 🚀 开发服务器启动脚本已生成');
  console.log('4. 📝 完整测试流程已制定');
  console.log('5. 🔬 增强版调试代码已准备');
  
  console.log('\n🚀 下一步:');
  console.log('1. 手动清理浏览器缓存');
  console.log('2. 启动开发服务器: npm run dev');
  console.log('3. 在新标签页中访问应用');
  console.log('4. 执行增强版调试代码');
  console.log('5. 测试班样按钮功能');
  console.log('6. 获取详细诊断报告');
  
  return { success: true, startScriptPath };
}

// 运行主函数
const result = main();

console.log('\n💡 重要提示:');
console.log('============');
console.log('缓存问题是导致开发环境异常行为的常见原因。');
console.log('清理缓存后，请确保:');
console.log('- 使用新的浏览器标签页');
console.log('- 重新登录建立新的认证状态');
console.log('- 观察控制台是否有新的错误信息');
console.log('- 使用增强版调试器获取详细的运行时信息');

if (result.success) {
  console.log('\n✅ 缓存清理完成！请按照上述步骤继续测试。');
} else {
  console.log('\n❌ 缓存清理过程中出现问题，请手动执行相关步骤。');
}
