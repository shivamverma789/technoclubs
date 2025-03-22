const express = require("express");
const router = express.Router();

// Import all route files
const authRoutes = require("./auth");
const userRoutes = require("./users");  // Ensure the filename matches exactly
const dashboardRoutes = require("./dashboard");
const chapterRoutes = require("./chapter");
const eventRoutes = require("./event");
const membershipRoutes = require("./membership");
const homeRoutes = require("./home");
const feedbackRoutes = require("./feedback");

// Use routes
router.get("/", homeRoutes);
router.use("/auth", authRoutes); // register and login
router.use("/users", userRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/chapters", chapterRoutes);
router.use("/events", eventRoutes);
router.use("/membership", membershipRoutes);
router.use("/feedback", feedbackRoutes);


module.exports = router;
