exports.calculateBollingerBands = async (
  prices,
  period = 20,
  multiplier = 2
) => {
  const result = [];

  for (let i = 0; i < prices.length; i++) {
    if (i + 1 < period) {
      result.push({
        date: prices[i].date,
        middle: null,
        upper: null,
        lower: null,
      });
      continue;
    }

    const window = prices.slice(i + 1 - period, i + 1);
    const closes = window.map((p) => p.close);

    // SMA
    const mean = closes.reduce((sum, v) => sum + v, 0) / period;

    // Standard Deviation
    const variance =
      closes.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / period;

    const stdDev = Math.sqrt(variance);

    result.push({
      date: prices[i].date,
      middle: mean,
      upper: mean + multiplier * stdDev,
      lower: mean - multiplier * stdDev,
    });
  }

  return result;
};
