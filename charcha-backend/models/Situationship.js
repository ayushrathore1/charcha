const mongoose = require("mongoose");

const situationshipSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    person: {
      name: {
        type: String,
        required: [true, "Person's name is required"],
        trim: true,
      },
      handle: {
        type: String,
        trim: true,
      },
      platform: {
        type: String,
        enum: ["instagram", "twitter", "linkedin", "irl", "discord", "other"],
        default: "other",
      },
      avatarUrl: {
        type: String,
        default: "",
      },
      notes: {
        type: String,
        default: "",
      },
      tags: [
        {
          type: String,
          trim: true,
        },
      ],
      contactInfo: {
        email: { type: String, trim: true },
        phone: { type: String, trim: true },
      },
    },
    warmthScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["warm", "cooling", "cold", "frozen"],
      default: "warm",
    },
    lastInteractionAt: {
      type: Date,
      default: Date.now,
    },
    nextNudgeAt: {
      type: Date,
    },
    interactionCount: {
      type: Number,
      default: 0,
    },
    isMuted: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

situationshipSchema.index({ owner: 1, lastInteractionAt: -1 });
situationshipSchema.index({ owner: 1, warmthScore: -1 });

module.exports = mongoose.model("Situationship", situationshipSchema);
