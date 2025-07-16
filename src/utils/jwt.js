/**
 * JWT工具模块
 */

import { CryptoJS } from '../../index.js';

/**
 * 生成JWT令牌
 * @param {string} username - 用户名
 * @param {string} secret - 密钥
 * @returns {Promise<string>} JWT令牌
 */
export async function generateJWT(username, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { username, iat: Math.floor(Date.now() / 1000) };

  const headerBase64 = btoa(JSON.stringify(header));
  const payloadBase64 = btoa(JSON.stringify(payload));

  const signatureInput = headerBase64 + '.' + payloadBase64;
  const signature = await CryptoJS.HmacSHA256(signatureInput, secret);

  return headerBase64 + '.' + payloadBase64 + '.' + signature;
}

/**
 * 验证JWT令牌
 * @param {string} token - JWT令牌
 * @param {string} secret - 密钥
 * @returns {Promise<object|null>} 验证成功返回payload，失败返回null
 */
export async function verifyJWT(token, secret) {
  try {
    if (!token || !secret) {
      console.log('[JWT] Token或Secret为空');
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('[JWT] Token格式错误，部分数量:', parts.length);
      return null;
    }

    const [headerBase64, payloadBase64, signature] = parts;
    const signatureInput = headerBase64 + '.' + payloadBase64;
    const expectedSignature = await CryptoJS.HmacSHA256(signatureInput, secret);

    if (signature !== expectedSignature) {
      console.log('[JWT] 签名验证失败');
      return null;
    }

    const payload = JSON.parse(atob(payloadBase64));
    console.log('[JWT] 验证成功，用户:', payload.username);
    return payload;
  } catch (error) {
    console.error('[JWT] 验证过程出错:', error);
    return null;
  }
}

/**
 * 从Cookie中获取指定键的值
 * @param {string} cookieString - Cookie字符串
 * @param {string} key - 键名
 * @returns {string|null} Cookie值或null
 */
export function getCookieValue(cookieString, key) {
  if (!cookieString) return null;

  const match = cookieString.match(new RegExp('(^| )' + key + '=([^;]+)'));
  return match ? match[2] : null;
}
