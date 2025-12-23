const { getWatchlistedSymbols } = require("../models/watchlist.model");
const { getLatestPrice } = require("../services/price.service");
const logger = require("../utils/logger");

// Fetch latest prices for all watchlisted tickers and save to DB
async function fetchPricesForWatchlist() {
  try {
    logger.info("Starting fetch_prices cron job");
    const symbols = await getWatchlistedSymbols();
    logger.info(`Found ${symbols.length} watchlisted symbols`);

    if (symbols.length === 0) {
      logger.info("No watchlisted symbols found, skipping fetch");
      return;
    }

    const results = [];
    for (const symbol of symbols) {
      try {
        const price = await getLatestPrice(symbol);
        results.push({ symbol, success: true, price });
        logger.info(`Fetched price for ${symbol}: ${price?.close}`);
      } catch (err) {
        results.push({ symbol, success: false, error: err.message });
        logger.error(`Failed to fetch price for ${symbol}: ${err.message}`);
      }
    }

    const successful = results.filter((r) => r.success).length;
    logger.info(
      `Cron job completed: ${successful}/${symbols.length} successful`
    );
    return results;
  } catch (err) {
    logger.error(`Cron job failed: ${err.message}`);
    throw err;
  }
}

module.exports = { fetchPricesForWatchlist };
