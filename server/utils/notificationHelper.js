const { Notification } = require('../models/index');

const createNotification = async (userId, type, message, refId = null) => {
  try {
    await Notification.create({
      user_id: userId,
      type,
      message,
      ref_id: refId
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = { createNotification };
