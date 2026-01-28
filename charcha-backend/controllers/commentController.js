const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Vote = require("../models/Vote");
const User = require("../models/User");
const Mention = require("../models/Mention");
const { calculateWilsonScore, getCommentSortQuery } = require("../utils/rankingAlgorithms");
const { applyPoints, applyPointsToContentOwner, checkSuspiciousActivity } = require("../services/pointsEngine");

/**
 * Parse @mentions from text
 */
function parseMentions(text) {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    const username = match[1].toLowerCase();
    if (!mentions.includes(username)) {
      mentions.push(username);
    }
  }
  
  return mentions;
}

/**
 * Create mentions in database
 */
async function createMentions(text, authorId, sourceId) {
  const mentionedUsernames = parseMentions(text);
  if (mentionedUsernames.length === 0) return { mentions: [], hasAdminMention: false };
  
  const hasAdminMention = mentionedUsernames.includes("admin");
  
  const mentionedUsers = await User.find({
    username: { $in: mentionedUsernames.filter(u => u !== "admin") }
  }).select("_id");
  
  const mentions = mentionedUsers.map(u => u._id);
  
  for (const user of mentionedUsers) {
    await Mention.create({
      mentioner: authorId,
      mentionedUser: user._id,
      sourceType: "comment",
      sourceId,
      sourceModel: "Comment",
      isAdminMention: false,
    });
  }
  
  if (hasAdminMention) {
    const admins = await User.find({ isAdmin: true }).select("_id");
    for (const admin of admins) {
      await Mention.create({
        mentioner: authorId,
        mentionedUser: admin._id,
        sourceType: "comment",
        sourceId,
        sourceModel: "Comment",
        isAdminMention: true,
      });
    }
  }
  
  return { mentions, hasAdminMention };
}

/**
 * Add a comment to a post
 */
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentCommentId, isAnonymous } = req.body;
    const userId = req.user._id;
    
    // Check for spam
    const suspiciousCheck = await checkSuspiciousActivity(userId, "COMMENT_CREATED");
    if (suspiciousCheck.suspicious) {
      return res.status(429).json({
        success: false,
        message: "Too many comments. Please slow down.",
      });
    }
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }
    
    const post = await Post.findById(postId);
    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    
    // Handle threading
    let depth = 0;
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment || parentComment.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Parent comment not found",
        });
      }
      depth = Math.min(parentComment.depth + 1, 10);
    }
    
    // Create comment
    const comment = await Comment.create({
      content,
      author: userId,
      post: postId,
      parentComment: parentCommentId || null,
      depth,
      isAnonymous: isAnonymous || false,
    });
    
    // Process mentions
    const { mentions, hasAdminMention } = await createMentions(content, userId, comment._id);
    comment.mentions = mentions;
    comment.hasAdminMention = hasAdminMention;
    await comment.save();
    
    // Increment post comment count
    await Post.updateOne({ _id: postId }, { $inc: { commentCount: 1 } });
    
    // Apply points to commenter
    await applyPoints(userId, "COMMENT_CREATED", {
      sourceType: "Comment",
      sourceId: comment._id,
      platform: post.platform,
    });
    
    // Give points to post author for receiving a comment (if not anonymous post)
    if (!post.isAnonymous && post.author.toString() !== userId.toString()) {
      await applyPointsToContentOwner(post.author, "COMMENT_RECEIVED", {
        sourceType: "Post",
        sourceId: postId,
        platform: post.platform,
      });
    }
    
    // Populate author
    const populatedComment = await Comment.findById(comment._id)
      .populate("author", "username avatarIndex aura cred level");
    
    const commentObj = populatedComment.toObject();
    if (populatedComment.isAnonymous) {
      commentObj.author = { username: "Anonymous", avatarIndex: -1 };
    }
    
    res.status(201).json({
      success: true,
      message: "Comment added",
      comment: commentObj,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding comment",
      error: error.message,
    });
  }
};

/**
 * Get comments for a post (threaded)
 */
exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { sort = "best", page = 1, limit = 50 } = req.query;
    
    const sortQuery = getCommentSortQuery(sort);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get top-level comments
    let comments = await Comment.find({
      post: postId,
      parentComment: null,
      isDeleted: false,
    })
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("author", "username avatarIndex aura cred level isAdmin");
    
    // Get all replies
    const allReplies = await Comment.find({
      post: postId,
      parentComment: { $ne: null },
      isDeleted: false,
    })
      .sort(sortQuery)
      .populate("author", "username avatarIndex aura cred level isAdmin");
    
    // Build reply map
    const replyMap = {};
    allReplies.forEach(reply => {
      const parentId = reply.parentComment.toString();
      if (!replyMap[parentId]) {
        replyMap[parentId] = [];
      }
      replyMap[parentId].push(reply);
    });
    
    // Process comments
    const processComment = (comment) => {
      const commentObj = comment.toObject();
      
      if (comment.isAnonymous) {
        commentObj.author = { username: "Anonymous", avatarIndex: -1 };
      }
      
      const replies = replyMap[comment._id.toString()] || [];
      commentObj.replies = replies.map(processComment);
      
      return commentObj;
    };
    
    const processedComments = comments.map(processComment);
    
    const total = await Comment.countDocuments({
      post: postId,
      parentComment: null,
      isDeleted: false,
    });
    
    res.json({
      success: true,
      comments: processedComments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: error.message,
    });
  }
};

/**
 * Delete a comment
 */
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;
    
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }
    
    if (comment.author.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }
    
    // Soft delete
    comment.isDeleted = true;
    comment.content = "[deleted]";
    await comment.save();
    
    // Decrement post comment count
    await Post.updateOne({ _id: comment.post }, { $inc: { commentCount: -1 } });
    
    res.json({
      success: true,
      message: "Comment deleted",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: error.message,
    });
  }
};
