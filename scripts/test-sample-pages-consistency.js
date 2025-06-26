#!/usr/bin/env node

/**
 * 样本记录页面一致性测试脚本
 * 验证所有样本记录页面的风格和组件一致性
 */

const fs = require('fs');
const path = require('path');

// 页面配置
const pages = [
  {
    name: '班样记录页面',
    routePath: 'app/shift-sample/page.tsx',
    componentPath: 'components/shift-sample-page.tsx',
    expectedTitle: '班样记录',
    expectedIcon: 'FlaskConical',
    expectedCardTitle: '生产日报数据填报'
  },
  {
    name: '压滤样记录页面',
    routePath: 'app/filter-sample/page.tsx',
    componentPath: 'components/filter-sample-page.tsx',
    expectedTitle: '压滤样记录',
    expectedIcon: 'Filter',
    expectedCardTitle: '压滤样化验数据填报'
  },
  {
    name: '进厂样记录页面',
    routePath: 'app/incoming-sample/page.tsx',
    componentPath: 'components/incoming-sample-page.tsx',
    expectedTitle: '进厂样记录',
    expectedIcon: 'TruckIcon',
    expectedCardTitle: '进厂原矿化验数据填报'
  },
  {
    name: '出厂样记录页面',
    routePath: 'app/outgoing-sample/page.tsx',
    componentPath: 'components/outgoing-sample-page.tsx',
    expectedTitle: '出厂样记录',
    expectedIcon: 'Package',
    expectedCardTitle: '出厂精矿化验数据填报'
  }
];

// 检查项目
const checks = [
  {
    name: '路由页面结构',
    check: (content, page) => {
      const hasAuthGuard = content.includes('AuthGuard');
      const hasComponentImport = content.includes(page.componentPath.replace('components/', '').replace('.tsx', ''));
      return {
        passed: hasAuthGuard && hasComponentImport,
        details: `AuthGuard: ${hasAuthGuard}, Component Import: ${hasComponentImport}`
      };
    }
  },
  {
    name: '组件基础结构',
    check: (content, page) => {
      const hasThemeToggle = content.includes('ThemeToggle');
      const hasWorkspaceNavigation = content.includes('WorkspaceNavigation');
      const hasCard = content.includes('Card');
      return {
        passed: hasThemeToggle && hasWorkspaceNavigation && hasCard,
        details: `ThemeToggle: ${hasThemeToggle}, WorkspaceNavigation: ${hasWorkspaceNavigation}, Card: ${hasCard}`
      };
    }
  },
  {
    name: '页面标题',
    check: (content, page) => {
      const titleRegex = new RegExp(`<h1 className="text-2xl font-bold">${page.expectedTitle}</h1>`);
      const hasTitle = titleRegex.test(content);
      return {
        passed: hasTitle,
        details: `Expected: ${page.expectedTitle}, Found: ${hasTitle}`
      };
    }
  },
  {
    name: '图标导入和使用',
    check: (content, page) => {
      const hasIconImport = content.includes(page.expectedIcon);
      const iconUsageRegex = new RegExp(`<${page.expectedIcon} className="h-8 w-8 text-primary"`);
      const hasIconUsage = iconUsageRegex.test(content);
      return {
        passed: hasIconImport && hasIconUsage,
        details: `Import: ${hasIconImport}, Usage: ${hasIconUsage}`
      };
    }
  },
  {
    name: '卡片标题',
    check: (content, page) => {
      const cardTitleRegex = new RegExp(`<span>${page.expectedCardTitle}</span>`);
      const hasCardTitle = cardTitleRegex.test(content);
      return {
        passed: hasCardTitle,
        details: `Expected: ${page.expectedCardTitle}, Found: ${hasCardTitle}`
      };
    }
  },
  {
    name: '表单字段一致性',
    check: (content, page) => {
      const hasDateField = content.includes('date:') || content.includes('startTime:');

      // 班样页面有特殊的字段结构
      if (page.name === '班样记录页面') {
        const hasMoistureField = content.includes('originalMoisture:');
        const hasPbGradeField = content.includes('originalPbGrade:') || content.includes('concentratePbGrade:');
        const hasZnGradeField = content.includes('originalZnGrade:') || content.includes('concentrateZnGrade:');
        const hasShiftField = content.includes('shift:');

        const fieldCount = [hasDateField, hasMoistureField, hasPbGradeField, hasZnGradeField, hasShiftField].filter(Boolean).length;
        return {
          passed: fieldCount >= 4,
          details: `Date: ${hasDateField}, Moisture: ${hasMoistureField}, Pb: ${hasPbGradeField}, Zn: ${hasZnGradeField}, Shift: ${hasShiftField}`
        };
      } else {
        // 其他页面的标准字段结构
        const hasMoistureField = content.includes('moisture:');
        const hasPbGradeField = content.includes('pbGrade:');
        const hasZnGradeField = content.includes('znGrade:');
        const hasRemarksField = content.includes('remarks:');

        const fieldCount = [hasDateField, hasMoistureField, hasPbGradeField, hasZnGradeField, hasRemarksField].filter(Boolean).length;
        return {
          passed: fieldCount >= 4,
          details: `Date: ${hasDateField}, Moisture: ${hasMoistureField}, Pb: ${hasPbGradeField}, Zn: ${hasZnGradeField}, Remarks: ${hasRemarksField}`
        };
      }
    }
  },
  {
    name: '计算器组件',
    check: (content, page) => {
      const hasCalculatorImport = content.includes('Calculator');
      const hasCalculatorUsage = content.includes('<Calculator className="h-4 w-4"');
      const hasDialogComponent = content.includes('Dialog');
      return {
        passed: hasCalculatorImport && hasCalculatorUsage && hasDialogComponent,
        details: `Import: ${hasCalculatorImport}, Usage: ${hasCalculatorUsage}, Dialog: ${hasDialogComponent}`
      };
    }
  },
  {
    name: '提交功能',
    check: (content, page) => {
      const hasSubmitFunction = content.includes('handleSubmit');
      const hasSubmitButton = content.includes('提交数据');
      const hasLoadingState = content.includes('isSubmitting');
      return {
        passed: hasSubmitFunction && hasSubmitButton && hasLoadingState,
        details: `Function: ${hasSubmitFunction}, Button: ${hasSubmitButton}, Loading: ${hasLoadingState}`
      };
    }
  }
];

console.log('🔍 样本记录页面一致性测试');
console.log('=' * 50);

let totalTests = 0;
let passedTests = 0;
let failedPages = [];

for (const page of pages) {
  console.log(`\n📄 测试页面: ${page.name}`);
  console.log('-' * 30);

  // 检查路由文件
  const routeFilePath = path.join(process.cwd(), page.routePath);
  const componentFilePath = path.join(process.cwd(), page.componentPath);

  if (!fs.existsSync(routeFilePath)) {
    console.log(`❌ 路由文件不存在: ${page.routePath}`);
    failedPages.push(page.name);
    continue;
  }

  if (!fs.existsSync(componentFilePath)) {
    console.log(`❌ 组件文件不存在: ${page.componentPath}`);
    failedPages.push(page.name);
    continue;
  }

  const routeContent = fs.readFileSync(routeFilePath, 'utf8');
  const componentContent = fs.readFileSync(componentFilePath, 'utf8');

  let pagePassedTests = 0;
  let pageFailedTests = 0;

  // 对路由文件进行基础检查
  const routeCheck = checks[0].check(routeContent, page);
  totalTests++;
  if (routeCheck.passed) {
    console.log(`✅ ${checks[0].name}: ${routeCheck.details}`);
    passedTests++;
    pagePassedTests++;
  } else {
    console.log(`❌ ${checks[0].name}: ${routeCheck.details}`);
    pageFailedTests++;
  }

  // 对组件文件进行详细检查
  for (let i = 1; i < checks.length; i++) {
    const check = checks[i];
    const result = check.check(componentContent, page);
    totalTests++;
    
    if (result.passed) {
      console.log(`✅ ${check.name}: ${result.details}`);
      passedTests++;
      pagePassedTests++;
    } else {
      console.log(`❌ ${check.name}: ${result.details}`);
      pageFailedTests++;
    }
  }

  if (pageFailedTests > 0) {
    failedPages.push(page.name);
  }

  console.log(`\n📊 页面测试结果: ${pagePassedTests}/${pagePassedTests + pageFailedTests} 通过`);
}

console.log('\n' + '=' * 50);
console.log('📈 总体测试结果');
console.log('=' * 50);
console.log(`总测试数: ${totalTests}`);
console.log(`通过测试: ${passedTests}`);
console.log(`失败测试: ${totalTests - passedTests}`);
console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (failedPages.length > 0) {
  console.log(`\n❌ 需要修复的页面: ${failedPages.join(', ')}`);
} else {
  console.log('\n✅ 所有页面一致性检查通过！');
}

console.log('\n🎯 一致性检查完成');
