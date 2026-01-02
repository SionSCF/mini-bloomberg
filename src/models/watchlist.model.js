const logger = require("../utils/logger");

function cleanSymbol(symbol) {
  const [symbolOnly, exchange] = symbol.split(".");
  return { symbolOnly, exchange };
}

exports.check = async (supabaseUser, symbol, userId) => {
  const { symbolOnly } = cleanSymbol(symbol);

  const { data, error } = await supabaseUser
    .from("watchlist")
    .select("id")
    .eq("symbol", symbolOnly)
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    logger.error(`Failed to check watchlist for ${symbol}: ${error.message}`);
    throw new Error(error.message);
  }

  // turn query result into boolean
  return !!data;
};

exports.add = async (supabaseUser, symbol, userId) => {
  const [symbolOnly, exchange] = symbol.split(".");
  const { data, error } = await supabaseUser
    .from("watchlist")
    .insert({
      user_id: userId,
      symbol: symbolOnly,
      exchange: exchange,
      active: true,
    })
    .select();

  if (error) {
    logger.error(`Failed to add ${symbol} to watchlist: ${error.message}`);
    throw new Error(error.message);
  }
  return data[0];
};

exports.remove = async (supabaseUser, symbol, userId) => {
  const [symbolOnly, exchange] = symbol.split(".");

  console.log(`Symbol is removed: `, symbol);
  // implement soft delete
  const { data, error } = await supabaseUser
    .from("watchlist")
    .update({ active: false })
    .eq("symbol", symbolOnly)
    .eq("exchange", exchange)
    .eq("user_id", userId)
    .select();

  if (error) {
    logger.error(`Failed to remove ${symbol} from watchlist: ${error.message}`);
    throw new Error(error.message);
  }

  return data[0];
};

exports.list = async (supabaseUser, userId) => {
  // ensure only active symbols are listed
  const { data, error } = await supabaseUser
    .from("watchlist_enriched")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true);
  if (error) {
    logger.error(`Failed to list watchlist: ${error.message}`);
    throw new Error(error.message);
  }

  return data;
};

exports.retrieveListForAutoSync = async (supabaseService) => {
  const { data, error } = await supabaseService
    .from("watchlist")
    .select("*")
    .eq("active", true);
  if (error) {
    logger.error(`Failed to retrieve watchlist for autosync: ${error.message}`);
    throw new Error(error.message);
  }

  return data;
};
