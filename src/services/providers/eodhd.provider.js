const axios = require("axios");

const BASE_URL = "https://www.eodhd.com/api/eod";

const inferResetTime = () => {
  const reset = new Date();
  reset.setUTCHours(24, 0, 0, 0);
  return reset.toISOString();
};

exports.fetchPrice = async (symbol, { mode, from, to } = {}) => {
  const params = {
    api_token: process.env.EODHD_API_KEY,
    fmt: "json",
    order: "d",
  };

  // parse symbol
  const [symbolOnly, exchange] = symbol.split(".");

  if (mode === "latest") {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yDate = yesterday.toISOString().split("T")[0];
    params.from = params.to = yDate;
  }

  if (mode === "historical") {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    params.from = oneYearAgo.toISOString().slice(0, 10);
    params.to = yesterday.toISOString().split("T")[0];
  }

  if (mode === "range") {
    params.from = from;
    params.to = to;
  }

  try {
    const res = await axios.get(`${BASE_URL}/${encodeURIComponent(symbol)}`, {
      params,
      timeout: 5000,
    });

    if (!Array.isArray(res.data)) throw new Error("Invalid API response");

    // Build data rows
    return res.data.map((row) => ({
      ok: true,
      symbol: symbolOnly,
      exchange: exchange,
      date: row.date,
      open: Number(row.open),
      high: Number(row.high),
      low: Number(row.low),
      close: Number(row.close),
      adjusted_close: Number(row.adjusted_close || row.adj_close),
      volume: Number(row.volume),
      provider: "EODHD",
    }));
  } catch (err) {
    if (err.response?.status === 429) {
      return {
        ok: false,
        reason: "RATE_LIMIT",
        resetAt: inferResetTime(),
      };
    }
    throw err;
  }
};
