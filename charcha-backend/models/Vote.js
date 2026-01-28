const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // What type of content is being voted on
    targetType: {
      type: String,
      enum: ["post", "comment"],
      required: true,
    },
    // ID of the post or comment
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetModel",
    },
    targetModel: {
      type: String,
      enum: ["Post", "Comment"],
      required: true,
    },
    // Vote type: 1 for upvote, -1 for downvote
    voteType: {
      type: Number,
      enum: [1, -1],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one vote per user per target
voteSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });
voteSchema.index({ targetId: 1, targetType: 1 });

module.exports = mongoose.model("Vote", voteSchema);
