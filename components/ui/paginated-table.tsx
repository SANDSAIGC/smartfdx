"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  SortAsc,
  SortDesc,
  Filter,
  Download,
  RefreshCw,
  Table as TableIcon
} from "lucide-react";
import { AnimatedCard, AnimatedButton } from "@/components/ui/animated-components";

// 列配置接口
export interface ColumnConfig<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T, index: number) => React.ReactNode;
  className?: string;
}

// 分页配置接口
export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  pageSizeOptions?: number[];
}

// 排序配置接口
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// 筛选配置接口
export interface FilterConfig {
  [key: string]: string;
}

// 分页表格属性接口
export interface PaginatedTableProps<T = any> {
  data: T[];
  columns: ColumnConfig<T>[];
  pagination?: Partial<PaginationConfig>;
  loading?: boolean;
  error?: string;
  title?: string;
  description?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selectedRows: T[]) => void;
  onRowClick?: (row: T, index: number) => void;
  onSort?: (sort: SortConfig) => void;
  onFilter?: (filters: FilterConfig) => void;
  onPageChange?: (page: number, pageSize: number) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  className?: string;
  tableClassName?: string;
  emptyText?: string;
  showActions?: boolean;
  actions?: React.ReactNode;
}

// 默认分页配置
const defaultPagination: PaginationConfig = {
  page: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: true,
  pageSizeOptions: [10, 20, 50, 100]
};

/**
 * 分页表格组件
 */
export function PaginatedTable<T extends Record<string, any>>({
  data,
  columns,
  pagination: paginationProp,
  loading = false,
  error,
  title,
  description,
  searchable = true,
  searchPlaceholder = "搜索数据...",
  sortable = true,
  filterable = false,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  onSort,
  onFilter,
  onPageChange,
  onRefresh,
  onExport,
  className,
  tableClassName,
  emptyText = "暂无数据",
  showActions = false,
  actions
}: PaginatedTableProps<T>) {
  // 状态管理
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 合并分页配置
  const pagination = useMemo(() => ({
    ...defaultPagination,
    ...paginationProp
  }), [paginationProp]);

  // 过滤和搜索数据
  const filteredData = useMemo(() => {
    let result = [...data];

    // 搜索过滤
    if (searchTerm && searchable) {
      result = result.filter(row =>
        columns.some(column => {
          const value = row[column.key];
          return value && String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // 字段过滤
    if (filterable && Object.keys(filterConfig).length > 0) {
      result = result.filter(row =>
        Object.entries(filterConfig).every(([key, value]) => {
          if (!value) return true;
          const rowValue = row[key];
          return rowValue && String(rowValue).toLowerCase().includes(value.toLowerCase());
        })
      );
    }

    return result;
  }, [data, searchTerm, filterConfig, columns, searchable, filterable]);

  // 排序数据
  const sortedData = useMemo(() => {
    if (!sortConfig || !sortable) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'desc' ? -comparison : comparison;
    });
  }, [filteredData, sortConfig, sortable]);

  // 分页数据
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize]);

  // 总页数
  const totalPages = Math.ceil(sortedData.length / pageSize);

  // 处理排序
  const handleSort = (field: string) => {
    if (!sortable) return;

    const newSortConfig: SortConfig = {
      field,
      direction: sortConfig?.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    };

    setSortConfig(newSortConfig);
    onSort?.(newSortConfig);
  };

  // 处理分页变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange?.(page, pageSize);
  };

  // 处理页面大小变化
  const handlePageSizeChange = (newPageSize: string) => {
    const size = parseInt(newPageSize);
    setPageSize(size);
    setCurrentPage(1);
    onPageChange?.(1, size);
  };

  // 处理筛选变化
  const handleFilterChange = (field: string, value: string) => {
    const newFilters = { ...filterConfig, [field]: value };
    setFilterConfig(newFilters);
    onFilter?.(newFilters);
    setCurrentPage(1);
  };

  // 处理列筛选变化
  const handleColumnFilter = (column: ColumnConfig, value: string) => {
    if (column.filterable) {
      handleFilterChange(column.key, value);
    }
  };

  // 渲染排序图标
  const renderSortIcon = (field: string) => {
    if (!sortable) return null;
    if (sortConfig?.field !== field) return <SortAsc className="h-4 w-4 opacity-50" />;
    return sortConfig.direction === 'asc' ? 
      <SortAsc className="h-4 w-4" /> : 
      <SortDesc className="h-4 w-4" />;
  };

  // 渲染分页信息
  const renderPaginationInfo = () => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, sortedData.length);
    return `显示 ${start}-${end} 条，共 ${sortedData.length} 条记录`;
  };

  // 渲染加载状态
  if (loading) {
    return (
      <AnimatedCard className={cn("w-full", className)}>
        {(title || description) && (
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TableIcon className="h-5 w-5" />
                {title && <CardTitle>{title}</CardTitle>}
              </div>
              {showActions && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  </Button>
                </div>
              )}
            </div>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">加载数据中...</p>
            </div>
          </div>
        </CardContent>
      </AnimatedCard>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <AnimatedCard className={cn("w-full", className)}>
        {(title || description) && (
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TableIcon className="h-5 w-5" />
                {title && <CardTitle>{title}</CardTitle>}
              </div>
              {showActions && onRefresh && (
                <AnimatedButton variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </AnimatedButton>
              )}
            </div>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 mb-2">⚠️</div>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className={cn("w-full", className)}>
      {/* 表格头部 */}
      {(title || description || searchable || showActions) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TableIcon className="h-5 w-5" />
              {title && <CardTitle>{title}</CardTitle>}
              <Badge variant="secondary" className="text-xs">
                {sortedData.length} 条记录
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {actions}
              {onRefresh && (
                <AnimatedButton variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </AnimatedButton>
              )}
              {onExport && (
                <AnimatedButton variant="outline" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4" />
                </AnimatedButton>
              )}
            </div>
          </div>
          {description && <CardDescription>{description}</CardDescription>}
          
          {/* 搜索和筛选 */}
          {(searchable || filterable) && (
            <div className="flex flex-col sm:flex-row gap-4">
              {searchable && (
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}
              {filterable && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  {columns.filter(col => col.filterable).map(column => (
                    <Input
                      key={column.key}
                      placeholder={`筛选${column.header}`}
                      value={filterConfig[column.key] || ''}
                      onChange={(e) => handleFilterChange(column.key, e.target.value)}
                      className="w-32"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardHeader>
      )}

      <CardContent className="p-0">
        {/* 表格内容 */}
        {paginatedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <TableIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-medium text-muted-foreground">{emptyText}</p>
            {searchTerm && (
              <p className="text-sm text-muted-foreground mt-2">
                尝试调整搜索条件或清空搜索框
              </p>
            )}
          </div>
        ) : (
          <ScrollArea className="w-full">
            <Table className={cn("w-full", tableClassName)}>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      className={cn(
                        "whitespace-nowrap",
                        column.sortable && sortable ? "cursor-pointer hover:text-primary transition-colors" : "",
                        column.align === 'center' && "text-center",
                        column.align === 'right' && "text-right",
                        column.className
                      )}
                      style={{ width: column.width }}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        {column.header}
                        {column.sortable && renderSortIcon(column.key)}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row, index) => (
                  <TableRow
                    key={row.id || index}
                    className={cn(
                      "hover:bg-muted/50 transition-colors",
                      onRowClick && "cursor-pointer",
                      selectable && selectedRows.includes(row) && "bg-muted"
                    )}
                    onClick={() => onRowClick?.(row, index)}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={cn(
                          column.align === 'center' && "text-center",
                          column.align === 'right' && "text-right",
                          column.className
                        )}
                      >
                        {column.render 
                          ? column.render(row[column.key], row, index)
                          : String(row[column.key] || '-')
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}

        {/* 分页控件 */}
        {paginatedData.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {pagination.showTotal && <span>{renderPaginationInfo()}</span>}
              {pagination.showSizeChanger && (
                <div className="flex items-center gap-2">
                  <span>每页显示</span>
                  <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pagination.pageSizeOptions?.map(size => (
                        <SelectItem key={size} value={String(size)}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span>条</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <AnimatedButton
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </AnimatedButton>
              <AnimatedButton
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </AnimatedButton>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <AnimatedButton
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </AnimatedButton>
                  );
                })}
              </div>

              <AnimatedButton
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </AnimatedButton>
              <AnimatedButton
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </AnimatedButton>

              {pagination.showQuickJumper && (
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-sm text-muted-foreground">跳转到</span>
                  <Input
                    type="number"
                    min={1}
                    max={totalPages}
                    className="w-16 h-8"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const page = parseInt((e.target as HTMLInputElement).value);
                        if (page >= 1 && page <= totalPages) {
                          handlePageChange(page);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <span className="text-sm text-muted-foreground">页</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </AnimatedCard>
  );
}
