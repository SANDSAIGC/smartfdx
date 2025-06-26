#!/usr/bin/env node

/**
 * 测试API修复的脚本
 */

console.log('🔧 测试API修复');
console.log('==============');

// 测试POST方法支持
async function testPostMethod() {
  console.log('\n1. 测试POST方法支持:');
  
  try {
    const testData = {
      tableName: "进厂原矿对比数据表",
      dateRange: {
        start: "2024-01-01",
        end: "2024-12-31"
      }
    };
    
    console.log('   📤 发送POST请求:', testData);
    
    const response = await fetch('http://localhost:3000/api/get-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('   📥 响应状态:', response.status, response.statusText);
    
    if (response.status === 405) {
      console.log('   ❌ 仍然返回405错误 - POST方法未支持');
      return false;
    }
    
    const result = await response.json();
    console.log('   📋 响应内容:', result);
    
    if (response.ok) {
      console.log('   ✅ POST方法支持正常');
      return true;
    } else {
      console.log('   ⚠️  POST方法支持但返回错误:', result.error);
      return false;
    }
    
  } catch (error) {
    console.log('   ❌ 测试POST方法时出错:', error.message);
    return false;
  }
}

// 测试GET方法兼容性
async function testGetMethod() {
  console.log('\n2. 测试GET方法兼容性:');
  
  try {
    const response = await fetch('http://localhost:3000/api/get-data?date=2024-01-01&limit=10', {
      method: 'GET',
    });
    
    console.log('   📥 GET响应状态:', response.status, response.statusText);
    
    if (response.ok) {
      const result = await response.json();
      console.log('   ✅ GET方法仍然正常工作');
      console.log('   📋 返回数据条数:', result.count);
      return true;
    } else {
      console.log('   ❌ GET方法出现问题');
      return false;
    }
    
  } catch (error) {
    console.log('   ❌ 测试GET方法时出错:', error.message);
    return false;
  }
}

// 生成修复总结
function generateFixSummary(postResult, getResult) {
  console.log('\n📊 修复总结:');
  console.log('============');
  
  console.log('\n✅ 已修复的问题:');
  console.log('1. HTTP 405错误修复');
  console.log('   - 在 /api/get-data 端点添加了POST方法支持');
  console.log('   - 支持数据对比功能的POST请求');
  console.log('   - 保持了原有GET方法的兼容性');
  
  console.log('\n🔍 修复详情:');
  console.log('- 新增POST方法处理函数');
  console.log('- 支持tableName和dateRange参数');
  console.log('- 添加了日期范围过滤功能');
  console.log('- 保持了与GET方法相同的错误处理逻辑');
  
  console.log('\n🧪 测试结果:');
  console.log(`- POST方法支持: ${postResult ? '✅ 通过' : '❌ 失败'}`);
  console.log(`- GET方法兼容性: ${getResult ? '✅ 通过' : '❌ 失败'}`);
  
  if (postResult && getResult) {
    console.log('\n🎯 预期效果:');
    console.log('- 化验室页面数据对比功能应该正常工作');
    console.log('- 不再出现HTTP 405错误');
    console.log('- 进厂数据和出厂数据对比图表应该正确加载');
    console.log('- 刷新数据按钮应该正常工作');
  } else {
    console.log('\n⚠️  需要进一步检查:');
    if (!postResult) {
      console.log('- POST方法支持可能需要重启服务器');
      console.log('- 检查API路由文件是否正确保存');
    }
    if (!getResult) {
      console.log('- GET方法兼容性问题需要检查');
      console.log('- 可能影响现有功能');
    }
  }
}

// 主函数
async function main() {
  try {
    const postResult = await testPostMethod();
    const getResult = await testGetMethod();
    
    generateFixSummary(postResult, getResult);
    
    console.log('\n🎉 API修复测试完成！');
    
    if (postResult && getResult) {
      console.log('\n🚀 问题1已成功修复，可以继续修复问题2。');
    } else {
      console.log('\n🔄 需要重启开发服务器后再次测试。');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

// 运行测试
main();
