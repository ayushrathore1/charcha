const Mention = require("../models/Mention");
const User = require("../models/User");

/**
 * Get mentions for current user
 */
exports.getMentions = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const query = { mentionedUser: req.user._id };
    if (unreadOnly === "true") {
      query.isRead = false;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const mentions = await Mention.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("mentioner", "username avatarIndex")
      .populate("sourceId")
      .sort({ createdAt: -1 });
    
    const total = await Mention.countDocuments(query);
    const unreadCount = await Mention.countDocuments({
      mentionedUser: req.user._id,
      isRead: false,
    });
    
    res.json({
      success: true,
      mentions,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get mentions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching mentions",
      error: error.message,
    });
  }
};

/**
 * Mark mentions as read
 */
exports.markMentionsRead = async (req, res) => {
  try {
    const { mentionIds } = req.body;
    
    if (mentionIds && mentionIds.length > 0) {
      await Mention.updateMany(
        {
          _id: { $in: mentionIds },
          mentionedUser: req.user._id,
        },
        { isRead: true }
      );
    } else {
      // Mark all as read
      await Mention.updateMany(
        { mentionedUser: req.user._id, isRead: false },
        { isRead: true }
      );
    }
    
    res.json({
      success: true,
      message: "Mentions marked as read",
    });
  } catch (error) {
    console.error("Mark mentions read error:", error);
    res.status(500).json({
      success: false,
      message: "Error marking mentions as read",
      error: error.message,
    });
  }
};

/**
 * Search users for @mention autocomplete
 */
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        users: [],
      });
    }
    
    const users = await User.find({
      username: { $regex: new RegExp(`^${q}`, "i") },
    })
      .select("username avatarIndex karma rank")
      .limit(10);
    
    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching users",
      error: error.message,
    });
  }
};

/**
 * Get admin mentions (admin only)
 */
exports.getAdminMentions = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }
    
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const mentions = await Mention.find({ isAdminMention: true })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("mentioner", "username avatarIndex")
      .populate("sourceId")
      .sort({ createdAt: -1 });
    
    const total = await Mention.countDocuments({ isAdminMention: true });
    const unreadCount = await Mention.countDocuments({
      isAdminMention: true,
      isRead: false,
    });
    
    res.json({
      success: true,
      mentions,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get admin mentions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin mentions",
      error: error.message,
    });
  }
};
