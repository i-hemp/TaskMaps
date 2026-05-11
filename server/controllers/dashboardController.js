const { Task, Project, ProjectMember, sequelize } = require('../models/index');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all projects the user belongs to
    const projectMemberships = await ProjectMember.findAll({
      where: { user_id: userId },
      attributes: ['project_id']
    });
    const projectIds = projectMemberships.map(pm => pm.project_id);

    // Summary counts
    const totalProjects = projectIds.length;
    
    const taskCounts = await Task.findAll({
      where: { 
        project_id: { [Op.in]: projectIds }
      },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const overdueCount = await Task.count({
      where: {
        project_id: { [Op.in]: projectIds },
        status: { [Op.ne]: 'done' },
        due_date: { [Op.lt]: new Date() }
      }
    });

    const myTasksCount = await Task.count({
      where: {
        assigned_to: userId,
        status: { [Op.ne]: 'done' }
      }
    });

    res.json({
      projectsCount: totalProjects,
      taskCounts,
      overdueCount,
      myTasksCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
