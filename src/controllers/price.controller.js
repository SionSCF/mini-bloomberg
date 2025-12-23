const PriceService = require("../services/price.service");

exports.getPrice = async (req, res) => {
  try {
    const { symbol } = req.body;
    const data = await PriceService.getPrice(symbol);
    res.json({ message: "Fetched", data });
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.syncLatest = async (req, res) => {
  try {
    const { symbol } = req.body;
    const data = await PriceService.syncLatest(symbol);
    res.json({ message: "Latest synced", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.syncMissing = async (req, res) => {
  try {
    const { symbol } = req.body;
    const data = await PriceService.syncMissing(symbol);
    res.json({ message: "Missing filled", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
