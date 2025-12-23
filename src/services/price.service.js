const PriceModel = require("../models/price.model");
const logger = require("../utils/logger");
const EODHD = require("./providers/eodhd.provider");

exports.getPrice = async (symbol) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const yDate = yesterday.toISOString().split("T")[0];
  const oneDay = 24 * 60 * 60 * 1000;

  const latest = await PriceModel.getLatest(symbol);

  // If no data existed
  if (!latest) {
    const api = await EODHD.fetchPrice(symbol, { mode: "historical" });
    if (api?.length > 0) await PriceModel.insertMany(symbol, api);
    return api;
  }

  const latestDateStr = new Date(latest.date).toISOString().split("T")[0];

  // If latest date is the same as yesterday's date
  if (latestDateStr === yDate) {
    return [latest];
  }

  // Gap calculation
  const diffDays = Math.round(
    Math.abs((new Date(latest.date) - yesterday) / oneDay)
  );

  // If gap is above 1 day(s)
  if (diffDays > 1) {
    const nextDate = new Date(latest.date);
    nextDate.setDate(nextDate.getDate() + 1);

    const from = nextDate.toISOString().split("T")[0];

    const api = await EODHD.fetchPrice(symbol, {
      mode: "range",
      from,
      to: yDate,
    });

    if (api?.length > 0) await PriceModel.insertMany(symbol, api);
    return api;
  }

  // Fetch daily only
  const api = await EODHD.fetchPrice(symbol, { mode: "latest" });
  if (api?.length > 0) await PriceModel.insertMany(symbol, api);
  return api;
};

// Sync latest data for cron
exports.syncLatest = async (symbol) => {
  const api = await EODHD.fetchPrice(symbol, { mode: "latest" });
  await PriceModel.insertMany(symbol, api);
  return api;
};

// Sync historical for first time add to watchlist
exports.syncHistorical = async (symbol) => {
  const api = await EODHD.fetchPrice(symbol, { mode: "historical" });
  await PriceModel.insertMany(symbol, api);
  return api;
};

// Sync missing data from failed cron execution
exports.syncMissing = async (symbol) => {
  const gaps = await PriceModel.findGaps(symbol);
  if (!gaps || gaps.length === 0) return [];
  let results = [];
  for (const gap of gaps) {
    const api = await EODHD.fetchPrice(symbol, {
      mode: "range",
      from: gap.from,
      to: gap.to,
    });
    await PriceModel.insertMany(symbol, api);
    results.push(...api);
  }
  return results;
};
