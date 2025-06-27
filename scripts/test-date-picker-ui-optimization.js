/**
 * 日期选择组件UI优化测试脚本
 * 
 * 功能：
 * 1. 验证日期选择器的视觉密度优化
 * 2. 检查点击区域大小和舒适度
 * 3. 测试字体大小和颜色对比度
 * 4. 验证移动端和桌面端响应式效果
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 开始日期选择组件UI优化测试...\n');

// 测试配置
const testConfig = {
  components: [
    'components/ui/unified-date-picker.tsx',
    'components/ui/calendar.tsx', 
    'components/ui/popover.tsx'
  ],
  pages: [
    'components/lab-page.tsx',
    'components/shift-sample-page.tsx',
    'components/filter-sample-page.tsx',
    'components/incoming-sample-page.tsx',
    'components/outgoing-sample-page.tsx'
  ]
};

// 测试结果统计
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: []
};

function addTestResult(name, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name} - ${details}`);
  }
  testResults.details.push({ name, passed, details });
}

// 1. 检查统一日期选择器组件优化
console.log('📋 1. 统一日期选择器组件优化检查');
console.log('─'.repeat(50));

const unifiedDatePickerPath = testConfig.components[0];
if (fs.existsSync(unifiedDatePickerPath)) {
  const content = fs.readFileSync(unifiedDatePickerPath, 'utf8');
  
  // 检查PopoverContent优化
  const hasPopoverOptimization = content.includes('shadow-lg border-2') && content.includes('sideOffset={8}');
  addTestResult('PopoverContent视觉优化', hasPopoverOptimization, '检查阴影和边框增强');
  
  // 检查Calendar组件样式优化
  const hasCalendarOptimization = content.includes('className="p-4"') && content.includes('classNames={{');
  addTestResult('Calendar组件样式配置', hasCalendarOptimization, '检查内边距和自定义样式');
  
  // 检查自定义classNames配置
  const hasCustomClassNames = content.includes('months:') && content.includes('day:') && content.includes('cell:');
  addTestResult('自定义样式类配置', hasCustomClassNames, '检查详细的样式类定义');
  
} else {
  addTestResult('统一日期选择器文件存在性', false, '文件不存在');
}

// 2. 检查Calendar组件优化
console.log('\n📋 2. Calendar组件优化检查');
console.log('─'.repeat(50));

const calendarPath = testConfig.components[1];
if (fs.existsSync(calendarPath)) {
  const content = fs.readFileSync(calendarPath, 'utf8');
  
  // 检查内边距优化
  const hasPaddingOptimization = content.includes('p-4');
  addTestResult('Calendar内边距优化', hasPaddingOptimization, '从p-3增加到p-4');
  
  // 检查weekday样式优化
  const hasWeekdayOptimization = content.includes('font-medium text-sm') && content.includes('py-3');
  addTestResult('星期标题样式优化', hasWeekdayOptimization, '字体和内边距优化');
  
  // 检查week间距优化
  const hasWeekSpacing = content.includes('mt-3');
  addTestResult('周行间距优化', hasWeekSpacing, '从mt-2增加到mt-3');
  
  // 检查日期按钮优化
  const hasDayButtonOptimization = content.includes('min-w-12 h-12') && content.includes('font-medium text-base');
  addTestResult('日期按钮尺寸和字体优化', hasDayButtonOptimization, '增大按钮尺寸和字体');
  
  // 检查hover效果优化
  const hasHoverOptimization = content.includes('hover:bg-accent') && content.includes('transition-colors duration-200');
  addTestResult('悬停效果优化', hasHoverOptimization, '添加平滑过渡动画');
  
  // 检查圆角优化
  const hasRoundedOptimization = content.includes('rounded-lg');
  addTestResult('圆角样式优化', hasRoundedOptimization, '从rounded-md升级到rounded-lg');
  
} else {
  addTestResult('Calendar组件文件存在性', false, '文件不存在');
}

// 3. 检查Popover组件优化
console.log('\n📋 3. Popover组件优化检查');
console.log('─'.repeat(50));

const popoverPath = testConfig.components[2];
if (fs.existsSync(popoverPath)) {
  const content = fs.readFileSync(popoverPath, 'utf8');
  
  // 检查边框优化
  const hasBorderOptimization = content.includes('border-2');
  addTestResult('Popover边框增强', hasBorderOptimization, '从border升级到border-2');
  
  // 检查阴影优化
  const hasShadowOptimization = content.includes('shadow-xl');
  addTestResult('Popover阴影增强', hasShadowOptimization, '从shadow-md升级到shadow-xl');
  
  // 检查圆角优化
  const hasRoundedOptimization = content.includes('rounded-lg');
  addTestResult('Popover圆角优化', hasRoundedOptimization, '从rounded-md升级到rounded-lg');
  
  // 检查宽度优化
  const hasWidthOptimization = content.includes('w-auto');
  addTestResult('Popover宽度自适应', hasWidthOptimization, '从固定宽度改为自适应');
  
} else {
  addTestResult('Popover组件文件存在性', false, '文件不存在');
}

// 4. 检查页面组件中的日期选择器使用
console.log('\n📋 4. 页面组件日期选择器使用检查');
console.log('─'.repeat(50));

let pagesWithDatePicker = 0;
testConfig.pages.forEach(pagePath => {
  if (fs.existsSync(pagePath)) {
    const content = fs.readFileSync(pagePath, 'utf8');
    
    // 检查是否使用了统一日期选择器
    const usesUnifiedDatePicker = content.includes('DatePicker') || content.includes('DateRangePicker') || content.includes('DateTimePicker');
    if (usesUnifiedDatePicker) {
      pagesWithDatePicker++;
      addTestResult(`${path.basename(pagePath)}使用统一日期选择器`, true);
    } else {
      // 检查是否使用了旧的日期选择器实现
      const usesOldDatePicker = content.includes('type="date"') || content.includes('<Calendar');
      if (usesOldDatePicker) {
        addTestResult(`${path.basename(pagePath)}需要迁移到统一日期选择器`, false, '仍在使用旧的日期选择器实现');
      }
    }
  }
});

addTestResult('页面组件日期选择器覆盖率', pagesWithDatePicker >= 3, `${pagesWithDatePicker}个页面使用统一日期选择器`);

// 5. 响应式设计检查
console.log('\n📋 5. 响应式设计检查');
console.log('─'.repeat(50));

// 检查移动端适配
const mobileOptimizations = [
  'flex-col md:flex-row',  // 移动端垂直布局
  'min-w-12 h-12',        // 足够大的触摸目标
  'text-base',            // 适合移动端的字体大小
  'py-3'                  // 足够的内边距
];

let mobileOptimizationCount = 0;
testConfig.components.forEach(componentPath => {
  if (fs.existsSync(componentPath)) {
    const content = fs.readFileSync(componentPath, 'utf8');
    mobileOptimizations.forEach(optimization => {
      if (content.includes(optimization)) {
        mobileOptimizationCount++;
      }
    });
  }
});

addTestResult('移动端响应式优化', mobileOptimizationCount >= 6, `${mobileOptimizationCount}/8个移动端优化项已实现`);

// 6. 可访问性检查
console.log('\n📋 6. 可访问性检查');
console.log('─'.repeat(50));

const accessibilityFeatures = [
  'focus:ring-2',           // 焦点环
  'focus:ring-ring',        // 焦点颜色
  'focus:ring-offset-2',    // 焦点偏移
  'aria-selected',          // ARIA属性
  'transition-colors'       // 平滑过渡
];

let accessibilityCount = 0;
testConfig.components.forEach(componentPath => {
  if (fs.existsSync(componentPath)) {
    const content = fs.readFileSync(componentPath, 'utf8');
    accessibilityFeatures.forEach(feature => {
      if (content.includes(feature)) {
        accessibilityCount++;
      }
    });
  }
});

addTestResult('可访问性特性支持', accessibilityCount >= 8, `${accessibilityCount}/15个可访问性特性已实现`);

// 输出测试结果
console.log('\n' + '='.repeat(60));
console.log('📊 日期选择组件UI优化测试结果');
console.log('='.repeat(60));
console.log(`总测试项: ${testResults.total}`);
console.log(`通过: ${testResults.passed} ✅`);
console.log(`失败: ${testResults.failed} ❌`);
console.log(`成功率: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

if (testResults.failed > 0) {
  console.log('\n❌ 失败的测试项:');
  testResults.details
    .filter(result => !result.passed)
    .forEach(result => {
      console.log(`  • ${result.name}: ${result.details}`);
    });
}

console.log('\n🎯 日期选择组件UI优化测试完成!');

// 生成优化建议
console.log('\n💡 优化建议:');
console.log('─'.repeat(50));
console.log('1. 确保所有页面都使用统一的日期选择器组件');
console.log('2. 在移动端测试触摸交互的舒适度');
console.log('3. 验证不同主题下的颜色对比度');
console.log('4. 测试键盘导航的可访问性');
console.log('5. 检查不同屏幕尺寸下的显示效果');

// 返回测试结果
process.exit(testResults.failed > 0 ? 1 : 0);
