const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const { protect, optionalAuth } = require("../middleware/auth");

// Get comments for a post (public)
router.get("/posts/:postId/comments", optionalAuth, commentController.getComments);

// Add comment (protected)
router.post("/posts/:postId/comments", protect, commentController.addComment);

// Delete comment (protected)
router.delete("/comments/:commentId", protect, commentController.deleteComment);

module.exports = router;
