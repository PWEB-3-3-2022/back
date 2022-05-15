export function validateURL(url) {
  let check;
  try {
    check = new URL(url);
  } catch (_) {
    return false;
  }
  return (check.protocol === 'http:' || check.protocol === 'https:') && (check.href == url || check.origin == url);
}

export function validateEmail(email) {
  return email.toLowerCase().match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  );
}
