#!/usr/bin/env node

/**
 * Lab页面路由配置测试脚本
 * 验证所有专项作业区按钮的路由配置是否正确
 */

const fs = require('fs');
const path = require('path');

// 预期的路由配置
const expectedRoutes = [
  {
    label: '班样',
    route: '/shift-sample',
    routeFile: 'app/shift-sample/page.tsx',
    componentFile: 'components/shift-sample-page.tsx'
  },
  {
    label: '压滤样',
    route: '/filter-sample',
    routeFile: 'app/filter-sample/page.tsx',
    componentFile: 'components/filter-sample-page.tsx'
  },
  {
    label: '进厂样',
    route: '/incoming-sample',
    routeFile: 'app/incoming-sample/page.tsx',
    componentFile: 'components/incoming-sample-page.tsx'
  },
  {
    label: '出厂样',
    route: '/outgoing-sample',
    routeFile: 'app/outgoing-sample/page.tsx',
    componentFile: 'components/outgoing-sample-page.tsx'
  }
];

console.log('🔍 Lab页面路由配置测试');
console.log('=' * 50);

// 检查lab-page.tsx中的路由配置
const labPagePath = path.join(process.cwd(), 'components/lab-page.tsx');
if (!fs.existsSync(labPagePath)) {
  console.log('❌ lab-page.tsx 文件不存在');
  process.exit(1);
}

const labPageContent = fs.readFileSync(labPagePath, 'utf8');

console.log('\n📄 检查 Lab 页面配置');
console.log('-' * 30);

let configurationPassed = true;

// 检查每个路由配置
for (const expected of expectedRoutes) {
  console.log(`\n🔗 检查 ${expected.label} 路由配置:`);
  
  // 检查路由配置是否存在
  const routeConfigRegex = new RegExp(`route: '${expected.route}'`);
  const hasRouteConfig = routeConfigRegex.test(labPageContent);
  
  // 检查是否设置为导航按钮
  const labelRegex = new RegExp(`label: "${expected.label}"[\\s\\S]*?isNavigationButton: true`);
  const isNavigationButton = labelRegex.test(labPageContent);
  
  if (hasRouteConfig && isNavigationButton) {
    console.log(`  ✅ 路由配置正确: ${expected.route}`);
    console.log(`  ✅ 导航按钮已启用`);
  } else {
    console.log(`  ❌ 路由配置错误:`);
    console.log(`    - 路由配置: ${hasRouteConfig ? '✅' : '❌'} ${expected.route}`);
    console.log(`    - 导航按钮: ${isNavigationButton ? '✅' : '❌'}`);
    configurationPassed = false;
  }
  
  // 检查对应的文件是否存在
  const routeFilePath = path.join(process.cwd(), expected.routeFile);
  const componentFilePath = path.join(process.cwd(), expected.componentFile);
  
  const routeFileExists = fs.existsSync(routeFilePath);
  const componentFileExists = fs.existsSync(componentFilePath);
  
  console.log(`  ${routeFileExists ? '✅' : '❌'} 路由文件: ${expected.routeFile}`);
  console.log(`  ${componentFileExists ? '✅' : '❌'} 组件文件: ${expected.componentFile}`);
  
  if (!routeFileExists || !componentFileExists) {
    configurationPassed = false;
  }
}

console.log('\n' + '=' * 50);
console.log('📈 路由配置测试结果');
console.log('=' * 50);

if (configurationPassed) {
  console.log('✅ 所有路由配置检查通过！');
  console.log('\n🎯 Lab页面专项作业区按钮路由配置完成');
  console.log('\n📋 可用路由:');
  for (const route of expectedRoutes) {
    console.log(`  • ${route.label}: ${route.route}`);
  }
} else {
  console.log('❌ 路由配置检查失败，请修复上述问题');
  process.exit(1);
}

// 检查handleWorkAreaClick函数
console.log('\n🔧 检查路由处理函数');
console.log('-' * 30);

const handleWorkAreaClickRegex = /handleWorkAreaClick.*?=.*?useCallback\((.*?)\)/s;
const hasHandleFunction = handleWorkAreaClickRegex.test(labPageContent);

if (hasHandleFunction) {
  console.log('✅ handleWorkAreaClick 函数存在');
  
  // 检查是否包含路由跳转逻辑
  const hasRouterPush = labPageContent.includes('router.push');
  const hasNavigationLogic = labPageContent.includes('isNavigationButton') && labPageContent.includes('route');
  
  console.log(`✅ 路由跳转逻辑: ${hasRouterPush ? '存在' : '缺失'}`);
  console.log(`✅ 导航逻辑检查: ${hasNavigationLogic ? '存在' : '缺失'}`);
  
  if (!hasRouterPush || !hasNavigationLogic) {
    console.log('⚠️  路由处理函数可能需要完善');
  }
} else {
  console.log('❌ handleWorkAreaClick 函数不存在');
}

console.log('\n🎯 路由配置测试完成');
