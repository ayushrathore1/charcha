const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { ssoAuth } = require("../middleware/ssoAuth");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// SSO routes (protected by X-SSO-Secret header)
router.post("/sso-sync", ssoAuth, authController.ssoSync);
router.post("/sso-login", ssoAuth, authController.ssoLogin);

// Protected routes
router.get("/me", protect, authController.getMe);
router.put("/profile", protect, authController.updateProfile);

// Public profile view
router.get("/users/:username", authController.getUserByUsername);

// Leaderboard
router.get("/leaderboard", authController.getLeaderboard);

module.exports = router;

