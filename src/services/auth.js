import crypto from 'crypto';

const tokenPass = Buffer.from(process.env.TOKEN_KEY, 'hex');

// Create a new auth token
export function createAuthToken(id, role, durationDays = 7) {
  const IV = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', tokenPass, IV);
  const token = cipher.update(`${id}|${role}|${Date.now() + durationDays * 24 * 3600 * 1000}`, 'utf8');
  return Buffer.concat([IV, token]).toString('base64url');
}

/**
 * Authentication object
 * @typedef {Object} Auth
 * @property {string} id - User id
 * @property {string} role
 * @property {string} expires
 */

/**
 * Check an encrypted auth token
 * @param {string} authToken - Base64 encoded auth token
 * @returns {Auth}
 */
function checkAuthToken(authToken) {
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

  // TODO(guillaume) verify if user id exists and role matches

  result = { id: split[0], role: split[1], expires: split[2] };

  return result;
}

/**
 * Auth express middleware, verifies auth token and set req.auth to the auth object
 */
export async function requireAuth(req, res, next) {
  if (req.cookies.authToken) {
    const auth = checkAuthToken(req.cookies.authToken);
    if ('error' in auth) {
      next({ code: 403, error: auth.error });
      return;
    }
    req.auth = auth;
    next();
    return;
  }
  next({ code: 401, error: 'No auth token' });
}
