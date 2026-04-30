const express = require("express");
const Task = require("../models/Task");
const Project = require("../models/Project");
const { protect } = require("../middleware/authMiddleware");
const {
  requireProjectMember,
  requireProjectAdmin
} = require("../middleware/projectRoleMiddleware");

const router = express.Router();

// Admin creates task
router.post(
  "/project/:projectId",
  protect,
  requireProjectAdmin,
  async (req, res) => {
    try {
      const { title, description, dueDate, priority, assignedTo } = req.body;

      if (!title || !dueDate || !assignedTo) {
        return res.status(400).json({
          message: "Title, due date and assigned user are required"
        });
      }

      const assignedUserIsMember = req.project.members.some(
        (m) => m.user.toString() === assignedTo
      );

      if (!assignedUserIsMember) {
        return res.status(400).json({
          message: "Assigned user must be a project member"
        });
      }

      const task = await Task.create({
        project: req.params.projectId,
        title,
        description,
        dueDate,
        priority,
        assignedTo,
        createdBy: req.user._id
      });

      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({
        message: "Task creation failed",
        error: error.message
      });
    }
  }
);

// Get tasks in project
// Admin sees all tasks
// Member sees only assigned tasks
router.get(
  "/project/:projectId",
  protect,
  requireProjectMember,
  async (req, res) => {
    try {
      const query = {
        project: req.params.projectId
      };

      if (req.projectRole === "Member") {
        query.assignedTo = req.user._id;
      }

      const tasks = await Task.find(query)
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

      res.json(tasks);
    } catch (error) {
      res.status(500).json({
        message: "Could not fetch tasks",
        error: error.message
      });
    }
  }
);

// Update task status
router.patch("/:taskId/status", protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["To Do", "In Progress", "Done"].includes(status)) {
      return res.status(400).json({ message: "Invalid task status" });
    }

    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);

    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({ message: "You are not a project member" });
    }

    const isAdmin = member.role === "Admin";
    const isAssignedUser = task.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignedUser) {
      return res.status(403).json({
        message: "You can update only your assigned tasks"
      });
    }

    task.status = status;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({
      message: "Could not update task status",
      error: error.message
    });
  }
});

// Delete task - Admin only
router.delete("/:taskId", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);

    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!member || member.role !== "Admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    await task.deleteOne();

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Could not delete task",
      error: error.message
    });
  }
});

module.exports = router;