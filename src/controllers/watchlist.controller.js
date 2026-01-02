const PriceService = require("../services/price.service");
const WatchlistService = require("../services/watchlist.service");
const logger = require("../utils/logger");

exports.add = async (req, res) => {
  try {
    const { symbol, exchange } = req.body;
    const fullSymbol = `${symbol}.${exchange}`;
    // Add to watchlist
    const added = await WatchlistService.addToList(
      req.supabaseUser,
      fullSymbol,
      req.user
    );

    // Load historical 1 year
    const insert = await PriceService.syncHistorical(
      req.supabaseUser,
      fullSymbol
    );

    if (insert) {
      console.log("Price data inputted successfully");
    }

    res.json({ message: "Added to watchlist", data: added });
  } catch (err) {
    logger.error(`Error in add: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { symbol, exchange } = req.body;
    const fullSymbol = `${symbol}.${exchange}`;
    console.log(req.body);

    const removed = await WatchlistService.removeSymbol(
      req.supabaseUser,
      fullSymbol,
      req.user
    );

    // Note: DO NOT DELETE PRICES
    res.json({ message: "Removed from watchlist", data: removed });
  } catch (err) {
    logger.error(`Error in remove: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const data = await WatchlistService.listActiveSymbols(
      req.supabaseUser,
      req.user
    );
    res.json({ message: "Watchlist", data });
  } catch (err) {
    logger.error(`Error in list: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};
