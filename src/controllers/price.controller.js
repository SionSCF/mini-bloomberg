const PriceService = require("../services/price.service");
const logger = require("../utils/logger");

exports.getPrice = async (req, res) => {
  try {
    const { symbol } = req.body;
    const data = await PriceService.getPrice(
      req.supabaseUser,
      symbol,
      req.user
    );
    res.json({ message: "Fetched", data });
  } catch (err) {
    logger.error(`Error in getPrice: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

exports.syncLatest = async (req, res) => {
  try {
    const { symbol } = req.body;
    const data = await PriceService.syncLatest(symbol);
    res.json({ message: "Latest synced", data });
  } catch (err) {
    logger.error(`Error in syncLatest: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

exports.syncMissing = async (req, res) => {
  try {
    const { symbol } = req.body;
    const data = await PriceService.syncMissing(symbol);
    res.json({ message: "Missing filled", data });
  } catch (err) {
    logger.error(`Error in syncMissing: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};
