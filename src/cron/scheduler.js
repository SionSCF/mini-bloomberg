const logger = require("../utils/logger");

function startCronIfEnabled() {
  if (process.env.ENABLE_CRON !== "true") return;
  try {
    const cron = require("node-cron");
    const { fetchPricesForWatchlist } = require("./fetch_prices.cron");
    const schedule = process.env.CRON_SCHEDULE || "0 1 * * *";
    cron.schedule(schedule, () => {
      fetchPricesForWatchlist().catch((err) => logger.error("Cron error", err));
    });
    logger.info(`Cron scheduled: ${schedule}`);
  } catch (e) {
    logger.warn(
      "node-cron not available or failed to schedule:",
      e.message || e
    );
  }
}

module.exports = { startCronIfEnabled };
