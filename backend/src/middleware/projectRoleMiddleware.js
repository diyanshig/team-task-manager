const Project = require("../models/Project");

const getProjectRole = async (projectId, userId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    return null;
  }

  const member = project.members.find(
    (m) => m.user.toString() === userId.toString()
  );

  if (!member) {
    return null;
  }

  return {
    project,
    role: member.role
  };
};

const requireProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id;

    const result = await getProjectRole(projectId, req.user._id);

    if (!result) {
      return res.status(403).json({ message: "You are not a project member" });
    }

    req.project = result.project;
    req.projectRole = result.role;

    next();
  } catch (error) {
    res.status(500).json({ message: "Project member check failed" });
  }
};

const requireProjectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id;

    const result = await getProjectRole(projectId, req.user._id);

    if (!result || result.role !== "Admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.project = result.project;
    req.projectRole = result.role;

    next();
  } catch (error) {
    res.status(500).json({ message: "Project admin check failed" });
  }
};

module.exports = {
  requireProjectMember,
  requireProjectAdmin
};