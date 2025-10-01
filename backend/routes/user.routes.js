// routes/user.routes.js
const express = require("express");
const router = express.Router();
const { newUser, loginUser, getUsers } = require("../controllers/user.controller");
const { protect } = require("../middleware/auth");

router.post("/register", newUser);
router.post("/login", loginUser);
router.get("/", protect, getUsers);

module.exports = router;
