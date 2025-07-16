/**
 * 配置管理模块
 */

/**
 * 生成随机密钥
 * @returns {string} 64字符的随机密钥
 */
export function generateRandomSecret() {
  // 生成一个64字符的随机密钥
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 获取系统配置
 * @param {Object} env - Cloudflare环境对象
 * @returns {Promise<Object>} 配置对象
 */
export async function getConfig(env) {
  try {
    if (!env.SUBSCRIPTIONS_KV) {
      console.error('[配置] KV存储未绑定');
      throw new Error('KV存储未绑定');
    }

    const data = await env.SUBSCRIPTIONS_KV.get('config');
    console.log('[配置] 从KV读取配置:', data ? '成功' : '空配置');

    const config = data ? JSON.parse(data) : {};

    // 确保JWT_SECRET的一致性
    let jwtSecret = config.JWT_SECRET;
    if (!jwtSecret || jwtSecret === 'your-secret-key') {
      jwtSecret = generateRandomSecret();
      console.log('[配置] 生成新的JWT密钥');

      // 保存新的JWT密钥
      const updatedConfig = { ...config, JWT_SECRET: jwtSecret };
      await env.SUBSCRIPTIONS_KV.put('config', JSON.stringify(updatedConfig));
    }

    const finalConfig = {
      ADMIN_USERNAME: config.ADMIN_USERNAME || 'admin',
      ADMIN_PASSWORD: config.ADMIN_PASSWORD || 'password',
      JWT_SECRET: jwtSecret,
      TG_BOT_TOKEN: config.TG_BOT_TOKEN || '',
      TG_CHAT_ID: config.TG_CHAT_ID || '',
      NOTIFYX_API_KEY: config.NOTIFYX_API_KEY || '',
      WEBHOOK_URL: config.WEBHOOK_URL || '',
      WEBHOOK_METHOD: config.WEBHOOK_METHOD || 'POST',
      WEBHOOK_HEADERS: config.WEBHOOK_HEADERS || '',
      WEBHOOK_TEMPLATE: config.WEBHOOK_TEMPLATE || '',
      SHOW_LUNAR: config.SHOW_LUNAR === true,
      WECHATBOT_WEBHOOK: config.WECHATBOT_WEBHOOK || '',
      WECHATBOT_MSG_TYPE: config.WECHATBOT_MSG_TYPE || 'text',
      WECHATBOT_AT_MOBILES: config.WECHATBOT_AT_MOBILES || '',
      WECHATBOT_AT_ALL: config.WECHATBOT_AT_ALL || 'false',
      RESEND_API_KEY: config.RESEND_API_KEY || '',
      EMAIL_FROM: config.EMAIL_FROM || '',
      EMAIL_FROM_NAME: config.EMAIL_FROM_NAME || '',
      EMAIL_TO: config.EMAIL_TO || '',
      ENABLED_NOTIFIERS: config.ENABLED_NOTIFIERS || ['notifyx']
    };

    console.log('[配置] 最终配置用户名:', finalConfig.ADMIN_USERNAME);
    return finalConfig;
  } catch (error) {
    console.error('[配置] 获取配置失败:', error);
    const defaultJwtSecret = generateRandomSecret();

    return {
      ADMIN_USERNAME: 'admin',
      ADMIN_PASSWORD: 'password',
      JWT_SECRET: defaultJwtSecret,
      TG_BOT_TOKEN: '',
      TG_CHAT_ID: '',
      NOTIFYX_API_KEY: '',
      WEBHOOK_URL: '',
      WEBHOOK_METHOD: 'POST',
      WEBHOOK_HEADERS: '',
      WEBHOOK_TEMPLATE: '',
      SHOW_LUNAR: true,
      WECHATBOT_WEBHOOK: '',
      WECHATBOT_MSG_TYPE: 'text',
      WECHATBOT_AT_MOBILES: '',
      WECHATBOT_AT_ALL: 'false',
      RESEND_API_KEY: '',
      EMAIL_FROM: '',
      EMAIL_FROM_NAME: '',
      EMAIL_TO: '',
      ENABLED_NOTIFIERS: ['notifyx']
    };
  }
}

/**
 * 保存系统配置
 * @param {Object} env - Cloudflare环境对象
 * @param {Object} newConfig - 新的配置对象
 * @returns {Promise<boolean>} 保存成功返回true，失败返回false
 */
export async function saveConfig(env, newConfig) {
  try {
    if (!env.SUBSCRIPTIONS_KV) {
      console.error('[配置] KV存储未绑定');
      return false;
    }

    const currentConfig = await getConfig(env);
    
    const updatedConfig = {
      ...currentConfig,
      ADMIN_USERNAME: newConfig.ADMIN_USERNAME || currentConfig.ADMIN_USERNAME,
      TG_BOT_TOKEN: newConfig.TG_BOT_TOKEN || '',
      TG_CHAT_ID: newConfig.TG_CHAT_ID || '',
      NOTIFYX_API_KEY: newConfig.NOTIFYX_API_KEY || '',
      WEBHOOK_URL: newConfig.WEBHOOK_URL || '',
      WEBHOOK_METHOD: newConfig.WEBHOOK_METHOD || 'POST',
      WEBHOOK_HEADERS: newConfig.WEBHOOK_HEADERS || '',
      WEBHOOK_TEMPLATE: newConfig.WEBHOOK_TEMPLATE || '',
      SHOW_LUNAR: newConfig.SHOW_LUNAR === true,
      WECHATBOT_WEBHOOK: newConfig.WECHATBOT_WEBHOOK || '',
      WECHATBOT_MSG_TYPE: newConfig.WECHATBOT_MSG_TYPE || 'text',
      WECHATBOT_AT_MOBILES: newConfig.WECHATBOT_AT_MOBILES || '',
      WECHATBOT_AT_ALL: newConfig.WECHATBOT_AT_ALL || 'false',
      RESEND_API_KEY: newConfig.RESEND_API_KEY || '',
      EMAIL_FROM: newConfig.EMAIL_FROM || '',
      EMAIL_FROM_NAME: newConfig.EMAIL_FROM_NAME || '',
      EMAIL_TO: newConfig.EMAIL_TO || '',
      ENABLED_NOTIFIERS: newConfig.ENABLED_NOTIFIERS || ['notifyx']
    };

    // 如果提供了新密码，则更新密码
    if (newConfig.ADMIN_PASSWORD) {
      updatedConfig.ADMIN_PASSWORD = newConfig.ADMIN_PASSWORD;
    }

    // 确保JWT_SECRET存在且安全
    if (!updatedConfig.JWT_SECRET || updatedConfig.JWT_SECRET === 'your-secret-key') {
      updatedConfig.JWT_SECRET = generateRandomSecret();
      console.log('[安全] 生成新的JWT密钥');
    }

    await env.SUBSCRIPTIONS_KV.put('config', JSON.stringify(updatedConfig));
    console.log('[配置] 配置已保存');
    
    return true;
  } catch (error) {
    console.error('[配置] 保存配置失败:', error);
    return false;
  }
}
