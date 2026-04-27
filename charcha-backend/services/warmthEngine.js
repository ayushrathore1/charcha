const Situationship = require("../models/Situationship");

/**
 * Recalculates the warmth score for a given situationship based on elapsed time.
 * Decays by -2 per day.
 * @param {Object} situationship - The Situationship mongoose document
 * @returns {Object} { score, status }
 */
const calculateCurrentWarmth = (situationship) => {
  const now = new Date();
  const lastInteraction = situationship.lastInteractionAt || situationship.createdAt;
  
  // Calculate days passed since last interaction
  const diffTime = Math.abs(now - lastInteraction);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Decay by 2 points per day
  let decay = diffDays * 2;
  
  let newScore = situationship.warmthScore - decay;
  if (newScore < 0) newScore = 0;
  
  let newStatus = getStatusFromScore(newScore);
  
  return { score: newScore, status: newStatus };
};

/**
 * Determines status category based on warmth score
 */
const getStatusFromScore = (score) => {
  if (score >= 70) return "warm";
  if (score >= 40) return "cooling";
  if (score >= 15) return "cold";
  return "frozen";
};

/**
 * Calculates the score impact of a new interaction
 */
const calculateInteractionImpact = (sentiment) => {
  let impact = 15; // Base interaction points
  if (sentiment === "positive") {
    impact += 10;
  } else if (sentiment === "negative") {
    impact -= 5;
  }
  return impact;
};

/**
 * Updates situationships for a user lazily, adjusting for decay.
 * Intended to be run during GET /dashboard or when listing situationships.
 * @param {ObjectId} userId
 */
const refreshWarmthScores = async (userId) => {
  const situationships = await Situationship.find({ owner: userId, isArchived: false });
  
  const updates = [];
  for (const ship of situationships) {
    const { score, status } = calculateCurrentWarmth(ship);
    if (score !== ship.warmthScore || status !== ship.status) {
      ship.warmthScore = score;
      ship.status = status;
      updates.push(ship.save());
    }
  }
  
  if (updates.length > 0) {
    await Promise.all(updates);
  }
};

module.exports = {
  calculateCurrentWarmth,
  getStatusFromScore,
  calculateInteractionImpact,
  refreshWarmthScores,
};
