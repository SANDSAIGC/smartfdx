#!/usr/bin/env node

/**
 * 班样按钮导航测试脚本
 * 自动化测试班样按钮的导航功能
 */

const puppeteer = require('puppeteer');

async function testShiftSampleNavigation() {
  console.log('🔍 班样按钮导航自动化测试');
  console.log('========================');

  let browser;
  let page;

  try {
    // 启动浏览器
    console.log('🚀 启动浏览器...');
    browser = await puppeteer.launch({
      headless: false, // 显示浏览器窗口以便观察
      devtools: true,  // 打开开发者工具
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    page = await browser.newPage();
    
    // 设置视口大小
    await page.setViewport({ width: 1280, height: 720 });

    // 监听控制台输出
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      if (text.includes('[AuthGuard]') || text.includes('[化验室]') || text.includes('[班样]')) {
        console.log(`📝 [浏览器控制台-${type}] ${text}`);
      }
    });

    // 监听页面错误
    page.on('pageerror', error => {
      console.log('❌ [页面错误]', error.message);
    });

    // 监听网络请求失败
    page.on('requestfailed', request => {
      console.log('🌐 [请求失败]', request.url(), request.failure().errorText);
    });

    console.log('📍 访问 lab 页面...');
    await page.goto('http://localhost:3002/lab', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // 等待页面加载完成
    console.log('⏳ 等待页面加载完成...');
    await page.waitForTimeout(2000);

    // 检查当前路径
    const currentPath = await page.evaluate(() => window.location.pathname);
    console.log('📍 当前路径:', currentPath);

    if (currentPath !== '/lab') {
      console.log('⚠️  页面被重定向到:', currentPath);
      
      if (currentPath.includes('/auth/login')) {
        console.log('🔐 页面被重定向到登录页面，需要先登录');
        
        // 尝试自动登录（如果有测试账号）
        console.log('🔑 尝试自动登录...');
        
        // 等待登录表单加载
        await page.waitForSelector('input[type="text"], input[type="email"]', { timeout: 5000 });
        
        // 填写测试账号（使用简单的员工ID）
        await page.type('input[type="text"], input[type="email"]', 'test001');
        await page.type('input[type="password"]', 'password123');
        
        // 点击登录按钮
        await page.click('button[type="submit"]');
        
        // 等待登录完成并重定向
        console.log('⏳ 等待登录完成...');
        await page.waitForTimeout(3000);
        
        // 检查是否成功重定向到 lab 页面
        const afterLoginPath = await page.evaluate(() => window.location.pathname);
        console.log('📍 登录后路径:', afterLoginPath);
        
        if (afterLoginPath !== '/lab') {
          console.log('❌ 登录后未能正确重定向到 lab 页面');
          return;
        }
      } else {
        console.log('❌ 页面被重定向到未知页面，测试终止');
        return;
      }
    }

    console.log('✅ 成功访问 lab 页面');

    // 查找班样按钮
    console.log('🔍 查找班样按钮...');
    
    // 等待按钮加载
    await page.waitForSelector('button', { timeout: 10000 });
    
    // 查找包含"班样"文本的按钮
    const shiftSampleButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(button => button.textContent?.includes('班样'));
    });

    if (!shiftSampleButton.asElement()) {
      console.log('❌ 未找到班样按钮');
      
      // 列出所有按钮以便调试
      const allButtons = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.map(button => ({
          text: button.textContent?.trim(),
          className: button.className,
          id: button.id
        }));
      });
      
      console.log('📋 页面中的所有按钮:', allButtons);
      return;
    }

    console.log('✅ 找到班样按钮');

    // 获取按钮详细信息
    const buttonInfo = await page.evaluate((button) => {
      return {
        text: button.textContent?.trim(),
        className: button.className,
        id: button.id,
        outerHTML: button.outerHTML.substring(0, 200) + '...'
      };
    }, shiftSampleButton.asElement());

    console.log('📋 班样按钮信息:', buttonInfo);

    // 记录点击前的状态
    const beforeClickPath = await page.evaluate(() => window.location.pathname);
    console.log('📍 点击前路径:', beforeClickPath);

    // 点击班样按钮
    console.log('🖱️  点击班样按钮...');
    await shiftSampleButton.asElement().click();

    // 等待路由变化
    console.log('⏳ 等待路由变化...');
    
    // 检查路径变化（多次检查）
    const pathChecks = [];
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(200);
      const currentPath = await page.evaluate(() => window.location.pathname);
      pathChecks.push({
        time: i * 200,
        path: currentPath
      });
    }

    console.log('📊 路径变化记录:');
    pathChecks.forEach(check => {
      console.log(`   ${check.time}ms: ${check.path}`);
    });

    // 分析结果
    const finalPath = pathChecks[pathChecks.length - 1].path;
    const pathChanged = finalPath !== beforeClickPath;
    const reachedShiftSample = finalPath === '/shift-sample';

    console.log('\n📊 测试结果分析:');
    console.log(`- 路径是否发生变化: ${pathChanged ? '✅ 是' : '❌ 否'}`);
    console.log(`- 是否到达 shift-sample 页面: ${reachedShiftSample ? '✅ 是' : '❌ 否'}`);
    console.log(`- 最终路径: ${finalPath}`);

    if (reachedShiftSample) {
      console.log('🎉 测试成功！班样按钮导航正常工作');
      
      // 验证 shift-sample 页面是否正确加载
      console.log('🔍 验证 shift-sample 页面内容...');
      
      // 等待页面内容加载
      await page.waitForTimeout(2000);
      
      // 检查页面是否包含班样相关内容
      const pageContent = await page.evaluate(() => document.body.textContent);
      const hasShiftSampleContent = pageContent.includes('班样') || pageContent.includes('班次');
      
      console.log(`- 页面包含班样相关内容: ${hasShiftSampleContent ? '✅ 是' : '❌ 否'}`);
      
      if (hasShiftSampleContent) {
        console.log('✅ shift-sample 页面内容验证通过');
      } else {
        console.log('⚠️  shift-sample 页面内容可能有问题');
      }
      
    } else {
      console.log('❌ 测试失败！班样按钮导航存在问题');
      
      if (!pathChanged) {
        console.log('🔍 问题分析: 路径没有发生变化');
        console.log('   可能原因:');
        console.log('   1. 按钮点击事件没有正确绑定');
        console.log('   2. handleWorkAreaClick 函数没有执行');
        console.log('   3. router.push 调用被阻止');
      } else {
        console.log('🔍 问题分析: 路径发生了变化但没有到达目标页面');
        console.log('   可能原因:');
        console.log('   1. AuthGuard 重定向拦截');
        console.log('   2. 路由配置问题');
        console.log('   3. 认证状态不稳定');
        
        // 检查是否被重定向到登录页面
        if (finalPath.includes('/auth/login')) {
          console.log('   🔐 被重定向到登录页面，认证状态可能有问题');
        }
      }
    }

    // 保持浏览器打开以便手动检查
    console.log('\n🔍 浏览器将保持打开状态，请手动检查页面状态');
    console.log('按 Ctrl+C 退出测试');
    
    // 等待用户手动关闭
    await new Promise(() => {}); // 无限等待

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  } finally {
    if (browser) {
      // 注释掉自动关闭，让用户手动检查
      // await browser.close();
    }
  }
}

// 检查是否安装了 puppeteer
try {
  require.resolve('puppeteer');
  console.log('✅ Puppeteer 已安装，开始自动化测试');
  testShiftSampleNavigation();
} catch (error) {
  console.log('❌ Puppeteer 未安装，无法进行自动化测试');
  console.log('📝 请运行以下命令安装 Puppeteer:');
  console.log('   npm install puppeteer');
  console.log('\n或者使用手动测试方法:');
  console.log('1. 在浏览器中访问 http://localhost:3002/lab');
  console.log('2. 打开开发者工具 (F12)');
  console.log('3. 点击"班样"按钮');
  console.log('4. 观察路径是否变为 /shift-sample');
}
