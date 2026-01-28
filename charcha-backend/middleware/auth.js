const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Auth middleware - Protects routes requiring authentication
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for Bearer token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Not authorized - no token provided" 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Not authorized - user not found" 
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ 
      success: false,
      message: "Not authorized - invalid token" 
    });
  }
};

/**
 * Optional auth middleware - Attaches user if token exists, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select("-password");
    }

    next();
  } catch (error) {
    // Token invalid, but continue without user
    next();
  }
};

/**
 * Admin only middleware
 */
const adminOnly = async (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ 
      success: false,
      message: "Access denied - admin only" 
    });
  }
  next();
};

module.exports = { protect, optionalAuth, adminOnly };
