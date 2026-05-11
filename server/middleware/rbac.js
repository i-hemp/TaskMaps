const { ProjectMember } = require('../models/index');

const requireProjectRole = (roles) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.id || req.params.pid;
      if (!projectId) return res.status(400).json({ message: 'Project ID is required' });

      const member = await ProjectMember.findOne({
        where: { project_id: projectId, user_id: req.user.id }
      });

      if (!member) {
        return res.status(403).json({ message: 'You are not a member of this project' });
      }

      if (roles && !roles.includes(member.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      req.projectRole = member.role;
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};

module.exports = requireProjectRole;
