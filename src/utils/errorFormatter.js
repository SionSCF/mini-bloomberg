function formatError(err) {
  if (!err) return { message: "Unknown error" };

  const out = {};
  // Prefer explicit message
  out.message = err.message || (err.cause && err.cause.message) || "No message";

  // Include provider info if present
  if (err.provider) out.provider = err.provider;
  if (typeof err.pricesCount === "number") out.pricesCount = err.pricesCount;

  // Axios-style response body
  if (err.cause && err.cause.response && err.cause.response.data) {
    out.providerResponse = err.cause.response.data;
  }

  if (err.code === "ETIMEDOUT") {
    out.message = "Request timed out";
  }

  // If the error has details (ProviderManager aggregated info), include it
  if (err.details) out.details = err.details;

  // Network/axios error codes (ETIMEDOUT, ENOTFOUND, ECONNREFUSED)
  if (err.cause && err.cause.code) out.code = err.cause.code;

  // In development include stack for debugging
  if (process.env.NODE_ENV !== "production") out.stack = err.stack;

  return out;
}

module.exports = { formatError };
