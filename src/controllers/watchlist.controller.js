const PriceService = require("../services/price.service");
const WatchlistService = require("../services/watchlist.service");
const logger = require("../utils/logger");

exports.add = async (req, res) => {
  try {
    const { symbol } = req.body;

    // Add to watchlist
    const added = await WatchlistService.addToList(
      req.supabaseUser,
      symbol,
      req.user
    );

    // Load historical 1 year
    await PriceService.syncHistorical(req.supabaseUser, symbol);

    res.json({ message: "Added to watchlist", data: added });
  } catch (err) {
    logger.error(`Error in add: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { symbol } = req.body;

    const removed = await WatchlistService.removeSymbol(
      req.supabaseUser,
      symbol,
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
