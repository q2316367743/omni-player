import dayjs from "dayjs";

/**
 * 格式化日期
 * @param date 日期对象
 * @param format 格式字符串
 */
export function formatDate(date: Date | string | number, format: string = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs(date).format(format);
}