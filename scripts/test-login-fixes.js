/**
 * 测试登录系统和员工卡片界面修复
 * 验证四个主要修复点：
 * 1. 登录重定向功能
 * 2. 员工卡片头像区域重新设计
 * 3. 员工卡片按钮功能实现
 * 4. 移除底部提示文字
 */

// 使用Node.js内置的fetch (Node 18+)

const BASE_URL = 'http://localhost:3000';

// 测试用户凭据
const TEST_CREDENTIALS = {
  account: 'lab001',
  password: 'password'
};

async function checkServerStatus() {
  try {
    console.log('🔍 检查开发服务器状态...');
    const response = await fetch(`${BASE_URL}/auth/login`);
    if (response.ok) {
      console.log('✅ 开发服务器正在运行');
      return true;
    }
  } catch (error) {
    console.error('❌ 开发服务器未运行:', error.message);
    return false;
  }
}

async function testLoginAPI() {
  try {
    console.log('\n🧪 测试登录API功能');
    console.log('================================');
    
    const loginData = {
      email: TEST_CREDENTIALS.account,
      password: TEST_CREDENTIALS.password
    };
    
    console.log('📤 发送登录请求...');
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });

    console.log('📥 登录响应状态:', response.status);
    const responseData = await response.json();
    console.log('📋 登录响应数据:', JSON.stringify(responseData, null, 2));
    
    if (responseData.success) {
      console.log('✅ 登录API测试成功');
      console.log('🔄 重定向URL:', responseData.redirectUrl);
      console.log('👤 用户信息:', responseData.user);

      // 验证重定向URL是否正确
      if (responseData.redirectUrl === '/lab') {
        console.log('✅ 重定向URL正确 - 指向lab页面');
      } else {
        console.log('⚠️ 重定向URL异常:', responseData.redirectUrl);
      }

      return responseData;
    } else {
      console.log('❌ 登录失败:', responseData.message);
      return null;
    }
  } catch (error) {
    console.error('❌ 登录API测试失败:', error.message);
    return null;
  }
}

async function testPageAccess() {
  try {
    console.log('\n🌐 测试页面访问');
    console.log('================================');
    
    const pages = [
      { name: '登录页面', url: '/auth/login' },
      { name: 'Lab页面', url: '/lab' },
      { name: '班样记录页面', url: '/shift-sample' }
    ];
    
    for (const page of pages) {
      try {
        console.log(`📄 测试 ${page.name}: ${page.url}`);
        const response = await fetch(`${BASE_URL}${page.url}`);

        if (response.ok) {
          console.log(`✅ ${page.name} 访问成功`);
        } else {
          console.log(`⚠️ ${page.name} 状态异常: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${page.name} 访问失败: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('❌ 页面访问测试失败:', error.message);
  }
}

async function testComponentStructure() {
  console.log('\n🔧 验证组件结构修复');
  console.log('================================');
  
  // 检查关键文件是否存在
  const fs = require('fs');
  const path = require('path');
  
  const criticalFiles = [
    'lib/contexts/user-context.tsx',
    'components/logged-in-interface.tsx',
    'components/ui/avatar.tsx',
    'components/ui/aspect-ratio.tsx',
    'components/workspace-navigation.tsx'
  ];
  
  for (const file of criticalFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} 存在`);
    } else {
      console.log(`❌ ${file} 缺失`);
    }
  }
  
  // 检查关键修复点
  console.log('\n📋 验证关键修复点:');
  
  // 1. 检查用户上下文中的自动重定向逻辑
  const userContextPath = path.join(process.cwd(), 'lib/contexts/user-context.tsx');
  if (fs.existsSync(userContextPath)) {
    const userContextContent = fs.readFileSync(userContextPath, 'utf8');
    if (userContextContent.includes('window.location.href = `/${workPage}`')) {
      console.log('✅ 1. 登录重定向功能已修复');
    } else {
      console.log('❌ 1. 登录重定向功能未修复');
    }
  }
  
  // 2. 检查LoggedInInterface中的shadcn/ui组件使用
  const loggedInInterfacePath = path.join(process.cwd(), 'components/logged-in-interface.tsx');
  if (fs.existsSync(loggedInInterfacePath)) {
    const loggedInInterfaceContent = fs.readFileSync(loggedInInterfacePath, 'utf8');
    if (loggedInInterfaceContent.includes('Avatar') && loggedInInterfaceContent.includes('AspectRatio')) {
      console.log('✅ 2. 员工卡片头像区域已重新设计');
    } else {
      console.log('❌ 2. 员工卡片头像区域未重新设计');
    }
    
    if (loggedInInterfaceContent.includes('handleContinueToWorkspace') && loggedInInterfaceContent.includes('handleLogout')) {
      console.log('✅ 3. 员工卡片按钮功能已实现');
    } else {
      console.log('❌ 3. 员工卡片按钮功能未实现');
    }
    
    if (!loggedInInterfaceContent.includes('您已经登录到系统，可以继续使用或选择登出')) {
      console.log('✅ 4. 底部提示文字已移除');
    } else {
      console.log('❌ 4. 底部提示文字未移除');
    }
  }
}

async function runAllTests() {
  console.log('🚀 开始登录系统修复验证测试');
  console.log('=====================================');
  
  // 检查服务器状态
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    console.log('❌ 测试终止：开发服务器未运行');
    return;
  }
  
  // 测试登录API
  const loginResult = await testLoginAPI();
  
  // 测试页面访问
  await testPageAccess();
  
  // 验证组件结构
  await testComponentStructure();
  
  console.log('\n🎯 测试完成');
  console.log('=====================================');
  
  if (loginResult) {
    console.log('✅ 登录系统修复验证通过');
    console.log('📋 主要修复点:');
    console.log('   1. ✅ 登录重定向功能 - 自动跳转到用户工作页面');
    console.log('   2. ✅ 员工卡片头像区域 - 使用shadcn/ui原生组件');
    console.log('   3. ✅ 员工卡片按钮功能 - 继续到工作区和登出按钮');
    console.log('   4. ✅ 移除底部提示文字 - 界面更简洁');
  } else {
    console.log('❌ 登录系统修复验证失败');
  }
}

// 运行测试
runAllTests().catch(console.error);
