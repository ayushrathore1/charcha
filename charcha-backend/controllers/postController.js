const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Vote = require("../models/Vote");
const Mention = require("../models/Mention");
const User = require("../models/User");
const { calculateHotScore, calculateSmartFeedScore, getPostSortQuery } = require("../utils/rankingAlgorithms");
const { applyPoints, applyPointsToContentOwner, checkSuspiciousActivity } = require("../services/pointsEngine");

// Constants
const MAX_ANONYMOUS_POSTS_PER_DAY = 3;
const MIN_ACCOUNT_AGE_FOR_ANONYMOUS = 24 * 60 * 60 * 1000;

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
async function createMentions(text, authorId, sourceId, sourceType) {
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
      sourceType,
      sourceId,
      sourceModel: sourceType === "post" ? "Post" : "Comment",
      isAdminMention: false,
    });
  }
  
  if (hasAdminMention) {
    const admins = await User.find({ isAdmin: true }).select("_id");
    for (const admin of admins) {
      await Mention.create({
        mentioner: authorId,
        mentionedUser: admin._id,
        sourceType,
        sourceId,
        sourceModel: sourceType === "post" ? "Post" : "Comment",
        isAdminMention: true,
      });
    }
  }
  
  return { mentions, hasAdminMention };
}

/**
 * Get action type based on post type
 */
function getPostActionType(postType) {
  const mapping = {
    "NOTE": "POST_NOTE",
    "EXPLANATION": "POST_EXPLANATION",
    "RESOURCE": "POST_RESOURCE",
    "ROADMAP": "POST_ROADMAP",
    "REVIEW": "POST_REVIEW",
  };
  return mapping[postType] || "POST_GENERIC";
}

/**
 * Create a new post
 */
exports.createPost = async (req, res) => {
  try {
    const { title, content, tag, type, platform, isAnonymous, mediaUrls, fileUrl } = req.body;
    const userId = req.user._id;
    
    // Check for suspicious activity
    const suspiciousCheck = await checkSuspiciousActivity(userId, "POST_GENERIC");
    if (suspiciousCheck.suspicious) {
      return res.status(429).json({
        success: false,
        message: "Too many posts. Please slow down.",
      });
    }
    
    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }
    
    // Anonymous posting restrictions
    if (isAnonymous) {
      const accountAge = Date.now() - new Date(req.user.createdAt).getTime();
      if (accountAge < MIN_ACCOUNT_AGE_FOR_ANONYMOUS) {
        return res.status(400).json({
          success: false,
          message: "Account must be at least 24 hours old for anonymous posting",
        });
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const anonCount = await Post.countDocuments({
        author: userId,
        isAnonymous: true,
        createdAt: { $gte: today },
      });
      
      if (anonCount >= MAX_ANONYMOUS_POSTS_PER_DAY) {
        return res.status(400).json({
          success: false,
          message: `Maximum ${MAX_ANONYMOUS_POSTS_PER_DAY} anonymous posts per day`,
        });
      }
    }
    
    // Create post
    const post = await Post.create({
      title,
      content,
      author: userId,
      type: type || "POST",
      platform: platform || req.user.platform || "MEDHA",
      tag: tag || "off-topic",
      isAnonymous: isAnonymous || false,
      mediaUrls: mediaUrls || [],
      fileUrl: fileUrl || null,
    });
    
    // Process mentions
    const { mentions, hasAdminMention } = await createMentions(content, userId, post._id, "post");
    post.mentions = mentions;
    post.hasAdminMention = hasAdminMention;
    
    // Calculate initial hot score
    post.hotScore = calculateHotScore(0, 0, post.createdAt);
    await post.save();
    
    // Apply points to author (only if not anonymous)
    if (!isAnonymous) {
      const actionType = getPostActionType(post.type);
      await applyPoints(userId, actionType, {
        sourceType: "Post",
        sourceId: post._id,
        platform: post.platform,
      });
    }
    
    // Populate and return
    const populatedPost = await Post.findById(post._id)
      .populate("author", "username avatarIndex aura cred level");
    
    res.status(201).json({
      success: true,
      message: "Post created",
      post: {
        ...populatedPost.toObject(),
        author: isAnonymous ? { username: "Anonymous", avatarIndex: -1 } : populatedPost.author,
      },
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating post",
      error: error.message,
    });
  }
};

/**
 * Get posts with sorting and filtering
 */
exports.getPosts = async (req, res) => {
  try {
    const { sort = "hot", tag, type, platform, page = 1, limit = 20 } = req.query;
    
    const query = { isDeleted: false };
    if (tag && tag !== "all") query.tag = tag;
    if (type && type !== "all") query.type = type;
    if (platform && platform !== "all") query.platform = platform;
    
    const sortQuery = getPostSortQuery(sort);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let posts = await Post.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("author", "username avatarIndex aura cred level isAdmin");
    
    // For smart sort, re-rank with CRED boost
    if (sort === "smart") {
      posts = posts.map(post => ({
        ...post.toObject(),
        smartScore: calculateSmartFeedScore(post, post.author?.cred || 0),
      })).sort((a, b) => b.smartScore - a.smartScore);
    }
    
    // Process anonymous posts
    posts = posts.map(post => {
      const postObj = post.toObject ? post.toObject() : post;
      if (postObj.isAnonymous) {
        postObj.author = { username: "Anonymous", avatarIndex: -1 };
      }
      return postObj;
    });
    
    const total = await Post.countDocuments(query);
    
    res.json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching posts",
      error: error.message,
    });
  }
};

/**
 * Get single post by ID or share slug
 */
exports.getPost = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    
    let post = await Post.findOne({ shareSlug: idOrSlug, isDeleted: false })
      .populate("author", "username avatarIndex aura cred level isAdmin");
    
    if (!post) {
      post = await Post.findOne({ _id: idOrSlug, isDeleted: false })
        .populate("author", "username avatarIndex aura cred level isAdmin");
    }
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    
    const postObj = post.toObject();
    if (post.isAnonymous) {
      postObj.author = { username: "Anonymous", avatarIndex: -1 };
    }
    
    res.json({
      success: true,
      post: postObj,
    });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching post",
      error: error.message,
    });
  }
};

/**
 * Delete a post
 */
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    
    // Check ownership or admin
    if (post.author.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this post",
      });
    }
    
    // Soft delete
    post.isDeleted = true;
    await post.save();
    
    // Apply penalty if admin removed it
    if (req.user.isAdmin && post.author.toString() !== userId.toString()) {
      await applyPoints(post.author, "CONTENT_REMOVED", {
        sourceType: "Post",
        sourceId: post._id,
        platform: post.platform,
      });
    }
    
    res.json({
      success: true,
      message: "Post deleted",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting post",
      error: error.message,
    });
  }
};

/**
 * Get shareable link
 */
exports.getShareLink = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findById(postId).select("shareSlug title");
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    
    res.json({
      success: true,
      shareSlug: post.shareSlug,
      title: post.title,
    });
  } catch (error) {
    console.error("Get share link error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting share link",
      error: error.message,
    });
  }
};

/**
 * Bookmark a post
 */
exports.bookmarkPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    
    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    
    // Increment bookmark count
    post.bookmarks = (post.bookmarks || 0) + 1;
    await post.save();
    
    // Give points to post author
    if (!post.isAnonymous) {
      await applyPointsToContentOwner(post.author, "BOOKMARK_RECEIVED", {
        sourceType: "Post",
        sourceId: post._id,
        platform: post.platform,
      });
    }
    
    res.json({
      success: true,
      message: "Post bookmarked",
      bookmarks: post.bookmarks,
    });
  } catch (error) {
    console.error("Bookmark post error:", error);
    res.status(500).json({
      success: false,
      message: "Error bookmarking post",
      error: error.message,
    });
  }
};

/**
 * Mark post as high quality (moderator/admin only)
 */
exports.markAsHighQuality = async (req, res) => {
  try {
    const { postId } = req.params;
    
    if (!req.user.canModerate()) {
      return res.status(403).json({
        success: false,
        message: "Moderator access required",
      });
    }
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    
    const wasHighQuality = post.isHighQuality;
    post.isHighQuality = !wasHighQuality;
    post.qualityScore = post.isHighQuality ? 100 : 0;
    await post.save();
    
    // Apply points
    if (!post.isAnonymous) {
      const action = post.isHighQuality ? "QUALITY_RESOURCE" : "QUALITY_REVOKED";
      await applyPointsToContentOwner(post.author, action, {
        sourceType: "Post",
        sourceId: post._id,
        platform: post.platform,
      });
    }
    
    res.json({
      success: true,
      message: post.isHighQuality ? "Marked as high quality" : "Quality mark removed",
      isHighQuality: post.isHighQuality,
    });
  } catch (error) {
    console.error("Mark quality error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating quality",
      error: error.message,
    });
  }
};
