const jwt = require("jsonwebtoken");
const User = require("../models/User");
const validator = require("validator");
const { calculateLevel, getLevelInfo, getLevelProgress, handleDailyLogin } = require("../services/pointsEngine");

/**
 * Generate JWT Token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

/**
 * Generate unique username from name
 */
const generateUsername = async (name) => {
  let base = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 15);
  
  if (base.length < 3) base = "user";
  
  let username = base;
  let counter = 1;
  
  while (await User.findOne({ username })) {
    username = `${base}${Math.floor(Math.random() * 9999)}`;
    counter++;
    if (counter > 10) {
      username = `${base}${Date.now().toString(36)}`;
      break;
    }
  }
  
  return username;
};

/**
 * Register new user
 */
exports.register = async (req, res) => {
  try {
    const { email, password, name, platform } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, password, and name",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const username = await generateUsername(name);

    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name,
      username,
      platform: platform || "MEDHA",
      avatarIndex: Math.floor(Math.random() * 10),
    });

    // Handle daily login for new user
    await handleDailyLogin(user._id);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        platform: user.platform,
        aura: user.aura,
        xp: user.xp,
        cred: user.cred,
        level: user.level,
        levelInfo: getLevelInfo(user.level),
        avatarIndex: user.avatarIndex,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Handle daily login streak
    const loginResult = await handleDailyLogin(user._id);

    const token = generateToken(user._id);

    // Refresh user data after potential point changes
    const updatedUser = await User.findById(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        username: updatedUser.username,
        platform: updatedUser.platform,
        aura: updatedUser.aura,
        xp: updatedUser.xp,
        cred: updatedUser.cred,
        level: updatedUser.level,
        levelInfo: getLevelInfo(updatedUser.level),
        levelProgress: getLevelProgress(updatedUser.aura),
        avatarIndex: updatedUser.avatarIndex,
        isAdmin: updatedUser.isAdmin,
        streak: updatedUser.streak,
      },
      loginReward: !loginResult.alreadyActive ? {
        xp: 5,
        message: "Daily login bonus!",
        streak: updatedUser.streak,
      } : null,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

/**
 * Get current user
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        platform: user.platform,
        aura: user.aura,
        xp: user.xp,
        cred: user.cred,
        level: user.level,
        levelInfo: getLevelInfo(user.level),
        levelProgress: getLevelProgress(user.aura),
        badges: user.badges,
        stats: user.stats,
        streak: user.streak,
        avatarIndex: user.avatarIndex,
        customFlair: user.customFlair,
        bio: user.bio,
        isAdmin: user.isAdmin,
        isModerator: user.isModerator,
        followerCount: user.followerCount,
        followingCount: user.followingCount,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, customFlair, avatarIndex } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (customFlair !== undefined) updateData.customFlair = customFlair;
    if (avatarIndex !== undefined) updateData.avatarIndex = avatarIndex;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: "Profile updated",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        bio: user.bio,
        customFlair: user.customFlair,
        avatarIndex: user.avatarIndex,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

/**
 * Get user by username (public profile)
 */
exports.getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username }).select(
      "username name platform aura xp cred level badges stats avatarIndex customFlair bio followerCount followingCount createdAt"
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    res.json({
      success: true,
      user: {
        ...user.toObject(),
        levelInfo: getLevelInfo(user.level),
        levelProgress: getLevelProgress(user.aura),
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};

/**
 * Get leaderboard
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const { type = "aura", limit = 20, platform } = req.query;
    
    const query = {};
    if (platform && platform !== "all") query.platform = platform;
    
    const sortField = type === "cred" ? "cred" : type === "xp" ? "xp" : "aura";
    
    const users = await User.find(query)
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit))
      .select("username name avatarIndex aura xp cred level badges platform");
    
    res.json({
      success: true,
      leaderboard: users.map((user, index) => ({
        rank: index + 1,
        ...user.toObject(),
        levelInfo: getLevelInfo(user.level),
      })),
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leaderboard",
      error: error.message,
    });
  }
};

/**
 * SSO Sync - Create or update user from external platform (CodeLearnn)
 * Used when a user registers or updates their profile on CodeLearnn
 */
exports.ssoSync = async (req, res) => {
  try {
    const { email, name, avatarUrl, codelearnId, platform } = req.body;

    // Validate required fields
    if (!email || !name || !codelearnId || !platform) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, name, codelearnId, and platform",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email",
      });
    }

    // Check if user exists by codelearnId or email
    let user = await User.findOne({
      $or: [
        { codelearnId: codelearnId },
        { email: email.toLowerCase() }
      ]
    });

    if (user) {
      // Update existing user
      user.name = name;
      user.email = email.toLowerCase();
      user.codelearnId = codelearnId;
      if (avatarUrl) user.avatarUrl = avatarUrl;
      if (platform) user.platform = platform.toUpperCase();
      await user.save();

      console.log(`SSO: Updated user ${user.username} from ${platform}`);
    } else {
      // Create new user
      const username = await generateUsername(name);

      user = await User.create({
        email: email.toLowerCase(),
        name,
        username,
        platform: platform.toUpperCase() || "CODELEARNN",
        codelearnId,
        avatarUrl: avatarUrl || "",
        avatarIndex: Math.floor(Math.random() * 10),
      });

      // Handle daily login for new user
      await handleDailyLogin(user._id);

      console.log(`SSO: Created new user ${user.username} from ${platform}`);
    }

    const token = generateToken(user._id);

    res.status(user.isNew ? 201 : 200).json({
      success: true,
      message: user.isNew ? "User created via SSO" : "User updated via SSO",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        platform: user.platform,
        codelearnId: user.codelearnId,
        avatarUrl: user.avatarUrl,
        aura: user.aura,
        xp: user.xp,
        cred: user.cred,
        level: user.level,
        levelInfo: getLevelInfo(user.level),
        avatarIndex: user.avatarIndex,
      },
    });
  } catch (error) {
    console.error("SSO Sync error:", error);
    res.status(500).json({
      success: false,
      message: "Error syncing user via SSO",
      error: error.message,
    });
  }
};

/**
 * SSO Login - Get token for existing user from external platform
 * Used when a user logs in on CodeLearnn and needs a Charcha token
 */
exports.ssoLogin = async (req, res) => {
  try {
    const { email, codelearnId, platform } = req.body;

    // Validate required fields
    if (!email || !codelearnId || !platform) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, codelearnId, and platform",
      });
    }

    // Find user by codelearnId or email
    const user = await User.findOne({
      $or: [
        { codelearnId: codelearnId },
        { email: email.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please use sso-sync to create user first.",
      });
    }

    // Verify codelearnId matches if user was found by email
    if (user.codelearnId && user.codelearnId !== codelearnId) {
      return res.status(403).json({
        success: false,
        message: "CodeLearnn ID mismatch",
      });
    }

    // Update codelearnId if not set (user was found by email)
    if (!user.codelearnId) {
      user.codelearnId = codelearnId;
      user.platform = platform.toUpperCase();
      await user.save();
    }

    // Handle daily login streak
    const loginResult = await handleDailyLogin(user._id);

    const token = generateToken(user._id);

    // Refresh user data after potential point changes
    const updatedUser = await User.findById(user._id);

    res.json({
      success: true,
      message: "SSO login successful",
      token,
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        username: updatedUser.username,
        platform: updatedUser.platform,
        codelearnId: updatedUser.codelearnId,
        avatarUrl: updatedUser.avatarUrl,
        aura: updatedUser.aura,
        xp: updatedUser.xp,
        cred: updatedUser.cred,
        level: updatedUser.level,
        levelInfo: getLevelInfo(updatedUser.level),
        levelProgress: getLevelProgress(updatedUser.aura),
        avatarIndex: updatedUser.avatarIndex,
        isAdmin: updatedUser.isAdmin,
        streak: updatedUser.streak,
      },
      loginReward: !loginResult.alreadyActive ? {
        xp: 5,
        message: "Daily login bonus!",
        streak: updatedUser.streak,
      } : null,
    });
  } catch (error) {
    console.error("SSO Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in via SSO",
      error: error.message,
    });
  }
};

