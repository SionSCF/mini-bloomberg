const logger = require("../utils/logger");

function cleanSymbol(symbol) {
  const [symbolOnly, exchange] = symbol.split(".");
  return { symbolOnly, exchange };
}

exports.getTimeSeries = async (supabase, symbol) => {
  const { symbolOnly } = cleanSymbol(symbol);

  const { data, error } = await supabase
    .from("prices")
    .select("*")
    .eq("symbol", symbolOnly)
    .order("date", { ascending: true });

  if (error) {
    logger.error(`Failed to fetch price for ${symbol}: ${error.message}`);
    throw new Error(error.message);
  }
  return data || [];
};

exports.getLatest = async (supabase, symbol) => {
  const { symbolOnly } = cleanSymbol(symbol);

  const { data, error } = await supabase
    .from("prices")
    .select("*")
    .eq("symbol", symbolOnly)
    .order("date", { ascending: false })
    .limit(1);

  if (error) {
    logger.error(
      `Failed to fetch latest price data for ${symbol}: ${error.message}`
    );
    throw new Error(error.message);
  }
  return data?.[0] || null;
};

exports.insertMany = async (supabase, symbol, rows) => {
  const { symbolOnly, exchange } = cleanSymbol(symbol);

  const cleaned = rows
    .filter((row) => {
      const values = [row.open, row.high, row.low, row.close];

      // either price is null / undefined / NaN
      if (values.some((v) => v == null)) return false;
      if (values.some((v) => Number(v) === 0)) return false;
      if (values.some((v) => isNaN(Number(v)))) return false;

      // volume can be 0 but not null or negative
      if (row.volume == null || Number(row.volume) < 0) return false;

      return true;
    })
    .filter((row) => {
      const rowDate = row.date;
      const todayStr = new Date().toISOString().split("T")[0];

      // discard today and future dates
      if (rowDate >= todayStr) return false;

      return true;
    })

    .map((row) => ({
      symbol: symbolOnly,
      exchange,
      date: row.date,
      open: Number(row.open),
      high: Number(row.high),
      low: Number(row.low),
      close: Number(row.close),
      adjusted_close: Number(row.adjusted_close || row.adj_close),
      volume: Number(row.volume),
      provider: "EODHD",
    }));

  if (cleaned.length === 0) {
    logger.warn(`No valid rows to insert for ${symbol}`);
    return;
  }

  if (cleaned.length != rows.length) {
    logger.warn(
      `[PriceModel] Dropped ${
        rows.length - cleaned.length
      } invalid rows for ${symbol}`
    );
  }
  const { error } = await supabase.from("prices").upsert(cleaned, {
    onConflict: "symbol, exchange, date",
  });

  if (error) {
    logger.error(`Failed to insert price data for ${symbol}: ${error.message}`);
    throw new Error(error.message);
  }
};

exports.findGaps = async (supabase, symbol) => {
  const { symbolOnly, exchange } = cleanSymbol(symbol);

  const { data, error } = await supabase.rpc("find_price_gaps", {
    symbol_input: symbolOnly,
    exchange_input: exchange,
  });

  if (error) {
    logger.error(`Failed to find gaps for ${symbol}: ${error.message}`);
    throw new Error(error.message);
  }
  return data || [];
};
