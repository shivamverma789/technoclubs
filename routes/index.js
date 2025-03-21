const express = require("express");
const router = express.Router();

// Import all route files
const authRoutes = require("./auth");
const userRoutes = require("./users");  // Ensure the filename matches exactly
const dashboardRoutes = require("./dashboard");
const chapterRoutes = require("./chapter");
const eventRoutes = require("./event");
const membershipRoutes = require("./membership");

// Use routes
router.get("/", (req, res) => res.render("index"));
router.use("/auth", authRoutes); // register and login
router.use("/users", userRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/chapters", chapterRoutes);
router.use("/events", eventRoutes);
router.use("/membership", membershipRoutes);

module.exports = router;
