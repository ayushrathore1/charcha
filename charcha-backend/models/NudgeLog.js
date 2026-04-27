const mongoose = require("mongoose");

const nudgeLogSchema = new mongoose.Schema(
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
    message: {
      type: String,
      required: true,
    },
    context: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "dismissed", "snoozed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

nudgeLogSchema.index({ owner: 1, status: 1 });
nudgeLogSchema.index({ situationship: 1 });

module.exports = mongoose.model("NudgeLog", nudgeLogSchema);
