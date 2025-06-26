#!/usr/bin/env node

/**
 * 测试工作页面路由查询API的脚本
 */

const http = require('http');

console.log('🧪 测试工作页面路由查询API');
console.log('==========================');

// 测试API调用
async function testWorkspaceAPI() {
  const testCases = [
    { workspaceName: '化验室', expectedRoute: '/lab' },
    { workspaceName: '生产车间', expectedRoute: '/production' },
    { workspaceName: '不存在的页面', expectedRoute: null }
  ];

  for (const testCase of testCases) {
    console.log(`\n🔍 测试工作页面: "${testCase.workspaceName}"`);
    
    try {
      const response = await fetch('http://localhost:3000/api/get-workspace-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceName: testCase.workspaceName
        })
      });

      const data = await response.json();
      
      console.log(`   状态码: ${response.status}`);
      console.log(`   响应数据:`, data);
      
      if (response.ok && data.success) {
        console.log(`   ✅ API调用成功，返回路由: ${data.route}`);
        if (testCase.expectedRoute && data.route === testCase.expectedRoute) {
          console.log(`   ✅ 路由匹配期望值: ${testCase.expectedRoute}`);
        } else if (testCase.expectedRoute) {
          console.log(`   ⚠️  路由不匹配期望值，期望: ${testCase.expectedRoute}，实际: ${data.route}`);
        }
      } else {
        console.log(`   ❌ API调用失败: ${data.error || '未知错误'}`);
        if (!testCase.expectedRoute) {
          console.log(`   ✅ 预期的失败情况`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ API调用异常: ${error.message}`);
    }
  }
}

// 主函数
async function main() {
  try {
    console.log('📡 开始测试API...');
    await testWorkspaceAPI();
    
    console.log('\n🎉 API测试完成！');
    console.log('\n💡 如果API测试失败，请确保:');
    console.log('1. Next.js开发服务器正在运行 (http://localhost:3000)');
    console.log('2. Supabase配置正确');
    console.log('3. 工作页面表中有相应的数据');
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

// 运行测试
main();
