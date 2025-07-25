/**
 * 管理页面处理模块
 */

import { getConfig } from '../kv/config.js';
import { verifyJWT, getCookieValue } from '../utils/jwt.js';
import { adminPage } from '../views/admin.js';
import { configPage } from '../views/config.js';

/**
 * 处理管理页面请求
 * @param {Request} request - 请求对象
 * @param {Object} env - Cloudflare环境对象
 * @param {Object} ctx - 上下文对象
 * @returns {Response} 响应对象
 */
export async function handleRequest(request, env, ctx) {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;

    console.log('[管理页面] 访问路径:', pathname);

    const token = getCookieValue(request.headers.get('Cookie'), 'token');
    console.log('[管理页面] Token存在:', !!token);

    const config = await getConfig(env);
    const user = token ? await verifyJWT(token, config.JWT_SECRET) : null;

    console.log('[管理页面] 用户验证结果:', !!user);

    if (!user) {
      console.log('[管理页面] 用户未登录，重定向到登录页面');
      return new Response('', {
        status: 302,
        headers: { 'Location': '/' }
      });
    }

    if (pathname === '/admin/config') {
      return new Response(configPage, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    return new Response(adminPage, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (error) {
    console.error('[管理页面] 处理请求时出错:', error);
    return new Response('服务器内部错误', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}
