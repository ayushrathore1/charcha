const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Platform source (MEDHA or CODELEARNN)
    platform: {
      type: String,
      enum: ["MEDHA", "CODELEARNN"],
      required: true,
      default: "MEDHA",
    },
    // Content type
    type: {
      type: String,
      enum: ["NOTE", "POST", "RESOURCE", "EXPLANATION", "ROADMAP", "REVIEW"],
      default: "POST",
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      maxlength: 10000,
    },
    // File attachment (for notes, PDFs)
    fileUrl: {
      type: String,
      default: null,
    },
    // Anonymous posting
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    // Media attachments
    mediaUrls: [{
      url: String,
      type: {
        type: String,
        enum: ["image", "video", "file", "pdf"],
      },
      filename: String,
    }],
    // Category tag
    tag: {
      type: String,
      enum: ["doubts", "resources", "memes", "off-topic", "announcements", "notes", "roadmaps", "tutorials"],
      default: "off-topic",
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
    // Bookmarks (for "your content bookmarked" points)
    bookmarks: {
      type: Number,
      default: 0,
    },
    // Quality score (for "high quality" designation)
    qualityScore: {
      type: Number,
      default: 0,
    },
    isHighQuality: {
      type: Boolean,
      default: false,
    },
    // Hot score for ranking
    hotScore: {
      type: Number,
      default: 0,
    },
    // Comment count
    commentCount: {
      type: Number,
      default: 0,
    },
    // Share slug
    shareSlug: {
      type: String,
      unique: true,
      sparse: true,
    },
    // @mentions
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
postSchema.index({ hotScore: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ platform: 1, createdAt: -1 });
postSchema.index({ type: 1, createdAt: -1 });
postSchema.index({ tag: 1, createdAt: -1 });
postSchema.index({ author: 1 });
postSchema.index({ shareSlug: 1 });
postSchema.index({ qualityScore: -1 });

// Generate share slug
postSchema.pre("save", function(next) {
  if (!this.shareSlug) {
    this.shareSlug = Math.random().toString(36).substring(2, 10);
  }
  next();
});

// Virtual for net score
postSchema.virtual("score").get(function() {
  return this.upvotes - this.downvotes;
});

module.exports = mongoose.model("Post", postSchema);
