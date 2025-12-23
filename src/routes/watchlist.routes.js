const express = require("express");
const router = express.Router();
const WatchlistController = require("../controllers/watchlist.controller");
const { authMiddleware } = require("../config/supabase");

router.post("/add", authMiddleware, WatchlistController.add);
router.post("/remove", authMiddleware, WatchlistController.remove);
router.post("/list", authMiddleware, WatchlistController.list);

module.exports = router;
