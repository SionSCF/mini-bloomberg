#!/usr/bin/env node
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");

// Load .env.local first (if present), then fallback to .env
dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Cron scheduling lives in a separate module to keep the entrypoint thin
const { startCronIfEnabled } = require("./cron/scheduler");
startCronIfEnabled();

const server = app.listen(PORT, () =>
  console.log(`\x1b[32mServer running on port ${PORT}\x1b[0m`)
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
  console.log("\x1b[33mGracefully shutting down...\x1b[0m");
  server.close(() => process.exit(0));
});
