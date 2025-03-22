const express = require("express");
const { ensureAuthenticated, ensureRole } = require("../middleware/auth");

const MembershipRequest = require("../models/Membership");
const User = require("../models/User");
const Chapter = require("../models/Chapter");

const router = express.Router();


router.get("/form/:chapterId", ensureAuthenticated, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) {
      req.flash("error_msg", "Chapter not found.");
      return res.redirect("/chapters");
    }

    res.render("membershipForm", { chapter });
  } catch (error) {
    console.error("Error loading membership form:", error);
    res.status(500).send("Server Error");
  }
});

// POST Membership Application
router.post("/request", ensureAuthenticated, async (req, res) => {
  try {
    const { chapterId, domain, experience, github, linkedin, availability, resumeLink } = req.body;
    
    const existingRequest = await MembershipRequest.findOne({ userId: req.user._id, chapterId });
    if (existingRequest) {
      req.flash("error_msg", "You have already requested to join this chapter.");
      return res.redirect(`/chapters/${chapterId}`);
    }

    const newRequest = new MembershipRequest({
      userId: req.user._id,
      chapterId,
      domain,
      experience,
      github,
      linkedin,
      availability,
      resumeLink,
      status: "Pending",
    });

    await newRequest.save();
    req.flash("success_msg", "Membership request submitted successfully!");
    res.redirect(`/chapters/${chapterId}`);
  } catch (error) {
    console.error("Error submitting membership request:", error);
    req.flash("error_msg", "Something went wrong. Try again.");
    res.redirect("/chapters");
  }
});
// http://localhost:4000//67de50563ffba3c26cec013d/requests
// 📌 Chapter Admin Views Membership Requests
router.get("/:chapterId/requests", ensureAuthenticated, ensureRole("chapteradmin"), async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);

    if (!chapter) {
      req.flash("error_msg", "Chapter not found.");
      return res.redirect("/chapters");
    }

    // ✅ Fetch membership requests for this chapter
    const requests = await MembershipRequest.find({ chapterId: req.params.chapterId })
      .populate("userId", "name email");

    res.render("membershipRequests", { requests, chapter });
  } catch (error) {
    console.error("Error fetching membership requests:", error);
    res.status(500).send("Server Error");
  }
});


router.post("/approve/:requestId", ensureAuthenticated, ensureRole("chapteradmin"), async (req, res) => {
  try {
    const request = await MembershipRequest.findById(req.params.requestId);
    if (!request) {
      req.flash("error_msg", "Request not found.");
      return res.redirect(`/membership/${request.chapterId}/requests`);
    }

    const chapter = await Chapter.findById(request.chapterId);
    if (!chapter) {
      req.flash("error_msg", "Chapter not found.");
      return res.redirect("/chapters");
    }

    // ✅ Update request status
    request.status = "Accepted";
    await request.save();

    // ✅ Add user to the chapter's team
    chapter.teamMembers.push(request.userId);
    await chapter.save();

    // ✅ Update user's profile to reflect the chapter
    await User.findByIdAndUpdate(request.userId, { chapterId: request.chapterId });

    req.flash("success_msg", "User approved and added to the chapter!");
    res.redirect(`/membership/${request.chapterId}/requests`);
  } catch (error) {
    console.error("Error approving membership request:", error);
    res.status(500).send("Server Error");
  }
});

router.post("/reject/:requestId", ensureAuthenticated, ensureRole("chapteradmin"), async (req, res) => {
  try {
    const request = await MembershipRequest.findById(req.params.requestId);
    if (!request) {
      req.flash("error_msg", "Request not found.");
      return res.redirect(`/chapters/${request.chapterId}/requests`);
    }

    const chapter = await Chapter.findById(request.chapterId);
    if (!chapter) {
      req.flash("error_msg", "Chapter not found.");
      return res.redirect("/chapters");
    }

    // ✅ Update request status
    request.status = "Rejected";
    await request.save();

    req.flash("success_msg", "Membership request rejected.");
    res.redirect(`/chapters/${request.chapterId}/requests`);
  } catch (error) {
    console.error("Error rejecting membership request:", error);
    res.status(500).send("Server Error");
  }
});




module.exports = router;
