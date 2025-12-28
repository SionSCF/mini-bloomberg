exports.calculateSMA = async (prices, period) => {
  // Simple Moving Average (SMA)

  const result = [];

  for (let i = 0; i < prices.length; i++) {
    if (i + 1 < period) {
      result.push({
        date: prices[i].date,
        value: null,
      });
      continue;
    }

    const window = prices.slice(i + 1 - period, i + 1);
    const sum = window.reduce((acc, price) => acc + price.close, 0);

    result.push({
      date: prices[i].date,
      value: sum / period,
    });
  }
  return result;
};
