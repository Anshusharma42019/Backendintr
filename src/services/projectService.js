const Project = require('../models/Project');

const getProjectProgress = async (projectId) => {
  const project = await Project.findById(projectId);
  
  if (!project.startDate || !project.endDate) {
    return 0;
  }
  
  const totalDays = (project.endDate - project.startDate) / (1000 * 60 * 60 * 24);
  const elapsedDays = (new Date() - project.startDate) / (1000 * 60 * 60 * 24);
  
  return Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
};

const updateProjectStatus = async (projectId, status) => {
  return await Project.findByIdAndUpdate(projectId, { status }, { new: true });
};

module.exports = { getProjectProgress, updateProjectStatus };