const express = require("express");
const { protect } = require("../middleware/auth");
const { getPendingNudges, updateNudgeStatus } = require("../controllers/nudgeController");

const router = express.Router();

router.use(protect);

router.get("/pending", getPendingNudges);
router.post("/:id/status", updateNudgeStatus);

module.exports = router;
