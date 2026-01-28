const express = require("express");
const router = express.Router();
const voteController = require("../controllers/voteController");
const { protect } = require("../middleware/auth");

// All vote routes are protected
router.post("/", protect, voteController.vote);
router.post("/check", protect, voteController.getUserVotes);

module.exports = router;
