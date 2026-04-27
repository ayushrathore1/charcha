const express = require("express");
const { protect } = require("../middleware/auth");
const {
  createSituationship,
  getSituationships,
  getDashboard,
  getSituationship,
  updateSituationship,
  deleteSituationship,
  logInteraction,
  getInteractions,
  toggleMute,
  generateNudge
} = require("../controllers/situationshipController");

const router = express.Router();

router.use(protect);

router.route("/")
  .post(createSituationship)
  .get(getSituationships);

router.get("/dashboard", getDashboard);

router.route("/:id")
  .get(getSituationship)
  .put(updateSituationship)
  .delete(deleteSituationship);

router.route("/:id/interactions")
  .post(logInteraction)
  .get(getInteractions);

router.post("/:id/mute", toggleMute);
router.post("/:id/nudge", generateNudge);

module.exports = router;
