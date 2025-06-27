#!/usr/bin/env node

/**
 * 测试脚本：验证Skeleton组件替换为Progress组件的完整性
 * 
 * 功能：
 * 1. 检查所有组件文件中是否还有Skeleton组件的使用
 * 2. 验证LoadingTransition组件的新变体是否正确实现
 * 3. 确认所有新的骨架屏组件是否正确导入和使用
 * 4. 生成详细的测试报告
 */

const fs = require('fs');
const path = require('path');

// 测试配置
const testConfig = {
  componentsDir: './components',
  targetFiles: [
    'lab-page.tsx',
    'data-display-card.tsx',
    'situation-management-page.tsx',
    'situation-report-page.tsx',
    'production-quality-data-page.tsx',
    'task-assignment-page.tsx'
  ],
  loadingTransitionFile: './components/loading-transition.tsx'
};

// 测试结果存储
const testResults = {
  skeletonReplacementTests: [],
  loadingTransitionTests: [],
  importTests: [],
  summary: {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    successRate: 0
  }
};

/**
 * 检查文件中是否还有Skeleton组件的使用
 */
function checkSkeletonUsage(filePath) {
  const test = {
    testName: `检查 ${path.basename(filePath)} 中的Skeleton使用`,
    filePath,
    passed: false,
    details: []
  };

  try {
    if (!fs.existsSync(filePath)) {
      test.details.push(`❌ 文件不存在: ${filePath}`);
      return test;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // 检查是否还有Skeleton导入
    const skeletonImportLines = lines.filter((line, index) => 
      line.includes('from "@/components/ui/skeleton"') && 
      !line.includes('//') && 
      !line.includes('/*')
    );

    // 检查是否还有Skeleton组件使用（排除SkeletonLoading等新组件）
    const skeletonUsageLines = lines.filter((line, index) =>
      line.includes('<Skeleton') &&
      !line.includes('<SkeletonLoading') &&
      !line.includes('<TableSkeletonLoading') &&
      !line.includes('<CardSkeletonLoading') &&
      !line.includes('//') &&
      !line.includes('/*')
    );

    if (skeletonImportLines.length === 0 && skeletonUsageLines.length === 0) {
      test.passed = true;
      test.details.push(`✅ 已成功移除所有Skeleton组件使用`);
    } else {
      if (skeletonImportLines.length > 0) {
        test.details.push(`❌ 仍有Skeleton导入: ${skeletonImportLines.length} 处`);
        skeletonImportLines.forEach((line, index) => {
          test.details.push(`   - 第 ${lines.indexOf(line) + 1} 行: ${line.trim()}`);
        });
      }
      
      if (skeletonUsageLines.length > 0) {
        test.details.push(`❌ 仍有Skeleton使用: ${skeletonUsageLines.length} 处`);
        skeletonUsageLines.forEach((line, index) => {
          test.details.push(`   - 第 ${lines.indexOf(line) + 1} 行: ${line.trim()}`);
        });
      }
    }

    // 检查是否正确导入了新的loading组件
    const loadingImportLines = lines.filter(line => 
      line.includes('from "@/components/loading-transition"')
    );

    if (loadingImportLines.length > 0) {
      test.details.push(`✅ 已正确导入loading组件: ${loadingImportLines.length} 处`);
      loadingImportLines.forEach(line => {
        test.details.push(`   - ${line.trim()}`);
      });
    } else {
      test.details.push(`⚠️  未发现loading组件导入`);
    }

  } catch (error) {
    test.details.push(`❌ 读取文件时出错: ${error.message}`);
  }

  return test;
}

/**
 * 检查LoadingTransition组件的新变体实现
 */
function checkLoadingTransitionImplementation() {
  const test = {
    testName: '检查LoadingTransition组件新变体实现',
    filePath: testConfig.loadingTransitionFile,
    passed: false,
    details: []
  };

  try {
    if (!fs.existsSync(testConfig.loadingTransitionFile)) {
      test.details.push(`❌ LoadingTransition文件不存在`);
      return test;
    }

    const content = fs.readFileSync(testConfig.loadingTransitionFile, 'utf8');
    
    // 检查新的变体类型
    const requiredVariants = ['skeleton', 'table', 'card'];
    const variantTypeRegex = /variant\?\s*:\s*['"](.*?)['"].*?\|.*?['"](skeleton|table|card)['"]/s;
    
    let foundVariants = [];
    const variantMatches = content.match(/variant\?\s*:\s*[^;]+/);
    if (variantMatches) {
      requiredVariants.forEach(variant => {
        if (variantMatches[0].includes(variant)) {
          foundVariants.push(variant);
        }
      });
    }

    if (foundVariants.length === requiredVariants.length) {
      test.details.push(`✅ 所有新变体类型已定义: ${foundVariants.join(', ')}`);
    } else {
      const missing = requiredVariants.filter(v => !foundVariants.includes(v));
      test.details.push(`❌ 缺少变体类型: ${missing.join(', ')}`);
    }

    // 检查新的属性
    const requiredProps = ['skeletonRows', 'skeletonCols'];
    let foundProps = [];
    
    requiredProps.forEach(prop => {
      if (content.includes(prop)) {
        foundProps.push(prop);
      }
    });

    if (foundProps.length === requiredProps.length) {
      test.details.push(`✅ 所有新属性已定义: ${foundProps.join(', ')}`);
    } else {
      const missing = requiredProps.filter(p => !foundProps.includes(p));
      test.details.push(`❌ 缺少属性: ${missing.join(', ')}`);
    }

    // 检查骨架屏实现逻辑
    const skeletonImplementationChecks = [
      { pattern: /variant === 'skeleton'/, name: 'skeleton变体处理' },
      { pattern: /variant === 'table'/, name: 'table变体处理' },
      { pattern: /variant === 'card'/, name: 'card变体处理' },
      { pattern: /Array\.from\(\{ length: skeletonRows \}\)/, name: '动态行数生成' },
      { pattern: /Array\.from\(\{ length: skeletonCols \}\)/, name: '动态列数生成' }
    ];

    let implementationScore = 0;
    skeletonImplementationChecks.forEach(check => {
      if (check.pattern.test(content)) {
        test.details.push(`✅ ${check.name} 已实现`);
        implementationScore++;
      } else {
        test.details.push(`❌ ${check.name} 未实现`);
      }
    });

    // 检查新的导出组件
    const requiredExports = ['SkeletonLoading', 'TableSkeletonLoading', 'CardSkeletonLoading'];
    let foundExports = [];
    
    requiredExports.forEach(exportName => {
      if (content.includes(`export const ${exportName}`)) {
        foundExports.push(exportName);
      }
    });

    if (foundExports.length === requiredExports.length) {
      test.details.push(`✅ 所有新导出组件已定义: ${foundExports.join(', ')}`);
    } else {
      const missing = requiredExports.filter(e => !foundExports.includes(e));
      test.details.push(`❌ 缺少导出组件: ${missing.join(', ')}`);
    }

    // 计算总体通过率
    const totalChecks = requiredVariants.length + requiredProps.length + skeletonImplementationChecks.length + requiredExports.length;
    const passedChecks = foundVariants.length + foundProps.length + implementationScore + foundExports.length;
    
    test.passed = passedChecks === totalChecks;
    test.details.push(`📊 实现完成度: ${passedChecks}/${totalChecks} (${Math.round(passedChecks/totalChecks*100)}%)`);

  } catch (error) {
    test.details.push(`❌ 检查LoadingTransition实现时出错: ${error.message}`);
  }

  return test;
}

/**
 * 检查组件导入的正确性
 */
function checkImportCorrectness(filePath) {
  const test = {
    testName: `检查 ${path.basename(filePath)} 的导入正确性`,
    filePath,
    passed: false,
    details: []
  };

  try {
    if (!fs.existsSync(filePath)) {
      test.details.push(`❌ 文件不存在: ${filePath}`);
      return test;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查loading组件的导入
    const loadingImportRegex = /import\s+\{([^}]+)\}\s+from\s+["']@\/components\/loading-transition["']/;
    const importMatch = content.match(loadingImportRegex);
    
    if (importMatch) {
      const importedComponents = importMatch[1].split(',').map(c => c.trim());
      test.details.push(`✅ 已导入loading组件: ${importedComponents.join(', ')}`);
      
      // 检查导入的组件是否在文件中被使用
      let usageCount = 0;
      importedComponents.forEach(component => {
        const usageRegex = new RegExp(`<${component}`, 'g');
        const matches = content.match(usageRegex);
        if (matches) {
          usageCount += matches.length;
          test.details.push(`✅ ${component} 被使用 ${matches.length} 次`);
        } else {
          test.details.push(`⚠️  ${component} 已导入但未使用`);
        }
      });
      
      test.passed = usageCount > 0;
    } else {
      test.details.push(`❌ 未发现loading组件导入`);
    }

  } catch (error) {
    test.details.push(`❌ 检查导入时出错: ${error.message}`);
  }

  return test;
}

/**
 * 运行所有测试
 */
function runAllTests() {
  console.log('🚀 开始执行Skeleton组件替换验证测试...\n');

  // 1. 检查LoadingTransition组件实现
  console.log('📋 测试1: LoadingTransition组件新变体实现');
  const loadingTransitionTest = checkLoadingTransitionImplementation();
  testResults.loadingTransitionTests.push(loadingTransitionTest);
  testResults.summary.totalTests++;
  if (loadingTransitionTest.passed) testResults.summary.passedTests++;
  else testResults.summary.failedTests++;

  // 2. 检查各个组件文件的Skeleton替换
  console.log('\n📋 测试2: 组件文件Skeleton使用检查');
  testConfig.targetFiles.forEach(fileName => {
    const filePath = path.join(testConfig.componentsDir, fileName);
    const skeletonTest = checkSkeletonUsage(filePath);
    testResults.skeletonReplacementTests.push(skeletonTest);
    testResults.summary.totalTests++;
    if (skeletonTest.passed) testResults.summary.passedTests++;
    else testResults.summary.failedTests++;
  });

  // 3. 检查导入正确性
  console.log('\n📋 测试3: 组件导入正确性检查');
  testConfig.targetFiles.forEach(fileName => {
    const filePath = path.join(testConfig.componentsDir, fileName);
    const importTest = checkImportCorrectness(filePath);
    testResults.importTests.push(importTest);
    testResults.summary.totalTests++;
    if (importTest.passed) testResults.summary.passedTests++;
    else testResults.summary.failedTests++;
  });

  // 计算成功率
  testResults.summary.successRate = Math.round(
    (testResults.summary.passedTests / testResults.summary.totalTests) * 100
  );
}

/**
 * 生成测试报告
 */
function generateTestReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 SKELETON组件替换验证测试报告');
  console.log('='.repeat(80));

  // 总体统计
  console.log('\n📈 总体统计:');
  console.log(`   总测试数: ${testResults.summary.totalTests}`);
  console.log(`   通过测试: ${testResults.summary.passedTests}`);
  console.log(`   失败测试: ${testResults.summary.failedTests}`);
  console.log(`   成功率: ${testResults.summary.successRate}%`);

  // LoadingTransition组件测试结果
  console.log('\n🔧 LoadingTransition组件实现测试:');
  testResults.loadingTransitionTests.forEach(test => {
    console.log(`\n${test.passed ? '✅' : '❌'} ${test.testName}`);
    test.details.forEach(detail => console.log(`   ${detail}`));
  });

  // Skeleton替换测试结果
  console.log('\n🔄 Skeleton组件替换测试:');
  testResults.skeletonReplacementTests.forEach(test => {
    console.log(`\n${test.passed ? '✅' : '❌'} ${test.testName}`);
    test.details.forEach(detail => console.log(`   ${detail}`));
  });

  // 导入测试结果
  console.log('\n📦 组件导入测试:');
  testResults.importTests.forEach(test => {
    console.log(`\n${test.passed ? '✅' : '❌'} ${test.testName}`);
    test.details.forEach(detail => console.log(`   ${detail}`));
  });

  // 最终结论
  console.log('\n' + '='.repeat(80));
  if (testResults.summary.successRate === 100) {
    console.log('🎉 所有测试通过！Skeleton组件替换已成功完成！');
    console.log('✨ 项目现在使用统一的Progress组件加载体验');
  } else if (testResults.summary.successRate >= 80) {
    console.log('⚠️  大部分测试通过，但仍有一些问题需要修复');
    console.log('🔧 请检查上述失败的测试项并进行相应修复');
  } else {
    console.log('❌ 测试失败率较高，需要重新检查Skeleton替换实现');
    console.log('🚨 建议重新审查替换逻辑和组件实现');
  }
  console.log('='.repeat(80));
}

// 执行测试
runAllTests();
generateTestReport();

// 保存测试结果到文件
const reportPath = './test-results/skeleton-replacement-test-report.json';
const reportDir = path.dirname(reportPath);
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
console.log(`\n📄 详细测试报告已保存到: ${reportPath}`);
