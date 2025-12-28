const express = require("express");
const router = express.Router();
const PriceController = require("../controllers/price.controller");
const { authMiddleware } = require("../middleware/user.auth");

router.post("/get", authMiddleware, PriceController.getPrice);
router.post("/sync-latest", authMiddleware, PriceController.syncLatest);
router.post("/sync-missing", authMiddleware, PriceController.syncMissing);

module.exports = router;
