// Simple retry helper for transient network errors
function isTransientError(err) {
  if (!err) return false;
  const code = err.code || (err.cause && err.cause.code) || "";
  const transientCodes = [
    "ETIMEDOUT",
    "ECONNRESET",
    "ENOTFOUND",
    "EAI_AGAIN",
    "ECONNREFUSED",
  ];
  if (transientCodes.includes(code)) return true;
  // Supabase/HTTP status codes
  const status =
    err.status ||
    (err.cause && err.cause.status) ||
    (err.response && err.response.status);
  if ([502, 503, 504].includes(status)) return true;
  const msg = (err.message || "").toLowerCase();
  if (msg.includes("timeout") || msg.includes("timed out")) return true;
  return false;
}

async function retry(fn, attempts = 3, initialDelay = 500) {
  let lastErr;
  let delay = initialDelay;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isTransientError(err) || i === attempts - 1) break;
      // wait
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
  throw lastErr;
}

module.exports = { retry, isTransientError };
