import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const tokenPass = Buffer.from(process.env.TOKEN_KEY, 'hex');

export function createAuthToken(id, role, durationDays = 7) {
  const IV = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', tokenPass, IV);
  const token = cipher.update(`${id}|${role}|${Date.now() + durationDays * 24 * 3600 * 1000}`, 'utf8');
  return Buffer.concat([IV, token]).toString('base64url');
}

export function checkCookieAuthToken(cookieHeader) {
  if (!(typeof (cookieHeader) === 'string')) {
    return ('Error');
  }
  const parsedCookie = cookieHeader
    .split(';')
    .map((v) => v.split('='))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});

  if (!parsedCookie.hasOwnProperty('authToken')) {
    return ('Error');
  }
  return parsedCookie.authToken;
}

export function checkAuthToken(authToken) {
  let result = {};
  let token = '';
  try {
    const buf = Buffer.from(authToken, 'base64url');
    const decipher = crypto.createDecipheriv('aes-256-gcm', tokenPass, buf.subarray(0, 16));
    token = decipher.update(buf.subarray(16), undefined, 'utf8');
  } catch (error) {
    result.error = 'InvalidTokenError';
    return result;
  }
  const split = token.split('|');
  if (split.length !== 3) {
    result.error = 'InvalidTokenError';
    return result;
  }

  const valid = (new Date(parseInt(split[2], 10))).getTime() > 0;

  if (!valid) {
    result.error = 'InvalidTokenError';
    return result;
  }

  if (Date.now() > result.expires) {
    result.error = 'ExpiredTokenError';
    return result;
  }

  result = { id: split[0], role: split[1], expires: split[2] };

  return result;
}
