const { searchTickers } = require("../services/ticker.service");
const logger = require("../utils/logger");

exports.searchTicker = async (req, res) => {
  try {
    const { symbol } = req.body;
    const data = await searchTickers(req.supabaseUser, symbol);
    res.json({ message: "Tickers found", data });
  } catch (err) {
    logger.error(`Error in searchTicker: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};
