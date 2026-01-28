const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false, // Not required for SSO users
      minlength: 6,
      select: false,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 50,
    },
    // Unique display username for the forum
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      maxlength: 30,
    },
    // Platform origin (but can use both)
    platform: {
      type: String,
      enum: ["MEDHA", "CODELEARNN"],
      default: "MEDHA",
    },
    // CodeLearnn SSO Integration
    codelearnId: {
      type: String,
      sparse: true,
      index: true,
    },
    // External avatar URL (from SSO platform)
    avatarUrl: {
      type: String,
      default: "",
    },

    // ============== UNIFIED REPUTATION SYSTEM ==============
    
    // AURA - Primary Reputation (public-facing "who is this person?" score)
    // Earned by: sharing notes, posting explanations, upvotes, bookmarks, resources
    // Used for: levels, badges, unlocking features, trust, visibility
    aura: {
      type: Number,
      default: 0,
    },
    
    // XP - Progress & Activity (how active and consistent)
    // Earned by: daily activity, commenting, completing learning paths, reviews
    // Used for: level progression, streaks, UI unlocks
    xp: {
      type: Number,
      default: 0,
    },
    
    // CRED - Quality & Authority Score (slower to earn, harder to lose)
    // Earned by: high engagement posts, reused notes, quality resources, assessments
    // Used for: moderation powers, higher vote weight, curator abilities
    cred: {
      type: Number,
      default: 0,
    },
    
    // Level (1-5, driven by AURA)
    // 1: Newcomer (0-100), 2: Explorer (100-500), 3: Contributor (500-2000)
    // 4: Mentor (2000-10000), 5: Master (10000+)
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    
    // Badges earned
    badges: [{
      type: String,
    }],
    
    // Activity statistics
    stats: {
      posts: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      upvotesReceived: { type: Number, default: 0 },
      downvotesReceived: { type: Number, default: 0 },
      bookmarks: { type: Number, default: 0 },
      notesShared: { type: Number, default: 0 },
      resourcesShared: { type: Number, default: 0 },
    },
    
    // Streak tracking
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActiveDate: Date,
    },

    // ============== END REPUTATION SYSTEM ==============

    // Avatar selection
    avatarIndex: {
      type: Number,
      default: 0,
    },
    // Custom user flair
    customFlair: {
      type: String,
      maxlength: 30,
      default: "",
    },
    // Admin/Moderator status
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isModerator: {
      type: Boolean,
      default: false,
    },
    // Follow counts
    followerCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
    // Profile bio
    bio: {
      type: String,
      maxlength: 200,
      default: "",
    },
    // Account status
    isVerified: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspiciousActivityFlags: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get vote weight based on CRED
userSchema.methods.getVoteWeight = function () {
  // New users have low influence, high CRED users have more weight
  return Math.max(0.1, Math.min(3, 0.5 + Math.log10(this.cred + 1)));
};

// Check if user can moderate
userSchema.methods.canModerate = function () {
  return this.isAdmin || this.isModerator || this.cred >= 500;
};

// Check if user can curate
userSchema.methods.canCurate = function () {
  return this.cred >= 100;
};

// Indexes
userSchema.index({ username: 1 });
userSchema.index({ aura: -1 });
userSchema.index({ cred: -1 });
userSchema.index({ level: -1 });
userSchema.index({ email: 1 });
userSchema.index({ platform: 1 });

module.exports = mongoose.model("User", userSchema);
