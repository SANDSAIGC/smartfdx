#!/usr/bin/env node

/**
 * 运行时路由调试脚本
 * 生成浏览器控制台调试代码，用于实时监控路由跳转问题
 */

console.log('🔍 运行时路由调试代码生成器');
console.log('============================');

console.log('\n📋 使用说明:');
console.log('1. 复制下面的调试代码');
console.log('2. 在浏览器中打开开发者工具 (F12)');
console.log('3. 切换到 Console 标签页');
console.log('4. 粘贴并执行调试代码');
console.log('5. 在 lab 页面点击"班样"按钮');
console.log('6. 观察控制台输出的详细日志');

console.log('\n🚀 浏览器控制台调试代码:');
console.log('================================');

const debugCode = `
// 班样按钮路由调试器
console.log('🔍 [调试器] 班样按钮路由调试器已启动');

// 保存原始的 router.push 和 router.replace 方法
const originalPush = window.history.pushState;
const originalReplace = window.history.replaceState;

// 拦截所有路由变化
window.history.pushState = function(...args) {
  console.log('🚀 [路由调试] history.pushState 调用:', args);
  console.trace('🔍 [路由调试] 调用堆栈:');
  return originalPush.apply(this, args);
};

window.history.replaceState = function(...args) {
  console.log('🔄 [路由调试] history.replaceState 调用:', args);
  console.trace('🔍 [路由调试] 调用堆栈:');
  return originalReplace.apply(this, args);
};

// 监听 popstate 事件
window.addEventListener('popstate', function(event) {
  console.log('⬅️ [路由调试] popstate 事件:', event);
  console.log('📍 [路由调试] 当前路径:', window.location.pathname);
});

// 监听 beforeunload 事件
window.addEventListener('beforeunload', function(event) {
  console.log('🚪 [路由调试] beforeunload 事件:', event);
  console.log('📍 [路由调试] 离开路径:', window.location.pathname);
});

// 拦截所有点击事件
document.addEventListener('click', function(event) {
  const target = event.target;
  const button = target.closest('button');
  
  if (button) {
    const buttonText = button.textContent?.trim();
    console.log('🖱️ [点击调试] 按钮点击:', {
      buttonText,
      element: button,
      classList: Array.from(button.classList),
      dataset: button.dataset
    });
    
    // 特别关注班样按钮
    if (buttonText?.includes('班样')) {
      console.log('🎯 [班样调试] 班样按钮被点击!');
      console.log('📍 [班样调试] 当前路径:', window.location.pathname);
      console.log('🔍 [班样调试] 按钮详情:', {
        outerHTML: button.outerHTML,
        onClick: button.onclick,
        eventListeners: getEventListeners ? getEventListeners(button) : '需要在 Chrome DevTools 中查看'
      });
      
      // 设置延迟检查，看路由是否真的发生了变化
      setTimeout(() => {
        console.log('⏰ [班样调试] 500ms 后检查路径变化:', window.location.pathname);
      }, 500);
      
      setTimeout(() => {
        console.log('⏰ [班样调试] 1000ms 后检查路径变化:', window.location.pathname);
      }, 1000);
      
      setTimeout(() => {
        console.log('⏰ [班样调试] 2000ms 后检查路径变化:', window.location.pathname);
      }, 2000);
    }
  }
});

// 监听 Next.js 路由变化（如果可用）
if (window.next && window.next.router) {
  const router = window.next.router;
  console.log('🔍 [Next.js调试] Next.js 路由器可用:', router);
  
  // 拦截 router.push
  const originalRouterPush = router.push;
  router.push = function(...args) {
    console.log('🚀 [Next.js调试] router.push 调用:', args);
    console.trace('🔍 [Next.js调试] 调用堆栈:');
    return originalRouterPush.apply(this, args);
  };
  
  // 拦截 router.replace
  const originalRouterReplace = router.replace;
  router.replace = function(...args) {
    console.log('🔄 [Next.js调试] router.replace 调用:', args);
    console.trace('🔍 [Next.js调试] 调用堆栈:');
    return originalRouterReplace.apply(this, args);
  };
}

// 定期检查路径变化
let lastPath = window.location.pathname;
setInterval(() => {
  const currentPath = window.location.pathname;
  if (currentPath !== lastPath) {
    console.log('🔄 [路径监控] 路径发生变化:', {
      from: lastPath,
      to: currentPath,
      timestamp: new Date().toISOString()
    });
    lastPath = currentPath;
  }
}, 100);

// 检查 AuthGuard 相关的状态
function checkAuthGuardState() {
  console.log('🔐 [认证调试] 检查认证状态...');
  
  // 检查 localStorage 中的用户数据
  const userData = localStorage.getItem('fdx_user_data');
  const sessionData = localStorage.getItem('fdx_session_data');
  
  console.log('💾 [认证调试] localStorage 数据:', {
    userData: userData ? JSON.parse(userData) : null,
    sessionData: sessionData ? JSON.parse(sessionData) : null
  });
  
  // 检查 React 组件状态（如果可用）
  const reactFiber = document.querySelector('[data-reactroot]')?._reactInternalFiber;
  if (reactFiber) {
    console.log('⚛️ [React调试] React Fiber 可用');
  }
}

// 立即检查认证状态
checkAuthGuardState();

// 每5秒检查一次认证状态
setInterval(checkAuthGuardState, 5000);

console.log('✅ [调试器] 班样按钮路由调试器设置完成');
console.log('📝 [调试器] 现在可以点击班样按钮进行测试');
console.log('🔍 [调试器] 所有路由变化和点击事件都会被记录');
`;

console.log(debugCode);

console.log('\n================================');

console.log('\n📝 调试步骤:');
console.log('1. 复制上面的调试代码');
console.log('2. 在浏览器中访问 http://localhost:3002/lab');
console.log('3. 打开开发者工具 (F12)');
console.log('4. 在 Console 中粘贴并执行调试代码');
console.log('5. 点击"班样"按钮');
console.log('6. 观察控制台输出');

console.log('\n🔍 关键观察点:');
console.log('- 🖱️ 按钮点击是否被正确捕获');
console.log('- 🚀 router.push 是否被调用');
console.log('- 🔄 路径是否发生变化');
console.log('- 🔐 认证状态是否稳定');
console.log('- ⏰ 延迟检查中路径的变化情况');

console.log('\n🎯 预期结果:');
console.log('- 点击班样按钮后应该看到 router.push("/shift-sample") 调用');
console.log('- 路径应该从 /lab 变化到 /shift-sample');
console.log('- 如果路径没有变化，说明存在重定向拦截问题');
console.log('- 如果路径变化后又变回来，说明存在重定向循环');

console.log('\n🛠️  常见问题排查:');
console.log('1. 如果没有看到 router.push 调用:');
console.log('   - 检查按钮的点击事件绑定');
console.log('   - 检查 handleWorkAreaClick 函数是否正确执行');

console.log('\n2. 如果看到 router.push 但路径没变化:');
console.log('   - 检查 Next.js 路由配置');
console.log('   - 检查是否有其他代码阻止了路由变化');

console.log('\n3. 如果路径变化后又变回来:');
console.log('   - 检查 AuthGuard 的重定向逻辑');
console.log('   - 检查认证状态是否稳定');
console.log('   - 查看是否有重定向循环');

console.log('\n4. 如果看到多个 router.replace 调用:');
console.log('   - 检查 AuthGuard 组件的 useEffect 依赖');
console.log('   - 检查是否有重复的认证检查');

console.log('\n📊 成功标准:');
console.log('✅ 点击班样按钮 → router.push("/shift-sample") → 路径变为 /shift-sample → 停留在该页面');

console.log('\n🚀 开始调试！');
console.log('请按照上述步骤进行调试，并将控制台输出结果反馈给我。');
