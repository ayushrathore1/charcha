const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      maxlength: 5000,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    // Parent comment for threading (null = top-level comment)
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    // Depth level for display (0 = top level)
    depth: {
      type: Number,
      default: 0,
      max: 10, // Limit nesting depth
    },
    // Anonymous commenting
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    // Voting
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    // Wilson score for "Best" sorting
    wilsonScore: {
      type: Number,
      default: 0,
    },
    // @mentions extracted from content
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    hasAdminMention: {
      type: Boolean,
      default: false,
    },
    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
commentSchema.index({ post: 1, createdAt: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ wilsonScore: -1 });

// Virtual for net score
commentSchema.virtual("score").get(function() {
  return this.upvotes - this.downvotes;
});

module.exports = mongoose.model("Comment", commentSchema);
