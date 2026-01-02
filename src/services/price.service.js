const PriceModel = require("../models/price.model");
const WatchlistService = require("./watchlist.service");
const EODHD = require("./providers/eodhd.provider");
const AnalysisService = require("./analysis.service");

// ==================== //
//  INTERNAL FUNCTIONS  //
// ==================== //

// Universal function that can be used by user request and cron job
// to ensure that price data is always fresh and up to date,
// and returns the time series data, standardizing the response.
const ensurePriceData = async (supabase, symbol, user) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yDate = yesterday.toISOString().split("T")[0];
  const oneDay = 24 * 60 * 60 * 1000;

  const latest = await PriceModel.getLatest(supabase, symbol);

  // If no data existed
  if (!latest) {
    const result = await EODHD.fetchPrice(symbol, {
      mode: "historical",
    });

    const activeSymbols = await WatchlistService.checkExists(
      supabase,
      symbol,
      user
    );
    const isInWatchlist = !!activeSymbols;

    if (isInWatchlist && result?.length > 0) {
      await PriceModel.insertMany(supabase, symbol, result);
      return await PriceModel.getTimeSeries(supabase, symbol);
    }
    return result;
  }

  const latestDate = new Date(latest.date);
  const latestDateStr = latestDate.toISOString().split("T")[0];

  // If latest date is the same as yesterday's date
  if (latestDateStr === yDate) {
    return await PriceModel.getTimeSeries(supabase, symbol);
  }

  // Gap calculation
  const diffDays = Math.round(Math.abs((latestDate - yesterday) / oneDay));

  // If gap is above 1 day(s)
  if (diffDays > 1) {
    const from = new Date(latestDate);
    from.setDate(from.getDate() + 1);

    const fromStr = from.toISOString().split("T")[0];

    const result = await EODHD.fetchPrice(symbol, {
      mode: "range",
      from: fromStr,
      to: yDate,
    });

    if (result?.length > 0)
      await PriceModel.insertMany(supabase, symbol, result);

    return await PriceModel.getTimeSeries(supabase, symbol);
  }

  // Fetch daily only
  const result = await EODHD.fetchPrice(symbol, { mode: "latest" });
  if (result?.length > 0) await PriceModel.insertMany(supabase, symbol, result);

  return await PriceModel.getTimeSeries(supabase, symbol);
};

const enrichPriceData = (prices) => {
  if (prices.length < 2) return prices;

  const prevClose = prices[0].close;

  return prices.map((price) => {
    const change = price.close - prevClose;
    const changePercent = (change / prevClose) * 100;

    return {
      ...price,
      change,
      changePercent,
    };
  });
};

// ==================== //
//  EXPORTED FUNCTIONS  //
// ==================== //

// Get price data
exports.getPrice = async (supabaseUser, symbol, user) => {
  const timeSeries = await ensurePriceData(supabaseUser, symbol, user).then(
    (timeSeries) => {
      return enrichPriceData(timeSeries);
    }
  );
  const enrichedPriceData = await enrichPriceData(timeSeries);
  const analysis = await AnalysisService.performTechnicalAnalysis(
    enrichedPriceData,
    {
      sma: [20, 50, 200],
      ema: [12, 20, 26, 50, 200],
      bollinger: [20],
      macd: true,
      rsi: { period: 14 },
    }
  );

  return analysis;
};

// Sync historical for first time add to watchlist
exports.syncHistorical = async (supabase, symbol) => {
  const api = await EODHD.fetchPrice(symbol, { mode: "historical" });
  await PriceModel.insertMany(supabase, symbol, api);
  return api;
};

// ==================== //
//    CRON FUNCTIONS    //
// ==================== //

// Sync latest data for cron
exports.syncLatest = async (supabaseService, symbol) => {
  const api = await EODHD.fetchPrice(symbol, { mode: "latest" });
  await PriceModel.insertMany(supabaseService, symbol, api);
  return api;
};

// Sync missing data from failed cron execution
exports.syncMissing = async (supabase, symbol) => {
  const gaps = await PriceModel.findGaps(supabase, symbol);
  if (!gaps || gaps.length === 0) return [];
  let results = [];
  for (const gap of gaps) {
    const api = await EODHD.fetchPrice(symbol, {
      mode: "range",
      from: gap.from,
      to: gap.to,
    });

    if (!Array.isArray(api) || api.length === 0) {
      logger.warn(
        `No data returned for ${symbol} from ${gap.from} to ${gap.to}`
      );
      continue;
    }
    await PriceModel.insertMany(supabase, symbol, api);
    results.push(...api);
  }
  return results;
};
