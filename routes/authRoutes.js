
const express = require("express");

const router = express.Router();

const { registerUser } = require("../controllers/authController");

// Registration API
router.post("/register", registerUser);

module.exports = router;
