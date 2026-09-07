const express = require("express");
const router = express.Router();
const { registerUser, loginUser, logoutUser, getProfile, updateProfile } = require("../controller/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;
