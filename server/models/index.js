const User = require('./User');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');
const Task = require('./Task');
const Comment = require('./Comment');
const Notification = require('./Notification');
const Label = require('./Label');
const TaskLabel = require('./TaskLabel');
const Attachment = require('./Attachment');
const Activity = require('./Activity');
const sequelize = require('../config/db');

// ... associations ...
User.hasMany(Activity, { foreignKey: 'user_id' });
Activity.belongsTo(User, { foreignKey: 'user_id' });

Project.hasMany(Activity, { foreignKey: 'project_id', onDelete: 'CASCADE' });
Activity.belongsTo(Project, { foreignKey: 'project_id' });


// User - Project (One to many, as creator)
User.hasMany(Project, { foreignKey: 'created_by' });
Project.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });

// User - ProjectMember (Many to many through ProjectMember)
User.belongsToMany(Project, { through: ProjectMember, foreignKey: 'user_id' });
Project.belongsToMany(User, { through: ProjectMember, foreignKey: 'project_id', as: 'members' });

// Direct associations for convenience
Project.hasMany(ProjectMember, { foreignKey: 'project_id', as: 'projectMembers' });
ProjectMember.belongsTo(Project, { foreignKey: 'project_id' });
ProjectMember.belongsTo(User, { foreignKey: 'user_id' });

// Project - Task
Project.hasMany(Task, { foreignKey: 'project_id', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'project_id' });

// Project - Label
Project.hasMany(Label, { foreignKey: 'project_id', onDelete: 'CASCADE' });
Label.belongsTo(Project, { foreignKey: 'project_id' });

// Task - Label (Many to many)
Task.belongsToMany(Label, { through: TaskLabel, foreignKey: 'task_id', as: 'labels' });
Label.belongsToMany(Task, { through: TaskLabel, foreignKey: 'label_id' });

// Task - Attachment
Task.hasMany(Attachment, { foreignKey: 'task_id', onDelete: 'CASCADE', as: 'attachments' });
Attachment.belongsTo(Task, { foreignKey: 'task_id' });

// Task - Subtasks (Self-referential)
Task.hasMany(Task, { as: 'subtasks', foreignKey: 'parent_id', onDelete: 'CASCADE' });
Task.belongsTo(Task, { as: 'parent', foreignKey: 'parent_id' });

// User - Task (Assigned to)
User.hasMany(Task, { foreignKey: 'assigned_to' });
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assigned_to' });

// User - Task (Created by)
User.hasMany(Task, { foreignKey: 'created_by' });
Task.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });

// Task - Comment
Task.hasMany(Comment, { foreignKey: 'task_id', onDelete: 'CASCADE' });
Comment.belongsTo(Task, { foreignKey: 'task_id' });

// User - Comment
User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

// User - Notification
User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  User,
  Project,
  ProjectMember,
  Task,
  Comment,
  Notification,
  Label,
  TaskLabel,
  Attachment,
  Activity,
  sequelize
};
