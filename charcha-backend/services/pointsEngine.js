/**
 * Points Engine - Central Brain for the Unified Reputation System
 * 
 * This is the SINGLE SERVICE that handles all point transactions.
 * Every action in the system calls this.
 */

const User = require("../models/User");
const PointLog = require("../models/PointLog");

// ============== POINT RULES ==============
// All actions and their point values

const POINT_RULES = {
  // Content creation
  POST_NOTE: { aura: 20, xp: 10, cred: 0 },
  POST_EXPLANATION: { aura: 10, xp: 5, cred: 0 },
  POST_RESOURCE: { aura: 15, xp: 8, cred: 0 },
  POST_ROADMAP: { aura: 25, xp: 12, cred: 0 },
  POST_REVIEW: { aura: 8, xp: 10, cred: 0 },
  POST_GENERIC: { aura: 5, xp: 3, cred: 0 },
  
  // Engagement received
  UPVOTE_RECEIVED: { aura: 2, xp: 1, cred: 0.2 },
  DOWNVOTE_RECEIVED: { aura: -2, xp: 0, cred: -0.1 },
  BOOKMARK_RECEIVED: { aura: 3, xp: 1, cred: 0.5 },
  COMMENT_RECEIVED: { aura: 1, xp: 1, cred: 0.1 },
  
  // Engagement given
  COMMENT_CREATED: { aura: 1, xp: 2, cred: 0 },
  UPVOTE_GIVEN: { aura: 0, xp: 1, cred: 0 },
  
  // Quality designations
  QUALITY_RESOURCE: { aura: 50, xp: 10, cred: 5 },
  QUALITY_REVOKED: { aura: -50, xp: -10, cred: -5 },
  
  // Activity
  DAILY_LOGIN: { aura: 0, xp: 5, cred: 0 },
  STREAK_BONUS: { aura: 5, xp: 10, cred: 0 }, // Per 7-day streak
  LEARNING_MODULE_COMPLETE: { aura: 5, xp: 20, cred: 0 },
  
  // Penalties
  SPAM_PENALTY: { aura: -20, xp: -10, cred: -2 },
  CONTENT_REMOVED: { aura: -10, xp: -5, cred: -1 },
};

// ============== LEVEL THRESHOLDS ==============

const LEVEL_THRESHOLDS = {
  1: { min: 0, name: "Newcomer", emoji: "🌱" },
  2: { min: 100, name: "Explorer", emoji: "📘" },
  3: { min: 500, name: "Contributor", emoji: "🧠" },
  4: { min: 2000, name: "Mentor", emoji: "🔥" },
  5: { min: 10000, name: "Master", emoji: "🏆" },
};

/**
 * Calculate level from AURA
 */
function calculateLevel(aura) {
  if (aura >= 10000) return 5;
  if (aura >= 2000) return 4;
  if (aura >= 500) return 3;
  if (aura >= 100) return 2;
  return 1;
}

/**
 * Get level info
 */
function getLevelInfo(level) {
  return LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[1];
}

/**
 * Get progress to next level
 */
function getLevelProgress(aura) {
  const currentLevel = calculateLevel(aura);
  if (currentLevel === 5) {
    return { current: aura, next: null, progress: 100 };
  }
  
  const currentThreshold = LEVEL_THRESHOLDS[currentLevel].min;
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel + 1].min;
  const progress = ((aura - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  
  return {
    current: aura,
    next: nextThreshold,
    progress: Math.min(100, Math.max(0, progress)),
  };
}

/**
 * Main function to apply points to a user
 * 
 * @param {string} userId - User ID
 * @param {string} actionType - Action from POINT_RULES
 * @param {Object} meta - Additional metadata
 * @returns {Object} - Result with new totals and level
 */
async function applyPoints(userId, actionType, meta = {}) {
  try {
    // Get point rule
    const rule = POINT_RULES[actionType];
    if (!rule) {
      console.error(`Unknown action type: ${actionType}`);
      return { success: false, error: "Unknown action type" };
    }
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }
    
    // Calculate weighted changes (CRED affects influence for some actions)
    let auraChange = rule.aura;
    let xpChange = rule.xp;
    let credChange = rule.cred;
    
    // Apply multipliers if any
    if (meta.multiplier) {
      auraChange = Math.round(auraChange * meta.multiplier);
      xpChange = Math.round(xpChange * meta.multiplier);
      credChange = credChange * meta.multiplier;
    }
    
    // Update user points
    const newAura = Math.max(0, user.aura + auraChange);
    const newXp = Math.max(0, user.xp + xpChange);
    const newCred = Math.max(0, user.cred + credChange);
    const newLevel = calculateLevel(newAura);
    
    // Check for level up
    const leveledUp = newLevel > user.level;
    
    // Update user
    user.aura = newAura;
    user.xp = newXp;
    user.cred = newCred;
    user.level = newLevel;
    
    // Update stats if applicable
    if (actionType === "UPVOTE_RECEIVED") {
      user.stats.upvotesReceived = (user.stats.upvotesReceived || 0) + 1;
    } else if (actionType === "DOWNVOTE_RECEIVED") {
      user.stats.downvotesReceived = (user.stats.downvotesReceived || 0) + 1;
    } else if (actionType === "BOOKMARK_RECEIVED") {
      user.stats.bookmarks = (user.stats.bookmarks || 0) + 1;
    } else if (actionType.startsWith("POST_")) {
      user.stats.posts = (user.stats.posts || 0) + 1;
    } else if (actionType === "COMMENT_CREATED") {
      user.stats.comments = (user.stats.comments || 0) + 1;
    }
    
    await user.save();
    
    // Create point log
    await PointLog.create({
      user: userId,
      action: actionType,
      auraChange,
      xpChange,
      credChange,
      auraAfter: newAura,
      xpAfter: newXp,
      credAfter: newCred,
      levelAfter: newLevel,
      sourceType: meta.sourceType || "System",
      sourceId: meta.sourceId,
      platform: meta.platform || "MEDHA",
      metadata: meta,
    });
    
    return {
      success: true,
      aura: newAura,
      xp: newXp,
      cred: newCred,
      level: newLevel,
      levelInfo: getLevelInfo(newLevel),
      leveledUp,
      changes: { aura: auraChange, xp: xpChange, cred: credChange },
    };
  } catch (error) {
    console.error("Points Engine Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Apply points when someone else's action affects the user
 * E.g., when someone upvotes your post
 */
async function applyPointsToContentOwner(contentOwnerId, actionType, meta = {}) {
  return applyPoints(contentOwnerId, actionType, meta);
}

/**
 * Calculate feed ranking score
 * Score = (upvotes - downvotes) + log(author.cred + 1) + freshnessBoost
 */
function calculateFeedScore(post, authorCred, now = Date.now()) {
  const netVotes = post.upvotes - post.downvotes;
  const credBoost = Math.log10(authorCred + 1);
  
  // Freshness: posts decay over time (24hr half-life)
  const ageInHours = (now - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
  const freshnessBoost = Math.pow(0.5, ageInHours / 24) * 10;
  
  return netVotes + credBoost + freshnessBoost;
}

/**
 * Get vote weight for a user based on CRED
 * Higher CRED = more influence on rankings
 */
function getVoteWeight(cred) {
  // New users: 0.1 to 0.5 weight
  // High CRED users: up to 3x weight
  return Math.max(0.1, Math.min(3, 0.5 + Math.log10(cred + 1)));
}

/**
 * Check for suspicious activity
 */
async function checkSuspiciousActivity(userId, actionType) {
  // Rate limiting check
  const recentLogs = await PointLog.countDocuments({
    user: userId,
    action: actionType,
    createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
  });
  
  const limits = {
    UPVOTE_GIVEN: 100,
    COMMENT_CREATED: 50,
    POST_GENERIC: 20,
  };
  
  const limit = limits[actionType] || 200;
  
  if (recentLogs >= limit) {
    // Flag user
    await User.updateOne(
      { _id: userId },
      { $inc: { suspiciousActivityFlags: 1 } }
    );
    return { suspicious: true, reason: "Rate limit exceeded" };
  }
  
  return { suspicious: false };
}

/**
 * Handle daily login streak
 */
async function handleDailyLogin(userId) {
  const user = await User.findById(userId);
  if (!user) return { success: false };
  
  const now = new Date();
  const lastActive = user.streak?.lastActiveDate;
  
  if (lastActive) {
    const daysDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      // Already logged in today
      return { success: true, alreadyActive: true };
    } else if (daysDiff === 1) {
      // Consecutive day
      user.streak.current += 1;
      user.streak.longest = Math.max(user.streak.longest, user.streak.current);
    } else {
      // Streak broken
      user.streak.current = 1;
    }
  } else {
    // First login
    user.streak = { current: 1, longest: 1 };
  }
  
  user.streak.lastActiveDate = now;
  await user.save();
  
  // Apply daily login points
  const result = await applyPoints(userId, "DAILY_LOGIN", { platform: user.platform });
  
  // Streak bonus every 7 days
  if (user.streak.current % 7 === 0) {
    await applyPoints(userId, "STREAK_BONUS", { 
      platform: user.platform,
      metadata: { streakDays: user.streak.current }
    });
  }
  
  return { 
    success: true, 
    streak: user.streak,
    ...result 
  };
}

module.exports = {
  POINT_RULES,
  LEVEL_THRESHOLDS,
  calculateLevel,
  getLevelInfo,
  getLevelProgress,
  applyPoints,
  applyPointsToContentOwner,
  calculateFeedScore,
  getVoteWeight,
  checkSuspiciousActivity,
  handleDailyLogin,
};
