const PriceService = require("../services/price.service");
const WatchlistModel = require("../models/watchlist.model");

exports.add = async (req, res) => {
  try {
    const { symbol } = req.body;

    const added = await WatchlistModel.add(symbol);

    // Load historical 1 year
    await PriceService.syncHistorical(symbol);

    res.json({ message: "Added to watchlist", data: added });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { symbol } = req.body;

    const removed = await WatchlistModel.remove(symbol);

    // Note: DO NOT DELETE PRICES
    res.json({ message: "Removed from watchlist", data: removed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.list = async (_req, res) => {
  try {
    const data = await WatchlistModel.list();
    res.json({ message: "Watchlist", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
