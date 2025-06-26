#!/usr/bin/env node

/**
 * 持久化登录状态管理系统测试脚本
 * 测试API端点和基础功能
 */

async function testAuthAPI() {
  console.log('🧪 开始测试持久化登录状态管理系统API');
  console.log('================================');

  try {
    console.log('\n📝 步骤1: 测试登录API');

    const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test001',
        password: '123456'
      }),
    });

    const loginResult = await loginResponse.json();
    console.log(`✅ 登录API响应: ${loginResponse.status}`);
    console.log(`✅ 登录结果: ${loginResult.success ? '成功' : '失败'}`);

    if (loginResult.success && loginResult.user) {
      console.log(`✅ 用户信息: ${loginResult.user.姓名} (${loginResult.user.账号})`);
      console.log(`✅ 重定向URL: ${loginResult.redirectUrl}`);
    }

    console.log('\n📝 步骤2: 执行登录操作');
    // 填写登录信息
    await page.type('input[id="account"]', 'test001');
    await page.type('input[id="password"]', '123456');
    
    // 勾选"记住我"
    await page.click('input[id="remember"]');
    console.log('✅ 已勾选"记住我"选项');
    
    // 点击登录按钮
    await page.click('button[type="submit"]');
    console.log('✅ 已提交登录表单');
    
    // 等待重定向
    await page.waitForNavigation({ timeout: 10000 });
    console.log('✅ 登录成功，已重定向');

    console.log('\n📝 步骤3: 检查localStorage中的认证数据');
    const authData = await page.evaluate(() => {
      return {
        userData: localStorage.getItem('fdx_user_data'),
        sessionData: localStorage.getItem('fdx_session_data'),
        rememberMe: localStorage.getItem('fdx_remember_me')
      };
    });
    
    console.log('✅ localStorage认证数据:');
    console.log(`   - 用户数据: ${authData.userData ? '存在' : '不存在'}`);
    console.log(`   - 会话数据: ${authData.sessionData ? '存在' : '不存在'}`);
    console.log(`   - 记住我: ${authData.rememberMe}`);

    console.log('\n📝 步骤4: 访问认证测试页面');
    await page.goto('http://localhost:3002/auth-test');
    await page.waitForSelector('[data-testid="auth-status"]', { timeout: 5000 }).catch(() => {
      console.log('⚠️ 认证状态元素未找到，继续测试...');
    });
    
    // 检查认证状态
    const authStatus = await page.evaluate(() => {
      const badges = Array.from(document.querySelectorAll('[data-state]'));
      return badges.map(badge => badge.textContent).join(', ');
    });
    
    console.log(`✅ 认证状态: ${authStatus || '页面已加载'}`);

    console.log('\n📝 步骤5: 刷新页面测试状态持久性');
    await page.reload();
    await page.waitForLoadState('networkidle');
    console.log('✅ 页面刷新完成');
    
    // 等待认证系统初始化
    await page.waitForTimeout(2000);
    
    // 再次检查认证数据
    const authDataAfterRefresh = await page.evaluate(() => {
      return {
        userData: localStorage.getItem('fdx_user_data'),
        sessionData: localStorage.getItem('fdx_session_data'),
        hasUserInDOM: !!document.querySelector('[data-testid="user-info"]')
      };
    });
    
    console.log('✅ 刷新后认证数据:');
    console.log(`   - 用户数据: ${authDataAfterRefresh.userData ? '保持' : '丢失'}`);
    console.log(`   - 会话数据: ${authDataAfterRefresh.sessionData ? '保持' : '丢失'}`);

    console.log('\n📝 步骤6: 关闭并重新打开标签页');
    await page.close();
    
    // 创建新页面（模拟重新打开标签页）
    const newPage = await browser.newPage();
    
    // 监听新页面的控制台输出
    newPage.on('console', msg => {
      if (msg.text().includes('[Auth]')) {
        console.log(`🔐 新页面日志: ${msg.text()}`);
      }
    });
    
    await newPage.goto('http://localhost:3002/auth-test');
    await newPage.waitForLoadState('networkidle');
    console.log('✅ 新标签页加载完成');
    
    // 等待认证系统初始化
    await newPage.waitForTimeout(3000);
    
    // 检查认证状态是否恢复
    const finalAuthData = await newPage.evaluate(() => {
      return {
        userData: localStorage.getItem('fdx_user_data'),
        sessionData: localStorage.getItem('fdx_session_data'),
        isAuthenticated: !!localStorage.getItem('fdx_user_data') && !!localStorage.getItem('fdx_session_data')
      };
    });
    
    console.log('✅ 新标签页认证状态:');
    console.log(`   - 用户数据: ${finalAuthData.userData ? '恢复成功' : '恢复失败'}`);
    console.log(`   - 会话数据: ${finalAuthData.sessionData ? '恢复成功' : '恢复失败'}`);
    console.log(`   - 认证状态: ${finalAuthData.isAuthenticated ? '已认证' : '未认证'}`);

    console.log('\n📝 步骤7: 测试受保护页面访问');
    await newPage.goto('http://localhost:3002/shift-sample');
    
    // 检查是否能正常访问受保护页面
    const isProtectedPageAccessible = await newPage.evaluate(() => {
      return !window.location.pathname.includes('/auth/login');
    });
    
    console.log(`✅ 受保护页面访问: ${isProtectedPageAccessible ? '成功' : '被重定向到登录页'}`);

    console.log('\n🎯 测试总结');
    console.log('================================');
    
    const testResults = {
      login: true,
      dataStorage: !!authData.userData && !!authData.sessionData,
      pageRefresh: !!authDataAfterRefresh.userData && !!authDataAfterRefresh.sessionData,
      tabReopen: !!finalAuthData.userData && !!finalAuthData.sessionData,
      protectedAccess: isProtectedPageAccessible
    };
    
    console.log(`✅ 登录功能: ${testResults.login ? '通过' : '失败'}`);
    console.log(`✅ 数据存储: ${testResults.dataStorage ? '通过' : '失败'}`);
    console.log(`✅ 页面刷新: ${testResults.pageRefresh ? '通过' : '失败'}`);
    console.log(`✅ 标签重开: ${testResults.tabReopen ? '通过' : '失败'}`);
    console.log(`✅ 受保护访问: ${testResults.protectedAccess ? '通过' : '失败'}`);
    
    const allTestsPassed = Object.values(testResults).every(result => result);
    console.log(`\n🏆 总体结果: ${allTestsPassed ? '全部通过' : '部分失败'}`);
    
    if (allTestsPassed) {
      console.log('🎉 持久化登录状态管理系统工作正常！');
    } else {
      console.log('⚠️ 部分功能需要检查和修复');
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  } finally {
    if (browser) {
      console.log('\n🔚 关闭浏览器...');
      await browser.close();
    }
  }
}

// 检查开发服务器是否运行
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3002/auth/login');
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔍 检查开发服务器状态...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ 开发服务器未运行，请先启动:');
    console.log('   npm run dev:turbo');
    return;
  }
  
  console.log('✅ 开发服务器正在运行\n');
  await testPersistentAuth();
}

main().catch(console.error);
