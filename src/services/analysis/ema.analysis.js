exports.calculateEMA = (prices, period) => {
  const result = [];
  const multiplier = 2 / (period + 1);

  let emaPrev = null;

  for (let i = 0; i < prices.length; i++) {
    const price = prices[i].close;

    // Insufficient data for EMA
    if (i + 1 < period) {
      result.push({
        date: prices[i].date,
        value: null,
      });
      continue;
    }

    // First EMA = SMA
    if (i + 1 === period) {
      const window = prices.slice(0, period);
      const sma = window.reduce((sum, p) => sum + p.close, 0) / period;

      emaPrev = sma;

      result.push({
        date: prices[i].date,
        value: sma,
      });
      continue;
    }

    // Next EMA
    const ema = (price - emaPrev) * multiplier + emaPrev;

    emaPrev = ema;

    result.push({
      date: prices[i].date,
      value: ema,
    });
  }

  return result;
};
