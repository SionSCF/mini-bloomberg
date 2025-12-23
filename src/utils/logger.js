let logger = null;
try {
  const winston = require("winston");
  logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : "";
        return `${timestamp} [${level.toUpperCase()}] ${message} ${metaStr}`;
      })
    ),
    transports: [new winston.transports.Console()],
  });
} catch (e) {
  // winston not installed — fallback to console wrapper
  logger = {
    info: (...args) => console.log(new Date().toISOString(), "[INFO]", ...args),
    warn: (...args) =>
      console.warn(new Date().toISOString(), "[WARN]", ...args),
    error: (...args) =>
      console.error(new Date().toISOString(), "[ERROR]", ...args),
    debug: (...args) => {
      if ((process.env.LOG_LEVEL || "info") === "debug")
        console.debug(new Date().toISOString(), "[DEBUG]", ...args);
    },
  };
}

module.exports = logger;
const level = process.env.LOG_LEVEL || "info";
function ts() {
  return new Date().toISOString();
}
module.exports = {
  info: (...args) => console.log(ts(), "[INFO]", ...args),
  warn: (...args) => console.warn(ts(), "[WARN]", ...args),
  error: (...args) => console.error(ts(), "[ERROR]", ...args),
  debug: (...args) => {
    if (level === "debug") console.debug(ts(), "[DEBUG]", ...args);
  },
};
