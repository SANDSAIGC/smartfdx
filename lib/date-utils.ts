/**
 * 优化的日期工具函数
 * 使用 tree-shaking 优化 date-fns 导入
 */

// 只导入需要的函数，而不是整个 date-fns 库
import { format as dateFnsFormat } from 'date-fns/format';
import { zhCN } from 'date-fns/locale/zh-CN';

// 导出优化的格式化函数
export const format = dateFnsFormat;
export const locale = { zhCN };

// 常用的日期格式化函数
export function formatDate(date: Date | undefined): string {
  if (!date) return "";
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 中文日期格式化
export function formatChineseDate(date: Date | undefined): string {
  if (!date) return "";
  
  return dateFnsFormat(date, "yyyy年MM月dd日", { locale: zhCN });
}

// 显示用的日期格式化
export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日`;
}

// ISO 日期字符串转换
export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0];
}
