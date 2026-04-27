const NudgeLog = require("../models/NudgeLog");

// Get pending nudges for the current user
exports.getPendingNudges = async (req, res) => {
  try {
    const nudges = await NudgeLog.find({ 
      owner: req.user._id,
      status: "pending" 
    }).populate("situationship", "person.name person.platform person.avatarUrl status warmthScore").sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: nudges });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update nudge status
exports.updateNudgeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!["sent", "dismissed", "snoozed", "pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const nudge = await NudgeLog.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: { status } },
      { new: true }
    );

    if (!nudge) {
      return res.status(404).json({ success: false, message: "Nudge not found" });
    }

    res.status(200).json({ success: true, data: nudge });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
