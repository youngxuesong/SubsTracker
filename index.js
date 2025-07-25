// 订阅续期通知系统 - 主入口文件
import { handleRequest as handleLoginRequest } from './src/views/login.js';
import { handleRequest as handleAdminRequest } from './src/handlers/admin.js';
import { handleRequest as handleApiRequest } from './src/handlers/api.js';
import { checkExpiringSubscriptions } from './src/cron.js';
import { getConfig } from './src/kv/config.js';

// 添加CryptoJS实现，确保JWT功能正常工作
const CryptoJS = {
  HmacSHA256: function(message, key) {
    const keyData = new TextEncoder().encode(key);
    const messageData = new TextEncoder().encode(message);

    return Promise.resolve().then(() => {
      return crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: {name: "SHA-256"} },
        false,
        ["sign"]
      );
    }).then(cryptoKey => {
      return crypto.subtle.sign(
        "HMAC",
        cryptoKey,
        messageData
      );
    }).then(buffer => {
      const hashArray = Array.from(new Uint8Array(buffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    });
  }
};

// 导出CryptoJS供其他模块使用
export { CryptoJS };

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 添加调试页面
    if (url.pathname === '/debug') {
      try {
        const config = await getConfig(env);
        const debugInfo = {
          timestamp: new Date().toISOString(),
          pathname: url.pathname,
          kvBinding: !!env.SUBSCRIPTIONS_KV,
          configExists: !!config,
          adminUsername: config.ADMIN_USERNAME,
          hasJwtSecret: !!config.JWT_SECRET,
          jwtSecretLength: config.JWT_SECRET ? config.JWT_SECRET.length : 0
        };

        return new Response(`
<!DOCTYPE html>
<html>
<head>
  <title>调试信息</title>
  <style>
    body { font-family: monospace; padding: 20px; background: #f5f5f5; }
    .info { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
    .success { color: green; }
    .error { color: red; }
  </style>
</head>
<body>
  <h1>系统调试信息</h1>
  <div class="info">
    <h3>基本信息</h3>
    <p>时间: ${debugInfo.timestamp}</p>
    <p>路径: ${debugInfo.pathname}</p>
    <p class="${debugInfo.kvBinding ? 'success' : 'error'}">KV绑定: ${debugInfo.kvBinding ? '✓' : '✗'}</p>
  </div>

  <div class="info">
    <h3>配置信息</h3>
    <p class="${debugInfo.configExists ? 'success' : 'error'}">配置存在: ${debugInfo.configExists ? '✓' : '✗'}</p>
    <p>管理员用户名: ${debugInfo.adminUsername}</p>
    <p class="${debugInfo.hasJwtSecret ? 'success' : 'error'}">JWT密钥: ${debugInfo.hasJwtSecret ? '✓' : '✗'} (长度: ${debugInfo.jwtSecretLength})</p>
  </div>

  <div class="info">
    <h3>解决方案</h3>
    <p>1. 确保KV命名空间已正确绑定为 SUBSCRIPTIONS_KV</p>
    <p>2. 尝试访问 <a href="/">/</a> 进行登录</p>
    <p>3. 如果仍有问题，请检查Cloudflare Workers日志</p>
  </div>
</body>
</html>`, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      } catch (error) {
        return new Response(`调试页面错误: ${error.message}`, {
          status: 500,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
    }

    // 路由分发
    if (url.pathname.startsWith('/api')) {
      return handleApiRequest(request, env, ctx);
    } else if (url.pathname.startsWith('/admin')) {
      return handleAdminRequest(request, env, ctx);
    } else {
      return handleLoginRequest(request, env, ctx);
    }
  },

  async scheduled(event, env, ctx) {
    const now = new Date();
    const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    console.log('[Workers] 定时任务触发 UTC:', now.toISOString(), '北京时间:', beijingTime.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'}));
    await checkExpiringSubscriptions(env);
  }
};
