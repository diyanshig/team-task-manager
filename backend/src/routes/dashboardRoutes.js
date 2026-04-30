const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const { protect } = require("../middleware/authMiddleware");
const { requireProjectMember } = require("../middleware/projectRoleMiddleware");

const router = express.Router();

// Dashboard data for one project
router.get(
  "/project/:projectId",
  protect,
  requireProjectMember,
  async (req, res) => {
    try {
      const projectId = new mongoose.Types.ObjectId(req.params.projectId);

      const baseQuery = {
        project: projectId
      };

      // Member should only see their own assigned tasks
      if (req.projectRole === "Member") {
        baseQuery.assignedTo = req.user._id;
      }

      const totalTasks = await Task.countDocuments(baseQuery);

      const tasksByStatus = await Task.aggregate([
        {
          $match: baseQuery
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            status: "$_id",
            count: 1,
            _id: 0
          }
        }
      ]);

      const overdueTasks = await Task.countDocuments({
        ...baseQuery,
        dueDate: { $lt: new Date() },
        status: { $ne: "Done" }
      });

      const tasksPerUser = await Task.aggregate([
        {
          $match: {
            project: projectId
          }
        },
        {
          $group: {
            _id: "$assignedTo",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $unwind: "$user"
        },
        {
          $project: {
            userId: "$user._id",
            name: "$user.name",
            email: "$user.email",
            count: 1,
            _id: 0
          }
        }
      ]);

      res.json({
        totalTasks,
        tasksByStatus,
        tasksPerUser,
        overdueTasks
      });
    } catch (error) {
      res.status(500).json({
        message: "Could not fetch dashboard data",
        error: error.message
      });
    }
  }
);

module.exports = router;