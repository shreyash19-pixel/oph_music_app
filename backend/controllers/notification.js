// controllers/notifications.js
const notificationModel = require("../model/notification");

const getNotificationsByOphid = async (req, res) => {
  const { ophid } = req.params;

  try {
    const rows = await notificationModel.getNotificationsByOphid(ophid);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications." });
  }
};

const markNotificationAsRead = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    const success = await notificationModel.updateNotificationReadStatus(id);

    if (!success) {
      return res.status(404).json({ error: "Notification not found." });
    }

    res.json({ message: "Notification marked as read." });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ error: "Failed to update notification status." });
  }
};

module.exports = {
  getNotificationsByOphid,
  markNotificationAsRead,
};
