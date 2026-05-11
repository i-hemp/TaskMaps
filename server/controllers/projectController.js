const { Project, ProjectMember, User } = require('../models/index');

exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({
      name,
      description,
      created_by: req.user.id
    });

    // Auto-assign creator as admin
    await ProjectMember.create({
      project_id: project.id,
      user_id: req.user.id,
      role: 'admin'
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await req.user.getProjects({
      include: [
        { model: User, as: 'members', attributes: ['id', 'name', 'email'] }
      ]
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'members', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.name = name || project.name;
    project.description = description || project.description;
    project.status = status || project.status;

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.destroy();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User with this email not found' });
    }

    const existingMember = await ProjectMember.findOne({
      where: { project_id: req.params.id, user_id: user.id }
    });

    if (existingMember) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    await ProjectMember.create({
      project_id: req.params.id,
      user_id: user.id,
      role: role || 'member'
    });

    res.json({ message: 'Member added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const member = await ProjectMember.findOne({
      where: { project_id: req.params.id, user_id: req.params.userId }
    });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    await member.destroy();
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
