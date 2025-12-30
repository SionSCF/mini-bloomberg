#!/usr/bin/env node
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const logger = require("./utils/logger");
const morgan = require("morgan");

// Load .env.local first (if present), then fallback to .env
dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

const PORT = process.env.PORT || 5000;

// Cron scheduling lives in a separate module to keep the entrypoint thin
const { startCronIfEnabled } = require("./cron/scheduler");
startCronIfEnabled();

const server = app.listen(PORT, () =>
  logger.info(`Server running on port ${PORT}`)
);

app.get("/", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/health", (req, res) =>
  res.json({ status: "ok", uptime: process.uptime() })
);

app.use("/api/prices", require("./routes/price.routes"));
app.use("/api/watchlist", require("./routes/watchlist.routes"));
app.use("/api/user", require("./routes/user.routes"));

process.on("SIGINT", () => {
  logger.info("Gracefully shutting down...");
  server.close(() => process.exit(0));
});
