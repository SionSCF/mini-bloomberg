const TickerModel = require("../models/ticker.model");

exports.searchTickers = async (supabaseUser, query) => {
  const ticker = await TickerModel.search(supabaseUser, query);

  if (!ticker || ticker.length === 0) {
    throw new Error("No tickers found matching the query.");
  }

  return ticker;
};
