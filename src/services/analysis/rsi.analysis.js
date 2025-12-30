exports.calculateRSI = (prices, period = 14) => {
  const result = [];
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      result.push({ date: prices[i].date, value: null });
      continue;
    }

    const change = prices[i].close - prices[i - 1].close;
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);

    if (i <= period) {
      avgGain += gain;
      avgLoss += loss;
      result.push({ date: prices[i].date, value: null });
      continue;
    }

    if (i === period + 1) {
      avgGain /= period;
      avgLoss /= period;
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    result.push({
      date: prices[i].date,
      value: rsi,
    });
  }

  return result;
};
