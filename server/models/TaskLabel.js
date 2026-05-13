const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TaskLabel = sequelize.define('TaskLabel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  task_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  label_id: {
    type: DataTypes.UUID,
    allowNull: false
  }
});

module.exports = TaskLabel;
