const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");

// POST /api/user  { userData }
router.post("/signup", controller.signUp);
router.post("/login", controller.login);

module.exports = router;
