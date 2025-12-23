class ProviderError extends Error {
  constructor(type, provider, message, details) {
    super(message);
    this.name = "ProviderError";
    this.type = type; // 'RATE_LIMIT'|'UNAVAILABLE'|'BAD_RESPONSE'
    this.provider = provider;
    this.details = details;
  }
}

module.exports = { ProviderError };
