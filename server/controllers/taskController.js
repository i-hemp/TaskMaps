const { Task, Comment, User } = require('../models/index');
const { createNotification } = require('../utils/notificationHelper');

exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, assigned_to, due_date } = req.body;
    const task = await Task.create({
      title,
      description,
      priority,
      assigned_to,
      due_date,
      project_id: req.params.pid,
      created_by: req.user.id
    });

    if (assigned_to) {
      await createNotification(
        assigned_to, 
        'task_assigned', 
        `You have been assigned a new task: ${title}`, 
        task.id
      );
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { status, priority, assigned_to } = req.query;
    const where = { project_id: req.params.pid };
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigned_to === 'me') where.assigned_to = req.user.id;

    const tasks = await Task.findAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'avatar_url'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.tid, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'avatar_url'] },
        { model: Comment, include: [{ model: User, attributes: ['id', 'name'] }] }
      ]
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.tid);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { title, description, status, priority, assigned_to, due_date } = req.body;
    
    const oldStatus = task.status;
    const oldAssignee = task.assigned_to;
    
    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.assigned_to = assigned_to || task.assigned_to;
    task.due_date = due_date || task.due_date;

    await task.save();

    // Notify if status changed
    if (status && status !== oldStatus && task.assigned_to) {
      await createNotification(
        task.assigned_to,
        'status_changed',
        `Task status updated to ${status}: ${task.title}`,
        task.id
      );
    }

    // Notify if assignee changed
    if (assigned_to && assigned_to !== oldAssignee) {
      await createNotification(
        assigned_to,
        'task_assigned',
        `You have been assigned to task: ${task.title}`,
        task.id
      );
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.tid);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.destroy();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.create({
      content,
      task_id: req.params.tid,
      user_id: req.user.id
    });

    const task = await Task.findByPk(req.params.tid);
    if (task && task.assigned_to && task.assigned_to !== req.user.id) {
      await createNotification(
        task.assigned_to,
        'new_comment',
        `New comment on task: ${task.title}`,
        task.id
      );
    }

    const fullComment = await Comment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['id', 'name'] }]
    });

    res.status(201).json(fullComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
