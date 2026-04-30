const express = require("express");
const Project = require("../models/Project");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const {
  requireProjectMember,
  requireProjectAdmin
} = require("../middleware/projectRoleMiddleware");

const router = express.Router();

// Create project
router.post("/", protect, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "Admin"
        }
      ]
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Project creation failed", error: error.message });
  }
});

// Get projects where logged-in user is a member
router.get("/", protect, async (req, res) => {
  try {
    const projects = await Project.find({
      "members.user": req.user._id
    }).populate("members.user", "name email");

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch projects" });
  }
});

// Get single project
router.get("/:id", protect, requireProjectMember, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "members.user",
      "name email"
    );

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch project" });
  }
});

// Add member by email - Admin only
router.post("/:id/members", protect, requireProjectAdmin, async (req, res) => {
  try {
    const { email, role = "Member" } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found. User must sign up first." });
    }

    const alreadyMember = req.project.members.some(
      (m) => m.user.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ message: "User is already a member" });
    }

    req.project.members.push({
      user: user._id,
      role
    });

    await req.project.save();

    res.json({ message: "Member added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Could not add member", error: error.message });
  }
});

// Remove member - Admin only
router.delete("/:id/members/:userId", protect, requireProjectAdmin, async (req, res) => {
  try {
    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ message: "Admin cannot remove themselves" });
    }

    req.project.members = req.project.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );

    await req.project.save();

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Could not remove member" });
  }
});

module.exports = router;