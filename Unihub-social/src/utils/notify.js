const { Notification } = require("../models");

// Mirrors Unihub-backend's createNotification (src/controllers/notificationController.js):
// fire-and-forget, never lets a notification failure break the caller's
// main request. Callers don't need their own try/catch.
const notifyUser = async (userId, type, title, message, link = null, metadata = null) => {
  try {
    await Notification.create({ userId, type, title, message, link, metadata });
  } catch (error) {
    console.error("Failed to create notification:", error.message);
  }
};

module.exports = { notifyUser };
