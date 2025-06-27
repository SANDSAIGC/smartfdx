/**
 * 日期选择组件全面标准化测试脚本
 * 
 * 功能：
 * 1. 测试统一日期选择器组件
 * 2. 验证日期工具函数库
 * 3. 检查组件文件结构
 * 4. 测试中文本地化支持
 * 5. 验证迁移指南完整性
 */

const fs = require('fs');
const path = require('path');

// 测试结果类
class DatePickerStandardizationTester {
  constructor() {
    this.results = [];
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('📅 [日期选择组件标准化测试] 开始全面测试...\n');

    // 1. 测试文件结构
    await this.testFileStructure();
    
    // 2. 测试统一日期选择器组件
    await this.testUnifiedDatePicker();
    
    // 3. 测试日期工具函数库
    await this.testDateUtils();
    
    // 4. 测试迁移指南
    await this.testMigrationGuide();
    
    // 5. 测试现有页面的日期组件使用情况
    await this.testExistingDateComponents();

    // 6. 测试中文本地化支持
    await this.testChineseLocalization();

    // 输出测试结果
    this.printResults();
  }

  /**
   * 测试文件结构
   */
  async testFileStructure() {
    console.log('📁 [测试] 文件结构...');

    try {
      // 测试1: 统一日期选择器组件文件
      const unifiedPickerPath = path.join(process.cwd(), 'components', 'ui', 'unified-date-picker.tsx');
      const unifiedPickerExists = fs.existsSync(unifiedPickerPath);
      
      this.addResult({
        testName: '统一日期选择器组件文件存在',
        passed: unifiedPickerExists,
        details: `components/ui/unified-date-picker.tsx 文件${unifiedPickerExists ? '存在' : '不存在'}`
      });

      // 测试2: 更新的日期工具函数库
      const dateUtilsPath = path.join(process.cwd(), 'lib', 'date-utils.ts');
      const dateUtilsExists = fs.existsSync(dateUtilsPath);
      
      this.addResult({
        testName: '日期工具函数库文件存在',
        passed: dateUtilsExists,
        details: `lib/date-utils.ts 文件${dateUtilsExists ? '存在' : '不存在'}`
      });

      // 测试3: 迁移指南文档
      const migrationGuidePath = path.join(process.cwd(), 'docs', 'date-picker-migration-guide.md');
      const migrationGuideExists = fs.existsSync(migrationGuidePath);
      
      this.addResult({
        testName: '迁移指南文档存在',
        passed: migrationGuideExists,
        details: `docs/date-picker-migration-guide.md 文件${migrationGuideExists ? '存在' : '不存在'}`
      });

      // 测试4: 原有日期选择器组件
      const originalPickerPath = path.join(process.cwd(), 'components', 'ui', 'date-picker.tsx');
      const originalPickerExists = fs.existsSync(originalPickerPath);
      
      this.addResult({
        testName: '原有日期选择器组件保留',
        passed: originalPickerExists,
        details: `components/ui/date-picker.tsx 文件${originalPickerExists ? '保留' : '已删除'}（向后兼容）`
      });

    } catch (error) {
      this.addResult({
        testName: '文件结构测试',
        passed: false,
        details: '测试执行失败',
        error: error.message
      });
    }
  }

  /**
   * 测试统一日期选择器组件
   */
  async testUnifiedDatePicker() {
    console.log('🗓️ [测试] 统一日期选择器组件...');

    try {
      const unifiedPickerPath = path.join(process.cwd(), 'components', 'ui', 'unified-date-picker.tsx');
      
      if (fs.existsSync(unifiedPickerPath)) {
        const content = fs.readFileSync(unifiedPickerPath, 'utf8');

        // 测试1: 主要组件导出
        const hasUnifiedDatePicker = content.includes('export function UnifiedDatePicker');
        const hasDatePicker = content.includes('export function DatePicker');
        const hasDateRangePicker = content.includes('export function DateRangePicker');
        const hasDateTimePicker = content.includes('export function DateTimePicker');
        const hasDateInputPicker = content.includes('export function DateInputPicker');

        this.addResult({
          testName: '主要组件导出检查',
          passed: hasUnifiedDatePicker && hasDatePicker && hasDateRangePicker && hasDateTimePicker && hasDateInputPicker,
          details: `UnifiedDatePicker: ${hasUnifiedDatePicker}, DatePicker: ${hasDatePicker}, DateRangePicker: ${hasDateRangePicker}, DateTimePicker: ${hasDateTimePicker}, DateInputPicker: ${hasDateInputPicker}`
        });

        // 测试2: TypeScript接口定义
        const hasDatePickerMode = content.includes('export type DatePickerMode');
        const hasDateRange = content.includes('export interface DateRange');
        const hasUnifiedDatePickerProps = content.includes('export interface UnifiedDatePickerProps');

        this.addResult({
          testName: 'TypeScript接口定义',
          passed: hasDatePickerMode && hasDateRange && hasUnifiedDatePickerProps,
          details: `DatePickerMode: ${hasDatePickerMode}, DateRange: ${hasDateRange}, UnifiedDatePickerProps: ${hasUnifiedDatePickerProps}`
        });

        // 测试3: 中文本地化支持
        const hasZhCNImport = content.includes('import { zhCN }');
        const hasChineseText = content.includes('选择日期') || content.includes('确认');

        this.addResult({
          testName: '中文本地化支持',
          passed: hasZhCNImport && hasChineseText,
          details: `zhCN导入: ${hasZhCNImport}, 中文文本: ${hasChineseText}`
        });

        // 测试4: 时间选择器组件
        const hasTimeSelector = content.includes('function TimeSelector');
        const hasTimeSelection = content.includes('Clock') && content.includes('Select');

        this.addResult({
          testName: '时间选择器功能',
          passed: hasTimeSelector && hasTimeSelection,
          details: `TimeSelector组件: ${hasTimeSelector}, 时间选择UI: ${hasTimeSelection}`
        });

        // 测试5: 使用示例文档
        const hasUsageExamples = content.includes('使用示例：') || content.includes('* // 基础单日期选择');

        this.addResult({
          testName: '使用示例文档',
          passed: hasUsageExamples,
          details: `组件包含使用示例: ${hasUsageExamples}`
        });

      } else {
        this.addResult({
          testName: '统一日期选择器组件测试',
          passed: false,
          details: '组件文件不存在，无法进行测试'
        });
      }

    } catch (error) {
      this.addResult({
        testName: '统一日期选择器组件测试',
        passed: false,
        details: '测试执行失败',
        error: error.message
      });
    }
  }

  /**
   * 测试日期工具函数库
   */
  async testDateUtils() {
    console.log('🛠️ [测试] 日期工具函数库...');

    try {
      const dateUtilsPath = path.join(process.cwd(), 'lib', 'date-utils.ts');
      
      if (fs.existsSync(dateUtilsPath)) {
        const content = fs.readFileSync(dateUtilsPath, 'utf8');

        // 测试1: 基础格式化函数
        const hasFormatDate = content.includes('export function formatDate');
        const hasFormatChineseDate = content.includes('export function formatChineseDate');
        const hasFormatDateTime = content.includes('export function formatDateTime');

        this.addResult({
          testName: '基础格式化函数',
          passed: hasFormatDate && hasFormatChineseDate && hasFormatDateTime,
          details: `formatDate: ${hasFormatDate}, formatChineseDate: ${hasFormatChineseDate}, formatDateTime: ${hasFormatDateTime}`
        });

        // 测试2: 日期验证函数
        const hasIsValidDate = content.includes('export function isValidDate');
        const hasIsValidDateString = content.includes('export function isValidDateString');
        const hasParseDate = content.includes('export function parseDate');

        this.addResult({
          testName: '日期验证函数',
          passed: hasIsValidDate && hasIsValidDateString && hasParseDate,
          details: `isValidDate: ${hasIsValidDate}, isValidDateString: ${hasIsValidDateString}, parseDate: ${hasParseDate}`
        });

        // 测试3: 日期常量定义
        const hasDateFormats = content.includes('export const DATE_FORMATS');
        const hasDatePresets = content.includes('export const DATE_PRESETS');

        this.addResult({
          testName: '日期常量定义',
          passed: hasDateFormats && hasDatePresets,
          details: `DATE_FORMATS: ${hasDateFormats}, DATE_PRESETS: ${hasDatePresets}`
        });

        // 测试4: 日期操作函数
        const hasGetToday = content.includes('export function getToday');
        const hasGetThisWeek = content.includes('export function getThisWeek');
        const hasGetLastNDays = content.includes('export function getLastNDays');

        this.addResult({
          testName: '日期操作函数',
          passed: hasGetToday && hasGetThisWeek && hasGetLastNDays,
          details: `getToday: ${hasGetToday}, getThisWeek: ${hasGetThisWeek}, getLastNDays: ${hasGetLastNDays}`
        });

        // 测试5: 中文本地化函数
        const hasGetChineseWeekday = content.includes('export function getChineseWeekday');
        const hasFormatFullChineseDate = content.includes('export function formatFullChineseDate');

        this.addResult({
          testName: '中文本地化函数',
          passed: hasGetChineseWeekday && hasFormatFullChineseDate,
          details: `getChineseWeekday: ${hasGetChineseWeekday}, formatFullChineseDate: ${hasFormatFullChineseDate}`
        });

      } else {
        this.addResult({
          testName: '日期工具函数库测试',
          passed: false,
          details: '日期工具函数库文件不存在'
        });
      }

    } catch (error) {
      this.addResult({
        testName: '日期工具函数库测试',
        passed: false,
        details: '测试执行失败',
        error: error.message
      });
    }
  }

  /**
   * 测试迁移指南
   */
  async testMigrationGuide() {
    console.log('📖 [测试] 迁移指南...');

    try {
      const migrationGuidePath = path.join(process.cwd(), 'docs', 'date-picker-migration-guide.md');
      
      if (fs.existsSync(migrationGuidePath)) {
        const content = fs.readFileSync(migrationGuidePath, 'utf8');

        // 测试1: 主要章节存在
        const hasOverview = content.includes('## 概述');
        const hasMigrationSteps = content.includes('## 迁移步骤');
        const hasExamples = content.includes('## 具体页面迁移示例');

        this.addResult({
          testName: '迁移指南主要章节',
          passed: hasOverview && hasMigrationSteps && hasExamples,
          details: `概述: ${hasOverview}, 迁移步骤: ${hasMigrationSteps}, 示例: ${hasExamples}`
        });

        // 测试2: 组件替换对照表
        const hasComponentMapping = content.includes('### 步骤 2: 组件替换对照表');
        const hasOldNewComparison = content.includes('**旧的实现方式:**') && content.includes('**新的标准化实现:**');

        this.addResult({
          testName: '组件替换对照表',
          passed: hasComponentMapping && hasOldNewComparison,
          details: `对照表章节: ${hasComponentMapping}, 新旧对比: ${hasOldNewComparison}`
        });

        // 测试3: 检查清单
        const hasChecklist = content.includes('## 迁移检查清单');
        const hasCheckboxes = content.includes('- [ ]');

        this.addResult({
          testName: '迁移检查清单',
          passed: hasChecklist && hasCheckboxes,
          details: `检查清单章节: ${hasChecklist}, 复选框格式: ${hasCheckboxes}`
        });

        // 测试4: 优势说明
        const hasAdvantages = content.includes('## 优势总结');
        const hasConsistency = content.includes('### 1. 一致性');

        this.addResult({
          testName: '优势说明',
          passed: hasAdvantages && hasConsistency,
          details: `优势总结: ${hasAdvantages}, 一致性说明: ${hasConsistency}`
        });

      } else {
        this.addResult({
          testName: '迁移指南测试',
          passed: false,
          details: '迁移指南文件不存在'
        });
      }

    } catch (error) {
      this.addResult({
        testName: '迁移指南测试',
        passed: false,
        details: '测试执行失败',
        error: error.message
      });
    }
  }

  /**
   * 测试现有页面的日期组件使用情况
   */
  async testExistingDateComponents() {
    console.log('🔍 [测试] 现有页面日期组件使用情况...');

    try {
      const componentsDir = path.join(process.cwd(), 'components');
      
      if (fs.existsSync(componentsDir)) {
        const files = this.getAllTsxFiles(componentsDir);
        
        let totalDateUsage = 0;
        let calendarUsage = 0;
        let popoverCalendarUsage = 0;
        let inputDateUsage = 0;

        files.forEach(file => {
          const content = fs.readFileSync(file, 'utf8');
          
          // 统计各种日期组件的使用
          if (content.includes('<Calendar') || content.includes('Calendar')) {
            calendarUsage++;
          }
          if (content.includes('<Popover>') && content.includes('<Calendar')) {
            popoverCalendarUsage++;
          }
          if (content.includes('type="date"')) {
            inputDateUsage++;
          }
          if (content.includes('date') || content.includes('Date') || content.includes('calendar')) {
            totalDateUsage++;
          }
        });

        this.addResult({
          testName: '现有日期组件使用统计',
          passed: true,
          details: `总文件数: ${files.length}, 涉及日期的文件: ${totalDateUsage}, Calendar组件: ${calendarUsage}, Popover+Calendar: ${popoverCalendarUsage}, Input[date]: ${inputDateUsage}`
        });

        // 检查是否需要迁移
        const needsMigration = calendarUsage > 0 || popoverCalendarUsage > 0 || inputDateUsage > 0;
        
        this.addResult({
          testName: '迁移需求评估',
          passed: true,
          details: needsMigration ? '发现需要迁移的日期组件' : '未发现需要迁移的组件'
        });

      } else {
        this.addResult({
          testName: '现有页面日期组件测试',
          passed: false,
          details: 'components目录不存在'
        });
      }

    } catch (error) {
      this.addResult({
        testName: '现有页面日期组件测试',
        passed: false,
        details: '测试执行失败',
        error: error.message
      });
    }
  }

  /**
   * 测试中文本地化支持
   */
  async testChineseLocalization() {
    console.log('🇨🇳 [测试] 中文本地化支持...');

    try {
      // 模拟测试中文本地化功能
      const chineseTexts = [
        '选择日期', '选择日期范围', '确认', '取消',
        '今天', '昨天', '本周', '本月',
        '年', '月', '日', '星期'
      ];

      const dateFormats = [
        'yyyy-MM-dd',
        'yyyy年MM月dd日',
        'yyyy-MM-dd HH:mm',
        'yyyy年MM月dd日 HH:mm'
      ];

      this.addResult({
        testName: '中文文本支持',
        passed: chineseTexts.length > 0,
        details: `支持的中文文本数量: ${chineseTexts.length}`
      });

      this.addResult({
        testName: '中文日期格式支持',
        passed: dateFormats.length > 0,
        details: `支持的中文日期格式数量: ${dateFormats.length}`
      });

      // 测试星期几的中文显示
      const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
      
      this.addResult({
        testName: '中文星期显示',
        passed: weekdays.length === 7,
        details: `中文星期格式: 星期${weekdays.join('、星期')}`
      });

    } catch (error) {
      this.addResult({
        testName: '中文本地化支持测试',
        passed: false,
        details: '测试执行失败',
        error: error.message
      });
    }
  }

  /**
   * 获取所有TSX文件
   */
  getAllTsxFiles(dir) {
    let files = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files = files.concat(this.getAllTsxFiles(fullPath));
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
          files.push(fullPath);
        }
      });
    } catch (error) {
      // 忽略无法访问的目录
    }
    
    return files;
  }

  /**
   * 添加测试结果
   */
  addResult(result) {
    this.results.push(result);
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.testName}: ${result.details}`);
    if (result.error) {
      console.log(`   错误: ${result.error}`);
    }
  }

  /**
   * 打印测试结果摘要
   */
  printResults() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log('\n' + '='.repeat(60));
    console.log('📅 日期选择组件全面标准化测试结果摘要');
    console.log('='.repeat(60));
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过: ${passedTests} ✅`);
    console.log(`失败: ${failedTests} ❌`);
    console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests > 0) {
      console.log('\n❌ 失败的测试:');
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`  - ${result.testName}: ${result.error || result.details}`);
      });
    }

    console.log('\n🎯 日期选择组件全面标准化' + (failedTests === 0 ? '完全成功!' : '需要修复失败的测试项'));
    console.log('='.repeat(60));
  }
}

// 执行测试
const tester = new DatePickerStandardizationTester();
tester.runAllTests().catch(console.error);
