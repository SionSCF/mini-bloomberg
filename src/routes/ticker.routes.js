const express = require("express");
const router = express.Router();
const TickerController = require("../controllers/ticker.controller");
const { authMiddleware } = require("../middleware/user.auth");

router.post("/get", authMiddleware, TickerController.searchTicker);

module.exports = router;
