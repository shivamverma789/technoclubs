const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { forwardAuthenticated } = require("../middleware/auth");

const router = express.Router();

// GET Register Page
router.get("/register", forwardAuthenticated, (req, res) => res.render("register"));

// ✅ Fixed POST Register Route
router.post("/register", async (req, res) => {  // Fixed here
  try {
    console.log(req.body);
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      req.flash("error_msg", "Email already exists");
      return res.redirect("/auth/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword});

    await user.save();
    req.flash("success_msg", "Registration successful! You can now log in.");
    res.redirect("/auth/login");
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Something went wrong. Try again.");
    res.redirect("/auth/register");
  }
});

// GET Login Page
router.get("/login", forwardAuthenticated, (req, res) => res.render("login"));

// POST Login User
router.post("/login", (req, res, next) => {
    console.log(req.body)
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        req.flash("error_msg", "Invalid credentials");
        return res.redirect("/auth/login");
      }
  
      req.logIn(user, (err) => {
        if (err) return next(err);
        
        // Role-based redirection
        if (user.role === "SuperAdmin") return res.redirect("/admin-dashboard");
        if (user.role === "ChapterAdmin") return res.redirect("/chapter-dashboard");
        return res.redirect("/");
      });
    })(req, res, next);
  });
  
// GET Logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    req.flash("success_msg", "Logged out successfully.");
    res.redirect("/auth/login");
  });
});

module.exports = router;
