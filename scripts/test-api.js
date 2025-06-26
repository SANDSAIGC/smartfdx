#!/usr/bin/env node

/**
 * API 测试脚本
 * 测试实验室数据查询 API 是否正常工作
 */

const http = require('http');

async function testAPI() {
  console.log('🧪 测试实验室数据查询 API');
  console.log('================================');

  const testCases = [
    {
      name: '班样数据查询',
      path: '/api/lab-data?sampleType=shift_samples&limit=5'
    },
    {
      name: '压滤样数据查询',
      path: '/api/lab-data?sampleType=filter_samples&limit=5'
    },
    {
      name: '进厂样数据查询',
      path: '/api/lab-data?sampleType=incoming_samples&limit=5'
    },
    {
      name: '出厂样数据查询',
      path: '/api/lab-data?sampleType=outgoing_sample&limit=5'
    },
    {
      name: '带日期范围的查询',
      path: '/api/lab-data?sampleType=shift_samples&startDate=2024-01-01&endDate=2024-12-31&limit=5'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📊 测试: ${testCase.name}`);
    console.log(`请求路径: ${testCase.path}`);
    
    try {
      const response = await fetch(`http://localhost:3001${testCase.path}`);
      const data = await response.json();
      
      console.log(`状态码: ${response.status}`);
      console.log(`成功: ${data.success}`);
      
      if (data.success) {
        console.log(`✅ 查询成功`);
        console.log(`数据条数: ${data.count}`);
        console.log(`表名: ${data.tableName}`);
        if (data.data && data.data.length > 0) {
          console.log(`示例数据:`, JSON.stringify(data.data[0], null, 2).substring(0, 200) + '...');
        }
      } else {
        console.log(`❌ 查询失败: ${data.error}`);
        if (data.responseText) {
          console.log(`响应内容: ${data.responseText}`);
        }
        if (data.queryUrl) {
          console.log(`查询URL: ${data.queryUrl}`);
        }
      }
    } catch (error) {
      console.log(`❌ 请求异常: ${error.message}`);
    }
  }

  console.log('\n🎯 测试完成');
}

// 检查开发服务器是否运行
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3001/api/lab-data?sampleType=shift_samples&limit=1');
    return response.status !== undefined;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('检查开发服务器状态...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ 开发服务器未运行，请先启动:');
    console.log('   npm run dev:fast');
    console.log('   或');
    console.log('   npm run dev:turbo');
    return;
  }
  
  console.log('✅ 开发服务器正在运行\n');
  await testAPI();
}

main().catch(console.error);
