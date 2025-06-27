#!/usr/bin/env node

/**
 * 化验室页面路由修复验证脚本
 * 
 * 验证内容：
 * 1. 检查所有demo路径引用是否已修复
 * 2. 验证中间件配置是否正确排除样本记录页面
 * 3. 检查AuthGuard配置是否正确
 * 4. 验证路由配置是否完整
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 化验室页面路由修复验证开始...\n');

// 测试结果统计
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(testName, testFunction) {
  totalTests++;
  console.log(`🔍 测试: ${testName}`);
  
  try {
    const result = testFunction();
    if (result.success) {
      passedTests++;
      console.log(`✅ 通过: ${result.message}\n`);
    } else {
      failedTests++;
      console.log(`❌ 失败: ${result.message}\n`);
    }
  } catch (error) {
    failedTests++;
    console.log(`❌ 异常: ${error.message}\n`);
  }
}

// 测试1: 检查demo路径引用是否已修复
runTest('Demo路径引用修复检查', () => {
  const filesToCheck = [
    'components/login-page-content.tsx',
    'components/logged-in-interface.tsx',
    'app/api/auth/login/route.ts'
  ];
  
  const demoReferences = [];
  
  filesToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        if (line.includes('/demo') && !line.includes('// ') && !line.includes('* ')) {
          demoReferences.push({
            file: filePath,
            line: index + 1,
            content: line.trim()
          });
        }
      });
    }
  });
  
  if (demoReferences.length === 0) {
    return {
      success: true,
      message: '所有demo路径引用已成功修复为/lab'
    };
  } else {
    return {
      success: false,
      message: `发现${demoReferences.length}个未修复的demo路径引用:\n${demoReferences.map(ref => `  ${ref.file}:${ref.line} - ${ref.content}`).join('\n')}`
    };
  }
});

// 测试2: 验证中间件配置
runTest('中间件配置检查', () => {
  const middlewarePath = 'middleware.ts';
  
  if (!fs.existsSync(middlewarePath)) {
    return {
      success: false,
      message: 'middleware.ts文件不存在'
    };
  }
  
  const content = fs.readFileSync(middlewarePath, 'utf8');
  
  const requiredExclusions = [
    'lab',
    'shift-sample',
    'filter-sample', 
    'incoming-sample',
    'outgoing-sample'
  ];
  
  const missingExclusions = requiredExclusions.filter(exclusion => 
    !content.includes(exclusion)
  );
  
  if (missingExclusions.length === 0) {
    return {
      success: true,
      message: '中间件配置正确，所有样本记录页面已排除在Supabase Auth检查之外'
    };
  } else {
    return {
      success: false,
      message: `中间件配置缺少以下页面排除: ${missingExclusions.join(', ')}`
    };
  }
});

// 测试3: 检查样本记录页面AuthGuard配置
runTest('样本记录页面AuthGuard配置检查', () => {
  const samplePages = [
    'app/shift-sample/page.tsx',
    'app/filter-sample/page.tsx',
    'app/incoming-sample/page.tsx',
    'app/outgoing-sample/page.tsx'
  ];
  
  const configIssues = [];
  
  samplePages.forEach(pagePath => {
    if (fs.existsSync(pagePath)) {
      const content = fs.readFileSync(pagePath, 'utf8');
      
      // 检查是否包含AuthGuard
      if (!content.includes('AuthGuard')) {
        configIssues.push(`${pagePath}: 缺少AuthGuard组件`);
      }
      
      // 检查AuthGuard配置
      if (content.includes('requireAuth={true}') || content.includes('<AuthGuard>')) {
        // 这是正确的配置
      } else {
        configIssues.push(`${pagePath}: AuthGuard配置可能有问题`);
      }
    } else {
      configIssues.push(`${pagePath}: 文件不存在`);
    }
  });
  
  if (configIssues.length === 0) {
    return {
      success: true,
      message: '所有样本记录页面AuthGuard配置正确'
    };
  } else {
    return {
      success: false,
      message: `发现配置问题:\n${configIssues.map(issue => `  ${issue}`).join('\n')}`
    };
  }
});

// 测试4: 验证lab页面路由配置
runTest('Lab页面路由配置检查', () => {
  const labPagePath = 'components/lab-page.tsx';
  
  if (!fs.existsSync(labPagePath)) {
    return {
      success: false,
      message: 'lab-page.tsx文件不存在'
    };
  }
  
  const content = fs.readFileSync(labPagePath, 'utf8');
  
  const expectedRoutes = [
    '/shift-sample',
    '/filter-sample',
    '/incoming-sample',
    '/outgoing-sample'
  ];
  
  const missingRoutes = expectedRoutes.filter(route => 
    !content.includes(`route: '${route}'`)
  );
  
  if (missingRoutes.length === 0) {
    return {
      success: true,
      message: 'Lab页面路由配置完整，所有按钮路由正确'
    };
  } else {
    return {
      success: false,
      message: `缺少路由配置: ${missingRoutes.join(', ')}`
    };
  }
});

// 测试5: 检查首页组件导入
runTest('首页组件导入检查', () => {
  const homePagePath = 'app/page.tsx';
  
  if (!fs.existsSync(homePagePath)) {
    return {
      success: false,
      message: 'app/page.tsx文件不存在'
    };
  }
  
  const content = fs.readFileSync(homePagePath, 'utf8');
  
  const deletedComponents = [
    'deploy-button',
    'env-var-warning',
    'hero',
    'tutorial/connect-supabase-steps',
    'tutorial/sign-up-user-steps'
  ];
  
  const stillImported = deletedComponents.filter(component => 
    content.includes(`@/components/${component}`)
  );
  
  if (stillImported.length === 0) {
    return {
      success: true,
      message: '首页组件导入已修复，不再引用已删除的组件'
    };
  } else {
    return {
      success: false,
      message: `仍然导入已删除的组件: ${stillImported.join(', ')}`
    };
  }
});

// 输出测试结果
console.log('📊 测试结果统计:');
console.log(`总测试数: ${totalTests}`);
console.log(`通过: ${passedTests} ✅`);
console.log(`失败: ${failedTests} ❌`);
console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (failedTests === 0) {
  console.log('\n🎉 所有测试通过！化验室页面路由修复成功！');
  console.log('\n🚀 建议测试步骤:');
  console.log('1. 启动开发服务器: npm run dev');
  console.log('2. 访问化验室页面: http://localhost:3004/lab');
  console.log('3. 点击各个专项作业区按钮测试路由跳转');
  console.log('4. 验证每个按钮都能正确跳转到对应的样本记录页面');
} else {
  console.log('\n⚠️ 存在失败的测试，请检查并修复相关问题');
  process.exit(1);
}
