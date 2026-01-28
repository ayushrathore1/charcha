const Follow = require("../models/Follow");
const User = require("../models/User");

/**
 * Follow a user
 */
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user._id;
    
    // Can't follow yourself
    if (userId === followerId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot follow yourself",
      });
    }
    
    // Check if user exists
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: userId,
    });
    
    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: "Already following this user",
      });
    }
    
    // Create follow
    await Follow.create({
      follower: followerId,
      following: userId,
    });
    
    // Update counts
    await User.updateOne({ _id: followerId }, { $inc: { followingCount: 1 } });
    await User.updateOne({ _id: userId }, { $inc: { followerCount: 1 } });
    
    res.json({
      success: true,
      message: "Now following user",
    });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({
      success: false,
      message: "Error following user",
      error: error.message,
    });
  }
};

/**
 * Unfollow a user
 */
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user._id;
    
    const follow = await Follow.findOneAndDelete({
      follower: followerId,
      following: userId,
    });
    
    if (!follow) {
      return res.status(404).json({
        success: false,
        message: "Not following this user",
      });
    }
    
    // Update counts
    await User.updateOne({ _id: followerId }, { $inc: { followingCount: -1 } });
    await User.updateOne({ _id: userId }, { $inc: { followerCount: -1 } });
    
    res.json({
      success: true,
      message: "Unfollowed user",
    });
  } catch (error) {
    console.error("Unfollow error:", error);
    res.status(500).json({
      success: false,
      message: "Error unfollowing user",
      error: error.message,
    });
  }
};

/**
 * Get followers of a user
 */
exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const follows = await Follow.find({ following: userId })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("follower", "username avatarIndex karma rank customFlair")
      .sort({ createdAt: -1 });
    
    const followers = follows.map(f => f.follower);
    const total = await Follow.countDocuments({ following: userId });
    
    res.json({
      success: true,
      followers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching followers",
      error: error.message,
    });
  }
};

/**
 * Get users that a user is following
 */
exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const follows = await Follow.find({ follower: userId })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("following", "username avatarIndex karma rank customFlair")
      .sort({ createdAt: -1 });
    
    const following = follows.map(f => f.following);
    const total = await Follow.countDocuments({ follower: userId });
    
    res.json({
      success: true,
      following,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching following",
      error: error.message,
    });
  }
};

/**
 * Check if current user is following another user
 */
exports.checkFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const follow = await Follow.findOne({
      follower: req.user._id,
      following: userId,
    });
    
    res.json({
      success: true,
      isFollowing: !!follow,
    });
  } catch (error) {
    console.error("Check following error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking follow status",
      error: error.message,
    });
  }
};
