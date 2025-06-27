# 日期选择组件标准化迁移指南

## 概述

本指南详细说明如何将项目中的各种日期选择组件迁移到统一的 `UnifiedDatePicker` 系统。

## 新的统一组件系统

### 1. 核心组件

- **`UnifiedDatePicker`**: 主要的统一日期选择器组件
- **`DatePicker`**: 单日期选择的便捷组件
- **`DateRangePicker`**: 日期范围选择的便捷组件
- **`DateTimePicker`**: 日期时间选择的便捷组件
- **`DateInputPicker`**: 输入框模式的日期选择器

### 2. 标准化的日期工具函数

- **`lib/date-utils.ts`**: 完整的日期处理工具库
- 支持中文本地化
- 统一的格式化函数
- 日期验证和转换
- 常用日期操作

## 迁移步骤

### 步骤 1: 导入新组件

```typescript
// 旧的导入方式
import { Calendar } from "@/components/ui/calendar";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

// 新的导入方式
import { DatePicker, DateRangePicker, DateTimePicker } from "@/components/ui/unified-date-picker";
import { formatDate, formatChineseDate, DATE_FORMATS } from "@/lib/date-utils";
```

### 步骤 2: 组件替换对照表

#### 2.1 单日期选择器

**旧的实现方式:**
```typescript
// components/ui/date-picker.tsx 的旧实现
<div className="relative">
  <Input
    type="date"
    value={formatDate(date)}
    onChange={(e) => setDate(new Date(e.target.value))}
  />
  <CalendarIcon className="absolute top-1/2 right-3 size-4" />
</div>
```

**新的标准化实现:**
```typescript
<DatePicker
  value={date}
  onChange={setDate}
  label="选择日期"
  placeholder="请选择日期"
  required={true}
/>
```

#### 2.2 Popover + Calendar 组合

**旧的实现方式:**
```typescript
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      <CalendarIcon className="mr-2 h-4 w-4" />
      {date ? format(date, "yyyy-MM-dd") : "选择日期"}
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
    />
  </PopoverContent>
</Popover>
```

**新的标准化实现:**
```typescript
<DatePicker
  value={date}
  onChange={setDate}
  label="选择日期"
  placeholder="选择日期"
/>
```

#### 2.3 日期范围选择器

**旧的实现方式:**
```typescript
<Calendar
  mode="range"
  selected={dateRange}
  onSelect={setDateRange}
  numberOfMonths={2}
/>
```

**新的标准化实现:**
```typescript
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  label="选择日期范围"
  placeholder="请选择日期范围"
/>
```

#### 2.4 日期时间选择器

**新的实现方式:**
```typescript
<DateTimePicker
  value={datetime}
  onChange={setDatetime}
  label="选择日期和时间"
  format="yyyy年MM月dd日"
/>
```

### 步骤 3: 日期格式化函数迁移

#### 3.1 基础格式化

**旧的方式:**
```typescript
import { format } from "date-fns";

// 各种不一致的格式化方式
const dateStr1 = format(date, "yyyy-MM-dd");
const dateStr2 = date.toISOString().split('T')[0];
const dateStr3 = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
```

**新的标准化方式:**
```typescript
import { formatDate, formatChineseDate, formatDateTime } from "@/lib/date-utils";

// 统一的格式化函数
const dateStr = formatDate(date);           // "2024-01-15"
const chineseDateStr = formatChineseDate(date);  // "2024年01月15日"
const datetimeStr = formatDateTime(date);   // "2024-01-15 14:30"
```

#### 3.2 日期验证和解析

**新的标准化方式:**
```typescript
import { isValidDate, parseDate, isValidDateString } from "@/lib/date-utils";

// 安全的日期验证
if (isValidDate(date)) {
  // 处理有效日期
}

// 安全的日期解析
const parsedDate = parseDate("2024-01-15");
if (parsedDate) {
  // 处理解析成功的日期
}

// 字符串日期验证
if (isValidDateString(dateString)) {
  // 处理有效的日期字符串
}
```

## 具体页面迁移示例

### 1. Lab页面数据对比区域

**迁移前:**
```typescript
// 多种不同的日期选择实现
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      <CalendarIcon className="mr-2 h-4 w-4" />
      {date ? format(date, 'yyyy年MM月dd日') : "选择日期..."}
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <Calendar mode="single" selected={date} onSelect={setDate} />
  </PopoverContent>
</Popover>
```

**迁移后:**
```typescript
<DatePicker
  value={date}
  onChange={setDate}
  label="选择对比日期"
  placeholder="选择日期进行数据对比"
  format="yyyy年MM月dd日"
/>
```

### 2. 数据表格中心页面

**迁移前:**
```typescript
// 日期范围选择的复杂实现
<Calendar
  initialFocus
  mode="range"
  defaultMonth={dateRange?.from}
  selected={dateRange}
  onSelect={setDateRange}
  numberOfMonths={2}
/>
```

**迁移后:**
```typescript
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  label="选择查询日期范围"
  placeholder="选择日期范围进行数据筛选"
/>
```

### 3. 样本记录页面

**迁移前:**
```typescript
// 输入框模式的日期选择
<Input
  type="date"
  value={formatDate(date)}
  onChange={(e) => setDate(new Date(e.target.value))}
/>
```

**迁移后:**
```typescript
<DateInputPicker
  value={date}
  onChange={setDate}
  label="记录日期"
  required={true}
/>
```

## 迁移检查清单

### ✅ 组件替换
- [ ] 替换所有 `<Calendar>` 组件使用
- [ ] 替换所有 `Popover + Calendar` 组合
- [ ] 替换所有自定义日期输入框
- [ ] 替换所有日期范围选择器

### ✅ 函数替换
- [ ] 替换所有 `format()` 函数调用
- [ ] 替换所有手动日期格式化代码
- [ ] 替换所有日期验证逻辑
- [ ] 替换所有日期解析代码

### ✅ 样式统一
- [ ] 确保所有日期选择器使用相同的样式
- [ ] 确保中文本地化正确显示
- [ ] 确保响应式设计一致
- [ ] 确保主题切换正常工作

### ✅ 功能验证
- [ ] 测试单日期选择功能
- [ ] 测试日期范围选择功能
- [ ] 测试日期时间选择功能
- [ ] 测试输入框模式功能
- [ ] 测试日期验证和错误处理

## 优势总结

### 1. 一致性
- 统一的用户界面和交互体验
- 一致的样式和主题支持
- 标准化的中文本地化

### 2. 可维护性
- 集中的组件管理
- 统一的日期处理逻辑
- 减少代码重复

### 3. 功能性
- 完整的TypeScript类型支持
- 丰富的日期操作函数
- 灵活的配置选项

### 4. 性能
- 优化的date-fns导入
- 减少包体积
- 更好的渲染性能

## 注意事项

1. **向后兼容**: 迁移过程中保持现有功能不变
2. **渐进式迁移**: 可以逐页面进行迁移，不需要一次性全部替换
3. **测试验证**: 每次迁移后都要进行功能测试
4. **用户体验**: 确保迁移后的用户体验不降低

## 技术支持

如果在迁移过程中遇到问题，请参考：
- `components/ui/unified-date-picker.tsx` 的详细注释
- `lib/date-utils.ts` 的函数文档
- 本迁移指南的示例代码
