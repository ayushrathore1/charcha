const Vote = require("../models/Vote");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");
const { calculateHotScore, calculateWilsonScore } = require("../utils/rankingAlgorithms");
const { applyPointsToContentOwner, applyPoints, getVoteWeight, checkSuspiciousActivity } = require("../services/pointsEngine");

/**
 * Vote on a post or comment
 */
exports.vote = async (req, res) => {
  try {
    const { targetType, targetId, voteType } = req.body;
    const userId = req.user._id;
    
    // Check for suspicious voting activity
    const suspiciousCheck = await checkSuspiciousActivity(userId, "UPVOTE_GIVEN");
    if (suspiciousCheck.suspicious) {
      return res.status(429).json({
        success: false,
        message: "Too many votes. Please slow down.",
      });
    }
    
    // Validate
    if (!["post", "comment"].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target type",
      });
    }
    
    if (![1, -1].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: "Vote type must be 1 (upvote) or -1 (downvote)",
      });
    }
    
    const targetModel = targetType === "post" ? "Post" : "Comment";
    
    // Get the target
    let target;
    if (targetType === "post") {
      target = await Post.findById(targetId);
    } else {
      target = await Comment.findById(targetId);
    }
    
    if (!target || target.isDeleted) {
      return res.status(404).json({
        success: false,
        message: `${targetType} not found`,
      });
    }
    
    // Can't vote on own content
    if (target.author.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot vote on your own content",
      });
    }
    
    // Get voter's influence based on CRED
    const voter = await User.findById(userId);
    const voteWeight = getVoteWeight(voter.cred);
    
    // Check for existing vote
    const existingVote = await Vote.findOne({
      user: userId,
      targetType,
      targetId,
    });
    
    let upvoteChange = 0;
    let downvoteChange = 0;
    let pointAction = null;
    
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Same vote = remove vote
        await Vote.deleteOne({ _id: existingVote._id });
        
        if (voteType === 1) {
          upvoteChange = -1;
          // Reverse the upvote points
          pointAction = "DOWNVOTE_RECEIVED"; // Canceling upvote = losing those points
        } else {
          downvoteChange = -1;
          pointAction = "UPVOTE_RECEIVED"; // Canceling downvote = regaining points
        }
      } else {
        // Different vote = switch vote
        existingVote.voteType = voteType;
        await existingVote.save();
        
        if (voteType === 1) {
          upvoteChange = 1;
          downvoteChange = -1;
          // Double impact: remove downvote effect + add upvote effect
          pointAction = "UPVOTE_RECEIVED";
        } else {
          upvoteChange = -1;
          downvoteChange = 1;
          pointAction = "DOWNVOTE_RECEIVED";
        }
      }
    } else {
      // New vote
      await Vote.create({
        user: userId,
        targetType,
        targetId,
        targetModel,
        voteType,
      });
      
      if (voteType === 1) {
        upvoteChange = 1;
        pointAction = "UPVOTE_RECEIVED";
      } else {
        downvoteChange = 1;
        pointAction = "DOWNVOTE_RECEIVED";
      }
      
      // Give XP to voter
      await applyPoints(userId, "UPVOTE_GIVEN", {
        sourceType: targetModel,
        sourceId: targetId,
        platform: target.platform || "MEDHA",
      });
    }
    
    // Update vote counts on target
    const updateQuery = {};
    if (upvoteChange !== 0) updateQuery.upvotes = upvoteChange;
    if (downvoteChange !== 0) updateQuery.downvotes = downvoteChange;
    
    if (targetType === "post") {
      const updatedPost = await Post.findByIdAndUpdate(
        targetId,
        { $inc: updateQuery },
        { new: true }
      );
      
      // Update hot score
      const newHotScore = calculateHotScore(
        updatedPost.upvotes,
        updatedPost.downvotes,
        updatedPost.createdAt
      );
      await Post.updateOne({ _id: targetId }, { hotScore: newHotScore });
    } else {
      const updatedComment = await Comment.findByIdAndUpdate(
        targetId,
        { $inc: updateQuery },
        { new: true }
      );
      
      // Update Wilson score
      const newWilsonScore = calculateWilsonScore(
        updatedComment.upvotes,
        updatedComment.downvotes
      );
      await Comment.updateOne({ _id: targetId }, { wilsonScore: newWilsonScore });
    }
    
    // Apply points to content owner (if not anonymous)
    if (pointAction && !target.isAnonymous) {
      await applyPointsToContentOwner(target.author, pointAction, {
        sourceType: targetModel,
        sourceId: targetId,
        platform: target.platform || "MEDHA",
        metadata: { voterId: userId, voteWeight },
      });
    }
    
    // Get updated target
    const finalTarget = targetType === "post"
      ? await Post.findById(targetId).select("upvotes downvotes")
      : await Comment.findById(targetId).select("upvotes downvotes");
    
    // Get user's current vote
    const currentVote = await Vote.findOne({
      user: userId,
      targetType,
      targetId,
    });
    
    res.json({
      success: true,
      message: "Vote recorded",
      upvotes: finalTarget.upvotes,
      downvotes: finalTarget.downvotes,
      score: finalTarget.upvotes - finalTarget.downvotes,
      userVote: currentVote ? currentVote.voteType : 0,
    });
  } catch (error) {
    console.error("Vote error:", error);
    res.status(500).json({
      success: false,
      message: "Error recording vote",
      error: error.message,
    });
  }
};

/**
 * Get user's votes for multiple targets
 */
exports.getUserVotes = async (req, res) => {
  try {
    const { targetType, targetIds } = req.body;
    const userId = req.user._id;
    
    const votes = await Vote.find({
      user: userId,
      targetType,
      targetId: { $in: targetIds },
    }).lean();
    
    const voteMap = {};
    votes.forEach(v => {
      voteMap[v.targetId.toString()] = v.voteType;
    });
    
    res.json({
      success: true,
      votes: voteMap,
    });
  } catch (error) {
    console.error("Get user votes error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching votes",
      error: error.message,
    });
  }
};
