import CryptoJS from 'crypto-js';

const tokenPass = `${process.env.TOKEN_KEY}`;

export function createAuthToken(id, role, durationDays = 7) {
  return CryptoJS.AES.encrypt(`${id}|${role}|${Date.now() + durationDays * 24 * 3600 * 1000}`, tokenPass).toString();
}

export function checkAuthToken(authToken) {
  let result = {};
  let decryptedToken = '';
  try {
    decryptedToken = CryptoJS.AES.decrypt(`${authToken}`, tokenPass).toString(CryptoJS.enc.Utf8);
  } catch (error) {
    result.error = 'InvalidTokenError';
    return result;
  }
  const split = decryptedToken.split('|');
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
