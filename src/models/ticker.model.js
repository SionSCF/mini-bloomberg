const logger = require("../utils/logger");

exports.search = async (supabaseUser, keyword) => {
  const { data, error } = await supabaseUser
    .from("tickers")
    .select("*")
    .or(
      `symbol.ilike.%${keyword}%,name.ilike.%${keyword}%,exchange.ilike.%${keyword}%`
    )
    .limit(50);

  console.log(data);

  if (error) {
    logger.error(`Error searching tickers: ${error.message}`);
    throw new Error(error.message);
  }

  return data || [];
};
