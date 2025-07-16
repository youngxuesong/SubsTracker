/**
 * 时间工具函数模块
 */

/**
 * 格式化北京时间
 * @param {Date} date - 日期对象，默认为当前时间
 * @param {string} format - 格式化选项: 'full'(完整), 'date'(仅日期), 'datetime'(日期和时间)
 * @returns {string} 格式化后的日期字符串
 */
export function formatBeijingTime(date = new Date(), format = 'full') {
  if (format === 'date') {
    return date.toLocaleDateString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } else if (format === 'datetime') {
    return date.toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } else {
    // full format
    return date.toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai'
    });
  }
}
