const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { protect, optionalAuth } = require("../middleware/auth");

// Public routes
router.get("/", optionalAuth, postController.getPosts);
router.get("/:idOrSlug", optionalAuth, postController.getPost);

// Protected routes
router.post("/", protect, postController.createPost);
router.delete("/:postId", protect, postController.deletePost);
router.get("/:postId/share", protect, postController.getShareLink);

// Bookmark
router.post("/:postId/bookmark", protect, postController.bookmarkPost);

// Quality marking (moderator only)
router.post("/:postId/quality", protect, postController.markAsHighQuality);

module.exports = router;
