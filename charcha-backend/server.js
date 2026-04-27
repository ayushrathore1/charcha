require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const voteRoutes = require("./routes/voteRoutes");
const followRoutes = require("./routes/followRoutes");
const mentionRoutes = require("./routes/mentionRoutes");
const situationshipRoutes = require("./routes/situationshipRoutes");
const nudgeRoutes = require("./routes/nudgeRoutes");

// Initialize express
const app = express();

// Connect to database
connectDB();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(",") 
    : ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { 
    success: false, 
    message: "Too many requests, please try again later" 
  },
});
app.use("/api", limiter);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    service: "Charcha Backend",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api", commentRoutes); // /api/posts/:postId/comments and /api/comments/:id
app.use("/api/votes", voteRoutes);
app.use("/api/users", followRoutes);
app.use("/api/mentions", mentionRoutes);
app.use("/api/situationships", situationshipRoutes);
app.use("/api/nudges", nudgeRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🎯 Charcha API - Discussion Forum Backend",
    version: "1.0.0",
    documentation: "/api-docs",
    endpoints: {
      auth: "/api/auth",
      posts: "/api/posts",
      comments: "/api/posts/:postId/comments",
      votes: "/api/votes",
      users: "/api/users",
      mentions: "/api/mentions",
      situationships: "/api/situationships",
      nudges: "/api/nudges",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║   🎯 CHARCHA BACKEND SERVER                        ║
║                                                    ║
║   Port: ${PORT}                                       ║
║   Environment: ${process.env.NODE_ENV || "development"}                      ║
║                                                    ║
║   Endpoints:                                       ║
║   → /api/auth     - Authentication                 ║
║   → /api/posts    - Posts CRUD                     ║
║   → /api/votes    - Voting system                  ║
║   → /api/users    - Follow/Followers               ║
║   → /api/mentions - @mentions                      ║
║   → /api/situationships - CRM Tracker              ║
║   → /api/nudges   - CRM Nudges                     ║
║                                                    ║
╚════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
