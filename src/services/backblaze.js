import fetch from 'node-fetch';

let auth;
// TODO check authTime > 24h
let authTime;

export async function authorizeB2() {
  const res = await fetch(
    'https://api.backblazeb2.com/b2api/v2/b2_authorize_account',
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.B2_KEY_ID}:${process.env.B2_KEY}`).toString('base64')}`,
      },
    },
  );
  auth = await res.json();
  // console.log(auth);
  if (auth.status) {
    throw new Error('Failed auth to B2');
  }
  authTime = new Date();
}

/**
 * Creates an auth token to download files after prefix
 * @param {string} prefix
 * @returns {Promise<string>} the auth token
 */
export async function downloadAuth(prefix) {
  const res = await fetch(`${auth.apiUrl}/b2api/v2/b2_get_download_authorization`, {
    method: 'POST',
    headers: { Authorization: auth.authorizationToken },
    body: JSON.stringify({
      bucketId: auth.allowed.bucketId,
      fileNamePrefix: prefix,
      validDurationInSeconds: 10800,
    }),
  });
  const data = await res.json();
  return data.authorizationToken;
}

/**
 * Get the download link to a file
 * @param {string} file
 * @returns {string}
 */
export function downloadLink(file) {
  return `${auth.downloadUrl}/file/${auth.allowed.bucketName}/${file}`;
}
