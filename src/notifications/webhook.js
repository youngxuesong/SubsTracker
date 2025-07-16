/**
 * Webhook通知模块 (企业微信应用通知)
 */

import { formatBeijingTime } from '../utils/time.js';

/**
 * 发送Webhook通知
 * @param {string} title - 通知标题
 * @param {string} content - 通知内容
 * @param {Object} config - 配置对象
 * @returns {Promise<boolean>} 是否发送成功
 */
export async function sendWebhookNotification(title, content, config) {
  try {
    if (!config.WEBHOOK_URL) {
      console.error('[企业微信应用通知] 通知未配置，缺少URL');
      return false;
    }

    console.log('[企业微信应用通知] 开始发送通知到: ' + config.WEBHOOK_URL);

    const timestamp = formatBeijingTime(new Date(), 'datetime');
    let requestBody;
    let headers = { 'Content-Type': 'application/json' };

    // 处理自定义请求头
    if (config.WEBHOOK_HEADERS) {
      try {
        const customHeaders = JSON.parse(config.WEBHOOK_HEADERS);
        headers = { ...headers, ...customHeaders };
      } catch (error) {
        console.warn('[企业微信应用通知] 自定义请求头格式错误，使用默认请求头');
      }
    }

    // 处理消息模板
    if (config.WEBHOOK_TEMPLATE) {
      try {
        const template = JSON.parse(config.WEBHOOK_TEMPLATE);
        requestBody = JSON.stringify(template)
          .replace(/\{\{title\}\}/g, title)
          .replace(/\{\{content\}\}/g, content)
          .replace(/\{\{timestamp\}\}/g, timestamp);
        requestBody = JSON.parse(requestBody);
      } catch (error) {
        console.warn('[企业微信应用通知] 消息模板格式错误，使用默认格式');
        requestBody = { title, content, timestamp };
      }
    } else {
      requestBody = { title, content, timestamp };
    }

    const response = await fetch(config.WEBHOOK_URL, {
      method: config.WEBHOOK_METHOD || 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    const result = await response.text();
    console.log('[企业微信应用通知] 发送结果:', response.status, result);
    return response.ok;
  } catch (error) {
    console.error('[企业微信应用通知] 发送通知失败:', error);
    return false;
  }
} 