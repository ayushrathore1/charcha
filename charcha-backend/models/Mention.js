const mongoose = require("mongoose");

const mentionSchema = new mongoose.Schema(
  {
    // User who created the mention (author of post/comment)
    mentioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // User who was mentioned
    mentionedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Where the mention occurred
    sourceType: {
      type: String,
      enum: ["post", "comment"],
      required: true,
    },
    // Reference to the source post or comment
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "sourceModel",
    },
    sourceModel: {
      type: String,
      enum: ["Post", "Comment"],
      required: true,
    },
    // If the mentioned user is admin (for admin inbox)
    isAdminMention: {
      type: Boolean,
      default: false,
    },
    // Has the mentioned user read this?
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
mentionSchema.index({ mentionedUser: 1, isRead: 1, createdAt: -1 });
mentionSchema.index({ isAdminMention: 1, isRead: 1, createdAt: -1 });
mentionSchema.index({ mentioner: 1 });

module.exports = mongoose.model("Mention", mentionSchema);
