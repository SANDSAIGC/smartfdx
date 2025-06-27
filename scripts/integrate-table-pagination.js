#!/usr/bin/env node

/**
 * 表格分页功能集成脚本
 * 自动将所有表格组件升级为分页表格
 */

const fs = require('fs');
const path = require('path');

class TablePaginationIntegrator {
  constructor() {
    this.results = {
      totalPages: 0,
      upgradedPages: 0,
      skippedPages: 0,
      errors: 0,
      details: []
    };
    
    // 需要集成分页功能的页面
    this.targetPages = [
      'components/data-table-center-page.tsx',
      'components/lab-page.tsx',
      'components/production-quality-data-page.tsx',
      'components/outgoing-data-details-page.tsx',
      'components/incoming-data-details-new-page.tsx',
      'components/filter-press-data-details-page.tsx',
      'components/machine-running-details-page.tsx',
      'components/concentration-fineness-monitor-page.tsx',
      'components/process-management-page.tsx',
      'components/situation-report-page.tsx',
      'components/purchase-management-page.tsx',
      'components/purchase-request-page.tsx',
      'components/weighbridge-data-page.tsx',
      'components/filter-press-workshop-page.tsx',
      'components/ball-mill-workshop-page.tsx'
    ];
  }

  /**
   * 运行分页功能集成
   */
  async run() {
    console.log('📊 开始表格分页功能集成...\n');
    
    for (const pagePath of this.targetPages) {
      await this.integratePagination(pagePath);
    }
    
    this.printResults();
  }

  /**
   * 集成单个页面的分页功能
   */
  async integratePagination(pagePath) {
    this.results.totalPages++;
    
    try {
      if (!fs.existsSync(pagePath)) {
        this.results.skippedPages++;
        this.results.details.push(`⏭️ ${pagePath} - 文件不存在，跳过`);
        return;
      }

      const content = fs.readFileSync(pagePath, 'utf8');
      const pageName = path.basename(pagePath, '.tsx');
      
      // 检查是否已经使用分页表格组件
      if (this.hasPaginatedTable(content)) {
        this.results.skippedPages++;
        this.results.details.push(`✅ ${pageName} - 分页表格组件已存在`);
        return;
      }

      // 检查是否有需要升级的表格
      if (!this.hasTableToUpgrade(content)) {
        this.results.skippedPages++;
        this.results.details.push(`⏭️ ${pageName} - 无需要升级的表格`);
        return;
      }

      // 集成分页功能
      const upgradedContent = this.integratePaginationFeatures(content, pageName);
      
      // 写入文件
      fs.writeFileSync(pagePath, upgradedContent, 'utf8');
      
      this.results.upgradedPages++;
      this.results.details.push(`📊 ${pageName} - 分页功能已集成`);
      
    } catch (error) {
      this.results.errors++;
      this.results.details.push(`❌ 错误: ${pagePath} - ${error.message}`);
    }
  }

  /**
   * 检查是否已有分页表格组件
   */
  hasPaginatedTable(content) {
    return content.includes('PaginatedTable') ||
           content.includes('from "@/components/ui/paginated-table"');
  }

  /**
   * 检查是否有需要升级的表格
   */
  hasTableToUpgrade(content) {
    return (content.includes('<Table>') || 
            content.includes('from "@/components/ui/table"')) &&
           !content.includes('PaginatedTable');
  }

  /**
   * 集成分页功能
   */
  integratePaginationFeatures(content, pageName) {
    let upgradedContent = content;

    // 1. 添加分页表格组件导入
    const paginatedTableImport = `import { PaginatedTable, ColumnConfig } from "@/components/ui/paginated-table";`;

    // 查找现有表格导入的位置
    const tableImportRegex = /import.*from.*["']@\/components\/ui\/table["'];?\s*$/gm;
    const tableImportMatch = upgradedContent.match(tableImportRegex);
    
    if (tableImportMatch) {
      // 在表格导入后添加分页表格导入
      upgradedContent = upgradedContent.replace(
        tableImportMatch[0], 
        tableImportMatch[0] + '\n' + paginatedTableImport
      );
    } else {
      // 在其他UI组件导入后添加
      const uiImportRegex = /import.*from.*["']@\/components\/ui\/.*["'];?\s*$/gm;
      const lastUiImportMatch = [...upgradedContent.matchAll(uiImportRegex)].pop();
      
      if (lastUiImportMatch) {
        const insertPosition = lastUiImportMatch.index + lastUiImportMatch[0].length;
        upgradedContent = upgradedContent.slice(0, insertPosition) + 
                        '\n' + paginatedTableImport + 
                        upgradedContent.slice(insertPosition);
      }
    }

    // 2. 升级表格使用方式
    upgradedContent = this.upgradeTableUsage(upgradedContent, pageName);

    return upgradedContent;
  }

  /**
   * 升级表格使用方式
   */
  upgradeTableUsage(content, pageName) {
    let upgradedContent = content;

    // 根据页面类型选择不同的升级策略
    if (pageName.includes('data-table-center')) {
      upgradedContent = this.upgradeDataTableCenter(upgradedContent);
    } else if (pageName.includes('lab-page')) {
      upgradedContent = this.upgradeLabPage(upgradedContent);
    } else {
      upgradedContent = this.upgradeGenericTable(upgradedContent, pageName);
    }

    return upgradedContent;
  }

  /**
   * 升级数据中心表格
   */
  upgradeDataTableCenter(content) {
    // 查找表格渲染部分并替换为分页表格
    const tablePattern = /<Table>[\s\S]*?<\/Table>/g;
    
    return content.replace(tablePattern, (match) => {
      // 提取表格配置信息
      const hasHeader = match.includes('<TableHeader>');
      const hasBody = match.includes('<TableBody>');
      
      if (hasHeader && hasBody) {
        return `<PaginatedTable
          data={data}
          columns={tableColumns[selectedTable] || []}
          title={\`\${selectedTable} 数据表\`}
          description="数据中心表格展示"
          searchable={true}
          sortable={true}
          filterable={true}
          pagination={{
            page: 1,
            pageSize: 20,
            total: data.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: true,
            pageSizeOptions: [10, 20, 50, 100]
          }}
          onRowClick={showRecordDetails}
          onRefresh={() => fetchTableData(selectedTable)}
          showActions={true}
          className="mt-4"
        />`;
      }
      
      return match;
    });
  }

  /**
   * 升级实验室页面表格
   */
  upgradeLabPage(content) {
    const tablePattern = /<Table>[\s\S]*?<\/Table>/g;
    
    return content.replace(tablePattern, (match) => {
      if (match.includes('TableHeader') && match.includes('TableBody')) {
        return `<PaginatedTable
          data={tableData}
          columns={columns}
          title={\`\${dataSourceLabel[selectedDataSource]} 数据\`}
          description="实验室数据展示"
          searchable={true}
          sortable={true}
          pagination={{
            page: 1,
            pageSize: 15,
            total: tableData.length,
            showSizeChanger: true,
            showTotal: true,
            pageSizeOptions: [10, 15, 30, 50]
          }}
          onRowClick={handleRowClick}
          onRefresh={fetchData}
          showActions={true}
          emptyText={\`暂无 \${dataSourceLabel[selectedDataSource]} 数据\`}
        />`;
      }
      
      return match;
    });
  }

  /**
   * 升级通用表格
   */
  upgradeGenericTable(content, pageName) {
    const tablePattern = /<Table>[\s\S]*?<\/Table>/g;
    
    return content.replace(tablePattern, (match) => {
      if (match.includes('TableHeader') && match.includes('TableBody')) {
        // 尝试提取数据变量名
        const dataVariableMatch = content.match(/\.map\(\(([^,\)]+)/);
        const dataVariable = dataVariableMatch ? dataVariableMatch[1].split('.')[0] : 'data';
        
        return `<PaginatedTable
          data={${dataVariable} || []}
          columns={columns || []}
          title="${this.getPageTitle(pageName)}"
          description="${this.getPageDescription(pageName)}"
          searchable={true}
          sortable={true}
          pagination={{
            page: 1,
            pageSize: 20,
            total: (${dataVariable} || []).length,
            showSizeChanger: true,
            showTotal: true,
            pageSizeOptions: [10, 20, 50, 100]
          }}
          showActions={true}
          emptyText="暂无数据"
        />`;
      }
      
      return match;
    });
  }

  /**
   * 获取页面标题
   */
  getPageTitle(pageName) {
    const titleMap = {
      'production-quality-data-page': '生产质量数据',
      'outgoing-data-details-page': '出厂数据详情',
      'incoming-data-details-new-page': '进厂数据详情',
      'filter-press-data-details-page': '压滤数据详情',
      'machine-running-details-page': '设备运行详情',
      'concentration-fineness-monitor-page': '浓细度监控',
      'process-management-page': '工艺管理',
      'situation-report-page': '情况报告',
      'purchase-management-page': '采购管理',
      'purchase-request-page': '采购申请',
      'weighbridge-data-page': '磅房数据',
      'filter-press-workshop-page': '压滤车间',
      'ball-mill-workshop-page': '球磨车间'
    };
    
    return titleMap[pageName] || '数据表格';
  }

  /**
   * 获取页面描述
   */
  getPageDescription(pageName) {
    const descriptionMap = {
      'production-quality-data-page': '生产质量数据管理和分析',
      'outgoing-data-details-page': '出厂产品数据详细信息',
      'incoming-data-details-new-page': '进厂原料数据详细信息',
      'filter-press-data-details-page': '压滤工艺数据详细记录',
      'machine-running-details-page': '设备运行状态详细监控',
      'concentration-fineness-monitor-page': '浓度和细度实时监控',
      'process-management-page': '生产工艺流程管理',
      'situation-report-page': '生产情况报告管理',
      'purchase-management-page': '采购订单和供应商管理',
      'purchase-request-page': '采购申请和审批流程',
      'weighbridge-data-page': '车辆称重数据记录',
      'filter-press-workshop-page': '压滤车间生产数据',
      'ball-mill-workshop-page': '球磨车间运行数据'
    };
    
    return descriptionMap[pageName] || '数据管理和展示';
  }

  /**
   * 打印结果
   */
  printResults() {
    console.log('\n======================================================================');
    console.log('📊 表格分页功能集成报告');
    console.log('======================================================================\n');

    console.log('📈 处理统计:');
    console.log(`   总页面数: ${this.results.totalPages}`);
    console.log(`   升级页面: ${this.results.upgradedPages}`);
    console.log(`   跳过页面: ${this.results.skippedPages}`);
    console.log(`   错误数量: ${this.results.errors}`);
    console.log(`   成功率: ${((this.results.upgradedPages / this.results.totalPages) * 100).toFixed(1)}%\n`);

    console.log('📋 详细结果:');
    this.results.details.forEach(detail => {
      console.log(`   ${detail}`);
    });

    if (this.results.upgradedPages > 0) {
      console.log('\n🎉 表格分页功能集成完成！');
      console.log('\n✨ 集成效果:');
      console.log('   • 统一的分页表格组件');
      console.log('   • 智能搜索和筛选功能');
      console.log('   • 灵活的排序机制');
      console.log('   • 可配置的分页选项');
      console.log('   • 响应式设计支持');
      console.log('   • 加载和错误状态处理');
      console.log('   • 数据导出功能');
      console.log('   • 表格操作工具栏');
      console.log('   • 行选择和批量操作');
      console.log('   • 快速跳转和页面大小调整');
    }

    if (this.results.errors > 0) {
      console.log('\n⚠️ 部分页面集成失败，请检查错误信息');
    }

    console.log('\n📚 使用指南:');
    console.log('   • 使用 PaginatedTable 组件替代原生 Table');
    console.log('   • 配置 ColumnConfig 定义表格列');
    console.log('   • 设置 pagination 属性控制分页行为');
    console.log('   • 使用 onRowClick 处理行点击事件');
    console.log('   • 使用 onSort 和 onFilter 处理数据操作');
    console.log('   • 使用 searchable 启用搜索功能');
    console.log('   • 使用 showActions 显示操作工具栏');
  }
}

// 运行脚本
if (require.main === module) {
  const integrator = new TablePaginationIntegrator();
  integrator.run().catch(console.error);
}

module.exports = TablePaginationIntegrator;
