const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

const logger = createLogger({
  level: process.env.LOG_LEVEL || "INFO",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}] ${message}`;
        })
      ),
    }),

    new DailyRotateFile({
      dirname: "logs",
      filename: "app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      format: format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}] ${message}`;
      }),
    }),
  ],
});

module.exports = logger;
