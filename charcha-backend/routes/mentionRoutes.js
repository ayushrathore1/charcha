const express = require("express");
const router = express.Router();
const mentionController = require("../controllers/mentionController");
const { protect } = require("../middleware/auth");

// Public routes
router.get("/users/search", mentionController.searchUsers);

// Protected routes
router.get("/", protect, mentionController.getMentions);
router.post("/read", protect, mentionController.markMentionsRead);

// Admin routes
router.get("/admin", protect, mentionController.getAdminMentions);

module.exports = router;
