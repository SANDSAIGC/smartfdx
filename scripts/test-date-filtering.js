#!/usr/bin/env node

/**
 * 日期过滤测试脚本
 * 专门测试各个表的日期字段映射是否正确
 */

async function testDateFiltering() {
  console.log('🗓️ 测试日期过滤功能');
  console.log('================================');

  const testCases = [
    {
      name: '班样数据 - 日期字段过滤',
      path: '/api/lab-data?sampleType=shift_samples&startDate=2024-12-25&endDate=2024-12-26&limit=10'
    },
    {
      name: '压滤样数据 - 开始时间字段过滤',
      path: '/api/lab-data?sampleType=filter_samples&startDate=2024-12-25&endDate=2024-12-26&limit=10'
    },
    {
      name: '进厂样数据 - 计量日期字段过滤',
      path: '/api/lab-data?sampleType=incoming_samples&startDate=2024-12-25&endDate=2024-12-26&limit=10'
    },
    {
      name: '出厂样数据 - 计量日期字段过滤',
      path: '/api/lab-data?sampleType=outgoing_sample&startDate=2024-12-25&endDate=2024-12-26&limit=10'
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
          console.log(`数据示例:`);
          data.data.forEach((item, index) => {
            console.log(`  记录 ${index + 1}:`);
            // 显示关键的日期/时间字段
            if (item.日期) console.log(`    日期: ${item.日期}`);
            if (item.开始时间) console.log(`    开始时间: ${item.开始时间}`);
            if (item.计量日期) console.log(`    计量日期: ${item.计量日期}`);
            if (item.班次) console.log(`    班次: ${item.班次}`);
            if (item.操作员) console.log(`    操作员: ${item.操作员}`);
            if (item.货物名称) console.log(`    货物名称: ${item.货物名称}`);
            if (item.车牌号) console.log(`    车牌号: ${item.车牌号}`);
          });
        } else {
          console.log(`📝 该日期范围内无数据`);
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

  console.log('\n🎯 日期过滤测试完成');
}

async function main() {
  console.log('检查开发服务器状态...');
  
  try {
    const response = await fetch('http://localhost:3001/api/lab-data?sampleType=shift_samples&limit=1');
    if (response.status === undefined) {
      throw new Error('Server not responding');
    }
  } catch (error) {
    console.log('❌ 开发服务器未运行，请先启动:');
    console.log('   npm run dev:turbo');
    return;
  }
  
  console.log('✅ 开发服务器正在运行\n');
  await testDateFiltering();
}

main().catch(console.error);
