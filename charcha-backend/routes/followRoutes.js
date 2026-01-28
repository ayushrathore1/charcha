const express = require("express");
const router = express.Router();
const followController = require("../controllers/followController");
const { protect } = require("../middleware/auth");

// Public routes
router.get("/:userId/followers", followController.getFollowers);
router.get("/:userId/following", followController.getFollowing);

// Protected routes
router.post("/:userId/follow", protect, followController.followUser);
router.delete("/:userId/follow", protect, followController.unfollowUser);
router.get("/:userId/following/check", protect, followController.checkFollowing);

module.exports = router;
