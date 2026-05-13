const { Task, Comment, User, Label, Attachment, TaskLabel } = require('../models/index');
const { createNotification } = require('../utils/notificationHelper');
const { cloudinary } = require('../config/cloudinary');

exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, assigned_to, due_date, parent_id, label_ids } = req.body;
    const task = await Task.create({
      title,
      description,
      priority,
      assigned_to: assigned_to || null,
      due_date: due_date || null,
      parent_id: parent_id || null,
      project_id: req.params.pid,
      created_by: req.user.id
    });

    if (label_ids && Array.isArray(label_ids)) {
      await task.setLabels(label_ids);
    }

    if (assigned_to) {
      await createNotification(
        assigned_to, 
        'task_assigned', 
        `You have been assigned a new task: ${title}`, 
        task.id
      );
    }

    const fullTask = await Task.findByPk(task.id, {
      include: [
        { model: Label, as: 'labels' }
      ]
    });

    res.status(201).json(fullTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { status, priority, assigned_to, parent_id } = req.query;
    const where = { project_id: req.params.pid };
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigned_to === 'me') where.assigned_to = req.user.id;
    
    // Default to only top-level tasks if no parent_id is specified
    if (parent_id) {
      where.parent_id = parent_id;
    } else if (parent_id === null || parent_id === 'null') {
      where.parent_id = null;
    }

    const tasks = await Task.findAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'avatar_url'] },
        { model: Label, as: 'labels' },
        { model: Task, as: 'subtasks', attributes: ['id'] } // Just count or presence
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
        { model: Comment, include: [{ model: User, attributes: ['id', 'name'] }] },
        { model: Label, as: 'labels' },
        { model: Attachment, as: 'attachments' },
        { 
          model: Task, 
          as: 'subtasks',
          include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'avatar_url'] }]
        },
        { model: Task, as: 'parent', attributes: ['id', 'title'] }
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

    const { title, description, status, priority, assigned_to, due_date, label_ids } = req.body;
    
    const oldStatus = task.status;
    const oldAssignee = task.assigned_to;
    
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (assigned_to !== undefined) task.assigned_to = assigned_to;
    if (due_date !== undefined) task.due_date = due_date;

    await task.save();

    if (label_ids && Array.isArray(label_ids)) {
      await task.setLabels(label_ids);
    }

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

    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'avatar_url'] },
        { model: Label, as: 'labels' }
      ]
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.tid, {
      include: [{ model: Attachment, as: 'attachments' }]
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Delete attachments from Cloudinary
    for (const attachment of task.attachments) {
      await cloudinary.uploader.destroy(attachment.public_id);
    }

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

exports.uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const attachment = await Attachment.create({
      task_id: req.params.tid,
      url: req.file.path,
      filename: req.file.originalname,
      file_type: req.file.mimetype,
      public_id: req.file.filename
    });

    res.status(201).json(attachment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAttachment = async (req, res) => {
  try {
    const attachment = await Attachment.findByPk(req.params.aid);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(attachment.public_id);
    
    // Delete from DB
    await attachment.destroy();

    res.json({ message: 'Attachment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
