const { calculateEMA } = require("./ema.analysis");

exports.calculateMACD = (prices) => {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);

  const macdLine = ema12.map((e, i) => {
    if (e.value === null || ema26[i].value === null) {
      return { date: e.date, value: null };
    }
    return {
      date: e.date,
      value: e.value - ema26[i].value,
    };
  });

  const signalLine = calculateEMA(
    macdLine.map((m) => ({ date: m.date, close: m.value })),
    9
  );

  const histogram = macdLine.map((m, i) => {
    if (m.value === null || signalLine[i].value === null) {
      return { date: m.date, value: null };
    }
    return {
      date: m.date,
      value: m.value - signalLine[i].value,
    };
  });

  return {
    line: macdLine,
    signal: signalLine,
    histogram,
  };
};
