/**
 * 标准化日期工具函数库
 *
 * 功能：
 * 1. 统一的日期格式化函数
 * 2. 中文本地化支持
 * 3. 日期验证和转换
 * 4. 时区处理
 * 5. 常用日期操作
 */

// 优化的 date-fns 导入
import { format as dateFnsFormat } from 'date-fns/format';
import { parse as dateFnsParse } from 'date-fns/parse';
import { isValid as dateFnsIsValid } from 'date-fns/isValid';
import { addDays, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';

// 导出优化的函数
export const format = dateFnsFormat;
export const parse = dateFnsParse;
export const isValid = dateFnsIsValid;
export const locale = { zhCN };

// 日期范围接口
export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

// 常用日期格式常量
export const DATE_FORMATS = {
  ISO: 'yyyy-MM-dd',
  CHINESE: 'yyyy年MM月dd日',
  DISPLAY: 'yyyy-MM-dd',
  DATETIME: 'yyyy-MM-dd HH:mm',
  DATETIME_FULL: 'yyyy-MM-dd HH:mm:ss',
  CHINESE_DATETIME: 'yyyy年MM月dd日 HH:mm',
  TIME_ONLY: 'HH:mm',
  MONTH_YEAR: 'yyyy年MM月'
} as const;

/**
 * 标准日期格式化函数（ISO格式：YYYY-MM-DD）
 */
export function formatDate(date: Date | undefined | null): string {
  if (!date || !isValid(date)) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 中文日期格式化
 */
export function formatChineseDate(date: Date | undefined | null): string {
  if (!date || !isValid(date)) return "";

  return dateFnsFormat(date, DATE_FORMATS.CHINESE, { locale: zhCN });
}

/**
 * 日期时间格式化
 */
export function formatDateTime(date: Date | undefined | null, includeSeconds: boolean = false): string {
  if (!date || !isValid(date)) return "";

  const formatStr = includeSeconds ? DATE_FORMATS.DATETIME_FULL : DATE_FORMATS.DATETIME;
  return dateFnsFormat(date, formatStr, { locale: zhCN });
}

/**
 * 中文日期时间格式化
 */
export function formatChineseDateTime(date: Date | undefined | null): string {
  if (!date || !isValid(date)) return "";

  return dateFnsFormat(date, DATE_FORMATS.CHINESE_DATETIME, { locale: zhCN });
}

/**
 * 显示用的日期格式化（从字符串转换）
 */
export function formatDisplayDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  if (!isValid(date)) return dateStr; // 如果无法解析，返回原字符串

  return formatChineseDate(date);
}

/**
 * ISO 日期字符串转换
 */
export function toISODateString(date: Date | undefined | null): string {
  if (!date || !isValid(date)) return "";

  return date.toISOString().split('T')[0];
}

/**
 * 安全的日期解析
 */
export function parseDate(dateStr: string, formatStr: string = DATE_FORMATS.ISO): Date | null {
  if (!dateStr) return null;

  try {
    // 尝试使用指定格式解析
    const parsed = dateFnsParse(dateStr, formatStr, new Date());
    if (isValid(parsed)) return parsed;

    // 尝试使用原生Date构造函数
    const nativeParsed = new Date(dateStr);
    if (isValid(nativeParsed)) return nativeParsed;

    return null;
  } catch {
    return null;
  }
}

/**
 * 日期验证
 */
export function isValidDate(date: any): date is Date {
  return date instanceof Date && isValid(date);
}

/**
 * 字符串日期验证
 */
export function isValidDateString(dateStr: string): boolean {
  if (!dateStr) return false;

  const date = new Date(dateStr);
  return isValid(date);
}

/**
 * 获取今天的日期
 */
export function getToday(): Date {
  return startOfDay(new Date());
}

/**
 * 获取昨天的日期
 */
export function getYesterday(): Date {
  return subDays(getToday(), 1);
}

/**
 * 获取明天的日期
 */
export function getTomorrow(): Date {
  return addDays(getToday(), 1);
}

/**
 * 获取本周的开始和结束日期
 */
export function getThisWeek(): DateRange {
  const today = getToday();
  return {
    from: startOfWeek(today, { weekStartsOn: 1 }), // 周一开始
    to: endOfWeek(today, { weekStartsOn: 1 })
  };
}

/**
 * 获取本月的开始和结束日期
 */
export function getThisMonth(): DateRange {
  const today = getToday();
  return {
    from: startOfMonth(today),
    to: endOfMonth(today)
  };
}

/**
 * 获取最近N天的日期范围
 */
export function getLastNDays(days: number): DateRange {
  const today = getToday();
  return {
    from: subDays(today, days - 1),
    to: today
  };
}

/**
 * 比较两个日期是否是同一天
 */
export function isSameDay(date1: Date | undefined | null, date2: Date | undefined | null): boolean {
  if (!date1 || !date2 || !isValid(date1) || !isValid(date2)) return false;

  return formatDate(date1) === formatDate(date2);
}

/**
 * 检查日期是否在范围内
 */
export function isDateInRange(date: Date, range: DateRange): boolean {
  if (!isValid(date) || !range.from || !range.to) return false;

  const dateTime = date.getTime();
  const fromTime = range.from.getTime();
  const toTime = range.to.getTime();

  return dateTime >= fromTime && dateTime <= toTime;
}

/**
 * 格式化日期范围显示
 */
export function formatDateRange(range: DateRange, separator: string = ' - '): string {
  if (!range.from && !range.to) return "";

  if (range.from && range.to) {
    if (isSameDay(range.from, range.to)) {
      return formatChineseDate(range.from);
    }
    return `${formatChineseDate(range.from)}${separator}${formatChineseDate(range.to)}`;
  }

  if (range.from) {
    return `从 ${formatChineseDate(range.from)}`;
  }

  if (range.to) {
    return `到 ${formatChineseDate(range.to)}`;
  }

  return "";
}

/**
 * 创建日期范围
 */
export function createDateRange(from: Date | string | undefined, to: Date | string | undefined): DateRange {
  const fromDate = typeof from === 'string' ? parseDate(from) : from;
  const toDate = typeof to === 'string' ? parseDate(to) : to;

  return {
    from: fromDate || undefined,
    to: toDate || undefined
  };
}

/**
 * 获取日期的时间戳（毫秒）
 */
export function getTimestamp(date: Date | undefined | null): number | null {
  if (!date || !isValid(date)) return null;

  return date.getTime();
}

/**
 * 从时间戳创建日期
 */
export function fromTimestamp(timestamp: number): Date | null {
  try {
    const date = new Date(timestamp);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
}

/**
 * 获取两个日期之间的天数差
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  if (!isValid(date1) || !isValid(date2)) return 0;

  const time1 = startOfDay(date1).getTime();
  const time2 = startOfDay(date2).getTime();

  return Math.abs(Math.ceil((time1 - time2) / (1000 * 60 * 60 * 24)));
}

/**
 * 常用的日期预设
 */
export const DATE_PRESETS = {
  today: () => ({ from: getToday(), to: getToday() }),
  yesterday: () => ({ from: getYesterday(), to: getYesterday() }),
  thisWeek: () => getThisWeek(),
  thisMonth: () => getThisMonth(),
  last7Days: () => getLastNDays(7),
  last30Days: () => getLastNDays(30),
  last90Days: () => getLastNDays(90)
} as const;

/**
 * 日期格式化选项
 */
export const CHINESE_DATE_OPTIONS = {
  year: 'numeric' as const,
  month: 'long' as const,
  day: 'numeric' as const,
  weekday: 'long' as const
};

/**
 * 获取中文星期几
 */
export function getChineseWeekday(date: Date): string {
  if (!isValid(date)) return "";

  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return `星期${weekdays[date.getDay()]}`;
}

/**
 * 完整的中文日期显示（包含星期）
 */
export function formatFullChineseDate(date: Date | undefined | null): string {
  if (!date || !isValid(date)) return "";

  const dateStr = formatChineseDate(date);
  const weekday = getChineseWeekday(date);

  return `${dateStr} ${weekday}`;
}
