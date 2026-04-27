const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema(
  {
    situationship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Situationship",
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "dm",
        "comment",
        "mention",
        "irl_meet",
        "call",
        "collab",
        "follow",
        "react",
        "manual",
      ],
      required: true,
    },
    platform: {
      type: String,
    },
    note: {
      type: String,
      default: "",
    },
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: "neutral",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    aiSuggested: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

interactionSchema.index({ situationship: 1, date: -1 });

module.exports = mongoose.model("Interaction", interactionSchema);
