const { supabase } = require("../config/supabase");

function cleanSymbol(symbol) {
  const [symbolOnly, exchange] = symbol.split(".");
  return { symbolOnly, exchange };
}

exports.getLatest = async (symbol) => {
  const { symbolOnly } = cleanSymbol(symbol);

  const { data, error } = await supabase
    .from("prices")
    .select("*")
    .eq("symbol", symbolOnly)
    .order("date", { ascending: false })
    .limit(1);

  if (error) throw new Error(error.message);
  return data?.[0] || null;
};

exports.insertMany = async (symbol, rows) => {
  const { symbolOnly, exchange } = cleanSymbol(symbol);

  const data = rows.map((row) => ({
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

  const { error } = await supabase.from("prices").upsert(data, {
    onConflict: "symbol, date",
  });
  if (error) throw new Error(error.message);
};

exports.findGaps = async (symbol) => {
  const { symbolOnly, exchange } = cleanSymbol(symbol);

  const { data, error } = await supabase.rpc("find_price_gaps", {
    symbol_input: symbolOnly,
    exchange_input: exchange,
  });

  if (error) throw new Error(error.message);
  return data || [];
};
