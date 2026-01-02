const { calculateSMA } = require("./analysis/sma.analysis");
const { calculateEMA } = require("./analysis/ema.analysis");
const { calculateBollingerBands } = require("./analysis/bollinger.analysis");
const { calculateMACD } = require("./analysis/macd.analysis");
const { calculateRSI } = require("./analysis/rsi.analysis");

exports.performTechnicalAnalysis = async (prices, options = {}) => {
  const indicators = {};

  if (options.sma) {
    indicators.sma = {};
    for (const period of options.sma) {
      indicators.sma[period] = await calculateSMA(prices, period);
    }
  }

  if (options.ema) {
    indicators.ema = {};
    for (const period of options.ema) {
      indicators.ema[period] = await calculateEMA(prices, period);
    }
  }

  if (options.bollinger) {
    indicators.bollinger = {};
    for (const period of options.bollinger) {
      indicators.bollinger[period] = await calculateBollingerBands(
        prices,
        period
      );
    }
  }

  if (options.macd) {
    indicators.macd = await calculateMACD(prices);
  }

  if (options.rsi) {
    indicators.rsi = await calculateRSI(prices, options.rsi.period || 14);
  }

  // 🔥 MERGE PER INDEX
  return prices.map((candle, i) => ({
    ...candle,

    sma20: indicators.sma?.[20]?.[i].value,
    sma50: indicators.sma?.[50]?.[i].value,
    sma200: indicators.sma?.[200]?.[i].value,

    ema12: indicators.ema?.[12]?.[i].value,
    ema20: indicators.ema?.[20]?.[i].value,
    ema26: indicators.ema?.[26]?.[i].value,
    ema50: indicators.ema?.[50]?.[i].value,
    ema200: indicators.ema?.[200]?.[i].value,

    rsi: indicators.rsi[i].value ?? null,

    macd: indicators.macd?.line?.[i].value,
    signal: indicators.macd?.signal?.[i].value,
    histogram: indicators.macd?.histogram?.[i].value,
  }));
};
