#!/usr/bin/env node

/**
 * 测试API修复的脚本 v2 - 使用正确的表名
 */

console.log('🔧 测试API修复 v2');
console.log('==================');

// 测试进厂原矿数据
async function testIncomingData() {
  console.log('\n1. 测试进厂原矿数据:');
  
  try {
    const testData = {
      tableName: "进厂原矿-FDX",
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
      console.log('   ❌ 仍然返回405错误');
      return false;
    }
    
    const result = await response.json();
    console.log('   📋 响应结果:', {
      success: result.success,
      dataCount: result.count,
      error: result.error
    });
    
    if (response.ok && result.success) {
      console.log('   ✅ 进厂原矿数据查询成功');
      return true;
    } else {
      console.log('   ⚠️  进厂原矿数据查询失败:', result.error);
      return false;
    }
    
  } catch (error) {
    console.log('   ❌ 测试进厂原矿数据时出错:', error.message);
    return false;
  }
}

// 测试出厂精矿数据
async function testOutgoingData() {
  console.log('\n2. 测试出厂精矿数据:');
  
  try {
    const testData = {
      tableName: "出厂精矿-FDX",
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
    
    const result = await response.json();
    console.log('   📋 响应结果:', {
      success: result.success,
      dataCount: result.count,
      error: result.error
    });
    
    if (response.ok && result.success) {
      console.log('   ✅ 出厂精矿数据查询成功');
      return true;
    } else {
      console.log('   ⚠️  出厂精矿数据查询失败:', result.error);
      return false;
    }
    
  } catch (error) {
    console.log('   ❌ 测试出厂精矿数据时出错:', error.message);
    return false;
  }
}

// 测试错误处理
async function testErrorHandling() {
  console.log('\n3. 测试错误处理:');
  
  try {
    const testData = {
      tableName: "不存在的表",
      dateRange: {
        start: "2024-01-01",
        end: "2024-12-31"
      }
    };
    
    const response = await fetch('http://localhost:3000/api/get-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('   📥 响应状态:', response.status, response.statusText);
    
    const result = await response.json();
    
    if (!response.ok && result.error) {
      console.log('   ✅ 错误处理正常 - 正确返回错误信息');
      return true;
    } else {
      console.log('   ⚠️  错误处理异常 - 应该返回错误');
      return false;
    }
    
  } catch (error) {
    console.log('   ❌ 测试错误处理时出错:', error.message);
    return false;
  }
}

// 生成修复总结
function generateFixSummary(incomingResult, outgoingResult, errorResult) {
  console.log('\n📊 修复总结:');
  console.log('============');
  
  console.log('\n✅ 已修复的问题:');
  console.log('1. HTTP 405错误修复');
  console.log('   - 添加了POST方法支持到 /api/get-data');
  console.log('   - 修复了表名错误问题');
  console.log('   - 使用正确的Supabase表名');
  
  console.log('\n🔍 修复详情:');
  console.log('- 原始表名: "进厂原矿对比数据表" → "进厂原矿-FDX"');
  console.log('- 原始表名: "出厂精矿对比数据表" → "出厂精矿-FDX"');
  console.log('- 添加了POST方法处理逻辑');
  console.log('- 支持日期范围过滤查询');
  
  console.log('\n🧪 测试结果:');
  console.log(`- 进厂原矿数据: ${incomingResult ? '✅ 通过' : '❌ 失败'}`);
  console.log(`- 出厂精矿数据: ${outgoingResult ? '✅ 通过' : '❌ 失败'}`);
  console.log(`- 错误处理: ${errorResult ? '✅ 通过' : '❌ 失败'}`);
  
  const allPassed = incomingResult && outgoingResult && errorResult;
  
  if (allPassed) {
    console.log('\n🎯 预期效果:');
    console.log('- 化验室页面数据对比功能应该正常工作');
    console.log('- 不再出现HTTP 405错误');
    console.log('- 进厂数据和出厂数据对比图表应该正确加载');
    console.log('- 刷新数据按钮应该正常工作');
    console.log('- 日期范围选择应该正确过滤数据');
    
    console.log('\n🚀 问题1修复状态: ✅ 完全修复');
  } else {
    console.log('\n⚠️  需要进一步检查:');
    if (!incomingResult) {
      console.log('- 进厂原矿数据查询可能需要检查表结构');
    }
    if (!outgoingResult) {
      console.log('- 出厂精矿数据查询可能需要检查表结构');
    }
    if (!errorResult) {
      console.log('- 错误处理逻辑需要完善');
    }
    
    console.log('\n🔄 问题1修复状态: ⚠️  部分修复');
  }
}

// 主函数
async function main() {
  try {
    const incomingResult = await testIncomingData();
    const outgoingResult = await testOutgoingData();
    const errorResult = await testErrorHandling();
    
    generateFixSummary(incomingResult, outgoingResult, errorResult);
    
    console.log('\n🎉 API修复测试完成！');
    
    const allPassed = incomingResult && outgoingResult && errorResult;
    if (allPassed) {
      console.log('\n✅ 问题1已完全修复，可以继续修复问题2。');
    } else {
      console.log('\n🔧 问题1需要进一步调试，但可以继续修复其他问题。');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

// 运行测试
main();
