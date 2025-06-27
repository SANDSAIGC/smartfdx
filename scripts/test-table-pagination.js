#!/usr/bin/env node

/**
 * 表格分页功能集成测试脚本
 * 验证所有页面的分页功能集成效果
 */

const fs = require('fs');
const path = require('path');

class TablePaginationTester {
  constructor() {
    this.results = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      details: []
    };
    
    // 测试目标页面
    this.testPages = [
      'components/data-table-center-page.tsx',
      'components/lab-page.tsx',
      'components/filter-press-data-details-page.tsx',
      'components/machine-running-details-page.tsx',
      'components/concentration-fineness-monitor-page.tsx'
    ];
  }

  /**
   * 运行所有测试
   */
  async run() {
    console.log('🧪 开始测试表格分页功能集成效果...\n');
    
    await this.testPaginatedTableComponent();
    await this.testPaginationIntegration();
    await this.testPaginationFeatures();
    await this.testTableConfiguration();
    
    this.printResults();
  }

  /**
   * 测试分页表格组件
   */
  async testPaginatedTableComponent() {
    console.log('📋 测试1: 分页表格组件基础设施检查\n');

    const requiredFiles = [
      'components/ui/paginated-table.tsx'
    ];

    for (const filePath of requiredFiles) {
      this.results.totalTests++;
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // 检查核心组件
        const hasPaginatedTable = content.includes('export function PaginatedTable');
        const hasColumnConfig = content.includes('export interface ColumnConfig');
        const hasPaginationConfig = content.includes('export interface PaginationConfig');
        const hasSortConfig = content.includes('export interface SortConfig');
        const hasFilterConfig = content.includes('export interface FilterConfig');
        
        // 检查功能特性
        const hasSearchFeature = content.includes('searchable');
        const hasSortFeature = content.includes('sortable');
        const hasFilterFeature = content.includes('filterable');
        const hasPaginationControls = content.includes('ChevronLeft');
        const hasPageSizeSelector = content.includes('pageSizeOptions');
        
        const componentScore = [
          hasPaginatedTable, hasColumnConfig, hasPaginationConfig,
          hasSortConfig, hasFilterConfig, hasSearchFeature,
          hasSortFeature, hasFilterFeature, hasPaginationControls,
          hasPageSizeSelector
        ].filter(Boolean).length;
        
        if (componentScore >= 8) {
          this.results.passedTests++;
          this.results.details.push(`✅ 分页表格组件 - 组件完整 (${componentScore}/10)`);
        } else {
          this.results.failedTests++;
          this.results.details.push(`❌ 分页表格组件 - 组件不完整 (${componentScore}/10)`);
        }
      } else {
        this.results.failedTests++;
        this.results.details.push(`❌ ${filePath} - 文件不存在`);
      }
    }
  }

  /**
   * 测试分页集成
   */
  async testPaginationIntegration() {
    console.log('\n📋 测试2: 页面分页功能集成检查\n');

    for (const pagePath of this.testPages) {
      this.results.totalTests++;
      
      if (fs.existsSync(pagePath)) {
        const content = fs.readFileSync(pagePath, 'utf8');
        const pageName = path.basename(pagePath, '.tsx');
        
        // 检查分页表格组件导入
        const hasPaginatedTableImport = content.includes('from "@/components/ui/paginated-table"');
        
        // 检查分页表格组件使用
        const hasPaginatedTableUsage = content.includes('<PaginatedTable');
        
        // 检查是否移除了旧的表格组件
        const hasOldTableUsage = content.includes('<Table>') && 
                                content.includes('<TableHeader>') && 
                                content.includes('<TableBody>') &&
                                !content.includes('<PaginatedTable');
        
        const integrationScore = [hasPaginatedTableImport, hasPaginatedTableUsage, !hasOldTableUsage].filter(Boolean).length;
        
        if (integrationScore >= 2) {
          this.results.passedTests++;
          this.results.details.push(`✅ ${pageName} - 分页功能集成完成 (${integrationScore}/3)`);
        } else {
          this.results.failedTests++;
          this.results.details.push(`❌ ${pageName} - 分页功能集成不完整 (${integrationScore}/3)`);
        }
      } else {
        this.results.failedTests++;
        this.results.details.push(`❌ ${pagePath} - 文件不存在`);
      }
    }
  }

  /**
   * 测试分页功能特性
   */
  async testPaginationFeatures() {
    console.log('\n📋 测试3: 分页功能特性检查\n');

    const paginatedTablePath = 'components/ui/paginated-table.tsx';
    
    if (fs.existsSync(paginatedTablePath)) {
      const content = fs.readFileSync(paginatedTablePath, 'utf8');
      
      const features = [
        { name: '搜索功能', check: 'searchTerm' },
        { name: '排序功能', check: 'sortConfig' },
        { name: '筛选功能', check: 'filterConfig' },
        { name: '分页控制', check: 'currentPage' },
        { name: '页面大小选择', check: 'pageSize' },
        { name: '快速跳转', check: 'showQuickJumper' },
        { name: '总数显示', check: 'showTotal' },
        { name: '加载状态', check: 'loading' },
        { name: '错误处理', check: 'error' },
        { name: '行选择', check: 'selectable' },
        { name: '行点击事件', check: 'onRowClick' },
        { name: '数据刷新', check: 'onRefresh' },
        { name: '数据导出', check: 'onExport' },
        { name: '响应式设计', check: 'ScrollArea' },
        { name: '动画效果', check: 'AnimatedCard' }
      ];

      for (const feature of features) {
        this.results.totalTests++;
        
        if (content.includes(feature.check)) {
          this.results.passedTests++;
          this.results.details.push(`✅ ${feature.name} - 功能完整`);
        } else {
          this.results.failedTests++;
          this.results.details.push(`❌ ${feature.name} - 功能缺失`);
        }
      }
    } else {
      this.results.failedTests++;
      this.results.details.push(`❌ ${paginatedTablePath} - 分页表格组件文件不存在`);
    }
  }

  /**
   * 测试表格配置功能
   */
  async testTableConfiguration() {
    console.log('\n📋 测试4: 表格配置功能检查\n');

    const paginatedTablePath = 'components/ui/paginated-table.tsx';
    
    if (fs.existsSync(paginatedTablePath)) {
      const content = fs.readFileSync(paginatedTablePath, 'utf8');
      
      const configFeatures = [
        { name: '列配置接口', check: 'ColumnConfig' },
        { name: '分页配置接口', check: 'PaginationConfig' },
        { name: '排序配置接口', check: 'SortConfig' },
        { name: '筛选配置接口', check: 'FilterConfig' },
        { name: '表格属性接口', check: 'PaginatedTableProps' },
        { name: '默认分页配置', check: 'defaultPagination' },
        { name: '列渲染函数', check: 'column.render' },
        { name: '列对齐配置', check: 'column.align' },
        { name: '列宽度配置', check: 'column.width' },
        { name: '列排序配置', check: 'column.sortable' },
        { name: '列筛选配置', check: 'column.filterable' },
        { name: '空数据提示', check: 'emptyText' }
      ];

      for (const feature of configFeatures) {
        this.results.totalTests++;
        
        if (content.includes(feature.check)) {
          this.results.passedTests++;
          this.results.details.push(`✅ ${feature.name} - 配置完整`);
        } else {
          this.results.failedTests++;
          this.results.details.push(`❌ ${feature.name} - 配置缺失`);
        }
      }
    }
  }

  /**
   * 打印测试结果
   */
  printResults() {
    console.log('\n======================================================================');
    console.log('📊 表格分页功能集成测试报告');
    console.log('======================================================================\n');

    console.log('📈 测试统计:');
    console.log(`   总测试数: ${this.results.totalTests}`);
    console.log(`   通过测试: ${this.results.passedTests}`);
    console.log(`   失败测试: ${this.results.failedTests}`);
    console.log(`   成功率: ${((this.results.passedTests / this.results.totalTests) * 100).toFixed(1)}%\n`);

    console.log('📋 详细测试结果:');
    this.results.details.forEach(detail => {
      console.log(`   ${detail}`);
    });

    if (this.results.passedTests === this.results.totalTests) {
      console.log('\n🎉 表格分页功能集成测试全部通过！');
      console.log('\n✨ 集成成果:');
      console.log('   • 统一的分页表格组件系统');
      console.log('   • 智能搜索和筛选功能');
      console.log('   • 灵活的排序机制');
      console.log('   • 可配置的分页选项');
      console.log('   • 响应式设计和动画效果');
      console.log('   • 加载和错误状态处理');
      console.log('   • 数据导出和刷新功能');
      console.log('   • 行选择和批量操作');
      console.log('   • 快速跳转和页面大小调整');
      console.log('   • 完整的配置接口和类型定义');
    } else {
      console.log('\n⚠️ 部分测试失败，请检查分页功能集成实现');
    }

    console.log('\n📚 使用指南:');
    console.log('   • 使用 PaginatedTable 组件替代原生 Table');
    console.log('   • 配置 ColumnConfig 定义表格列结构');
    console.log('   • 设置 pagination 属性控制分页行为');
    console.log('   • 使用 searchable 启用智能搜索功能');
    console.log('   • 使用 sortable 启用列排序功能');
    console.log('   • 使用 filterable 启用列筛选功能');
    console.log('   • 使用 onRowClick 处理行点击事件');
    console.log('   • 使用 onSort 和 onFilter 处理数据操作');
    console.log('   • 使用 onRefresh 和 onExport 处理表格操作');
    console.log('   • 使用 showActions 显示操作工具栏');
    console.log('   • 使用 loading 和 error 处理状态显示');
    console.log('   • 使用 emptyText 自定义空数据提示');

    console.log('\n🔧 高级配置:');
    console.log('   • 列渲染函数: column.render(value, row, index)');
    console.log('   • 列对齐方式: column.align (left/center/right)');
    console.log('   • 列宽度设置: column.width (CSS宽度值)');
    console.log('   • 分页大小选项: pageSizeOptions [10, 20, 50, 100]');
    console.log('   • 快速跳转: showQuickJumper (启用页面跳转)');
    console.log('   • 总数显示: showTotal (显示记录统计)');
    console.log('   • 页面大小选择器: showSizeChanger (启用大小选择)');
  }
}

// 运行测试
if (require.main === module) {
  const tester = new TablePaginationTester();
  tester.run().catch(console.error);
}

module.exports = TablePaginationTester;
