const { supabase } = require("../config/supabase");

function cleanSymbol(symbol) {
  const [symbolOnly, exchange] = symbol.split(".");
  return { symbolOnly, exchange };
}

exports.checkExists = async (symbol) => {
  const { symbolOnly } = cleanSymbol(symbol);

  const { data, error } = await supabase
    .from("watchlist")
    .select("*")
    .eq("symbol", symbolOnly)
    .limit(1);

  if (error) throw new Error(error.message);
  return data?.length > 0;
};

exports.add = async (symbol) => {
  const [symbolOnly, exchange] = symbol.split(".");
  console.log(symbolOnly, exchange);
  const { data, error } = await supabase
    .from("watchlist")
    .insert({
      symbol: symbolOnly,
      exchange: exchange,
      active: true,
      created_at: new Date(),
    })
    .select();

  if (error) throw error;
  return data[0];
};

exports.remove = async (symbol) => {
  const { data, error } = await supabase
    .from("watchlist")
    .delete()
    .eq("symbol", symbol)
    .select();

  if (error) throw error;
  return data[0];
};

exports.list = async () => {
  const { data, error } = await supabase.from("watchlist").select("*");
  if (error) throw error;
  return data;
};
