const mongoose = require("mongoose");

/**
 * PointLog - Transaction log for all point changes
 * VERY IMPORTANT for debugging, auditing, reverting, and analytics
 */
const pointLogSchema = new mongoose.Schema(
  {
    // User affected
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Action that triggered the change
    action: {
      type: String,
      required: true,
      enum: [
        // Content creation
        "POST_NOTE",
        "POST_EXPLANATION",
        "POST_RESOURCE",
        "POST_ROADMAP",
        "POST_REVIEW",
        "POST_GENERIC",
        // Engagement received
        "UPVOTE_RECEIVED",
        "DOWNVOTE_RECEIVED",
        "BOOKMARK_RECEIVED",
        "COMMENT_RECEIVED",
        // Engagement given
        "COMMENT_CREATED",
        "UPVOTE_GIVEN",
        // Quality designations
        "QUALITY_RESOURCE",
        "QUALITY_REVOKED",
        // Activity
        "DAILY_LOGIN",
        "STREAK_BONUS",
        "LEARNING_MODULE_COMPLETE",
        // Moderation
        "SPAM_PENALTY",
        "CONTENT_REMOVED",
        "MANUAL_ADJUSTMENT",
      ],
    },
    // Point changes
    auraChange: {
      type: Number,
      default: 0,
    },
    xpChange: {
      type: Number,
      default: 0,
    },
    credChange: {
      type: Number,
      default: 0,
    },
    // New totals after change (for easy lookup)
    auraAfter: {
      type: Number,
    },
    xpAfter: {
      type: Number,
    },
    credAfter: {
      type: Number,
    },
    levelAfter: {
      type: Number,
    },
    // Reference to source (post, comment, etc)
    sourceType: {
      type: String,
      enum: ["Post", "Comment", "User", "System"],
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    // Platform where action occurred
    platform: {
      type: String,
      enum: ["MEDHA", "CODELEARNN", "SYSTEM"],
      default: "MEDHA",
    },
    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
pointLogSchema.index({ user: 1, createdAt: -1 });
pointLogSchema.index({ action: 1, createdAt: -1 });
pointLogSchema.index({ platform: 1, createdAt: -1 });
pointLogSchema.index({ sourceType: 1, sourceId: 1 });

module.exports = mongoose.model("PointLog", pointLogSchema);
