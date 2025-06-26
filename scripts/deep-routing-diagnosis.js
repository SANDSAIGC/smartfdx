#!/usr/bin/env node

/**
 * 深度路由诊断脚本
 * 全面分析班样按钮路由问题的运行时状态
 */

console.log('🔬 深度路由诊断系统');
console.log('==================');

console.log('\n📋 诊断计划:');
console.log('1. 🔐 运行时认证状态检查');
console.log('2. 🚀 路由跳转时序分析');
console.log('3. ⚛️  组件渲染状态诊断');
console.log('4. 🌐 网络和缓存问题检查');
console.log('5. 🛠️  Next.js 系统状态验证');

console.log('\n🚀 生成实时诊断代码...');

const diagnosticCode = `
// ===== 深度路由诊断系统 =====
console.log('🔬 [深度诊断] 深度路由诊断系统启动');

// 全局诊断状态
window.routingDiagnosis = {
  logs: [],
  authStates: [],
  routeChanges: [],
  componentRenders: [],
  errors: [],
  startTime: Date.now()
};

// 日志记录函数
function logDiagnosis(category, message, data = {}) {
  const entry = {
    timestamp: Date.now(),
    category,
    message,
    data,
    relativeTime: Date.now() - window.routingDiagnosis.startTime
  };
  
  window.routingDiagnosis.logs.push(entry);
  console.log(\`🔬 [\${category}] \${message}\`, data);
  
  return entry;
}

// ===== 1. 认证状态监控 =====
function monitorAuthState() {
  logDiagnosis('认证监控', '开始监控认证状态');
  
  // 检查 localStorage 认证数据
  function checkAuthData() {
    const userData = localStorage.getItem('fdx_user_data');
    const sessionData = localStorage.getItem('fdx_session_data');
    
    const authState = {
      timestamp: Date.now(),
      hasUserData: !!userData,
      hasSessionData: !!sessionData,
      userData: userData ? JSON.parse(userData) : null,
      sessionData: sessionData ? JSON.parse(sessionData) : null,
      currentPath: window.location.pathname
    };
    
    window.routingDiagnosis.authStates.push(authState);
    
    return authState;
  }
  
  // 立即检查一次
  const initialAuth = checkAuthData();
  logDiagnosis('认证状态', '初始认证状态', initialAuth);
  
  // 定期检查认证状态变化
  setInterval(() => {
    const currentAuth = checkAuthData();
    const lastAuth = window.routingDiagnosis.authStates[window.routingDiagnosis.authStates.length - 2];
    
    if (lastAuth && JSON.stringify(currentAuth) !== JSON.stringify(lastAuth)) {
      logDiagnosis('认证变化', '认证状态发生变化', {
        from: lastAuth,
        to: currentAuth
      });
    }
  }, 500);
}

// ===== 2. 路由跳转监控 =====
function monitorRouting() {
  logDiagnosis('路由监控', '开始监控路由跳转');
  
  // 拦截 Next.js 路由器
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    logDiagnosis('路由跳转', 'history.pushState 调用', {
      args,
      from: window.location.pathname,
      stackTrace: new Error().stack
    });
    
    window.routingDiagnosis.routeChanges.push({
      type: 'pushState',
      timestamp: Date.now(),
      args,
      from: window.location.pathname
    });
    
    return originalPushState.apply(this, args);
  };
  
  history.replaceState = function(...args) {
    logDiagnosis('路由跳转', 'history.replaceState 调用', {
      args,
      from: window.location.pathname,
      stackTrace: new Error().stack
    });
    
    window.routingDiagnosis.routeChanges.push({
      type: 'replaceState',
      timestamp: Date.now(),
      args,
      from: window.location.pathname
    });
    
    return originalReplaceState.apply(this, args);
  };
  
  // 监听 popstate 事件
  window.addEventListener('popstate', function(event) {
    logDiagnosis('路由事件', 'popstate 事件触发', {
      event,
      currentPath: window.location.pathname
    });
  });
  
  // 路径变化监控
  let lastPath = window.location.pathname;
  setInterval(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      logDiagnosis('路径变化', '检测到路径变化', {
        from: lastPath,
        to: currentPath,
        timestamp: Date.now()
      });
      lastPath = currentPath;
    }
  }, 50);
}

// ===== 3. 组件渲染监控 =====
function monitorComponentRenders() {
  logDiagnosis('组件监控', '开始监控组件渲染');
  
  // 监控 React 错误
  window.addEventListener('error', function(event) {
    logDiagnosis('组件错误', 'JavaScript 错误', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
    
    window.routingDiagnosis.errors.push({
      type: 'javascript',
      timestamp: Date.now(),
      error: event.error,
      message: event.message
    });
  });
  
  // 监控未处理的 Promise 拒绝
  window.addEventListener('unhandledrejection', function(event) {
    logDiagnosis('组件错误', 'Promise 拒绝', {
      reason: event.reason,
      promise: event.promise
    });
    
    window.routingDiagnosis.errors.push({
      type: 'promise',
      timestamp: Date.now(),
      reason: event.reason
    });
  });
}

// ===== 4. 班样按钮专项监控 =====
function monitorShiftSampleButton() {
  logDiagnosis('按钮监控', '开始监控班样按钮');
  
  // 监控所有点击事件
  document.addEventListener('click', function(event) {
    const target = event.target;
    const button = target.closest('button');
    
    if (button) {
      const buttonText = button.textContent?.trim();
      
      if (buttonText?.includes('班样')) {
        logDiagnosis('班样按钮', '班样按钮被点击', {
          buttonElement: button.outerHTML.substring(0, 200),
          currentPath: window.location.pathname,
          authState: window.routingDiagnosis.authStates[window.routingDiagnosis.authStates.length - 1],
          timestamp: Date.now()
        });
        
        // 详细的点击后状态跟踪
        const clickTracker = {
          clickTime: Date.now(),
          initialPath: window.location.pathname,
          pathChecks: []
        };
        
        // 连续检查路径变化
        for (let i = 0; i < 20; i++) {
          setTimeout(() => {
            const currentPath = window.location.pathname;
            clickTracker.pathChecks.push({
              time: i * 100,
              path: currentPath,
              changed: currentPath !== clickTracker.initialPath
            });
            
            if (i === 19) {
              logDiagnosis('班样跟踪', '班样按钮点击后路径跟踪完成', clickTracker);
              
              // 分析结果
              const finalPath = clickTracker.pathChecks[clickTracker.pathChecks.length - 1].path;
              const pathChanged = finalPath !== clickTracker.initialPath;
              const reachedTarget = finalPath === '/shift-sample';
              
              logDiagnosis('班样结果', '班样按钮点击结果分析', {
                success: reachedTarget,
                pathChanged,
                finalPath,
                expectedPath: '/shift-sample',
                clickTracker
              });
            }
          }, i * 100);
        }
      }
    }
  });
}

// ===== 5. 网络请求监控 =====
function monitorNetworkRequests() {
  logDiagnosis('网络监控', '开始监控网络请求');
  
  // 拦截 fetch 请求
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    logDiagnosis('网络请求', 'fetch 请求', { url, args });
    
    return originalFetch.apply(this, args)
      .then(response => {
        logDiagnosis('网络响应', 'fetch 响应', {
          url,
          status: response.status,
          ok: response.ok
        });
        return response;
      })
      .catch(error => {
        logDiagnosis('网络错误', 'fetch 错误', { url, error });
        throw error;
      });
  };
}

// ===== 6. 诊断报告生成 =====
function generateDiagnosisReport() {
  const report = {
    summary: {
      totalLogs: window.routingDiagnosis.logs.length,
      authStateChanges: window.routingDiagnosis.authStates.length,
      routeChanges: window.routingDiagnosis.routeChanges.length,
      errors: window.routingDiagnosis.errors.length,
      duration: Date.now() - window.routingDiagnosis.startTime
    },
    authStates: window.routingDiagnosis.authStates,
    routeChanges: window.routingDiagnosis.routeChanges,
    errors: window.routingDiagnosis.errors,
    logs: window.routingDiagnosis.logs
  };
  
  console.log('📊 [诊断报告] 完整诊断报告:', report);
  return report;
}

// ===== 启动所有监控 =====
monitorAuthState();
monitorRouting();
monitorComponentRenders();
monitorShiftSampleButton();
monitorNetworkRequests();

// 提供全局诊断函数
window.getDiagnosisReport = generateDiagnosisReport;
window.clearDiagnosis = function() {
  window.routingDiagnosis = {
    logs: [],
    authStates: [],
    routeChanges: [],
    componentRenders: [],
    errors: [],
    startTime: Date.now()
  };
  console.log('🧹 [诊断清理] 诊断数据已清理');
};

// 定期生成摘要报告
setInterval(() => {
  const summary = {
    logs: window.routingDiagnosis.logs.length,
    authStates: window.routingDiagnosis.authStates.length,
    routeChanges: window.routingDiagnosis.routeChanges.length,
    errors: window.routingDiagnosis.errors.length,
    lastAuth: window.routingDiagnosis.authStates[window.routingDiagnosis.authStates.length - 1],
    currentPath: window.location.pathname
  };
  
  logDiagnosis('定期摘要', '诊断状态摘要', summary);
}, 5000);

console.log('✅ [深度诊断] 深度路由诊断系统已完全启动');
console.log('📝 [深度诊断] 可用命令:');
console.log('   - getDiagnosisReport(): 获取完整诊断报告');
console.log('   - clearDiagnosis(): 清理诊断数据');
console.log('   - window.routingDiagnosis: 查看实时诊断数据');
`;

console.log('📋 深度诊断代码已生成');
console.log('================================');
console.log(diagnosticCode);
console.log('================================');

console.log('\n📝 使用说明:');
console.log('1. 复制上面的诊断代码');
console.log('2. 在浏览器中访问 http://localhost:3002/lab');
console.log('3. 打开开发者工具 (F12)');
console.log('4. 在 Console 中粘贴并执行诊断代码');
console.log('5. 点击"班样"按钮');
console.log('6. 等待 2-3 秒让诊断完成');
console.log('7. 执行 getDiagnosisReport() 获取完整报告');

console.log('\n🔍 关键诊断点:');
console.log('- 🔐 认证状态是否在点击时稳定');
console.log('- 🚀 router.push 是否真正被调用');
console.log('- 🔄 路径变化的完整时序');
console.log('- ⚛️  是否有 React 组件错误');
console.log('- 🌐 是否有网络请求失败');
console.log('- 🛡️  AuthGuard 的具体行为');

console.log('\n📊 预期诊断结果:');
console.log('正常情况下应该看到:');
console.log('1. 班样按钮点击被正确捕获');
console.log('2. history.pushState 被调用，参数包含 /shift-sample');
console.log('3. 路径从 /lab 变化到 /shift-sample');
console.log('4. 认证状态保持稳定，无重复重定向');
console.log('5. 无 JavaScript 错误或网络错误');

console.log('\n🚨 异常情况分析:');
console.log('如果出现以下情况，说明存在问题:');
console.log('- 点击后没有 history.pushState 调用 → 按钮事件绑定问题');
console.log('- 有 pushState 但路径没变化 → Next.js 路由系统问题');
console.log('- 路径变化后又变回来 → AuthGuard 重定向问题');
console.log('- 认证状态不稳定 → UserContext 状态管理问题');
console.log('- 有 JavaScript 错误 → 组件渲染问题');
console.log('- 有网络错误 → API 或 Supabase 连接问题');

console.log('\n🛠️  故障排除步骤:');
console.log('根据诊断结果，按以下顺序排查:');
console.log('1. 检查按钮点击事件是否正确绑定');
console.log('2. 验证 Next.js 路由系统是否正常');
console.log('3. 分析 AuthGuard 重定向逻辑');
console.log('4. 检查 UserContext 状态管理');
console.log('5. 排查组件渲染错误');
console.log('6. 验证网络连接和 API 状态');

console.log('\n🚀 开始深度诊断!');
console.log('请按照上述步骤执行诊断，并将完整的诊断报告反馈给我。');
