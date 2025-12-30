const { calculateSMA } = require("./analysis/sma.analysis");
const { calculateEMA } = require("./analysis/ema.analysis");
const { calculateBollingerBands } = require("./analysis/bollinger.analysis");
const { calculateMACD } = require("./analysis/macd.analysis");
const { calculateRSI } = require("./analysis/rsi.analysis");

exports.performTechnicalAnalysis = async (prices, options = {}) => {
  const analysis = {};

  if (options.sma) {
    analysis.sma = {};
    for (const period of options.sma) {
      analysis.sma[period] = await calculateSMA(prices, period);
    }
  }

  if (options.ema) {
    analysis.ema = {};
    for (const period of options.ema) {
      analysis.ema[period] = await calculateEMA(prices, period);
    }
  }

  if (options.bollinger) {
    analysis.bollinger = {};
    for (const period of options.bollinger) {
      analysis.bollinger[period] = await calculateBollingerBands(
        prices,
        period
      );
    }
  }

  if (options.macd) {
    analysis.macd = await calculateMACD(prices);
  }

  if (options.rsi) {
    analysis.rsi = await calculateRSI(prices, options.rsi.period || 14);
  }

  return analysis;
};
