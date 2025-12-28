const express = require("express");
const router = express.Router();
const UserController = require("../controllers/auth.controller");

// POST /api/user  { userData }
router.post("/signup", UserController.signUp);
router.post("/login", UserController.login);

module.exports = router;
